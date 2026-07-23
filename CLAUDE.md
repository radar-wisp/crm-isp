[CLAUDE.md](https://github.com/user-attachments/files/30306677/CLAUDE.md)
# CLAUDE.md

Guia de contexto para o Claude (ou outro assistente de IA) trabalhar neste
repositório.

## O que é este projeto

CRM interno ("Radar Internet") para provedor de internet, front-end puro
(HTML + CSS + JavaScript "vanilla", sem framework, sem build step). Os
dados são simulados em memória (`shared/mock-data.js`) — não há backend
nem persistência real.

## Regras ao editar este projeto

1. **Não introduza um bundler/framework sem que seja pedido explicitamente.**
   O projeto é intencionalmente "vanilla" e roda direto no navegador via
   `<script src="...">` sequenciais — leia `ARCHITECTURE.md` antes de
   mudar a forma como os arquivos são carregados.
2. **A ordem de carregamento em `config/app.config.js` importa.** Vários
   arquivos usam funções/variáveis globais definidas por arquivos
   anteriores da lista. Se adicionar um arquivo novo, adicione-o na
   posição certa e explique a dependência em um comentário.
3. **Nomes de menu, textos visíveis e o fluxo Lead → Funil → Venda são
   regra de negócio** — não renomeie nem reordene sem confirmação
   explícita do usuário.
4. **CSS:** ao adicionar uma regra nova, prefira o arquivo de
   `assets/css/` correspondente à tela afetada. Se afetar várias telas,
   considere se cabe em `02_layout.css` (chrome do app) ou se merece um
   arquivo próprio.
5. **Sempre teste no navegador antes de considerar uma tarefa concluída.**
   Este projeto usa `fetch()` para montar as telas — um erro comum é
   testar abrindo o arquivo direto (`file://`), o que sempre falha por
   causa de CORS. Sirva com `python3 -m http.server` (ou equivalente) e
   teste a navegação entre todas as telas, a abertura do assistente de
   venda (wizard) e a aba Configurações antes de finalizar.
6. **Erros de "hoisting entre arquivos"**: se uma função existir mas o
   console acusar "X is not defined" ao carregar a página, é provável que
   ela esteja definida em um arquivo que carrega DEPOIS de quem a usa.
   Ajuste a ordem em `config/app.config.js`, não duplique a função.

## Onde procurar cada coisa

| Preciso mexer em... | Vá para |
|---|---|
| Layout do menu lateral / topo | `shared/app-shell.js`, `assets/css/02_layout.css`, `index.html` |
| Cards e gráficos do Dashboard | `modules/dashboard.js`, `assets/css/03_dashboard.css`, `modules/dashboard.html` |
| Tabela e filtros de Leads | `modules/leads.js`, `assets/css/04_leads.css`, `modules/leads.html` |
| Kanban/Lista do Funil Comercial | `modules/funil.js`, `assets/css/06_funil.css`, `modules/funil.html` |
| Formulário de Cadastro do cliente | `modules/cadastro.js`, `assets/css/07_cadastro.css`, `modules/cadastro.html` |
| Kanban do vendedor / Próxima Ação | `modules/venda.js`, `assets/css/08_venda.css`, `modules/venda.html` |
| Assistente de conversão (wizard) | `shared/wizard-engine.js`, `assets/css/05_wizard.css`, `shared/modals.html` |
| Cadastros da tela Configurações (vendedores, planos, metas...) | `engine/config-engine.js`, `assets/css/09_config.css`, `modules/config.html` |
| Motor de Funis/Etapas/Ações/Validações (aba "Funis" em Configurações) | `engine/funnel-engine.js` |
| Dados fictícios de leads/vendedores | `shared/mock-data.js` |

## Comandos úteis

```bash
# servir localmente
python3 -m http.server 8080

# checar sintaxe de um arquivo JS isoladamente
node --check modules/leads.js
```
