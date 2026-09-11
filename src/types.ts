export interface Song {
  id: string; // YouTube videoId
  videoId?: string;
  title: string;
  originalTitle?: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  thumbnail: string;
  audioQuality?: string;
  badge?: string;
  tag?: string;
  rank?: string;
  searches?: string;
  subtitle?: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Song[];
  creator: string;
  createdAt: number;
  cover?: string;
}

export interface ListeningStats {
  totalListeningTime: number; // in seconds
  uniqueSongs: number;
  uniqueArtists: number;
  topArtists: { name: string; playCount: number; thumbnail?: string }[];
  topSongs: { song: Song; playCount: number }[];
  recentlyPlayed: Song[];
  weeklyGrowth: number; // percentage
}

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface LyricsResponse {
  source: string;
  synced: boolean;
  lines: LyricLine[];
  plainText?: string;
}

export type ScreenTab = "home" | "stats" | "explore" | "library" | "search";

export interface FeedData {
  nowPlayingInitial: Song;
  featured: Song & { subtitle?: string };
  shelves: {
    title: string;
    items: Song[];
  }[];
  communityPlaylists: {
    id: string;
    name: string;
    creator: string;
    thumbnail: string;
    trackCount: number;
  }[];
  // Legacy compatibility (optional)
  keepListening?: Song[];
  kemarauChill?: Song[];
  similarSessions?: Song[];
  trending?: Song[];
}

export interface CommunityPlaylistDetailData {
  id: string;
  title: string;
  creator: string;
  creatorAvatar: string;
  isVerified?: boolean;
  followers: string;
  trackCount: string;
  totalDuration: string;
  covers: string[];
  sampleTrack: Song;
  tracks?: Song[];
  description?: string;
}

