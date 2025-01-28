/* eslint-disable react/react-in-jsx-scope */
'use client';
import React, { useEffect, useState } from 'react';
import ResponsiveAppBar from '@/components/ResponsiveAppBar';
import './globals.css';
import { ReactNode } from 'react';
import { User, UserProvider, useUser } from './context/UserContext';
import { Box, CircularProgress } from '@mui/material';

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
const MainContent: React.FC<{ children: ReactNode }> = ({ children }) => {
  console.log('ver:1.0.X');
  const [isLoading, setIsLoading] = useState(true);
  const { setUser } = useUser();
  const fetchUser = async (loginEmail: string): Promise<User> => {
    console.log('Email:', loginEmail);

    const response = await fetch(
      `https://azure-api-opf.azurewebsites.net/api/user?email=${loginEmail}` //テスト用ベタ打ち
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
        const loginEmail: string =
          process.env.NODE_ENV === 'development'
            ? 's.matsuzaki@hiroka.biz'
            : await (async () => {
                const decodeToken = await fetchDecodeToken();
                console.log('decodeToken:', decodeToken);

                if (!decodeToken || !decodeToken['upn']) {
                  throw new Error('Invalid token or "upn" is missing');
                }

                return decodeToken['upn'];
              })();

        console.log('メールアドレス:', loginEmail);

        const userData = await fetchUser(loginEmail);

        if (!userData) {
          throw new Error('Failed to fetch user data');
        }

        setUser(userData);
        console.log('取得したユーザー情報:', userData);
        setIsLoading(false);
      } catch (error) {
        console.error('データ取得エラー:', error);

        alert('ユーザー情報の取得中にエラーが発生しました。もう一度お試しください。');
      }
    };

    fetchData()
      .then(() => {
        console.log('fetchData完了');
      })
      .catch((error) => {
        console.error('fetchDataエラー:', error);
      });
  }, [setUser]);

  const { user } = useUser();
  if (isLoading) {
    // ローディング中の画面
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress /> {/* ローディングスピナー */}
      </Box>
    );
  }

  return (
    <>
      <ResponsiveAppBar userName={user ? user.user_name : null} />
      <main>{children}</main>
    </>
  );
};
