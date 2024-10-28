// /pages/api/callFunction.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  message?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    const functionUrl = process.env.NEXT_PUBLIC_FUNCTION_URL;
    const response = await fetch(`${functionUrl}/events`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    res.status(200).json({ message: text });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
