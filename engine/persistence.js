/* ==================================================================
 * Persistência (parte 2/2) — restauração do restante do estado,
 * salvamento automático e controle "Dados de teste" no topo da tela.
 * ------------------------------------------------------------------
 * Carrega por ÚLTIMO na lista de config/app.config.js: só neste ponto
 * todas as variáveis de estado do protótipo já existem (CFG, FUNIS,
 * PROX_ACOES, dashCards/dashChartsData, PA_QUEUE...).
 *
 * O que é salvo:
 *   - Leads (inclusive os criados no modal "Novo Lead", o vendedor
 *     atribuído e a etapa do Fluxo da Venda de cada lead)
 *   - Configurações: todas as tabelas de CFG (colaboradores, planos,
 *     metas, áreas, grupos, pagamentos, motivos de perda, NF, campanhas)
 *   - Motor do Funil: FUNIS (etapas, fluxo, campos, ações, validações)
 *     e a biblioteca de Próximas Ações
 *   - Dashboard: cards e gráficos adicionados/removidos
 *   - Próxima Ação do Fluxo da Venda (fila, posição atual e histórico)
 *
 * O que NÃO é salvo (de propósito): estado puramente visual — aba
 * aberta, página da tabela, menu recolhido, wizard em andamento.
 *
 * Nenhuma regra de negócio, texto ou fluxo foi alterado: este arquivo
 * apenas lê/escreve as mesmas variáveis que a aplicação já usava em
 * memória.
 * ================================================================== */
