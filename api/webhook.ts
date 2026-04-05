import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { event, data } = req.body;
  const secret = req.headers['x-webhook-secret'];

  if (secret !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('Webhook received:', event, data);

  // Logic to update Supabase user status would go here
  // For now, we just acknowledge receipt
  return res.json({ status: 'ok' });
}
