import { NextApiRequest, NextApiResponse } from 'next';

const getDecodeToken = (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = req.headers['x-ms-token-aad-access-token'];

  return res.status(200).json(accessToken);
};

export default getDecodeToken;
