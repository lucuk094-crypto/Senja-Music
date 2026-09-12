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

  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Query parameter required'
    });
  }

  // Mock search results
  const mockResults = [
    {
      id: "2A9Atl2hUkg",
      videoId: "2A9Atl2hUkg",
      title: "Lagu Untuk Kamu",
      artist: "Sal Priadi",
      thumbnail: "https://i.ytimg.com/vi/2A9Atl2hUkg/hqdefault.jpg",
      duration: 180
    },
    {
      id: "KlfFb5D0j-E",
      videoId: "KlfFb5D0j-E",
      title: "Bertaut",
      artist: "Nadin Amizah",
      thumbnail: "https://i.ytimg.com/vi/KlfFb5D0j-E/hqdefault.jpg",
      duration: 210
    }
  ];

  return res.status(200).json({
    success: true,
    items: mockResults
  });
}
