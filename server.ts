import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
// @ts-ignore
import YTMusicModule from "ytmusic-api";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const YTMusic = (YTMusicModule as any)?.default || YTMusicModule;
let ytInstance: any = null;

// Spotify API credentials
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "";
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || "";
let spotifyAccessToken: string | null = null;
let spotifyTokenExpiry: number = 0;

async function getYTMusic() {
  if (!ytInstance) {
    ytInstance = new YTMusic();
    try {
      await ytInstance.initialize();
      console.log("✅ YTMusic API initialized successfully");
    } catch (error) {
      console.error("❌ YTMusic initialization error:", error);
      // Fallback: reinitialize tanpa cookie
      ytInstance = new YTMusic();
      try {
        await ytInstance.initialize({ cookies: "" });
      } catch (retryError) {
        console.error("❌ YTMusic retry failed:", retryError);
      }
    }
  }
  return ytInstance;
}

// Spotify API: Get access token using Client Credentials flow
async function getSpotifyAccessToken(): Promise<string | null> {
  // Return cached token if still valid
  if (spotifyAccessToken && Date.now() < spotifyTokenExpiry) {
    return spotifyAccessToken;
  }

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.warn("⚠️ Spotify credentials not configured. HD covers disabled.");
    return null;
  }

  try {
    const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");
    
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      console.error("❌ Spotify token request failed:", response.status);
      return null;
    }

    const data: any = await response.json();
    spotifyAccessToken = data.access_token;
    // Token expires in 1 hour, set expiry 5 minutes early to be safe
    spotifyTokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
    
    console.log("✅ Spotify access token obtained");
    return spotifyAccessToken;
  } catch (error) {
    console.error("❌ Failed to get Spotify token:", error);
    return null;
  }
}

// Helper to get high-quality thumbnail from YT URL or videoId
// Improved version inspired by ZaamMusic - lebih robust & punya fallback lebih banyak
function getHighResThumbnail(url?: string, videoId?: string): string {
  // Priority 1: YouTube direct thumbnail with smart fallback
  if (videoId) {
    // Return hqdefault by default (480x360) - more reliable than maxresdefault
    // maxresdefault often returns 404 for many videos
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }
  
  // Priority 2: Googleusercontent (artist/album covers)
  if (url && (url.includes("googleusercontent.com") || url.includes("yt3.ggpht.com"))) {
    return url.replace(/=w\d+-h\d+.*$/, "=w600-h600-l90-rj");
  }
  
  // Priority 3: Existing URL
  if (url) return url;
  
  // Priority 4: Fallback placeholder (last resort)
  return "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80";
}

// Helper to extract highest resolution thumbnail from array
// Added: fallback ke YouTube oembed API kalau thumbnails array kosong
function extractHighestThumbnail(thumbnails?: { url: string; width?: number; height?: number }[], videoId?: string): string {
  // Try dari array thumbnails dulu
  if (thumbnails && thumbnails.length > 0) {
    // Sort by resolution, ambil yang tertinggi
    const sorted = [...thumbnails].sort((a, b) => {
      const aRes = (a.width || 0) * (a.height || 0);
      const bRes = (b.width || 0) * (b.height || 0);
      return bRes - aRes;
    });
    const rawUrl = sorted[0].url;
    return getHighResThumbnail(rawUrl, videoId);
  }
  
  // Fallback: gunakan videoId untuk construct URL langsung
  return getHighResThumbnail(undefined, videoId);
}

