// app/layout.tsx
/* eslint-disable react/react-in-jsx-scope */
'use client'; // クライアントコンポーネント
import React, { useEffect, useState } from 'react';
import ResponsiveAppBar from '@/components/ResponsiveAppBar';
import './globals.css'; // 共通CSSの読み込み
import { ReactNode } from 'react';
import { UserProvider, useUser } from './context/UserContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <UserProvider>
          <MainContent>{children}</MainContent> {/* 子コンポーネントを渡す */}
        </UserProvider>
      </body>
    </html>
  );
}

// メインコンテンツでユーザー情報を渡す
const MainContent: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { setUser } = useUser(); // UserContextからsetUserを取得

  useEffect(() => {
    // クライアントから取得したユーザー情報（App Service 認証によるメールアドレス）
    const fetchUserEmail = async () => {
      const response = await fetch('/api/getUserInfo');
      if (response.ok) {
        const data = await response.json();
        setUserEmail(data.email); // メールアドレスを設定
        setUser(data); // UserContext にユーザー情報を設定
      }
    };

    fetchUserEmail();
  }, [setUser]);

  const { user } = useUser(); // UserContextからユーザー情報を取得

  return (
    <>
      <ResponsiveAppBar userName={user ? user.user_name : null} /> {/* ユーザー名を渡す */}
      <div>
        {userEmail && <p>ログイン済み: {userEmail}</p>} {/* メールアドレスを表示 */}
      </div>
      <main>{children}</main> {/* 各ページのコンテンツ */}
    </>
  );
};