(function () {
  'use strict';

  var S = window.RadarStore;
  if (!S) { console.warn('[persistence] engine/storage.js não foi carregado antes.'); return; }

  /* Executa um trecho isolado: se uma variável/tela não existir (por
   * exemplo, se um módulo falhar ao carregar), o restante continua. */
  function seguro(fn) { try { return fn(); } catch (e) { console.warn('[persistence]', e); } }

  /* ---------------------------------------------------------------
   * 1. Fotografia do estado atual
   * --------------------------------------------------------------- */
  function estadoAtual() {
    var s = { v: S.VERSAO, salvoEm: new Date().toISOString() };
    seguro(function () { if (typeof LEADS !== 'undefined') s.leads = LEADS; });
    seguro(function () {
      if (typeof CFG === 'undefined') return;
      s.cfg = {};
      Object.keys(CFG).forEach(function (k) { s.cfg[k] = CFG[k].data; });
    });
    seguro(function () { if (typeof FUNIS !== 'undefined') s.funis = FUNIS; });
    seguro(function () { if (typeof PROX_ACOES !== 'undefined') s.proxAcoes = PROX_ACOES; });
    seguro(function () { if (typeof dashCards !== 'undefined') s.dashCards = dashCards; });
    seguro(function () { if (typeof dashChartsData !== 'undefined') s.dashCharts = dashChartsData; });
    seguro(function () { if (typeof PA_QUEUE !== 'undefined') s.paFila = PA_QUEUE; });
    seguro(function () { if (typeof paIdx !== 'undefined') s.paIdx = paIdx; });
    seguro(function () { if (typeof paHistorico !== 'undefined') s.paHistorico = paHistorico; });
    return s;
  }

  /* ---------------------------------------------------------------
   * 2. Restauração (os LEADS já foram restaurados em storage.js)
   * --------------------------------------------------------------- */
  var snap = S.ler();
  var restaurou = false;

  if (snap) {
    restaurou = true;

    seguro(function () {
      if (!snap.cfg || typeof CFG === 'undefined') return;
      Object.keys(snap.cfg).forEach(function (k) {
        if (CFG[k] && Array.isArray(snap.cfg[k])) CFG[k].data = snap.cfg[k];
      });
    });
    seguro(function () { if (typeof FUNIS !== 'undefined') S.preencherArray(FUNIS, snap.funis); });
    seguro(function () { if (typeof PROX_ACOES !== 'undefined') S.preencherArray(PROX_ACOES, snap.proxAcoes); });
    seguro(function () { if (typeof dashCards !== 'undefined') S.preencherArray(dashCards, snap.dashCards); });
    seguro(function () { if (typeof dashChartsData !== 'undefined') S.preencherArray(dashChartsData, snap.dashCharts); });
    seguro(function () { if (typeof PA_QUEUE !== 'undefined') S.preencherArray(PA_QUEUE, snap.paFila); });
    seguro(function () { if (typeof paHistorico !== 'undefined') S.preencherArray(paHistorico, snap.paHistorico); });
    seguro(function () {
      if (snap.paIdx == null || typeof paIdx === 'undefined') return;
      paIdx = snap.paIdx;
      paAtual = (typeof PA_QUEUE !== 'undefined' && PA_QUEUE[paIdx]) ? PA_QUEUE[paIdx] : null;
    });

    /* Índices de seleção podem ter ficado fora do intervalo se algo foi
     * excluído em uma sessão anterior. */
    seguro(function () {
      if (typeof FUNIS !== 'undefined' && typeof funilSelIdx !== 'undefined' && funilSelIdx >= FUNIS.length) funilSelIdx = 0;
    });

    /* Redesenha as telas que já haviam sido montadas com os dados-semente. */
    ['renderLeads', 'renderVenda', 'renderProxAcaoCard', 'renderDashCards',
     'renderDashCharts', 'populateVendaFunilSelect', 'renderFunisPanel']
      .forEach(function (nome) {
        seguro(function () { if (typeof window[nome] === 'function') window[nome](); });
      });
    seguro(function () {
      if (typeof CFG === 'undefined' || typeof renderCfg !== 'function') return;
      Object.keys(CFG).forEach(function (k) { seguro(function () { renderCfg(k); }); });
    });
  }

  /* ---------------------------------------------------------------
   * 3. Salvamento automático
   * --------------------------------------------------------------- */
  var timer = null;
  var desligado = false;   /* trava usada ao restaurar/importar, para que um
                            * salvamento pendente não regrave o que acabou de
                            * ser apagado antes de a página recarregar. */
  function agendarSalvamento() {
    if (desligado) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(salvarAgora, 400);
  }
  function salvarAgora() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (desligado) return;
    S.gravar(estadoAtual());
  }
  function desligarSalvamento() {
    desligado = true;
    if (timer) { clearTimeout(timer); timer = null; }
    window.removeEventListener('beforeunload', salvarAgora);
  }

  /* (a) Depois de qualquer interação. As telas são redesenhadas pelos
   *     próprios handlers do projeto; o debounce garante que a gravação
   *     aconteça depois que o estado já foi alterado. */
  ['click', 'change', 'input'].forEach(function (ev) {
    document.addEventListener(ev, agendarSalvamento, true);
  });

  /* (b) Depois de cada redesenho — um sinal mais direto de que algum
   *     dado mudou. Envolve as funções originais sem alterá-las. */
  ['renderLeads', 'renderVenda', 'renderCfg', 'renderFunisPanel',
   'renderDashCards', 'renderDashCharts', 'renderProxAcaoCard']
    .forEach(function (nome) {
      var orig = window[nome];
      if (typeof orig !== 'function' || orig.__radarWrapped) return;
      var wrap = function () {
        var r = orig.apply(this, arguments);
        agendarSalvamento();
        return r;
      };
      wrap.__radarWrapped = true;
      window[nome] = wrap;
    });

  /* (c) Ao sair/ocultar a aba, grava imediatamente o que estiver pendente. */
  window.addEventListener('beforeunload', salvarAgora);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') salvarAgora();
  });

  /* Grava a fotografia inicial (sessão nova = dados-semente preservados). */
  salvarAgora();

  /* ---------------------------------------------------------------
   * 4. Controle "Dados de teste" no topo
   * --------------------------------------------------------------- */
  var topbar = document.querySelector('.topbar');
  if (!topbar) return;

  var wrap = document.createElement('div');
  wrap.className = 'ps-wrap';
  wrap.innerHTML =
    '<button class="ps-chip" id="psChip" type="button" title="Dados de teste salvos neste navegador">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>' +
      '<polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>' +
      '<span id="psLabel">Dados salvos</span>' +
    '</button>' +
    '<div class="ps-menu" id="psMenu">' +
      '<div class="ps-menu-head">Dados de teste</div>' +
      '<button type="button" data-ps="salvar">Salvar agora</button>' +
      '<button type="button" data-ps="exportar">Exportar backup (.json)</button>' +
      '<button type="button" data-ps="importar">Importar backup…</button>' +
      '<button type="button" class="ps-danger" data-ps="resetar">Restaurar dados iniciais</button>' +
      '<div class="ps-menu-foot" id="psFoot"></div>' +
    '</div>' +
    '<input type="file" id="psFile" accept="application/json,.json" hidden>';
  topbar.insertBefore(wrap, topbar.lastElementChild);

  var chip = wrap.querySelector('#psChip');
  var menu = wrap.querySelector('#psMenu');
  var label = wrap.querySelector('#psLabel');
  var foot = wrap.querySelector('#psFoot');
  var file = wrap.querySelector('#psFile');

  function hora(d) {
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ':' +
           String(d.getSeconds()).padStart(2, '0');
  }
  function atualizarRodape() {
    var s = S.ler();
    foot.textContent = S.suportado
      ? (s && s.salvoEm ? 'Último salvamento: ' + hora(new Date(s.salvoEm)) : 'Nada salvo ainda.')
      : 'Armazenamento do navegador indisponível — os dados valem só nesta sessão.';
  }

  S.aoSalvar(function (estado) {
    label.textContent = 'Salvo ' + hora(new Date(estado.salvoEm));
    chip.classList.add('ps-flash');
    setTimeout(function () { chip.classList.remove('ps-flash'); }, 600);
    if (menu.classList.contains('open')) atualizarRodape();
  });

  if (!S.suportado) { chip.classList.add('ps-off'); label.textContent = 'Sem salvamento'; }
  else if (restaurou) label.textContent = 'Dados restaurados';

  chip.addEventListener('click', function (e) {
    e.stopPropagation();
    menu.classList.toggle('open');
    if (menu.classList.contains('open')) atualizarRodape();
  });
  document.addEventListener('click', function (e) {
    if (!wrap.contains(e.target)) menu.classList.remove('open');
  });

  menu.addEventListener('click', function (e) {
    var b = e.target.closest('[data-ps]');
    if (!b) return;
    var acao = b.dataset.ps;

    if (acao === 'salvar') { salvarAgora(); atualizarRodape(); }

    if (acao === 'exportar') {
      var blob = new Blob([JSON.stringify(estadoAtual(), null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      var d = new Date();
      a.href = url;
      a.download = 'radar-crm-backup-' + d.toISOString().slice(0, 10) + '-' +
                   String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0') + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      menu.classList.remove('open');
    }

    if (acao === 'importar') { file.click(); }

    if (acao === 'resetar') {
      if (!confirm('Restaurar os dados iniciais?\n\nTodos os cadastros, configurações e edições feitos nos testes serão apagados deste navegador.')) return;
      desligarSalvamento();
      S.limpar();
      location.reload();
    }
  });

  file.addEventListener('change', function () {
    var f = file.files && file.files[0];
    if (!f) return;
    var fr = new FileReader();
    fr.onload = function () {
      var dados;
      try { dados = JSON.parse(fr.result); } catch (err) { alert('Arquivo inválido: não é um JSON válido.'); return; }
      if (!dados || dados.v !== S.VERSAO) { alert('Este backup não é compatível com a versão atual do protótipo.'); return; }
      desligarSalvamento();
      S.limpar();
      S.gravar(dados);
      location.reload();
    };
    fr.readAsText(f);
    file.value = '';
  });

  /* Atalhos úteis no console durante os testes. */
  window.RadarStore.salvarAgora = salvarAgora;
  window.RadarStore.estadoAtual = estadoAtual;
})();