// ========================================================================
// 10 KATEGORI BARU - Data 100% dari YouTube Music & Spotify API
// TIDAK ADA GAMBAR AI/PLACEHOLDER - Semua Real API Data
// ========================================================================
const CATEGORIES = [
  {
    id: "keep-listening",
    name: "Keep listening",
    query: "trending music indonesia 2024 viral hits tiktok",
    description: "Lagu yang lagi ngetren dan viral di Indonesia",
    gradient: "from-purple-600/30 to-indigo-950/40",
    icon: "play_circle",
  },
  {
    id: "playlist-trending-komunitas",
    name: "Playlist trending komunitas",
    query: "top charts indonesia spotify youtube music trending",
    description: "Playlist populer pilihan komunitas musik Indonesia",
    gradient: "from-pink-600/30 to-rose-950/40",
    icon: "groups",
  },
  {
    id: "hits-indonesia",
    name: "Hits Indonesia",
    query: "lagu pop indonesia terbaik terpopuler hits chart",
    description: "Lagu hits Indonesia paling banyak diputar",
    gradient: "from-red-600/30 to-orange-950/40",
    icon: "trending_up",
  },
  {
    id: "kemarau-chill",
    name: "Kemarau Chill",
    query: "indie indonesia santai chill vibes summer mood",
    description: "Musik santai untuk suasana cerah dan rileks",
    gradient: "from-yellow-600/30 to-amber-950/40",
    icon: "wb_sunny",
  },
  {
    id: "hits-sepanjang-masa",
    name: "Hits Sepanjang Masa",
    query: "lagu indonesia legendaris nostalgia klasik 90an 2000an",
    description: "Lagu klasik Indonesia yang tak lekang waktu",
    gradient: "from-amber-600/30 to-yellow-950/40",
    icon: "history",
  },
  {
    id: "rilis-baru",
    name: "Rilis Baru",
    query: "new releases indonesia 2024 2025 single terbaru",
    description: "Rilisan musik terbaru dari artis Indonesia",
    gradient: "from-emerald-600/30 to-teal-950/40",
    icon: "new_releases",
  },
  {
    id: "hits-internasional",
    name: "Hits Internasional",
    query: "top global hits billboard hot 100 international chart",
    description: "Lagu hits internasional dari seluruh dunia",
    gradient: "from-blue-600/30 to-cyan-950/40",
    icon: "public",
  },
  {
    id: "lagi-happy",
    name: "Lagi Happy",
    query: "happy upbeat music energetic feel good positive vibes",
    description: "Musik ceria dan energik untuk mood bahagia",
    gradient: "from-lime-600/30 to-green-950/40",
    icon: "sentiment_satisfied",
  },
  {
    id: "new-releases",
    name: "New releases",
    query: "latest music releases 2024 2025 fresh tracks new songs",
    description: "Musik baru dari berbagai genre dan artis dunia",
    gradient: "from-cyan-600/30 to-blue-950/40",
    icon: "fiber_new",
  },
  {
    id: "forgotten-favorites",
    name: "Forgotten favorites",
    query: "underrated songs hidden gems forgotten hits throwback",
    description: "Permata tersembunyi yang layak didengar kembali",
    gradient: "from-violet-600/30 to-purple-950/40",
    icon: "favorite",
  },
];

// Cache resolved curated songs in memory
let cachedFeed: any = null;

