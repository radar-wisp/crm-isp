[CHANGELOG.md](https://github.com/user-attachments/files/30432664/CHANGELOG.md)
[CHANGELOG.md](https://github.com/user-attachments/files/30306706/CHANGELOG.md)
# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

## [Unreleased]

### Added — Persistência local dos dados de teste

As informações, configurações e edições feitas na interface agora ficam
salvas no navegador e voltam ao recarregar a página. Nenhuma regra de
negócio, texto, nome de menu, layout ou fluxo foi alterado.

- Novos arquivos `engine/storage.js` (armazenamento + restauração dos
  Leads, carregado logo depois de `shared/mock-data.js`) e
  `engine/persistence.js` (restaura Configurações, Motor do Funil,
  Próximas Ações e Dashboard, salva automaticamente e cuida dos
  backups, carregado por último) — ver `ARCHITECTURE.md`.
- Salvamento automático (debounced) após qualquer interação e após cada
  `render*()`; os pontos de mutação do código original não foram
  tocados.
- Novo controle **Dados salvos** no topo da tela: salvar agora, exportar
  backup `.json`, importar backup e restaurar os dados iniciais.
- Novo `assets/css/10_persistence.css` (estilo do controle acima) e o
  `<link>` correspondente, adicionado por último no `index.html`.
- `modules/venda.js`: a etapa inicial do lead no Fluxo da Venda passou a
  ser sorteada apenas quando o lead ainda não tem etapa, para não
  sobrescrever a etapa restaurada. Em base nova, o resultado é idêntico.

Validado em navegador real (Playwright): criação de lead, exclusão de
registros em Configurações, reordenação de etapas do funil, exclusão de
Próximas Ações, avanço da Próxima Ação, remoção de card do Dashboard,
perda e avanço de venda no wizard — todos preservados após recarregar,
sem erros de console; exportação/importação de backup e restauração dos
dados iniciais funcionando.

### Changed — Reorganização em arquitetura modular

Nenhuma funcionalidade, layout, componente, CSS, JavaScript, nome de menu
ou fluxo de negócio foi alterado. Esta mudança é puramente estrutural:

- O `index.html` único (~2800 linhas, com CSS e JS inline) foi dividido em:
  - `assets/css/` — 9 arquivos de estilo, um por área/tela da aplicação;
  - `modules/` — HTML e JS de cada tela (`dashboard`, `leads`, `funil`,
    `cadastro`, `venda`, `config`) em arquivos próprios;
  - `shared/` — código e HTML usados por mais de uma tela (utilitários,
    dados fictícios, navegação do menu, assistente de venda/wizard,
    modais);
  - `engine/` — motores de regra de negócio da tela Configurações
    (cadastros dinâmicos e motor de funis/etapas/ações/validações);
  - `config/app.config.js` — lista, em um único lugar, os módulos e
    scripts a carregar e em que ordem.
- Adicionado `engine/module-loader.js`, responsável por montar a
  aplicação em tempo de execução (busca os módulos HTML e depois carrega
  os scripts, na ordem original).
- `index.html` passou a conter apenas a estrutura principal da aplicação
  (shell + placeholders), sem lógica de negócio.
- Ajuste estrutural único no JavaScript: as funções `esc()`/`escA()`
  foram movidas para `shared/utils.js` e passaram a carregar primeiro,
  para preservar exatamente o mesmo comportamento que existia por
  "hoisting" dentro do `<script>` único original (ver `ARCHITECTURE.md`).
  O corpo das duas funções não foi alterado.
- Adicionados `README.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `CLAUDE.md` e
  este `CHANGELOG.md`.

### Validação

A aplicação resultante foi testada em navegador real (Playwright):
navegação entre todas as telas, abertura/fechamento do assistente de
venda, tabelas e motor de funis da tela Configurações, e comparação
visual (screenshot) com o arquivo original — sem diferenças estruturais
ou de layout encontradas.
