# Coolify Deployment (Indexação Garantida)

Este projeto está preparado para **SSR leve + geração de HTML persistente** via API,
garantindo indexação estável sem deploy por post.

## 1) Tipo de Deploy
- **Use Dockerfile** (o repo já possui `Dockerfile`).
- O container roda Node e serve `dist/spa` + HTMLs gerados.

## 2) Variáveis de Ambiente
Defina no Coolify:
- `SITE_ORIGIN=https://curiosotech.online`
- `PUBLISH_TOKEN=crie_um_token_forte`
- `GENERATED_DIR=/data/generated`

## 3) Volume Persistente
Crie um volume e monte no container:
- Host path: (auto no Coolify)
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
