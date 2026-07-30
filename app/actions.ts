"use server";

import { prisma } from "../lib/db";
import { signToken, checkCredentials } from "../lib/auth";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notifyGoogleIndexing } from "../lib/google-indexing";
import { calculateReadTime } from "../lib/image-utils";

// --- AUTENTICAÇÃO ---

export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Por favor, preencha todos os campos." };
  }

  const isValid = checkCredentials(username, password);

  if (!isValid) {
    return { error: "Usuário ou senha incorretos." };
  }

  // Criar token de sessão e setar cookie
  const token = await signToken(username);
  
  cookies().set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });

  return { success: true };
}

export async function logoutAction() {
  cookies().delete("admin_token");
  redirect("/admin/login");
}

// --- CRUD DE POSTS ---

export async function savePostAction(data: {
  id?: string;
  slug: string;
  tag: string;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  img: string;
  imgFocalPoint: string;
  audioUrl?: string | null;
  audioUrlsByLang?: Record<string, string | null>;
  blocks: { text: string; image: string; focalPoint: string }[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  lang?: string;
}) {
  try {
    // Validar slug
    const existing = await prisma.post.findFirst({
      where: {
        slug: data.slug,
        id: data.id ? { not: data.id } : undefined
      }
    });

    if (existing) {
      return { error: "Já existe um post com esta URL (slug). Escolha outro." };
    }

    const lang = data.lang || "pt";

    const computedReadTime = calculateReadTime({ title: data.title, excerpt: data.excerpt, blocks: data.blocks });
    const finalReadTime = (data.readTime && data.readTime !== "5 min") ? data.readTime : computedReadTime;

    if (data.id) {
      // Obter post atual para capturar translationGroupId
      const currentPost = await prisma.post.findUnique({ where: { id: data.id } });
      const translationGroupId = currentPost?.translationGroupId;

      const targetAudio = data.audioUrlsByLang && data.audioUrlsByLang[lang] !== undefined
        ? data.audioUrlsByLang[lang]
        : (data.audioUrl || null);

      // Atualização do post alvo
      await prisma.post.update({
        where: { id: data.id },
        data: {
          slug: data.slug,
          tag: data.tag,
          category: data.category,
          title: data.title,
          excerpt: data.excerpt,
          readTime: finalReadTime,
          img: data.img,
          imgFocalPoint: data.imgFocalPoint,
          audioUrl: targetAudio || null,
          blocks: data.blocks as any,
          seoTitle: data.seoTitle || data.title,
          seoDescription: data.seoDescription || data.excerpt,
          seoKeywords: data.seoKeywords || "",
          lang,
          date: new Date() // Atualizar data ao editar
        }
      });

      // Sincronizar imagens (e áudios específicos de idioma) com todos os posts do mesmo grupo de tradução
      if (translationGroupId) {
        const sisterPosts = await prisma.post.findMany({
          where: {
            translationGroupId,
            id: { not: data.id }
          }
        });

        for (const sister of sisterPosts) {
          let sisterBlocks: any[] = [];
          if (Array.isArray(sister.blocks)) {
            sisterBlocks = sister.blocks;
          } else if (typeof sister.blocks === "string") {
            try {
              sisterBlocks = JSON.parse(sister.blocks);
            } catch (e) {
              sisterBlocks = [];
            }
          }

          const updatedSisterBlocks = sisterBlocks.map((b: any, idx: number) => {
            const sourceBlock = data.blocks[idx];
            if (sourceBlock) {
              return {
                ...b,
                image: sourceBlock.image || "",
                focalPoint: sourceBlock.focalPoint || "center"
              };
            }
            return b;
          });

          const sisterAudio = data.audioUrlsByLang && data.audioUrlsByLang[sister.lang] !== undefined
            ? data.audioUrlsByLang[sister.lang]
            : sister.audioUrl;

          const sisterComputedReadTime = calculateReadTime({ title: sister.title, excerpt: sister.excerpt, blocks: updatedSisterBlocks });

          await prisma.post.update({
            where: { id: sister.id },
            data: {
              img: data.img,
              imgFocalPoint: data.imgFocalPoint,
              readTime: sisterComputedReadTime,
              audioUrl: sisterAudio || null,
              blocks: updatedSisterBlocks as any
            }
          });
        }
      }
    } else {
      // Criação
      await prisma.post.create({
        data: {
          slug: data.slug,
          tag: data.tag,
          category: data.category,
          title: data.title,
          excerpt: data.excerpt,
          readTime: finalReadTime,
          img: data.img,
          imgFocalPoint: data.imgFocalPoint,
          audioUrl: data.audioUrl || null,
          blocks: data.blocks as any,
          seoTitle: data.seoTitle || data.title,
          seoDescription: data.seoDescription || data.excerpt,
          seoKeywords: data.seoKeywords || "",
          lang
        }
      });
    }

    // Revalidar caches públicos
    revalidatePath("/");
    revalidatePath("/reviews");
    revalidatePath("/manutencao");
    revalidatePath("/rotas");
    revalidatePath("/equipamentos");
    revalidatePath(`/post/${data.slug}`);
    revalidatePath("/sitemap.xml");

    // Indexação automática via Google Indexing API
    try {
      const configPage = await prisma.page.findUnique({ where: { slug: "config" } });
      let activePlugins: Record<string, boolean> = {};
      if (configPage && configPage.content) {
        const contentObj = typeof configPage.content === "string" 
          ? JSON.parse(configPage.content) 
          : configPage.content;
        activePlugins = contentObj.activePlugins || {};
      }
      if (activePlugins["googleIndexing"]) {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://motonapratica.online";
        const postUrl = `${baseUrl}/post/${data.slug}`;
        notifyGoogleIndexing(postUrl).then((res) => {
          if (res.success) {
            console.log(`[Google Indexing] URL ${postUrl} enviada com sucesso para indexação instantânea.`);
          } else {
            console.warn(`[Google Indexing] Falha ao indexar URL ${postUrl}:`, res.message);
          }
        });
      }
    } catch (e) {
      console.error("Erro ao rodar plugin de indexação do Google:", e);
    }

    // Disparar Webhook do n8n (caso haja leitores inscritos e webhook ativo)
    try {
      const savedPost = await prisma.post.findUnique({ where: { slug: data.slug } });
      if (savedPost) {
        await triggerN8nWebhook(savedPost);
      }
    } catch (e) {
      console.warn("Falha ao disparar webhook n8n:", e);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao salvar post:", error);
    return { error: "Erro interno ao salvar post no banco de dados." };
  }
}

export async function deletePostAction(id: string) {
  try {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return { error: "Post não encontrado." };
    }

    // Se o post possuir um translationGroupId, deleta todo o grupo (PT, EN, ES)
    if (post.translationGroupId) {
      await prisma.post.deleteMany({
        where: { translationGroupId: post.translationGroupId }
      });
    } else {
      await prisma.post.delete({ where: { id } });
    }

    revalidatePath("/");
    revalidatePath("/posts");
    revalidatePath("/reviews");
    revalidatePath("/manutencao");
    revalidatePath("/rotas");
    revalidatePath("/equipamentos");
    if (post.slug) revalidatePath(`/post/${post.slug}`);
    revalidatePath("/sitemap.xml");

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar post:", error);
    return { error: "Erro ao deletar post e suas traduções." };
  }
}

// --- INTEGRAÇÃO COM N8N & NOTIFICAÇÕES ---

export async function triggerN8nWebhook(post: any) {
  try {
    const configPage = await prisma.page.findUnique({ where: { slug: "config" } });
    let webhookUrl = process.env.N8N_WEBHOOK_URL || "";
    
    if (configPage && configPage.content) {
      const content = typeof configPage.content === "string" ? JSON.parse(configPage.content) : configPage.content;
      if (content.n8nWebhookUrl) {
        webhookUrl = content.n8nWebhookUrl;
      }
    }

    if (!webhookUrl) return;

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://motonapratica.online";
    
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "new_post_published",
        post: {
          id: post.id,
          title: post.title,
          excerpt: post.excerpt,
          slug: post.slug,
          tag: post.tag,
          category: post.category,
          img: post.img,
          url: `${baseUrl}/post/${post.slug}`,
          createdAt: post.createdAt || post.date,
        },
      }),
    });
  } catch (e) {
    console.warn("Erro no disparo do webhook para n8n:", e);
  }
}

