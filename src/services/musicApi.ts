import { Song } from "../types";
import { cachedFetch, generateCacheKey } from "../utils/apiCache";

/**
 * musicApi.ts / musicApi.js
 * Service utama untuk berinteraksi dengan API backend YouTube Music.
 * Mendukung VITE_API_BASE_URL untuk server API mandiri ataupun Express server internal.
 */

const metaEnv = (import.meta as any).env || {};
const isDevelopment = metaEnv.DEV;
export const API_BASE_URL = isDevelopment ? 'http://localhost:3000' : '';

console.log('🌍 Environment:', isDevelopment ? 'Development' : 'Production');
console.log('🔗 API Base:', API_BASE_URL || 'Same Origin (Vercel)');

/**
 * Helper resolusi gambar:
 * Selalu mengambil thumbnail dengan resolusi tertinggi dari YouTube Music API
 */
export function extractHighestThumbnail(
  thumbnails?: Array<{ url: string; width?: number; height?: number } | string>,
  videoId?: string
): string {
  let selectedUrl = "";

  if (Array.isArray(thumbnails) && thumbnails.length > 0) {
    // Ambil thumbnail dengan resolusi tertinggi
    const lastItem = thumbnails[thumbnails.length - 1];
    selectedUrl = typeof lastItem === "string" ? lastItem : lastItem?.url || "";
  }

  if (selectedUrl) {
    // Tingkatkan resolusi jika memungkinkan
    if (selectedUrl.includes("googleusercontent.com") || selectedUrl.includes("ggpht.com")) {
      // Gunakan parameter untuk mendapatkan gambar kualitas tinggi
      selectedUrl = selectedUrl.replace(/=w\d+-h\d+[^?&]*/gi, "=w800-h800-l90-rj");
      selectedUrl = selectedUrl.replace(/=s\d+[^?&]*/gi, "=s800");
    }
    
    // Jika thumbnail ytimg standar, gunakan mqdefault atau hqdefault
    if (selectedUrl.includes("i.ytimg.com")) {
      // Prioritas: maxresdefault > hqdefault > mqdefault
      if (selectedUrl.includes("/default.jpg")) {
        selectedUrl = selectedUrl.replace("/default.jpg", "/hqdefault.jpg");
      }
    }
    
    return selectedUrl;
  }

  // Fallback ke YouTube thumbnail jika videoId tersedia
  if (videoId) {
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }

  // Final fallback
  return "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80";
}

/**
 * Normalisasi data lagu dari response API ke model Song aplikasi.
 * Memastikan videoId dipetakan dengan tepat ke id dan videoId untuk YT.Player().
 */
export function normalizeSong(raw: any): Song {
  // Library ytmusic-api dapat mengembalikan videoId, id, atau id.videoId
  const videoId =
    raw.videoId ||
    (typeof raw.id === "string" ? raw.id : raw.id?.videoId) ||
    raw.id ||
    "";

  const title = raw.title || raw.name || "Lagu Tanpa Judul";
  const artist =
    typeof raw.artist === "string"
      ? raw.artist
      : raw.artist?.name || raw.author || raw.artistName || "Artis";

  const album =
    typeof raw.album === "string"
      ? raw.album
      : raw.album?.name || "Single";

  const duration =
    typeof raw.duration === "number"
      ? raw.duration
      : parseInt(raw.duration || "210", 10) || 210;

  const thumbnail =
    raw.thumbnail && !raw.thumbnails
      ? extractHighestThumbnail([{ url: raw.thumbnail }], videoId)
      : extractHighestThumbnail(raw.thumbnails, videoId);

  return {
    id: videoId,
    title,
    artist,
    album,
    duration,
    thumbnail,
    badge: raw.badge,
    tag: raw.tag,
    subtitle: raw.subtitle,
    audioQuality: "LOSSLESS 24-BIT / 96kHz",
  };
}

/**
 * 1. PENCARIAN LAGU (Search Music)
 * Endpoint: GET /api/search?q={query}
 * Cached for 10 minutes
 */
