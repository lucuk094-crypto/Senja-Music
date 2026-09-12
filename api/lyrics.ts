import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { videoId } = req.query;

  if (!videoId || typeof videoId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'videoId required'
    });
  }

  // Mock lyrics
  const mockLyrics = [
    { line: "Ku tulis lagu untuk kamu", time: 0 },
    { line: "Tentang senja yang indah", time: 4000 },
    { line: "Di ujung hari kita bersama", time: 8000 },
    { line: "Menikmati hangat matahari", time: 12000 }
  ];

  return res.status(200).json({
    success: true,
    lyrics: mockLyrics,
    isSynced: true
  });
}
