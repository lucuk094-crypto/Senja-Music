import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Return config untuk frontend
  const config = {
    apiBaseUrl: process.env.API_BASE_URL || ''
  };
  
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`window.__API_BASE_URL__ = '${config.apiBaseUrl}';`);
}