export async function searchMusic(query: string): Promise<Song[]> {
  const trimmed = (query || "").trim();
  if (!trimmed) return [];

  const cacheKey = generateCacheKey('/api/search', { q: trimmed });
  
  return cachedFetch(cacheKey, async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(trimmed)}`);
      if (!res.ok) {
        throw new Error(`Search request failed: ${res.status}`);
      }
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.results || [];
      return items.map((item: any) => normalizeSong(item)).filter((s: Song) => Boolean(s.id));
    } catch (error) {
      console.error(`[musicApi] searchMusic error for "${query}":`, error);
      return [];
    }
  }, 10 * 60 * 1000); // Cache for 10 minutes
}

/**
 * 2. DETAIL LAGU (Song Detail)
 * Endpoint: GET /api/song/{videoId}
 * Cached for 30 minutes (song details rarely change)
 */
export async function getSongDetail(videoId: string): Promise<Song | null> {
  if (!videoId) return null;

  const cacheKey = `/api/song/${videoId}`;
  
  return cachedFetch(cacheKey, async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/song/${encodeURIComponent(videoId)}`);
      if (!res.ok) {
        throw new Error(`getSongDetail failed: ${res.status}`);
      }
      const data = await res.json();
      return normalizeSong(data);
    } catch (error) {
      console.error(`[musicApi] getSongDetail error for "${videoId}":`, error);
      return null;
    }
  }, 30 * 60 * 1000); // Cache for 30 minutes
}

/**
 * 3. SIMILAR / RELATED ARTIST
 * Endpoint: GET /api/artist/{artistName}/related
 * 
 * CATATAN PENGEMBANG (Sesuai instruksi #4):
 * Jika endpoint khusus related-artist di API backend belum tersedia atau mengalami kegagalan,
 * fungsi ini menerapkan STRATEGI FALLBACK SEMENTARA:
 * Mencari nama artis tersebut via endpoint searchMusic(), lalu mengambil beberapa hasil
 * teratas sebagai representasi lagu serupa sampai endpoint khusus related-artist tersedia.
 */
export async function getSimilarArtist(
  artistName: string,
  fallbackQuery?: string
): Promise<{ artistName: string; artistThumbnail?: string; songs: Song[] }> {
  const cleanName = (artistName || "").trim();
  if (!cleanName) return { artistName: "", songs: [] };

  try {
    const res = await fetch(`${API_BASE_URL}/api/artist/${encodeURIComponent(cleanName)}/related`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.songs) && data.songs.length > 0) {
        return {
          artistName: data.artistName || cleanName,
          artistThumbnail: data.artistThumbnail,
          songs: data.songs.map((s: any) => normalizeSong(s)),
        };
      }
    }
  } catch (apiErr) {
    console.warn(`[musicApi] Related endpoint unavailable for "${cleanName}", using fallback search:`, apiErr);
  }

  // --- STRATEGI FALLBACK SEMENTARA ---
  // Catatan: Fallback sementara sampai endpoint asli related-artist siap sepenuhnya.
  const query = fallbackQuery || `${cleanName} lagu terbaik`;
  const fallbackResults = await searchMusic(query);

  return {
    artistName: cleanName,
    artistThumbnail: fallbackResults[0]?.thumbnail || "",
    songs: fallbackResults.slice(0, 10),
  };
}

/**
 * 4. KATEGORI & GENRE
 * Endpoint: GET /api/categories dan GET /api/categories/{categoryId}
 * Cached for 1 hour (categories rarely change)
 */
export async function getCategories(): Promise<any[]> {
  const cacheKey = '/api/categories';
  
  return cachedFetch(cacheKey, async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return await res.json();
    } catch (error) {
      console.error("[musicApi] getCategories error:", error);
      return [];
    }
  }, 60 * 60 * 1000); // Cache for 1 hour
}

export async function getCategorySongs(categoryId: string): Promise<Song[]> {
  const cacheKey = `/api/categories/${categoryId}`;
  
  return cachedFetch(cacheKey, async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/${encodeURIComponent(categoryId)}`);
      if (!res.ok) throw new Error(`Category songs failed: ${res.status}`);
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.songs || [];
      return items.map((item: any) => normalizeSong(item));
    } catch (error) {
      console.error(`[musicApi] getCategorySongs (${categoryId}) error:`, error);
      return [];
    }
  }, 15 * 60 * 1000); // Cache for 15 minutes
}

/**
 * 5. LIRIK LAGU (Public Lyrics API)
 * Endpoint: GET /api/lyrics?title={title}&artist={artist}&videoId={videoId}
 * Menggunakan public API LRCLIB untuk synchronized lyrics + fallback ytmusic-api
 */
export async function getLyrics(
  title: string,
  artist: string,
  videoId?: string
): Promise<{ source?: string; synced: boolean; lines: { time: number; text: string }[]; plainText?: string } | null> {
  try {
    const params = new URLSearchParams({
      title: title || "",
      artist: artist || "",
      videoId: videoId || "",
    });
    const res = await fetch(`${API_BASE_URL}/api/lyrics?${params.toString()}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn("[musicApi] getLyrics error:", err);
    return null;
  }
}

export default {
  API_BASE_URL,
  extractHighestThumbnail,
  normalizeSong,
  searchMusic,
  getSongDetail,
  getSimilarArtist,
  getCategories,
  getCategorySongs,
  getLyrics,
};
