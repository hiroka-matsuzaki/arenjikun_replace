// app/layout.tsx
/* eslint-disable react/react-in-jsx-scope */
'use client'; // クライアントコンポーネント
import React, { useEffect } from 'react';
import ResponsiveAppBar from '@/components/ResponsiveAppBar';
import './globals.css'; // 共通CSSの読み込み
import { ReactNode } from 'react';
import { User, UserProvider, useUser } from './context/UserContext';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider, useAccount, useMsal } from '@azure/msal-react';

const msalConfig = {
  auth: {
    clientId: process.env.AZURE_AD_CLIENT_ID as string,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}`,
    redirectUri: process.env.NEXTAUTH_URL as string,
  },
};
const msalInstance = new PublicClientApplication(msalConfig);
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
        <MsalProvider instance={msalInstance}>
          <UserProvider>
            <MainContent>{children}</MainContent> {/* 子コンポーネントを渡す */}
          </UserProvider>
        </MsalProvider>
      </body>
    </html>
  );
}

// メインコンテンツでユーザー情報を渡す
const MainContent: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  const handleLogin = () => {
    instance.loginPopup({ scopes: ['User.Read'] }).catch((e) => console.error(e));
  };

  const handleLogout = () => {
    instance.logoutPopup().catch((e) => console.error(e));
  };
  const { setUser } = useUser(); // UserContextからsetUserを取得

  useEffect(() => {
    setUser(mockUserData);
  }, [setUser]);

  const { user } = useUser(); // UserContextからユーザー情報を取得

  return (
    <>
      <ResponsiveAppBar userName={user ? user.user_name : null} /> {/* ユーザー名を渡す */}
      <div>
        {!account && <button onClick={handleLogin}>ログイン</button>}
        {account && (
          <>
            <p>ログイン済み: {account.username}</p>
            <button onClick={handleLogout}>ログアウト</button>
          </>
        )}
      </div>
      <main>{children}</main> {/* 各ページのコンテンツ */}
    </>
  );
};
