/* ==================================================================
 * Configuração da aplicação — Radar Internet CRM
 * ------------------------------------------------------------------
 * Define, em um único lugar, quais telas (modules/*.html) e quais
 * scripts o engine/module-loader.js deve carregar, e em que ordem.
 *
 * IMPORTANTE: a ordem da lista "scripts" reproduz exatamente a ordem
 * em que o código aparecia no <script> único original. Não reordene
 * sem revisar ARCHITECTURE.md — vários arquivos dependem de variáveis
 * e funções globais definidas pelos arquivos anteriores da lista.
 * ================================================================== */
window.APP_CONFIG = {
  htmlModules: [
    { target: '[data-module-slot="dashboard"]', url: 'modules/dashboard.html' },
    { target: '[data-module-slot="leads"]',     url: 'modules/leads.html' },
    { target: '[data-module-slot="funil"]',     url: 'modules/funil.html' },
    { target: '[data-module-slot="cadastro"]',  url: 'modules/cadastro.html' },
    { target: '[data-module-slot="venda"]',     url: 'modules/venda.html' },
    { target: '[data-module-slot="config"]',    url: 'modules/config.html' },
    { target: '[data-module-slot="modals"]',    url: 'shared/modals.html' }
  ],
  scripts: [
    'shared/utils.js',
    'shared/app-shell.js',
    'modules/funil.js',
    'modules/cadastro.js',
    'modules/config.js',
    'shared/mock-data.js',
    'modules/leads.js',
    'modules/venda.js',
    'shared/wizard-engine.js',
    'engine/config-engine.js',
    'modules/dashboard.js',
    'engine/funnel-engine.js'
  ]
};
