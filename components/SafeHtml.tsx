"use client";

import React from "react";

interface SafeHtmlProps {
  html: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
  className?: string;
  style?: React.CSSProperties;
}

export default function SafeHtml({ html, tag = "div", className = "", style }: SafeHtmlProps) {
  if (!html) return null;
  const Tag = tag as any;

  return (
    <Tag
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
