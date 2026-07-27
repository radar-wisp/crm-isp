/* ==================================================================
 * Persistência (parte 1/2) — armazenamento + restauração dos LEADS
 * ------------------------------------------------------------------
 * Objetivo: permitir TESTAR o CRM sem perder o que foi cadastrado,
 * configurado ou editado ao recarregar a página (F5). O estado é
 * gravado no localStorage do navegador — continua sendo um protótipo
 * front-end, sem backend; cada navegador/máquina tem seus próprios
 * dados.
 *
 * POR QUE ESTE ARQUIVO CARREGA CEDO (logo depois de shared/mock-data.js):
 * o array LEADS precisa ser reidratado ANTES de modules/leads.js e
 * modules/venda.js rodarem, porque esses dois montam suas telas (e o
 * array "mineAll" do Fluxo da Venda) a partir do conteúdo de LEADS no
 * momento em que são carregados. Sem isso, a cada F5 os 132 leads
 * seriam sorteados de novo pelo mock-data.js.
 *
 * A restauração do RESTANTE do estado (Configurações, Funis, Próximas
 * Ações, Dashboard) fica em engine/persistence.js, carregado por
 * último — só lá as variáveis CFG/FUNIS/PROX_ACOES/dashCards já existem.
 * ================================================================== */
(function () {
  'use strict';

  var KEY = 'radar-crm:estado:v1';
  var VERSAO = 1;

  var suportado = (function () {
    try {
      var t = '__radar_probe__';
      window.localStorage.setItem(t, '1');
      window.localStorage.removeItem(t);
      return true;
    } catch (e) {
      return false;
    }
  })();

  var memoria = null;      /* fallback quando o localStorage está bloqueado */
  var cache = null;
  var cacheLido = false;
  var ultimoRaw = null;
  var avisouQuota = false;
  var ouvintes = [];

  function ler() {
    if (cacheLido) return cache;
    cacheLido = true;
    try {
      var raw = suportado ? window.localStorage.getItem(KEY) : memoria;
      cache = raw ? JSON.parse(raw) : null;
      ultimoRaw = raw;
    } catch (e) {
      console.warn('[storage] estado salvo inválido — ignorando.', e);
      cache = null;
    }
    if (cache && cache.v !== VERSAO) {
      console.warn('[storage] estado salvo de versão diferente — ignorando.');
      cache = null;
    }
    return cache;
  }

  function gravar(estado) {
    var raw;
    try {
      raw = JSON.stringify(estado);
    } catch (e) {
      console.warn('[storage] não foi possível serializar o estado.', e);
      return false;
    }
    if (raw === ultimoRaw) return true;   /* nada mudou: evita escrita à toa */
    try {
      if (suportado) window.localStorage.setItem(KEY, raw); else memoria = raw;
      ultimoRaw = raw;
      cache = estado;
      cacheLido = true;
      notificar(estado);
      return true;
    } catch (e) {
      if (!avisouQuota) {
        avisouQuota = true;
        console.warn('[storage] falha ao gravar (cota do navegador?).', e);
      }
      return false;
    }
  }

  function limpar() {
    try { if (suportado) window.localStorage.removeItem(KEY); } catch (e) { /* ignora */ }
    memoria = null; cache = null; cacheLido = true; ultimoRaw = null;
  }

  /* Substitui o conteúdo de um array MANTENDO a mesma referência —
   * importante porque outras telas (ex.: "mineAll" em venda.js) guardam
   * referências para o mesmo array/objetos. */
  function preencherArray(alvo, dados) {
    if (!Array.isArray(alvo) || !Array.isArray(dados)) return false;
    alvo.length = 0;
    for (var i = 0; i < dados.length; i++) alvo.push(dados[i]);
    return true;
  }

  function aoSalvar(cb) { if (typeof cb === 'function') ouvintes.push(cb); }
  function notificar(estado) {
    for (var i = 0; i < ouvintes.length; i++) {
      try { ouvintes[i](estado); } catch (e) { /* um ouvinte quebrado não derruba o resto */ }
    }
  }

  window.RadarStore = {
    KEY: KEY,
    VERSAO: VERSAO,
    suportado: suportado,
    ler: ler,
    gravar: gravar,
    limpar: limpar,
    preencherArray: preencherArray,
    aoSalvar: aoSalvar,
    temEstadoSalvo: function () { return !!ler(); }
  };

  if (!suportado) {
    console.warn('[storage] localStorage indisponível neste contexto — ' +
      'as alterações valerão apenas até recarregar a página.');
  }

  /* ---- restauração dos LEADS (precisa acontecer AGORA, ver cabeçalho) ---- */
  var snap = ler();
  if (snap && Array.isArray(snap.leads) && typeof LEADS !== 'undefined') {
    preencherArray(LEADS, snap.leads);
  }
})();
