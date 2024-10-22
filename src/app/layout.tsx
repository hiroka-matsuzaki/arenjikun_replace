"use client";  // クライアントコンポーネント

import ResponsiveAppBar from "@/components/ResponsiveAppBar";
import "./globals.css";  // 共通CSSの読み込み
import { ReactNode } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <ResponsiveAppBar /> {/* 全ページ共通のヘッダー */}
        <main>{children}</main> {/* 各ページのコンテンツ */}
      </body>
    </html>
  );
}
