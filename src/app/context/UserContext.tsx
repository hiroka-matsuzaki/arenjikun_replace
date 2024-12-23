// app/context/UserContext.tsx
import React, { createContext, useState, ReactNode, useContext } from 'react';

// ユーザー情報の型
export interface User {
  email: string;
  user_name: string;
  login_code: string;
  department: string;
  companyts: string;
  user_code: string;
}

interface UserContextType {
  user: User | null;
  // eslint-disable-next-line no-unused-vars
  setUser: (user: User | null) => void;
}

const initialState: UserContextType = {
  user: null,
  setUser: () => {},
};

const UserContext = createContext<UserContextType>(initialState);

// ユーザー情報を提供するコンポーネント
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

// カスタムフックでユーザー情報を取得
export const useUser = () => useContext(UserContext);
