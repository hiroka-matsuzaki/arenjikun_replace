// app/layout.tsx
/* eslint-disable react/react-in-jsx-scope */
'use client'; // クライアントコンポーネント
import React, { useEffect } from 'react';
import ResponsiveAppBar from '@/components/ResponsiveAppBar';
import './globals.css'; // 共通CSSの読み込み
import { ReactNode } from 'react';
import { User, UserProvider, useUser } from './context/UserContext';

// const mockUserData: User = {
//   user_name: '松崎 祥也',
//   login_code: 'ShoyaMatsuzaki',
//   department: '開発チーム',
//   companyts: 'HIROKA',
//   email: 's.matsuzaki@hiroka.biz',
// };

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
  const fetchUser = async (loginEmail: string): Promise<User> => {
    // const functionUrl = process.env.NEXT_PUBLIC_FUNCTION_URL;
    console.log('Email:', loginEmail);
    if (process.env.NODE_ENV === 'development') {
      return {
        email: 's.matsuzaki@hiroka.biz',
        user_name: '松崎　祥也',
        login_code: '999999',
        department: 'テスト部署',
        companyts: 'テスト株式会社',
        user_code: '602371',
      };
    }
    const response = await fetch(
      `https://azure-api-opf.azurewebsites.net/api/users?email=${loginEmail}` //テスト用ベタ打ち
    );
    if (!response.ok) {
      throw new Error(`HTTPエラー: ${response.status}`);
    }

    const data: User = await response.json();
    return data;
  };
  useEffect(() => {
    const fetchUserEmail = async () => {
      const response = await fetch('/api/getUserEmail');
      const data = await response.json();
      return data.email; // メールアドレスを設定// UserContext にユーザー情報を設定
    };
    const fetchData = async () => {
      try {
        const loginEmail = await fetchUserEmail();
        const userData = await fetchUser(loginEmail);
        setUser(userData);
        console.log('取得したユーザー情報:', userData);
      } catch (error) {
        console.error('データ取得エラー:', error);
      }
    };

    fetchData();
  }, [setUser]);

  const { user } = useUser(); // UserContextからユーザー情報を取得

  return (
    <>
      <ResponsiveAppBar userName={user ? user.user_name : null} /> {/* ユーザー名を渡す */}
      <main>{children}</main> {/* 各ページのコンテンツ */}
    </>
  );
};