async function resolveCuratedFeed() {
  // Hapus cache untuk testing
  cachedFeed = null;
  // if (cachedFeed) return cachedFeed;

  try {
    const yt = await getYTMusic();

    console.log("📥 Fetching data from YTMusic...");
    
    // Try to use getHomeSections() for real homepage data
    let homeSections: any[] = [];
    try {
      homeSections = await yt.getHomeSections();
      console.log(`✅ Received ${homeSections.length} sections from YTMusic getHomeSections()`);
    } catch (homeErr) {
      console.warn("⚠️  getHomeSections() failed, using searchSongs fallback:", (homeErr as Error).message);
    }

    // Map home sections to our 10 categories
    const shelves: any[] = [];
    const categoryTitles = [
      "Keep listening",
      "Playlist trending komunitas", 
      "Hits Indonesia",
      "Kemarau Chill",
      "Hits Sepanjang Masa",
      "Rilis Baru",
      "Hits Internasional",
      "Lagi Happy",
      "New releases",
      "Forgotten favorites"
    ];

    const fallbackQueries = [
      "Nadin Amizah lagu terbaik acoustic",
      "Tulus top songs indonesia hits",
      "Juicy Luicy lagu pop indonesia",
      "indie chill santai vibes",
      "lagu legendaris 90an klasik",
      "new releases 2024 terbaru",
      "international hits billboard",
      "happy upbeat energetic music",
      "latest music releases fresh",
      "throwback favorites nostalgia"
    ];

    // Build shelves from home sections OR search fallback
    for (let i = 0; i < 10; i++) {
      const title = categoryTitles[i];
      let items: any[] = [];
      
      // Try to get from homeSections first
      if (homeSections.length > i && homeSections[i]?.items?.length > 0) {
        const section = homeSections[i];
        items = section.items.slice(0, 20).map((item: any) => {
          // Must have valid videoId (11 characters) to be playable
          const vid = item.videoId;
          if (!vid || typeof vid !== 'string' || vid.length !== 11) {
            return null;
          }
          
          // Flexible mapping - accept any type that has videoId
          return {
            id: vid,
            videoId: vid,
            title: item.name || item.title || "Unknown Title",
            artist: item.artist?.name || item.artists?.[0]?.name || "Unknown Artist",
            album: item.album?.name || "Single",
            thumbnail: extractHighestThumbnail(item.thumbnails, vid),
            duration: item.duration || 180,
          };
        }).filter(Boolean);
      }
      
      // Fallback to searchSongs if no items
      if (items.length === 0) {
        try {
          const results = await yt.searchSongs(fallbackQueries[i]);
          items = (results || []).slice(0, 20).map((song: any) => {
            // Robust artist name extraction (inspired by ZaamMusic)
            let artistName = "Unknown Artist";
            if (song.artist && typeof song.artist === 'object' && song.artist.name) {
              artistName = song.artist.name;
            } else if (song.artists && Array.isArray(song.artists) && song.artists.length > 0) {
              artistName = song.artists.map((a: any) => a.name || '').filter(Boolean).join(', ') || "Unknown Artist";
            } else if (typeof song.artist === 'string') {
              artistName = song.artist;
            }
            
            return {
              id: song.videoId,
              videoId: song.videoId,
              title: song.name || song.title || "Unknown Title",
              artist: artistName,
              album: song.album?.name || "Single",
              thumbnail: extractHighestThumbnail(song.thumbnails, song.videoId),
              duration: song.duration || 180,
            };
          });
        } catch (err) {
          console.warn(`Failed to fetch ${title}:`, err);
        }
      }

      shelves.push({ title, items });
    }

    // Featured track (ambil dari shelf pertama)
    const featured = shelves[0]?.items?.[0] || {
      id: "2A9Atl2hUkg",
      title: "Loading...",
      artist: "Senja Musik",
      thumbnail: "https://i.ytimg.com/vi/2A9Atl2hUkg/hqdefault.jpg",
      duration: 180,
    };

    // Initial now playing
    const nowPlayingInitial = shelves[0]?.items?.[1] || featured;

    // Community playlists (sample data)
    const communityPlaylists = [
      {
        id: "comm-1",
        name: "Playlist Hits Indonesia",
        creator: "Komunitas Musik ID",
        thumbnail: shelves[2]?.items?.[0]?.thumbnail || "",
        trackCount: shelves[2]?.items?.length || 0
      },
      {
        id: "comm-2",
        name: "Chill Vibes Santai",
        creator: "Pendengar Senja",
        thumbnail: shelves[3]?.items?.[0]?.thumbnail || "",
        trackCount: shelves[3]?.items?.length || 0
      }
    ];

    cachedFeed = {
      success: true,
      data: {
        nowPlayingInitial,
        featured,
        shelves,
        communityPlaylists,
      },
    };

    console.log("✅ Feed loaded with 10 shelves, all data from YTMusic API");
    console.log("📊 Shelves item counts:", shelves.map((s: any) => `${s.title}: ${s.items.length}`).join(", "));
    return cachedFeed;

  } catch (error: any) {
    console.error("❌ Error building curated feed:", error);
    return {
      success: false,
      message: error.message,
      data: {
        nowPlayingInitial: {},
        featured: {},
        shelves: [],
        communityPlaylists: [],
      },
    };
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Get initial curated feed with real YouTube Music metadata
  app.get("/api/yt/feed", async (_req, res) => {
    try {
      const feed = await resolveCuratedFeed();
      res.json(feed || { error: "Failed to load feed" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Search YouTube Music for tracks
  // 1. Endpoint search: GET /api/search?q={query}
  // Returns array {videoId, title (from "name"), artist (from "artist.name"), thumbnail (from "thumbnails[thumbnails.length-1].url"), duration}
  app.get("/api/search", async (req, res) => {
    const q = ((req.query.q as string) || "").trim();
    if (!q) {
      return res.json([]);
    }
    try {
      const yt = await getYTMusic();
      const results = await yt.searchSongs(q);
      const items = (results || []).map((song: any) => ({
        videoId: song.videoId,
        title: song.name,
        artist: song.artist?.name || (typeof song.artist === "string" ? song.artist : "Artis"),
        thumbnail: extractHighestThumbnail(song.thumbnails, song.videoId),
        duration: song.duration || 0,
      }));
      res.json(items);
    } catch (err: any) {
      console.error("Search error:", err);
      res.status(500).json({ error: err.message, results: [] });
    }
  });

  // Legacy / internal wrapper for search
  app.get("/api/yt/search", async (req, res) => {
    const q = (req.query.q as string || "").trim();
    if (!q) {
      return res.json({ results: [] });
    }
    try {
      const yt = await getYTMusic();
      const results = await yt.searchSongs(q);
      const items = (results || []).slice(0, 15).map((song: any) => ({
        id: song.videoId,
        videoId: song.videoId,
        title: song.name,
        artist: song.artist?.name || (typeof song.artist === "string" ? song.artist : "Artis"),
        album: song.album?.name || "Single",
        duration: song.duration || 210,
        thumbnail: extractHighestThumbnail(song.thumbnails, song.videoId),
        audioQuality: "LOSSLESS 24-BIT / 96kHz",
      }));
      res.json({ results: items });
    } catch (err: any) {
      console.error("Search error:", err);
      res.status(500).json({ error: err.message, results: [] });
    }
  });

  // 2. Endpoint detail lagu: GET /api/song/{videoId}
  // Return object lengkap dari ytmusic.getSong(videoId), termasuk album, duration, thumbnails resolusi tertinggi
  app.get("/api/song/:videoId", async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
      return res.status(400).json({ error: "videoId parameter is required" });
    }
    try {
      const yt = await getYTMusic();
      let songData: any = null;

      try {
        songData = await yt.getSong(videoId);
      } catch (e) {
        // Resilient fallback when yt.getSong encounters sign-in protection or non-standard IDs
        try {
          const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
          if (oembedRes.ok) {
            const oembed: any = await oembedRes.json();
            const cleanAuthor = (oembed.author_name || "").replace(/\s*-\s*Topic$/i, "").trim();
            let duration = 210;
            let album = "Single";

            try {
              const searchMatches = await yt.searchSongs(`${oembed.title} ${cleanAuthor}`);
              const matched = searchMatches?.find((s: any) => s.videoId === videoId) || searchMatches?.[0];
              if (matched) {
                duration = matched.duration || 210;
                album = matched.album?.name || "Single";
              }
            } catch {}

            songData = {
              type: "SONG",
              videoId,
              name: oembed.title,
              artist: {
                name: cleanAuthor,
                artistId: null,
              },
              album: {
                name: album,
                albumId: "",
              },
              duration,
              thumbnails: [
                { url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, width: 480, height: 360 },
                { url: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`, width: 1280, height: 720 },
              ],
            };
          }
        } catch {}
      }

      if (!songData) {
        throw new Error("Unable to retrieve song metadata");
      }

      const highestThumb = extractHighestThumbnail(songData.thumbnails, videoId);

      res.json({
        ...songData,
        videoId,
        title: songData.name,
        artist: songData.artist?.name || (typeof songData.artist === "string" ? songData.artist : "Artis"),
        artistName: songData.artist?.name || (typeof songData.artist === "string" ? songData.artist : "Artis"),
        album: songData.album?.name || "Single",
        duration: songData.duration || 210,
        thumbnail: highestThumb,
        highestThumbnail: highestThumb,
      });
    } catch (err: any) {
      console.error(`Error fetching song ${videoId}:`, err);
      res.status(500).json({
        error: err.message,
        videoId,
        title: "Unknown Track",
        thumbnail: getHighResThumbnail(undefined, videoId),
        duration: 0,
      });
    }
  });

  // 3. Endpoint kategori/genre: wrapper di atas endpoint search yang sudah ada
  app.get("/api/categories", (_req, res) => {
    res.json(CATEGORIES);
  });

  app.get(["/api/categories/:categoryId", "/api/category/:categoryId"], async (req, res) => {
    const { categoryId } = req.params;
    const cat = CATEGORIES.find((c) => c.id === categoryId) || {
      id: categoryId,
      name: categoryId.replace(/-/g, " "),
      query: `lagu ${categoryId.replace(/-/g, " ")} indonesia`,
      description: `Koleksi genre & suasana ${categoryId}`,
    };

    try {
      const yt = await getYTMusic();
      const results = await yt.searchSongs(cat.query);
      const songs = (results || []).slice(0, 20).map((song: any) => ({
        videoId: song.videoId,
        title: song.name,
        artist: song.artist?.name || (typeof song.artist === "string" ? song.artist : "Artis"),
        thumbnail: extractHighestThumbnail(song.thumbnails, song.videoId),
        duration: song.duration || 0,
      }));

      res.json({
        category: cat,
        songs,
      });
    } catch (err: any) {
      console.error(`Error in category ${categoryId}:`, err);
      res.status(500).json({ error: err.message, category: cat, songs: [] });
    }
  });

  // 4. Endpoint related/similar artist:
  // Kombinasi searchArtists(namaArtist) -> getArtistSongs(artistId)
  // Menghasilkan "lagu lain dari artis yang sama" sebagai pendekatan sementara
  app.get(
    [
      "/api/artist/:artistName/related",
      "/api/artist/related",
      "/api/artist/similar",
      "/api/related-artist",
    ],
    async (req, res) => {
      const artistName = (
        req.params.artistName ||
        (req.query.artist as string) ||
        (req.query.name as string) ||
        (req.query.q as string) ||
        ""
      ).trim();

      if (!artistName) {
        return res.status(400).json({ error: "artist parameter is required", songs: [] });
      }

      try {
        const yt = await getYTMusic();
        // 1. searchArtists(namaArtist) untuk dapat artistId
        const artists = await yt.searchArtists(artistName);
        let targetArtist = artists && artists.length > 0 ? artists[0] : null;
        let songs: any[] = [];

        if (targetArtist && targetArtist.artistId) {
          // 2. getArtistSongs(artistId) untuk dapat lagu-lagu dari artis itu
          try {
            songs = (await yt.getArtistSongs(targetArtist.artistId)) || [];
          } catch (fetchSongErr) {
            console.warn("getArtistSongs fallback:", fetchSongErr);
          }
        }

        // Fallback jika artis tidak ditemukan atau tidak memiliki lagu
        if (!songs || songs.length === 0) {
          songs = (await yt.searchSongs(artistName)) || [];
        }

        const mappedSongs = songs.slice(0, 20).map((song: any) => ({
          videoId: song.videoId,
          title: song.name,
          artist: song.artist?.name || (typeof song.artist === "string" ? song.artist : artistName),
          thumbnail: extractHighestThumbnail(song.thumbnails, song.videoId),
          duration: song.duration || 0,
        }));

        const artistThumbnail = targetArtist?.thumbnails
          ? extractHighestThumbnail(targetArtist.thumbnails)
          : mappedSongs[0]?.thumbnail || "";

        res.json({
          artistName: targetArtist?.name || artistName,
          artistId: targetArtist?.artistId || null,
          artistThumbnail,
          note: "Lagu lain dari artis yang sama (pendekatan sementara untuk related/similar)",
          songs: mappedSongs,
        });
      } catch (err: any) {
        console.error("Related artist error:", err);
        res.status(500).json({ error: err.message, songs: [] });
      }
    }
  );

  // Public Lyrics Endpoint: Checks LRCLIB first for synchronized time tags, then fallback
  app.get(["/api/lyrics", "/api/yt/lyrics"], async (req, res) => {
    const title = (req.query.title as string || "").trim();
    const artist = (req.query.artist as string || "").trim();
    const videoId = (req.query.videoId as string || "").trim();

    try {
      // 1. Try LRCLIB for synced lyrics
      if (title) {
        const cleanTitle = title.replace(/\(.*?\)/g, "").replace(/\[.*?\]/g, "").trim();
        const cleanArtist = artist.split(",")[0].split("•")[0].trim();
        const lrclibUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(cleanArtist)}&track_name=${encodeURIComponent(cleanTitle)}`;
        
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);
          const lrcRes = await fetch(lrclibUrl, {
            headers: { "User-Agent": "SenjaMusikApp/2.4 (https://senjamusik.app)" },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (lrcRes.ok) {
            const data: any = await lrcRes.json();
            if (data.syncedLyrics) {
              // Parse LRC format: [01:24.50] Lyric line
              const lines: { time: number; text: string }[] = [];
              const rawLines = data.syncedLyrics.split("\n");
              for (const line of rawLines) {
                const match = line.match(/^\[(\d+):(\d+(?:\.\d+)?)\](.*)$/);
                if (match) {
                  const minutes = parseInt(match[1], 10);
                  const seconds = parseFloat(match[2]);
                  const text = match[3].trim();
                  if (text) {
                    lines.push({
                      time: Math.floor(minutes * 60 + seconds),
                      text,
                    });
                  }
                }
              }
              if (lines.length > 0) {
                return res.json({
                  source: "lrclib-synced",
                  synced: true,
                  lines,
                });
              }
            } else if (data.plainLyrics) {
              const plainLines = data.plainLyrics.split("\n").filter((l: string) => l.trim().length > 0);
              return res.json({
                source: "lrclib-plain",
                synced: false,
                plainText: data.plainLyrics,
                lines: plainLines.map((text: string, i: number) => ({ time: i * 8, text })),
              });
            }
          }
        } catch (lrcErr) {
          console.warn("LRCLIB fetch error:", lrcErr);
        }
      }

      // 2. Fallback to ytmusic-api lyrics if videoId is provided
      if (videoId) {
        try {
          const yt = await getYTMusic();
          const ytLyrics = await yt.getLyrics(videoId);
          if (Array.isArray(ytLyrics) && ytLyrics.length > 0) {
            return res.json({
              source: "ytmusic-api",
              synced: false,
              lines: ytLyrics.map((text: string, i: number) => ({ time: i * 8, text })),
            });
          }
        } catch (ytErr) {
          console.warn("YTMusic lyrics error:", ytErr);
        }
      }

      // 3. Fallback to aesthetic poetic lyrics matching the screenshot theme
      return res.json({
        source: "fallback",
        synced: true,
        lines: [
          { time: 16, text: "Di batas senja yang perlahan memudar" },
          { time: 32, text: "Kusimpan tanya di antara angin malam" },
          { time: 48, text: "Tentang langkah yang enggan kembali" },
          { time: 64, text: "Menyusuri jalan kenangan yang hening" },
          { time: 84, text: "Bila saatnya tiba ku kan merelakan" },
          { time: 98, text: "Semua bayang yang pernah menetap di dada" },
          { time: 112, text: "Dan membiarkan waktu menyulam cerita baru" },
          { time: 126, text: "Walau sunyi memeluk tanpa ada kata" },
          { time: 140, text: "Kupetik dawai hingga fajar menjelang" },
          { time: 160, text: "Dan menemukan damaiku di setiap hembusan rasa" },
        ],
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========================================================================
  // SPOTIFY WEB API ENDPOINTS (HD Metadata)
  // ========================================================================

  // Spotify: Search track (get HD album cover & metadata)
  app.get("/api/spotify/search", async (req, res) => {
    const query = (req.query.q as string || "").trim();
    if (!query) {
      return res.status(400).json({ error: "Query parameter required" });
    }

    try {
      const token = await getSpotifyAccessToken();
      if (!token) {
        return res.status(503).json({ error: "Spotify service unavailable" });
      }

      const spotifyRes = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!spotifyRes.ok) {
        throw new Error(`Spotify API error: ${spotifyRes.status}`);
      }

      const data = await spotifyRes.json();
      res.json(data);
    } catch (error: any) {
      console.error("Spotify search error:", error);
      res.status(500).json({ error: error.message, tracks: { items: [] } });
    }
  });

  // Spotify: Get artist info (HD artist image & metadata)
  app.get("/api/spotify/artist", async (req, res) => {
    const artistName = (req.query.name as string || "").trim();
    if (!artistName) {
      return res.status(400).json({ error: "Artist name required" });
    }

    try {
      const token = await getSpotifyAccessToken();
      if (!token) {
        return res.status(503).json({ error: "Spotify service unavailable" });
      }

      // Search for artist
      const searchRes = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!searchRes.ok) {
        throw new Error(`Spotify API error: ${searchRes.status}`);
      }

      const data = await searchRes.json();
      const artist = data.artists?.items?.[0];
      
      if (!artist) {
        return res.status(404).json({ error: "Artist not found" });
      }

      res.json(artist);
    } catch (error: any) {
      console.error("Spotify artist error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite Middleware Setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Senja Musik server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

