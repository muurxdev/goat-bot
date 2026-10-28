# Problemas conhecidos — GOATBOT

**Atualizado:** 2026-10-28. Este arquivo substitui a versão de 2026-08-30. Relatórios antigos de fase estão em `docs/historico/`.

## Estado do código

- Comandos ficam em `src/commands/<categoria>/`. Insígnias do Reino (`badge_trofeu_N`) usam a fábrica `src/utils/insignia.js`.
- Erros engolidos: nenhum `catch` vazio em `src/`. Qualquer `catch` novo precisa de `logger.warn`/`logger.error` com contexto.
- SQL com texto fixo passa por `q()` (cache de statement de `src/database/connection.js`). SQL com `${}` continua em `db.prepare`, de propósito.
- Download de URL de usuário passa por `buscarComSeguranca` (`src/services/media/urlSeguro.js`), que confere cada redirecionamento.

## Testes

- `npm test` roda `scripts/check-template-literals.js` e depois `scripts/run-tests.js`. O runner roda cada `tests/*.test.js` em processo separado, com `NODE_ENV=test`, e mostra o resumo no fim.
- Em 2026-10-28, com banco de teste novo, 85 de 115 arquivos passam. As falhas já existiam antes das mudanças dessa data. Não há falha nova.
- **Estado compartilhado:** o banco `data/database.test.sqlite` não é zerado entre execuções. Dados de um teste aparecem em outro e geram falhas que não são do código. Para uma execução limpa, apague `data/database.test.sqlite*` antes.

## Itens em aberto

- **Dispatcher:** `dispatch()` em `src/handlers/commandDispatcher.js` tem ~500 linhas e 12 portões em sequência, com variáveis compartilhadas. Dividir em funções é a próxima refatoração. Os testes de login, módulos, aluguel e hierarquia são a rede de segurança.
- **Falhas de teste pré-existentes:** 30 arquivos de teste falham desde antes desta data (ex.: `group-control.test.js`, `backup.test.js`, `hierarchy-modules.test.js`). Cada um precisa de análise própria.
- **Repositório Git:** `.git/objects/pack` tem ~587 MiB. Reduzir isso exige reescrever histórico; não foi feito.
- **Dados locais:** `cookies.txt` e `.env` ficam na raiz, mas não estão rastreados pelo Git. Confira antes de qualquer commit.
- **Arquivos arquivados:** `indexx.js`, `legacy_backup/`, `scratch/` e os `relatorio-*` foram movidos para `../GOATBOT-arquivo-2026-10-28` (fora do repositório, em 2026-10-28). Não são usados por nenhum código.
- **Scripts arquivados:** geradores já executados estão em `scripts/archive/`. Não rodar de novo: eles sobrescrevem dados.