export async function getNotificationsAction() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return { success: true, notifications };
  } catch (error) {
    return { success: false, notifications: [] };
  }
}

export async function getSubscribersAction() {
  try {
    const subscribers = await prisma.subscriber.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, subscribers };
  } catch (error) {
    return { success: false, subscribers: [] };
  }
}

export async function markNotificationAsReadAction(id: string) {
  try {
    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// --- CRUD DE PÁGINAS ---

export async function savePageAction(data: {
  id?: string;
  slug: string;
  title: string;
  isStatic: boolean;
  content: any;
  seoTitle?: string;
  seoDescription?: string;
}) {
  try {
    // Validar slug
    const existing = await prisma.page.findFirst({
      where: {
        slug: data.slug,
        id: data.id ? { not: data.id } : undefined
      }
    });

    if (existing) {
      return { error: "Já existe uma página com esta URL (slug). Escolha outro." };
    }

    const isFallbackId = data.id?.startsWith("fallback-");

    if (data.id && !isFallbackId) {
      await prisma.page.update({
        where: { id: data.id },
        data: {
          slug: data.slug,
          title: data.title,
          isStatic: data.isStatic,
          content: data.content,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription
        }
      });
    } else {
      await prisma.page.create({
        data: {
          slug: data.slug,
          title: data.title,
          isStatic: data.isStatic,
          content: data.content,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription
        }
      });
    }

    // Revalidar rotas
    revalidatePath("/");
    revalidatePath("/sobre");
    revalidatePath(`/${data.slug}`);
    revalidatePath("/sitemap.xml");

    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar página:", error);
    return { error: "Erro ao salvar página." };
  }
}

export async function deletePageAction(id: string) {
  try {
    const page = await prisma.page.findUnique({ where: { id } });
    if (page?.isStatic) {
      return { error: "Páginas fixas do sistema (Home e Sobre) não podem ser deletadas." };
    }
    
    await prisma.page.delete({ where: { id } });

    revalidatePath("/sitemap.xml");
    if (page) revalidatePath(`/${page.slug}`);

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar página:", error);
    return { error: "Erro ao deletar página." };
  }
}

