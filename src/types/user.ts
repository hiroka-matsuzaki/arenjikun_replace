// Event.ts
export interface User {
  email: string;
  user_name: string;
  login_code: string;
  department: string;
  company: string;
  user_code: string;
}

// イベントの配列型
export type Users = User[];
