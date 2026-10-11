import type { Metadata, Viewport } from "next";
import { content } from "@/lib/content";
import "./globals.css";

export const metadata: Metadata = {
  title: content.pageTitle,
  description: content.pageDescription,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1d1b4b",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body className="font-serif antialiased">{children}</body>
    </html>
  );
}
