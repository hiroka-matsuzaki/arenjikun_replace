'use client'; // クライアントコンポーネント
import React, { useEffect } from 'react';
import ResponsiveAppBar from '@/components/ResponsiveAppBar';
import './globals.css'; // 共通CSSの読み込み
import { ReactNode } from 'react';
import { UserProvider, useUser } from './context/UserContext';
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
      // session.userにEmail情報が含まれているので、setUserを使って更新する
      setUser({
        email: session.user.email || '', // emailが存在すれば設定
        user_name: session.user.name || '', // ユーザー名も取得できれば設定
        login_code: '999', // login_codeがあれば設定、なければ空文字
        department: 'test', // departmentがあれば設定、なければ空文字
        companyts: 'test co', // companytsがあれば設定、なければ空文字
      });
    }
  }, [session, status, setUser]);

  const { user } = useUser(); // UserContextからユーザー情報を取得

  if (status === 'loading') {
    return <p>Loading...</p>; // セッションをロード中
  }

  if (status === 'unauthenticated') {
    return (
      <>
        <p>Not signed in</p>
        <button onClick={() => signIn('azure-ad')}>Sign in with Azure AD</button>
      </>
    );
  }

  return (
    <>
      <ResponsiveAppBar userName={user ? user.user_name : null} /> {/* ユーザー名を渡す */}
      <main>
        {/* ここでユーザーのEmailも表示 */}
        {user?.email && <p>Email: {user.email}</p>}
        {children} {/* 各ページのコンテンツ */}
      </main>
    </>
  );
};
