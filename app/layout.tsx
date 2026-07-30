import type { Metadata } from "next";
import { Barlow, Teko } from "next/font/google";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin"],
  variable: "--font-barlow",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const teko = Teko({
  subsets: ["latin"],
  variable: "--font-teko",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CuriosoTech · Tecnologia, Geopolítica e Curiosidades",
  description: "Portal editorial sobre bastidores da tecnologia, inteligência artificial, geopolítica e curiosidades do mundo conectado.",
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className={`${barlow.variable} ${teko.variable}`}>
      <body>{children}</body>
    </html>
  );
}
