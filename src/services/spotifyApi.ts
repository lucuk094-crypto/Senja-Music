/**
 * Spotify Web API Service
 * 
 * Free tier: 180 requests/minute
 * Used for: High-quality album covers, metadata, artist info
 * 
 * Note: Spotify playback requires Premium account
 * We use YouTube IFrame for actual audio playback (free & unlimited)
 */

import { cachedFetch } from "../utils/apiCache";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string; id: string }>;
  album: {
    name: string;
    images: Array<{ url: string; width: number; height: number }>;
    release_date: string;
  };
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: Array<{ url: string; width: number; height: number }>;
  genres: string[];
  popularity: number;
  followers: { total: number };
}

export interface EnrichedSongMetadata {
  spotifyId?: string;
  youtubeId: string;
  title: string;
  artist: string;
  album: string;
  albumCoverHD?: string; // From Spotify (640x640 or higher)
  artistImageHD?: string; // From Spotify
  releaseDate?: string;
  genres?: string[];
  popularity?: number;
  duration: number;
  thumbnail: string; // Fallback from YouTube
}

/**
 * Search track on Spotify to get high-quality metadata
 * Cached for 1 hour (metadata rarely changes)
 */
export async function searchSpotifyTrack(
  title: string,
  artist: string
): Promise<SpotifyTrack | null> {
  const query = `track:${title} artist:${artist}`;
  const cacheKey = `/api/spotify/search?q=${encodeURIComponent(query)}`;

  return cachedFetch(
    cacheKey,
    async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/spotify/search?q=${encodeURIComponent(query)}`
        );
        if (!res.ok) return null;
        const data = await res.json();
        return data.tracks?.items?.[0] || null;
      } catch (error) {
        console.warn("Spotify search error:", error);
        return null;
      }
    },
    60 * 60 * 1000 // 1 hour cache
  );
}

/**
 * Get artist info from Spotify
 * Cached for 1 hour
 */
export async function getSpotifyArtist(
  artistName: string
): Promise<SpotifyArtist | null> {
  const cacheKey = `/api/spotify/artist?name=${encodeURIComponent(artistName)}`;

  return cachedFetch(
    cacheKey,
    async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/spotify/artist?name=${encodeURIComponent(artistName)}`
        );
        if (!res.ok) return null;
        return await res.json();
      } catch (error) {
        console.warn("Spotify artist error:", error);
        return null;
      }
    },
    60 * 60 * 1000 // 1 hour cache
  );
}

/**
 * Enrich YouTube song with Spotify metadata
 * This gives us HD album covers and better metadata while keeping YouTube for free playback
 */
export async function enrichSongWithSpotify(
  youtubeId: string,
  title: string,
  artist: string,
  youtubeThumbnail: string,
  duration: number
): Promise<EnrichedSongMetadata> {
  // Try to get Spotify data
  const spotifyTrack = await searchSpotifyTrack(title, artist);

  if (spotifyTrack) {
    // Get HD album cover (largest available, usually 640x640)
    const albumCover = spotifyTrack.album.images[0]?.url;

    return {
      spotifyId: spotifyTrack.id,
      youtubeId,
      title: spotifyTrack.name || title,
      artist: spotifyTrack.artists[0]?.name || artist,
      album: spotifyTrack.album.name,
      albumCoverHD: albumCover,
      releaseDate: spotifyTrack.album.release_date,
      popularity: spotifyTrack.popularity,
      duration: Math.floor(spotifyTrack.duration_ms / 1000) || duration,
      thumbnail: albumCover || youtubeThumbnail, // Prefer Spotify cover
    };
  }

  // Fallback to YouTube data if Spotify not found
  return {
    youtubeId,
    title,
    artist,
    album: "Single",
    duration,
    thumbnail: youtubeThumbnail,
  };
}

/**
 * Get HD artist image from Spotify
 */
export async function getArtistImageHD(artistName: string): Promise<string | null> {
  const artist = await getSpotifyArtist(artistName);
  return artist?.images[0]?.url || null;
}

/**
 * Batch enrich multiple songs (useful for playlists/feeds)
 * Rate limited to not exceed Spotify's 180 req/min limit
 */
export async function batchEnrichSongs(
  songs: Array<{
    youtubeId: string;
    title: string;
    artist: string;
    thumbnail: string;
    duration: number;
  }>
): Promise<EnrichedSongMetadata[]> {
  const enriched: EnrichedSongMetadata[] = [];
  
  // Process in chunks to respect rate limits (max 30 per batch)
  const chunkSize = 30;
  for (let i = 0; i < songs.length; i += chunkSize) {
    const chunk = songs.slice(i, i + chunkSize);
    
    const chunkResults = await Promise.all(
      chunk.map((song) =>
        enrichSongWithSpotify(
          song.youtubeId,
          song.title,
          song.artist,
          song.thumbnail,
          song.duration
        )
      )
    );
    
    enriched.push(...chunkResults);
    
    // Wait 350ms between chunks to avoid rate limiting
    if (i + chunkSize < songs.length) {
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
  }
  
  return enriched;
}

export default {
  searchSpotifyTrack,
  getSpotifyArtist,
  enrichSongWithSpotify,
  getArtistImageHD,
  batchEnrichSongs,
};
