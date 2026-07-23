import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { prisma } from "../lib/db";
import { GET as getPostsHandler } from "../app/api/posts/[lang]/route";
import { POST as publishPostHandler } from "../app/api/publish-post/route";
import { NextRequest } from "next/server";

describe("Blog System Integration Tests", () => {
  const TEST_POST_ID = "test-post-uuid-999";
  const TEST_SLUG = "test-slug-usability-usabilidade";

  // Clean up any existing test records before starting
  before(async () => {
    try {
      await prisma.post.deleteMany({
        where: {
          id: { in: [TEST_POST_ID] }
        }
      });
    } catch (e) {
      // Ignored
    }
  });

  // Clean up after tests run
  after(async () => {
    try {
      await prisma.post.deleteMany({
        where: {
          id: { in: [TEST_POST_ID] }
        }
      });
    } catch (e) {
      // Ignored
    }
  });

  test("1. Database post creation and query verification", async () => {
    const created = await prisma.post.create({
      data: {
        id: TEST_POST_ID,
        slug: TEST_SLUG,
        lang: "pt",
        tag: "Teste",
        category: "Tecnologia",
        title: "Título de Teste de Integração",
        excerpt: "Este é um resumo do artigo de teste.",
        readTime: "3 min",
        img: "",
        blocks: [
          { text: "<p>Conteúdo de teste do bloco.</p>", image: "", focalPoint: "center" }
        ],
        published: true,
        date: new Date()
      }
    });

    assert.strictEqual(created.id, TEST_POST_ID);
    assert.strictEqual(created.slug, TEST_SLUG);
    assert.strictEqual(created.lang, "pt");

    const found = await prisma.post.findUnique({
      where: { id_lang: { id: TEST_POST_ID, lang: "pt" } }
    });
    assert.ok(found);
    assert.strictEqual(found.title, "Título de Teste de Integração");
  });

  test("2. GET /api/posts/[lang] handler (user common reading view)", async () => {
    const req = new NextRequest(`http://localhost:3000/api/posts/pt?all=true`);
    const response = await getPostsHandler(req, { params: { lang: "pt" } });
    
    assert.strictEqual(response.status, 200);
    const body = await response.json();
    
    assert.ok(body.posts);
    assert.ok(Array.isArray(body.posts));
    
    const testPost = body.posts.find((p: any) => p.id === TEST_POST_ID);
    assert.ok(testPost);
    assert.strictEqual(testPost.title, "Título de Teste de Integração");
  });

  test("3. POST /api/publish-post handler (publishing/saving post draft/update)", async () => {
    const payload = {
      output: {
        id: TEST_POST_ID,
        slug: TEST_SLUG,
        titulo: "Título de Teste Atualizado",
        conteudo_html: {
          bloco1: "<h1>Título de Teste Atualizado</h1><p>Novo parágrafo editado.</p>"
        },
        categoria: "Tecnologia",
        excerpt: "Resumo atualizado",
        tags: ["teste", "atualizacao"],
        palavra_chave_principal: "teste",
        published: false
      }
    };

    process.env.PUBLISH_TOKEN = "integration-test-token";

    const req = new NextRequest("http://localhost:3000/api/publish-post?lang=pt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publish-token": "integration-test-token"
      },
      body: JSON.stringify(payload)
    });

    const response = await publishPostHandler(req);
    assert.strictEqual(response.status, 200);

    const body = await response.json();
    assert.ok(body.success);

    const updatedPost = await prisma.post.findUnique({
      where: { id_lang: { id: TEST_POST_ID, lang: "pt" } }
    });
    assert.ok(updatedPost);
    assert.strictEqual(updatedPost.title, "Título de Teste Atualizado");
    assert.strictEqual(updatedPost.published, false);
  });
});
