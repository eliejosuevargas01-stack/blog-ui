"use client";

import { useEffect } from "react";

interface PostViewTrackerProps {
  postId: number | string;
}

export default function PostViewTracker({ postId }: PostViewTrackerProps) {
  useEffect(() => {
    if (!postId) return;
    fetch("/api/posts/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    }).catch(() => {});
  }, [postId]);

  return null;
}
