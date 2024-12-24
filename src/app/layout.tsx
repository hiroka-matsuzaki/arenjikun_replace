/* eslint-disable react/react-in-jsx-scope */
'use client';
import React, { useEffect } from 'react';
import ResponsiveAppBar from '@/components/ResponsiveAppBar';
import './globals.css';
import { ReactNode } from 'react';
import { User, UserProvider, useUser } from './context/UserContext';
import jwt, { JwtPayload } from 'jsonwebtoken';

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <UserProvider>
          <MainContent>{children}</MainContent>
        </UserProvider>
      </body>
    </html>
  );
}
interface DecodedToken extends JwtPayload {
  upn: string; // JwtPayload を拡張して 'upn' プロパティを追加
}
const MainContent: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { setUser } = useUser();
  const fetchUser = async (loginEmail: string): Promise<User> => {
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
    const fetchDecodeToken = async () => {
      const response = await fetch('/api/getDecodeToken');
      const data = await response.json();
      return data.token;
    };
    const fetchData = async () => {
      try {
        const accessToken = await fetchDecodeToken();
        console.log('accessToken:', accessToken);
        const decoded = jwt.decode(accessToken);

        // decoded が JwtPayload 型で upn プロパティがある場合の型ガード
        if (decoded && typeof decoded !== 'string' && 'upn' in decoded) {
          const loginEmail = (decoded as DecodedToken).upn;
          console.log('loginEmail:', loginEmail);

          const userData = await fetchUser(loginEmail);
          setUser(userData);
          console.log('取得したユーザー情報:', userData);
        } else {
          console.error('トークンのデコードに失敗しました。無効なトークンかもしれません。');
        }
      } catch (error) {
        console.error('データ取得エラー:', error);
      }
    };

    fetchData();
  }, [setUser]);

  const { user } = useUser();

  return (
    <>
      <ResponsiveAppBar userName={user ? user.user_name : null} />
      <main>{children}</main>
    </>
  );
};
