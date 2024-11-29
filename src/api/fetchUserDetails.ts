import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const accessToken = req.headers.authorization?.split(' ')[1]; // 'Bearer <token>' からトークンを取得

  if (!accessToken) {
    return res.status(401).json({ error: 'Access token is missing' });
  }

  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await response.json();
    res.status(200).json(userData);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message); // `message` に安全にアクセス
    } else {
      console.error('An unknown error occurred');
    }
  }
}
