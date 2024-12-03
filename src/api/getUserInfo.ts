// pages/api/get-user-info.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const email = req.headers['x-ms-client-principal-name'] as string;

  if (email) {
    // メールアドレスが取得できた場合
    res.status(200).json({ email });
  } else {
    res.status(400).json({ error: 'ユーザー情報が取得できませんでした' });
  }
}
