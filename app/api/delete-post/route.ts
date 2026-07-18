import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  let isAuthenticated = false;

  // 1. Check x-publish-token / auth header
  const apiToken = process.env.PUBLISH_TOKEN;
  if (apiToken) {
    const incoming =
      req.headers.get("x-publish-token") ??
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
      "";
    if (incoming === apiToken) {
      isAuthenticated = true;
    }
  }

  // 2. Check admin_token cookie
  if (!isAuthenticated) {
    const cookieToken = cookies().get("admin_token")?.value;
    if (cookieToken) {
      const payload = await verifyToken(cookieToken);
      if (payload) {
        isAuthenticated = true;
      }
    }
  }

  // If no PUBLISH_TOKEN is set in the environment, bypass auth check for webhook ease
  if (!apiToken) {
    isAuthenticated = true;
  }

  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await req.json();
    const { slug, id } = payload;

    if (!slug && !id) {
      return NextResponse.json({ error: "Missing slug or id" }, { status: 400 });
    }

    // Find the post
    let postToDelete = null;
    if (slug) {
      postToDelete = await prisma.post.findUnique({ where: { slug } });
    } else if (id) {
      // Try by database UUID or legacy ID string
      postToDelete = await prisma.post.findFirst({
        where: {
          OR: [
            { id: id },
            { slug: id.replace(/^post-[a-z]{2}-/, "") } // fallback for legacy IDs like post-pt-slug
          ]
        }
      });
    }

    if (!postToDelete) {
      return NextResponse.json({ error: "Post not found in database" }, { status: 404 });
    }

    // Collect all slugs (PT, EN, ES) from the translation mapping
    let slugsToDelete: string[] = [postToDelete.slug];
    if (postToDelete.slugs) {
      const slugMap = typeof postToDelete.slugs === "string" 
        ? JSON.parse(postToDelete.slugs) 
        : postToDelete.slugs;
      if (slugMap && typeof slugMap === "object") {
        Object.values(slugMap).forEach((val) => {
          if (typeof val === "string" && val.trim()) {
            slugsToDelete.push(val.trim());
          }
        });
      }
    }

    // Deduplicate
    slugsToDelete = Array.from(new Set(slugsToDelete));

    // Delete all matched posts from the database
    const deleteResult = await prisma.post.deleteMany({
      where: {
        slug: { in: slugsToDelete }
      }
    });

    console.log(`[Delete] Deleted ${deleteResult.count} posts matching slugs:`, slugsToDelete);

    return NextResponse.json({
      ok: true,
      deletedCount: deleteResult.count,
      deletedSlugs: slugsToDelete
    });

  } catch (error: any) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
