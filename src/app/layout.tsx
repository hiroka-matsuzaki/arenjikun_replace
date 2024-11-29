// app/layout.tsx
/* eslint-disable react/react-in-jsx-scope */
'use client'; // クライアントコンポーネント
import React, { useEffect } from 'react';
import ResponsiveAppBar from '@/components/ResponsiveAppBar';
import './globals.css'; // 共通CSSの読み込み
import { ReactNode } from 'react';
import { User, UserProvider, useUser } from './context/UserContext';

const mockUserData: User = {
  user_name: '松崎 祥也',
  login_code: 'ShoyaMatsuzaki',
  department: '開発チーム',
  companyts: 'HIROKA',
  email: 's.matsuzaki@hiroka.biz',
};

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
  const { setUser } = useUser(); // UserContextからsetUserを取得

  useEffect(() => {
    // EntraIDから取得した情報を仮データで設定
    setUser(mockUserData);
  }, [setUser]);

  const { user } = useUser(); // UserContextからユーザー情報を取得

  return (
    <>
      <ResponsiveAppBar userName={user ? user.user_name : null} /> {/* ユーザー名を渡す */}
      <main>{children}</main> {/* 各ページのコンテンツ */}
    </>
  );
};
