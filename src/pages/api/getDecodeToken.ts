import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const getDecodeToken = (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = req.headers['x-ms-token-aad-access-token'];

  if (!accessToken || typeof accessToken !== 'string') {
    return res.status(401).json({ message: 'Access token not provided' });
  }
  try {
    const decodedToken = jwt.decode(accessToken);

    if (typeof decodedToken !== 'object' || decodedToken === null) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    return res.status(200).json({ token: decodedToken });
  } catch (error) {
    console.error('Error decoding token:', error);
    return res.status(500).json({ message: 'Failed to decode token' });
  }
};

export default getDecodeToken;
