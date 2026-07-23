[README.md](https://github.com/user-attachments/files/30306666/README.md)
# Radar Internet — CRM

CRM interno para provedores de internet: captação e qualificação de Leads,
Funil Comercial, Fluxo da Venda (com assistente guiado de conversão),
Dashboard gerencial e Configurações (motor de funis, etapas, ações
automáticas e validações).

Este repositório contém a **mesma aplicação** que antes vivia em um único
arquivo `index.html`, reorganizada em uma **arquitetura modular** — sem
nenhuma mudança de funcionalidade, layout, comportamento ou nomes de menu.
Veja [`ARCHITECTURE.md`](./ARCHITECTURE.md) para o detalhamento técnico
dessa reorganização.

## Como rodar localmente

A aplicação carrega suas telas (`modules/*.html`) e scripts dinamicamente
via `fetch`. Por isso **precisa ser servida por HTTP** — abrir o
`index.html` direto no navegador (`file://`) não funciona, pois os
navegadores bloqueiam `fetch` de arquivos locais por segurança (CORS).

Opções simples:

```bash
# Python (já vem instalado na maioria dos sistemas)
python3 -m http.server 8080
# depois acesse http://localhost:8080

# Node.js
npx serve .

# VS Code
# instale a extensão "Live Server" e clique em "Go Live"
```

Também funciona automaticamente ao publicar no **GitHub Pages** — veja o
passo a passo mais abaixo.

## Estrutura do projeto

```
radar-internet/
├── index.html              # Casca da aplicação (shell + placeholders)
├── config/
│   └── app.config.js        # Define quais módulos/scripts carregar e em que ordem
├── engine/
│   ├── module-loader.js     # Monta a aplicação em runtime (fetch dos módulos)
│   ├── config-engine.js     # Motor das tabelas de cadastro (aba Configurações)
│   └── funnel-engine.js     # Motor do Funil (etapas, tipos, ações, validações)
├── modules/                 # Uma tela por arquivo (HTML + JS correspondente)
│   ├── dashboard.html / .js
│   ├── leads.html / .js
│   ├── funil.html / .js
│   ├── cadastro.html / .js
│   ├── venda.html / .js
│   └── config.html / .js
├── shared/                  # Código e HTML usados por mais de uma tela
│   ├── utils.js
│   ├── app-shell.js
│   ├── mock-data.js
│   ├── wizard-engine.js
│   └── modals.html
├── assets/
│   ├── css/                 # Uma folha de estilo por área da aplicação
│   ├── images/
│   └── icons/
└── docs/                    # Documentação técnica complementar
```

## Documentação

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — como o projeto foi modularizado e por quê.
- [`ROADMAP.md`](./ROADMAP.md) — próximos passos sugeridos.
- [`CHANGELOG.md`](./CHANGELOG.md) — histórico de mudanças.
- [`CLAUDE.md`](./CLAUDE.md) — guia de contexto para assistentes de IA (Claude) trabalharem neste repositório.

## Publicando no GitHub Pages (versão Web, sem linha de comando)

Veja o passo a passo completo na resposta que acompanha este pacote de
arquivos, ou em `docs/github-web-guide.md`.
