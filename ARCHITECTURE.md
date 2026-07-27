[ARCHITECTURE.md](https://github.com/user-attachments/files/30432647/ARCHITECTURE.md)
[ARCHITECTURE.md](https://github.com/user-attachments/files/30306716/ARCHITECTURE.md)
# Arquitetura

## Objetivo desta reorganização

O projeto era um único arquivo `index.html` (~2800 linhas) com CSS, HTML e
JavaScript misturados. Esta reorganização **não mudou nenhuma
funcionalidade, layout, componente, CSS, JavaScript, nome de menu ou fluxo
de negócio** — apenas separou o mesmo código em arquivos por
responsabilidade. Tudo foi validado rodando a aplicação real em navegador
(Playwright) e comparando visualmente com o original antes da entrega.

## Como a aplicação é montada

Como não há um processo de build (Webpack/Vite/etc.), a junção dos módulos
acontece **em tempo de execução, no navegador**:

1. `index.html` carrega o CSS (`assets/css/*.css`) e contém apenas a
   "casca" da aplicação: sidebar, topo e um placeholder `<div
   data-module-slot="...">` para cada tela.
2. `config/app.config.js` declara, em um único lugar, a lista de módulos
   HTML e a lista de scripts, **na ordem correta**.
3. `engine/module-loader.js`:
   - busca (`fetch`) cada módulo em `modules/*.html` e `shared/modals.html`
     e substitui o placeholder correspondente pelo HTML da tela;
   - só depois de **todas** as telas estarem no DOM, carrega os arquivos
     JavaScript, um de cada vez, respeitando a ordem — igual ao
     comportamento do `<script>` único original.

Por depender de `fetch`, o projeto precisa ser servido via HTTP (ver
README.md). Isso é uma consequência inevitável de não ter build step; é o
mesmo padrão usado por qualquer app "vanilla" modularizado sem bundler.

## Por que a ORDEM dos scripts importa

O JavaScript original era um único `<script>`. Dentro de um único bloco de
script, declarações `function nome(){}` são "hoisted" (ficam disponíveis
para todo o bloco, mesmo antes de sua definição textual). Ao dividir em
vários arquivos `<script src="...">`, esse hoisting deixa de valer *entre*
arquivos — cada arquivo só enxerga o que já foi carregado antes dele.

Por isso `config/app.config.js` carrega os scripts nesta ordem, que
reproduz a ordem original do código:

1. `shared/utils.js` — `esc()`/`escA()` (escape de HTML)
2. `shared/app-shell.js` — menu lateral e navegação
3. `modules/funil.js`, `modules/cadastro.js`, `modules/config.js` — pequenos
   comportamentos de UI dessas telas
4. `shared/mock-data.js` — dados fictícios (leads simulados)
5. `modules/leads.js`
6. `modules/venda.js`
7. `shared/wizard-engine.js` — assistente de conversão de lead em venda
8. `engine/config-engine.js` — tabelas dinâmicas da tela Configurações
9. `modules/dashboard.js`
10. `engine/funnel-engine.js` — motor de funis/etapas/ações/validações

**Único ajuste deliberado ao código, puramente estrutural:** as funções
`esc()` e `escA()` (escape de HTML, usadas por quase todas as telas) foram
movidas para `shared/utils.js` e carregadas primeiro. No arquivo original,
elas ficavam definidas mais abaixo, mas eram alcançáveis por hoisting
dentro do único `<script>`. Ao dividir em múltiplos arquivos, precisavam
ser carregadas antes de quem as usa. **O corpo das duas funções não foi
alterado em nenhuma linha** — apenas o ponto de definição foi adiantado, o
que não muda nenhum comportamento (elas não têm nenhuma dependência).
Nenhum outro trecho de lógica foi movido, reescrito ou reordenado.

## Critério usado para separar o CSS

O CSS foi dividido em blocos contíguos (a mesma ordem de texto do arquivo
original), nomeados pela tela/área que concentra a maioria das regras
daquele bloco. A ordem de carregamento dos `<link>` no `index.html`
reproduz exatamente a ordem original — importante porque, em CSS, quando
duas regras têm a mesma especificidade, vence a que aparece depois.
Algumas classes utilitárias (ex.: `.btn-primary`, `.content`) aparecem no
arquivo do bloco onde foram originalmente escritas, mesmo sendo usadas por
mais de uma tela — isso é só uma questão de nome de arquivo, não afeta o
resultado visual.

## Critério usado para separar o JavaScript

Cada tela (`dashboard`, `leads`, `funil`, `cadastro`, `venda`, `config`)
ganhou um arquivo próprio em `modules/` com o código específico daquela
tela. Código usado por mais de uma tela foi para `shared/`
(dados fictícios, utilitários, o assistente de conversão de venda,
navegação do menu). As duas grandes "engines" de configuração — o motor de
tabelas cadastráveis e o motor de funis/etapas/ações/validações — ficaram
em `engine/`, por serem, na prática, o motor de regras de negócio por trás
da tela Configurações, e não HTML/CSS de uma tela específica.

## O que NÃO mudou

- Nenhuma regra de negócio, cálculo, texto ou nome de menu.
- Nenhuma classe CSS foi renomeada ou removida.
- Nenhuma função JavaScript teve seu corpo alterado (fora o realocamento
  documentado acima de `esc`/`escA`).
- O HTML de cada tela é byte-a-byte o mesmo do arquivo original,
  apenas movido para seu próprio arquivo.

## Camada de persistência (dados de teste)

Acrescentada depois da modularização, para que o protótipo possa ser
testado sem perder o que foi cadastrado a cada `F5`. São dois arquivos,
e a posição de cada um na lista de `config/app.config.js` é o ponto
importante:

| Arquivo | Posição | Por quê |
|---|---|---|
| `engine/storage.js` | logo **depois** de `shared/mock-data.js` | Reidrata o array `LEADS` antes de `modules/leads.js` e `modules/venda.js` rodarem — os dois montam suas telas (e o array `mineAll`) a partir do conteúdo de `LEADS` no momento em que carregam. Sem isso, os 132 leads seriam sorteados de novo a cada recarga. |
| `engine/persistence.js` | **por último** | Só neste ponto `CFG`, `FUNIS`, `PROX_ACOES` e o estado do Dashboard já existem para serem restaurados; depois de restaurá-los, redesenha as telas que já haviam sido montadas com os dados-semente. |

Como o estado é gravado:

- **Sem tocar nos pontos de mutação.** Em vez de chamar "salvar" em cada
  `push`/`splice`/`Object.assign` espalhado pelo projeto, o
  `persistence.js` grava de forma *debounced* (400 ms) depois de qualquer
  `click`/`change`/`input` no documento e depois de cada `render*()`.
  As funções de render originais não foram alteradas — elas são apenas
  envolvidas (`window.renderLeads = wrap(renderLeads)`), o que preserva o
  comportamento e mantém a gravação acoplada ao momento em que o estado
  realmente muda (importante em fluxos assíncronos, como a conclusão da
  venda no wizard, que altera o lead ~1,6 s depois do clique).
- **Uma única chave** no `localStorage` (`radar-crm:estado:v1`, ~85 KB),
  versionada: um snapshot de versão diferente é descartado em vez de
  quebrar a tela.
- **Restauração preservando referências**: arrays são preenchidos no
  lugar (`arr.length=0` + `push`), nunca substituídos, porque outras
  telas guardam referências para os mesmos objetos (ex.: `mineAll` em
  `modules/venda.js`).

Único ajuste de comportamento em código existente: em `modules/venda.js`,
a etapa inicial (`fstage`) passou a ser sorteada apenas para leads que
ainda não têm etapa (`if(l.fstage==null)`), para não sobrescrever a etapa
restaurada. Em uma base nova (sem nada salvo) o resultado é idêntico ao
anterior.
