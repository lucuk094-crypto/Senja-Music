/**
 * api.ts
 * Unified API service layer - re-exports from musicApi.ts for consistency
 * This file maintains backward compatibility while using the main musicApi implementation
 */

// Re-export all functions from musicApi.ts as the single source of truth
export {
  API_BASE_URL,
  extractHighestThumbnail,
  normalizeSong,
  searchMusic,
  getSongDetail,
  getSimilarArtist,
  getCategories,
  getCategorySongs,
  getLyrics,
} from "./musicApi";

// Type definitions for backward compatibility
import { Song } from "../types";

export interface ApiSongItem {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  album?: string;
}

export interface RelatedArtistResponse {
  artistName: string;
  artistId?: string | null;
  artistThumbnail?: string;
  note?: string;
  songs: Song[];
}

export interface MusicCategoryItem {
  id: string;
  name: string;
  query: string;
  description: string;
  gradient?: string;
  icon?: string;
}

/**
 * Helper to convert ApiSongItem into application Song model
 */
export function toAppSong(item: ApiSongItem): Song {
  return {
    id: item.videoId,
    title: item.title,
    artist: item.artist,
    album: item.album || "Single",
    duration: item.duration || 210,
    thumbnail: item.thumbnail,
    audioQuality: "LOSSLESS 24-BIT / 96kHz",
  };
}

/**
 * Alias for getSimilarArtist for backward compatibility
 */
export { getSimilarArtist as getRelatedArtistSongs } from "./musicApi";
