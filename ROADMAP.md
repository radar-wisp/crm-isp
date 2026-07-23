[ROADMAP.md](https://github.com/user-attachments/files/30306687/ROADMAP.md)
# Roadmap

Este roadmap é uma sugestão de evolução técnica **após** a modularização
feita neste pacote. Nenhum item aqui foi implementado — são apenas
próximos passos possíveis, para discussão com o time.

## Curto prazo

- [ ] Conectar a um backend real (API REST/GraphQL) substituindo
      `shared/mock-data.js` por chamadas de rede.
- [ ] Adicionar um `data-module-slot` "estado de carregamento" (skeleton)
      enquanto os módulos HTML são buscados, para evitar o flash de tela
      em branco em conexões lentas.
- [ ] Configurar um linter (ESLint) e um formatter (Prettier) para manter
      consistência entre os arquivos de `modules/`, `shared/` e `engine/`.

## Médio prazo

- [ ] Autenticação e controle de acesso por perfil (hoje o usuário
      "Renatha Loiola" é fixo no código).
- [ ] Persistência real de Leads, Funis, Etapas e Próximas Ações (hoje
      tudo vive em memória e se perde ao recarregar a página).
- [ ] Testes automatizados de regressão de UI (ex.: Playwright) cobrindo
      a navegação entre todas as telas e o fluxo completo do assistente
      de venda.

## Longo prazo — avaliar se faz sentido

- [ ] Migrar para um bundler (Vite/esbuild) caso o número de módulos
      cresça muito, permitindo ES Modules reais (`import`/`export`) no
      lugar do carregamento sequencial via `<script>`.
- [ ] Avaliar um framework de componentes se a complexidade de estado
      compartilhado entre telas aumentar.

> Qualquer item deste roadmap que mude comportamento, layout ou fluxo de
> negócio deve ser validado com o time de produto antes de ser
> implementado — este documento é só uma lista de ideias técnicas.
