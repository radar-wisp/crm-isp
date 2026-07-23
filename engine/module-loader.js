/* ==================================================================
 * Engine / Module Loader
 * ------------------------------------------------------------------
 * Responsável por montar a aplicação em tempo de execução:
 *   1. Busca cada módulo HTML (telas + modais) definido em
 *      config/app.config.js e injeta no lugar do respectivo
 *      placeholder [data-module-slot] em index.html.
 *   2. Somente depois de TODAS as telas estarem no DOM, carrega os
 *      arquivos JavaScript, em sequência e na ORDEM EXATA declarada
 *      em config/app.config.js — preservando o mesmo comportamento
 *      do <script> único do index.html original.
 *
 * Por usar fetch(), este arquivo exige que o projeto seja servido via
 * HTTP (GitHub Pages, Live Server, "python -m http.server" etc.).
 * Abrir o index.html direto pelo navegador (protocolo file://) não
 * funciona — veja README.md.
 * ================================================================== */
(function () {
  'use strict';

  function loadHTML(mod) {
    return fetch(mod.url)
      .then(function (res) {
        if (!res.ok) throw new Error('Falha ao carregar módulo: ' + mod.url);
        return res.text();
      })
      .then(function (html) {
        var placeholder = document.querySelector(mod.target);
        if (!placeholder) throw new Error('Placeholder não encontrado para: ' + mod.url);
        placeholder.outerHTML = html;
      });
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('Falha ao carregar script: ' + src)); };
      document.body.appendChild(s);
    });
  }

  function loadScriptsInOrder(list) {
    return list.reduce(function (chain, src) {
      return chain.then(function () { return loadScript(src); });
    }, Promise.resolve());
  }

  function showFatalError(err) {
    console.error('[module-loader]', err);
    document.body.insertAdjacentHTML(
      'afterbegin',
      '<div style="background:#fee2e2;color:#991b1b;padding:14px 18px;' +
      'font:13px/1.5 system-ui,sans-serif;border-bottom:1px solid #fecaca">' +
      '<b>Não foi possível carregar a aplicação.</b><br>' +
      'Este projeto precisa ser servido via HTTP (GitHub Pages, ou um ' +
      'servidor local como <code>python -m http.server</code>) — não funciona ' +
      'abrindo o arquivo index.html diretamente pelo navegador.<br>' +
      '<small>' + (err && err.message ? err.message : err) + '</small></div>'
    );
  }

  function boot() {
    var cfg = window.APP_CONFIG;
    if (!cfg) { showFatalError('config/app.config.js não foi carregado.'); return; }

    Promise.all(cfg.htmlModules.map(loadHTML))
      .then(function () { return loadScriptsInOrder(cfg.scripts); })
      .catch(showFatalError);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
