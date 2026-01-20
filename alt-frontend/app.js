const postsContainer = document.getElementById("posts");
const endpointInput = document.getElementById("endpoint");
const reloadButton = document.getElementById("reload");
const statusEl = document.getElementById("status");
const template = document.getElementById("post-card-template");

function setStatus(message) {
  statusEl.textContent = message;
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function renderPosts(posts) {
  postsContainer.innerHTML = "";
  if (!Array.isArray(posts) || posts.length === 0) {
    postsContainer.innerHTML = "<p>Nenhum post encontrado.</p>";
    return;
  }

  for (const post of posts) {
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector(".post-card");
    const media = clone.querySelector(".post-media");
    const meta = clone.querySelector(".post-meta");
    const title = clone.querySelector(".post-title");
    const excerpt = clone.querySelector(".post-excerpt");

    const cover = post.cover_image_url || post.coverImage || post.image;
    if (cover) {
      const img = document.createElement("img");
      img.src = cover;
      img.alt = post.cover_image_alt || post.titulo || "Imagem do post";
      media.innerHTML = "";
      media.appendChild(img);
    } else {
      media.textContent = post.categoria || post.category || "Sem imagem";
    }

    const date = post.publicado_em || post.criado_em || post.publishedAt || "";
    meta.textContent = [post.categoria || post.category, date && new Date(date).toLocaleDateString("pt-BR")]
      .filter(Boolean)
      .join(" • ");

    title.textContent = post.titulo || post.title || post.slug || "Sem titulo";
    const text = post.resumo || post.excerpt || stripHtml(post.conteudo || post.content || "");
    excerpt.textContent = text.length > 140 ? `${text.slice(0, 140)}...` : text;

    postsContainer.appendChild(card);
  }
}

async function fetchPosts() {
  const endpoint = endpointInput.value.trim();
  if (!endpoint) {
    setStatus("Informe o endpoint.");
    return;
  }

  setStatus("Carregando...");
  try {
    let response;

    // Tenta POST primeiro
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list_posts" })
      });
    } catch (err) {
      response = null;
    }

    if (!response || !response.ok) {
      response = await fetch(endpoint);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    const posts = Array.isArray(data)
      ? data
      : Array.isArray(data?.posts)
        ? data.posts
        : Array.isArray(data?.data)
          ? data.data
          : [];

    renderPosts(posts);
    setStatus(`Carregado: ${posts.length} posts`);
  } catch (err) {
    setStatus("Falha ao carregar posts.");
    postsContainer.innerHTML = "<p>Erro ao carregar posts.</p>";
  }
}

reloadButton.addEventListener("click", fetchPosts);
fetchPosts();
