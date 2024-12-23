import { NextApiRequest, NextApiResponse } from 'next';

const getAccessToken = (req: NextApiRequest, res: NextApiResponse) => {
  // ここでヘッダーからアクセストークンを取得します
  const accessToken = req.headers['x-ms-token-aad-access-token'];

  // アクセストークンが見つからない場合
  if (!accessToken) {
    return res.status(401).json({ message: 'Access token not found' });
  }

  // アクセストークンが存在する場合、それを返す
  return res.status(200).json({ token: accessToken });
};

export default getAccessToken;
