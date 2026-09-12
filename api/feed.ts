import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple feed response for Vercel deployment
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Return mock data for now since YTMusic API doesn't work in serverless
    const mockSongs = [
      {
        id: "2A9Atl2hUkg",
        videoId: "2A9Atl2hUkg",
        title: "Lagu Untuk Kamu",
        artist: "Sal Priadi",
        album: "Single",
        thumbnail: "https://i.ytimg.com/vi/2A9Atl2hUkg/hqdefault.jpg",
        duration: 180
      },
      {
        id: "e8T8eoqKVy4",
        videoId: "e8T8eoqKVy4",
        title: "Mantan Terindah",
        artist: "Raisa",
        album: "Handmade",
        thumbnail: "https://i.ytimg.com/vi/e8T8eoqKVy4/hqdefault.jpg",
        duration: 240
      },
      {
        id: "3D8_fN_g51Y",
        videoId: "3D8_fN_g51Y",
        title: "Untuk Perempuan Yang Sedang Dalam Pelukan",
        artist: "Payung Teduh",
        album: "Ruang Tunggu",
        thumbnail: "https://i.ytimg.com/vi/3D8_fN_g51Y/hqdefault.jpg",
        duration: 200
      },
      {
        id: "KlfFb5D0j-E",
        videoId: "KlfFb5D0j-E",
        title: "Bertaut",
        artist: "Nadin Amizah",
        album: "Selamat Ulang Tahun",
        thumbnail: "https://i.ytimg.com/vi/KlfFb5D0j-E/hqdefault.jpg",
        duration: 210
      },
      {
        id: "fN5HV79_8B8",
        videoId: "fN5HV79_8B8",
        title: "Lagu Cinta",
        artist: "Glenn Fredly",
        album: "Selamat Pagi Dunia",
        thumbnail: "https://i.ytimg.com/vi/fN5HV79_8B8/hqdefault.jpg",
        duration: 220
      },
      {
        id: "T4Y-EUH4w6A",
        videoId: "T4Y-EUH4w6A",
        title: "Kangen",
        artist: "Dewa 19",
        album: "Bintang Lima",
        thumbnail: "https://i.ytimg.com/vi/T4Y-EUH4w6A/hqdefault.jpg",
        duration: 250
      },
      {
        id: "m4dNLXZL7Hs",
        videoId: "m4dNLXZL7Hs",
        title: "Menghitung Hari",
        artist: "Krisdayanti",
        album: "Cinta",
        thumbnail: "https://i.ytimg.com/vi/m4dNLXZL7Hs/hqdefault.jpg",
        duration: 230
      },
      {
        id: "y0AT1Xb8Jt8",
        videoId: "y0AT1Xb8Jt8",
        title: "Serba Salah",
        artist: "Raisa",
        album: "Raisa",
        thumbnail: "https://i.ytimg.com/vi/y0AT1Xb8Jt8/hqdefault.jpg",
        duration: 195
      },
      {
        id: "E-G5on04bJg",
        videoId: "E-G5on04bJg",
        title: "Cukup Siti Nurbaya",
        artist: "Dewa 19",
        album: "Cintailah Cinta",
        thumbnail: "https://i.ytimg.com/vi/E-G5on04bJg/hqdefault.jpg",
        duration: 270
      },
      {
        id: "pYIb2mQjgvA",
        videoId: "pYIb2mQjgvA",
        title: "Kisah Klasik Untuk Masa Depan",
        artist: "Sheila On 7",
        album: "Kisah Klasik",
        thumbnail: "https://i.ytimg.com/vi/pYIb2mQjgvA/hqdefault.jpg",
        duration: 260
      }
    ];

    // Create 10 shelves with different songs
    const shelves = [
      { title: "Keep listening", items: mockSongs },
      { title: "Playlist trending komunitas", items: [...mockSongs].reverse() },
      { title: "Hits Indonesia", items: mockSongs.slice(0, 8) },
      { title: "Kemarau Chill", items: mockSongs.slice(2, 10) },
      { title: "Hits Sepanjang Masa", items: [...mockSongs].sort(() => Math.random() - 0.5) },
      { title: "Rilis Baru", items: mockSongs.slice(1, 9) },
      { title: "Hits Internasional", items: mockSongs },
      { title: "Lagi Happy", items: mockSongs.slice(0, 7) },
      { title: "New releases", items: mockSongs.slice(3) },
      { title: "Forgotten favorites", items: mockSongs }
    ];

    const response = {
      success: true,
      data: {
        nowPlayingInitial: mockSongs[0],
        featured: mockSongs[1],
        shelves,
        communityPlaylists: [
          {
            id: "comm-1",
            name: "Playlist Hits Indonesia",
            creator: "Komunitas Musik ID",
            thumbnail: mockSongs[0].thumbnail,
            trackCount: 25
          },
          {
            id: "comm-2",
            name: "Chill Vibes Santai",
            creator: "Pendengar Senja",
            thumbnail: mockSongs[2].thumbnail,
            trackCount: 30
          }
        ]
      }
    };

    return res.status(200).json(response);
    
  } catch (error: any) {
    console.error('Feed API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
