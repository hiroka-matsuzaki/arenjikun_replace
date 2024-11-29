// app/layout.tsx
'use client'; // クライアントコンポーネント
import React, { useEffect } from 'react';
import ResponsiveAppBar from '@/components/ResponsiveAppBar';
import './globals.css'; // 共通CSSの読み込み
import { ReactNode } from 'react';
import { User, UserProvider, useUser } from './context/UserContext';
import { useSession, SessionProvider, signIn } from 'next-auth/react';

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <SessionProvider>
          <UserProvider>
            <MainContent>{children}</MainContent> {/* 子コンポーネントを渡す */}
          </UserProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

// メインコンテンツでユーザー情報を渡す
const MainContent: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { setUser } = useUser(); // UserContextからsetUserを取得
  const { data: session, status } = useSession(); // next-authのセッションを取得
  console.log('Session:', session);
  console.log('Status:', status);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Microsoft Graph APIからユーザー情報を取得
      const fetchUserData = async () => {
        try {
          const res = await fetch('/api/fetchUserDetails', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          });
          if (!res.ok) throw new Error('Failed to fetch user data');

          const userData: User = await res.json();
          setUser(userData); // UserContextに設定
        } catch (error) {
          console.error(error);
        }
      };

      fetchUserData();
    }
  }, [session, status, setUser]);

  const { user } = useUser(); // UserContextからユーザー情報を取得

  if (status === 'loading') {
    return <p>Loading...</p>; // セッションをロード中
  }

  if (status === 'unauthenticated') {
    return (
      <>
        <p>Not signed in</p>;
        <button onClick={() => signIn('azure-ad')}>Sign in with Azure AD</button>
      </>
    );
  }

  return (
    <>
      <ResponsiveAppBar userName={user ? user.user_name : null} /> {/* ユーザー名を渡す */}
      <main>{children}</main> {/* 各ページのコンテンツ */}
    </>
  );
};
