import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // リクエストヘッダー全体をコンソールに出力
    console.log('Request Headers:', req.headers);

    const userEmail = req.headers['x-ms-client-principal-name'] || null;
    console.log('User email:', userEmail);

    return res.status(200).json({ email: userEmail });
  }

  // 他のメソッドの場合は 405 エラーを返す
  res.status(405).json({ message: 'Method Not Allowed' });
}
