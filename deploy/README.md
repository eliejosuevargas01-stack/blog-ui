# Coolify Deploy Script

Este README descreve o comportamento do script `deploy/coolify-deploy.js`.

## O que o script faz

1) Le as variaveis `COOLIFY_WEBHOOK_URL` e `COOLIFY_API_TOKEN`.
2) Se ela nao existir, exibe erro e encerra com `process.exit(1)`.
3) Monta um payload com dados do GitHub Actions.
4) Envia um POST para o webhook do Coolify.
5) Se a resposta nao for OK, lança erro com detalhes.
6) Em caso de erro, registra no console e encerra com `process.exit(1)`.

## Variaveis usadas

- `COOLIFY_WEBHOOK_URL`: URL do webhook do projeto no Coolify.
- `COOLIFY_API_TOKEN`: token de API do Coolify com permissao `deploy`.
- `GITHUB_REPOSITORY`: repo atual.
- `GITHUB_REF`: branch/tag do commit.
- `GITHUB_SHA`: hash do commit.
- `GITHUB_ACTOR`: autor do commit.
- `GITHUB_EVENT_NAME`: evento que disparou o workflow.

## Observacoes

- O script depende de `fetch` disponivel no Node 18+ (padrao no GitHub Actions).
- Para outro projeto, basta trocar o secret `COOLIFY_WEBHOOK_URL`.
