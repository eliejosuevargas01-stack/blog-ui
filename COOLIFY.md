# Coolify Deployment (SSG + HTML Persistente)

Este projeto está preparado para **SSG das páginas fixas** + **HTML persistente**
para posts, garantindo indexação estável e rápida.

## 1) Tipo de Deploy
- **Use Dockerfile** (o repo já possui `Dockerfile`).
- O container roda Node e serve `dist/spa` + HTMLs gerados.
- As páginas fixas são pré-renderizadas no build (`pnpm run ssg`).

## 2) Variáveis de Ambiente
Defina no Coolify:
- `SITE_ORIGIN=https://curiosotech.online`
- `PUBLISH_TOKEN=crie_um_token_forte`
- `GENERATED_DIR=/data/generated`
- `SSG_ORIGIN=https://curiosotech.online` (opcional, ajuda o build a carregar posts)

## 3) Volume Persistente
Crie um volume persistente e monte no container:
- Host path: (defina no VPS)
- Container path: `/data/generated`

Esse volume armazena:
- HTMLs gerados por post
- `sitemap.xml`

## 4) Endpoint para o n8n (publicação)
Envie o JSON do post para:
```
POST https://curiosotech.online/api/publish-post
Header: x-publish-token: <PUBLISH_TOKEN>
Body: { ...post_json... }
```
Também aceita array:
```
Body: [{...}, {...}]
```

O servidor:
- gera `/data/generated/<lang>/post/<slug>/index.html`
- atualiza `/data/generated/sitemap.xml`

## 5) Sitemap
- `robots.txt` já aponta para `/sitemap.xml`
- `/sitemap.xml` será servido do volume gerado

## 6) Rotas
Se existir HTML gerado, ele será servido **antes** do SPA.
Se não existir, o SPA é usado como fallback.

## Teste rápido (manual)
```
curl -X POST https://curiosotech.online/api/publish-post \
  -H "Content-Type: application/json" \
  -H "x-publish-token: <PUBLISH_TOKEN>" \
  -d '{"slug":"teste","titulo":"Teste","conteudo":"# Olá","lang":"pt"}'
```
Depois:
```
https://curiosotech.online/pt/post/teste
https://curiosotech.online/sitemap.xml
```
