// Teste seu computador: decide quais botões de compra ligam.
// estadoPortao é pura (testada em testes/test_portao.mjs); o resto só liga na página.
(function (raiz) {
  var AVISO = 'Ainda não roda no seu computador. Não compre agora.';
  var FALTA = 'Responda as perguntas para liberar a compra.';

  // so: 'mac' | 'windows' | ''; r: respostas ('sim' | 'nao' | '') na ordem da tela: as 3 do sistema, a "dos dois"
  // e a 5ª, só da Máquina de Cortes (Mac: macOS 14, 16 GB, 20 GB livres; Windows: 20 GB livres).
  function estadoPortao(so, r) {
    var nenhum = { fabrica: false, maquina: false, combo: false };
    if (so !== 'mac' && so !== 'windows') return { ok: false, botoes: nenhum, msg: FALTA };
    var resp = (r || []).slice(0, 5);
    while (resp.length < 5) resp.push('');
    var fab = resp.slice(0, 4), maq = resp[4];
    var nome = so === 'mac' ? 'Mac' : 'Windows';
    if (fab.indexOf('nao') !== -1) return { ok: false, botoes: nenhum, msg: AVISO };
    if (fab.some(function (x) { return x !== 'sim'; }) || maq === '') return { ok: false, botoes: nenhum, msg: FALTA };
    if (maq === 'sim') {
      return { ok: true, botoes: { fabrica: true, maquina: true, combo: true },
        msg: 'Tudo certo: a Fábrica e a Máquina de Cortes rodam no seu ' + nome + '.' };
    }
    if (so === 'mac') {
      return { ok: true, botoes: { fabrica: true, maquina: false, combo: false }, nota: 'Precisa de macOS 14, 16 GB e 20 GB livres',
        msg: 'A Fábrica roda no seu Mac. A Máquina de Cortes, não: ela precisa de macOS 14 (Sonoma) ou mais novo, 16 GB de memória e 20 GB livres. Por isso só o botão da Fábrica ligou.' };
    }
    return { ok: true, botoes: { fabrica: true, maquina: false, combo: false }, nota: 'Precisa de 20 GB livres',
      msg: 'A Fábrica roda no seu Windows. A Máquina de Cortes precisa de 20 GB livres no disco: libere espaço e responda de novo. Por enquanto só o botão da Fábrica ligou.' };
  }

  // Desligado: tira o href (guardado em data-href), então clique do meio, nova aba e copiar link não têm para onde ir.
  function aplicarHref(a, off) {
    if (a.getAttribute('data-href') === null) a.setAttribute('data-href', a.getAttribute('href') || '');
    if (off) a.removeAttribute('href'); else a.setAttribute('href', a.getAttribute('data-href'));
  }

  function ligar(doc) {
    var gate = doc.getElementById('teste');
    if (!gate) return;
    var links = { fabrica: doc.getElementById('buy-fabrica'), maquina: doc.getElementById('buy-maquina'), combo: doc.getElementById('buy-combo') };
    var msg = doc.getElementById('teste-msg'), txt = doc.getElementById('teste-txt'), go = doc.getElementById('teste-go');
    var pMac = doc.getElementById('teste-mac'), pWin = doc.getElementById('teste-windows'), pMaq = doc.getElementById('teste-mac-maquina'), pWinMaq = doc.getElementById('teste-windows-maquina');
    var el = function (n) { return gate.querySelector('input[name="' + n + '"]:checked'); };
    var val = function (n) { var e = el(n); return e ? e.value : ''; };

    function atualizar() {
      var so = val('so');
      pMac.hidden = so !== 'mac'; pWin.hidden = so !== 'windows'; if (pMaq) pMaq.hidden = so !== 'mac'; if (pWinMaq) pWinMaq.hidden = so !== 'windows';
      var r = [val(so + '1'), val(so + '2'), val(so + '3'), val('dois'), so === 'mac' ? val('mac4') : so === 'windows' ? val('win4') : ''];
      var e = estadoPortao(so, so ? r : []);
      txt.textContent = e.msg; go.hidden = !e.ok;
      gate.classList.toggle('bad', e.msg === AVISO);
      gate.classList.toggle('good', e.ok);
      Object.keys(links).forEach(function (k) {
        var a = links[k]; if (!a) return;
        var off = !e.botoes[k];
        a.setAttribute('aria-disabled', off ? 'true' : 'false');
        aplicarHref(a, off);
        var n = a.parentNode.querySelector('.buy-note');
        if (n) n.textContent = !off ? '' : e.ok ? e.nota : 'Faça o teste do computador';
      });
    }

    gate.hidden = false;
    gate.addEventListener('change', atualizar);
    Object.keys(links).forEach(function (k) {
      var a = links[k]; if (!a) return;
      a.addEventListener('click', function (ev) {
        if (a.getAttribute('aria-disabled') === 'true') { ev.preventDefault(); gate.scrollIntoView({ block: 'center' }); msg.focus(); }
      });
    });
    atualizar();
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { estadoPortao: estadoPortao, aplicarHref: aplicarHref, AVISO: AVISO, FALTA: FALTA };
  else if (typeof document !== 'undefined') ligar(document);
})(this);
