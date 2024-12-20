import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userEmail = req.headers['x-ms-client-principal-name'] || null;

  res.status(200).json({ email: userEmail });
}
