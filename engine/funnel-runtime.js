/* ==================================================================
 * Motor do Funil — camada de execução (runtime)
 * ------------------------------------------------------------------
 * Ponto único de leitura das configurações feitas em
 * Configurações > Funis de Venda > Motor do Funil (Funis, Etapas,
 * Fluxo, Campos Obrigatórios, Validações, Ações Automáticas e
 * Próximas Ações) para a tela do vendedor (Kanban, Lista e
 * Assistente de Venda).
 *
 * Não existe aqui nenhuma etapa, campo, nome ou regra fixa: tudo é
 * derivado de FUNIS em tempo de execução. Qualquer alteração feita
 * pelo administrador reflete automaticamente na tela do vendedor.
 *
 * Carrega DEPOIS de engine/funnel-engine.js (quando FUNIS já existe)
 * e ANTES de engine/persistence.js.
 * ================================================================== */
window.FunnelRuntime = (function () {
  'use strict';

  function funis() { return (typeof FUNIS !== 'undefined') ? FUNIS : []; }

  /* Funil selecionado no seletor "Funil Atual" do Fluxo da Venda. */
  function selIdx() {
    var i = (typeof vFunilSelIdx !== 'undefined') ? vFunilSelIdx : 0;
    return (i >= 0 && i < funis().length) ? i : 0;
  }
  function funilSelecionado() { return funis()[selIdx()] || null; }
  function porNome(n) {
    var l = funis(), i;
    for (i = 0; i < l.length; i++) if (l[i].nome === n) return l[i];
    return null;
  }

  /* Funil associado à Lead. Enquanto a Lead não entrou em nenhum funil,
   * ela acompanha o funil selecionado na tela. */
  function funilDaLead(l) { return (l && l.funil && porNome(l.funil)) || funilSelecionado(); }

  /* Etapas cadastradas e ativas do funil, na ordem configurada. */
  function etapas(f) { return f ? f.etapas.filter(function (e) { return e.ativa !== 'Não'; }) : []; }
  function etapasDaLead(l) { return etapas(funilDaLead(l)); }

  /* Índice da etapa atual da Lead, sempre dentro do total de etapas do
   * funil (o total muda quando o administrador altera o cadastro). */
  function idxEtapa(l) {
    var t = etapasDaLead(l).length;
    if (!t) return 0;
    var i = (l && l.fstage != null) ? l.fstage : 0;
    return Math.max(0, Math.min(t - 1, i));
  }

  function campos(e) { return (e && e.camposAvanco) || []; }
  function validacoes(e) { return (e && e.validacoes) || []; }
  function acoes(e) { return (e && e.acoesAutomaticas) || []; }
  function proximaAcao(e) { return (e && e.proximasAcoes && e.proximasAcoes[0]) || null; }
  function modeloProxAcao(nome) {
    var l = (typeof PROX_ACOES !== 'undefined') ? PROX_ACOES : [], i;
    for (i = 0; i < l.length; i++) if (l[i].nome === nome) return l[i];
    return null;
  }

  /* Lista os itens configurados que ainda não foram atendidos, usando o
   * mapa de verificações informado pela tela. Itens sem verificação
   * conhecida são ignorados. */
  function pendencias(lista, mapa) {
    return (lista || []).filter(function (k) { return mapa[k] && !mapa[k](); });
  }

  /* Fluxo entre etapas: só permite avançar se a próxima etapa constar em
   * "Pode avançar para" da etapa atual. */
  function fluxoPermite(e, proxima) {
    if (!e || !e.avancarPara || !e.avancarPara.length || !proxima) return true;
    return e.avancarPara.indexOf(proxima.nome) > -1;
  }

  /* Ações Automáticas: executadas sozinhas ao entrar/concluir a etapa,
   * sem nenhuma ação manual do vendedor. Ficam registradas na Lead
   * (auditoria do protótipo) e não se repetem para o mesmo momento. */
  function executarAcoes(e, lead, momento) {
    var lista = acoes(e);
    if (!lista.length || !lead) return lista;
    var reg = lead.acoesExecutadas || (lead.acoesExecutadas = []);
    var novas = [];
    lista.forEach(function (a) {
      var chave = (e.nome || '') + '|' + a + '|' + (momento || 'entrada');
      if (reg.indexOf(chave) > -1) return;
      reg.push(chave);
      novas.push(a);
    });
    if (novas.length) console.info('[funil] ações automáticas · ' + e.nome + ': ' + novas.join(', '));
    return lista;
  }

  return {
    funis: funis, funilSelecionado: funilSelecionado, porNome: porNome, funilDaLead: funilDaLead,
    etapas: etapas, etapasDaLead: etapasDaLead, idxEtapa: idxEtapa,
    campos: campos, validacoes: validacoes, acoes: acoes,
    proximaAcao: proximaAcao, modeloProxAcao: modeloProxAcao,
    pendencias: pendencias, fluxoPermite: fluxoPermite, executarAcoes: executarAcoes
  };
})();

/* modules/venda.js carrega antes de FUNIS existir: redesenha o Kanban e a
 * Lista agora que as etapas configuradas já estão disponíveis. */
if (typeof populateVendaFunilSelect === 'function') populateVendaFunilSelect();
if (typeof renderVenda === 'function') renderVenda();
