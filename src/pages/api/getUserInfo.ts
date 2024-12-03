// pages/api/getUserInfo.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Azure App Service 認証情報を取得
  const userEmail = req.headers['x-ms-client-principal-name'] || null;

  res.status(200).json({ email: userEmail });
}
