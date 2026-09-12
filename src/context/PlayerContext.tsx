import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { INITIAL_FEED, INITIAL_NOW_PLAYING } from "../data/defaultData";
import { CommunityPlaylistDetailData, FeedData, ListeningStats, LyricLine, LyricsResponse, Playlist, Song } from "../types";
import { getStorageItem, setStorageItem, STORAGE_KEYS } from "../utils/localStorage";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
}

interface PlayerContextType {
  currentTrack: Song;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  isRepeat: boolean;
  isLiked: boolean;
  queue: Song[];
  feed: FeedData;
  isLoadingFeed: boolean;
  lyrics: LyricLine[];
  isLyricsSynced: boolean;
  activeLyricIndex: number;
  // Library Management
  likedSongs: Song[];
  playlists: Playlist[];
  downloadedSongs: Song[];
  recentlyPlayed: Song[];
  listeningStats: ListeningStats;
  // User Profile & Preferences
  userName: string;
  setUserName: (name: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  selectedFont: string;
  setSelectedFont: (font: string) => void;
  // Actions
  playTrack: (song: Song) => void;
  togglePlay: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  playNext: () => void;
  playPrev: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLike: (songId?: string) => void;
  // Playlist Management
  createPlaylist: (name: string) => void;
  deletePlaylist: (playlistId: string) => void;
  addToPlaylist: (playlistId: string, song: Song) => void;
  removeFromPlaylist: (playlistId: string, songId: string) => void;
  // Download Management
  toggleDownload: (song: Song) => void;
  isDownloaded: (songId: string) => boolean;
  // Queue Management
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playFromQueue: (index: number) => void;
  moveQueueItem: (fromIndex: number, toIndex: number) => void;
  isQueueOpen: boolean;
  setIsQueueOpen: (open: boolean) => void;
  // Screen/modal navigation
  isNowPlayingOpen: boolean;
  setIsNowPlayingOpen: (open: boolean) => void;
  isLyricsOpen: boolean;
  setIsLyricsOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isCommunityOpen: boolean;
  setIsCommunityOpen: (open: boolean) => void;
  selectedCommunityPlaylist: CommunityPlaylistDetailData | null;
  setSelectedCommunityPlaylist: (pl: CommunityPlaylistDetailData | null) => void;
  activeTab: "home" | "stats" | "explore" | "library" | "search";
  setActiveTab: (tab: "home" | "stats" | "explore" | "library" | "search") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  // Toast notifications
  toasts: ToastMessage[];
  showToast: (type: ToastMessage["type"], title: string, message: string, duration?: number) => void;
  dismissToast: (id: string) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [feed, setFeed] = useState<FeedData>(INITIAL_FEED);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<Song>(INITIAL_NOW_PLAYING);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(84);
  const [duration, setDuration] = useState(222);
  const [volume, setVolumeState] = useState(() => getStorageItem(STORAGE_KEYS.VOLUME, 70));
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(() => getStorageItem(STORAGE_KEYS.IS_SHUFFLE, false));
  const [isRepeat, setIsRepeat] = useState(() => getStorageItem(STORAGE_KEYS.IS_REPEAT, false));
  const [likedSongs, setLikedSongs] = useState<Set<string>>(() => {
    const saved = getStorageItem<string[]>(STORAGE_KEYS.LIKED_SONGS, ["2A9Atl2hUkg"]);
    return new Set(saved);
  });
  const [queue, setQueue] = useState<Song[]>([]);

  // Library Management State
  const [playlists, setPlaylists] = useState<Playlist[]>(() => 
    getStorageItem(STORAGE_KEYS.PLAYLISTS, [])
  );
  const [downloadedSongs, setDownloadedSongs] = useState<Song[]>(() =>
    getStorageItem(STORAGE_KEYS.DOWNLOADED_SONGS, [])
  );
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>(() =>
    getStorageItem(STORAGE_KEYS.RECENTLY_PLAYED, [])
  );
  
  // User Profile & Preferences
  const [userName, setUserName] = useState<string>(() =>
    localStorage.getItem('senja_user_name') || 'Amanda Putri'
  );
  const [userEmail, setUserEmail] = useState<string>(() =>
    localStorage.getItem('senja_user_email') || 'amanda@senjamusik.id'
  );
  const [selectedFont, setSelectedFont] = useState<string>(() =>
    localStorage.getItem('senja_font') || 'Inter'
  );
  
  // Auto-save user preferences to localStorage
  useEffect(() => {
    localStorage.setItem('senja_user_name', userName);
  }, [userName]);
  
  useEffect(() => {
    localStorage.setItem('senja_user_email', userEmail);
  }, [userEmail]);
  
  useEffect(() => {
    localStorage.setItem('senja_font', selectedFont);
    // Apply font to document
    document.documentElement.style.setProperty('--font-family', selectedFont);
  }, [selectedFont]);
  
  // Listening Stats State
  const [playHistory, setPlayHistory] = useState<{ songId: string; artist: string; timestamp: number; duration: number }[]>(() =>
    getStorageItem(STORAGE_KEYS.PLAY_HISTORY, [])
  );
  const [songPlayCounts, setSongPlayCounts] = useState<Map<string, number>>(() => {
    const saved = getStorageItem<[string, number][]>(STORAGE_KEYS.SONG_PLAY_COUNTS, []);
    return new Map(saved);
  });
  const [artistPlayCounts, setArtistPlayCounts] = useState<Map<string, number>>(() => {
    const saved = getStorageItem<[string, number][]>(STORAGE_KEYS.ARTIST_PLAY_COUNTS, []);
    return new Map(saved);
  });

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<"home" | "stats" | "explore" | "library" | "search">("home");
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const [selectedCommunityPlaylist, setSelectedCommunityPlaylist] = useState<CommunityPlaylistDetailData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Lyrics State
  const [lyrics, setLyrics] = useState<LyricLine[]>([
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
  ]);
  const [isLyricsSynced, setIsLyricsSynced] = useState(true);

  // YouTube Iframe Player Ref
  const ytPlayerRef = useRef<any>(null);
  const isPlayerReadyRef = useRef<boolean>(false);
  const pendingPlayRef = useRef<boolean>(false);
  const playerErrorCount = useRef<number>(0);
  const maxRetries = 3;

  // Queue Management State
  const [queueIndex, setQueueIndex] = useState(0);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  // Toast Notifications State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast notification functions
  const showToast = (
    type: ToastMessage["type"],
    title: string,
    message: string,
    duration: number = 4000
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, type, title, message, duration };
    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Fetch feed from backend server
  useEffect(() => {
    let isMounted = true;
    const apiBase = (window as any).__API_BASE_URL__ || '';
    fetch(`${apiBase}/api/yt/feed`)
      .then((res) => res.json())
      .then((response) => {
        if (isMounted && response && !response.error) {
          // Handle new API structure: { success, data: { nowPlayingInitial, featured, shelves, communityPlaylists } }
          const feedData = response.data || response;
          
          setFeed(feedData);
          
          // Set initial track if needed
          if (feedData.nowPlayingInitial) {
            setCurrentTrack(feedData.nowPlayingInitial);
          }
          
          // Build queue from all feed tracks
          const allSongs: Song[] = [
            feedData.nowPlayingInitial,
            feedData.featured,
          ].filter(Boolean);
          
          // Add all songs from shelves
          if (feedData.shelves && Array.isArray(feedData.shelves)) {
            feedData.shelves.forEach((shelf: any) => {
              if (shelf.items && Array.isArray(shelf.items)) {
                allSongs.push(...shelf.items);
              }
            });
          }
          
          setQueue(allSongs);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch initial feed:", err);
        if (isMounted) {
          showToast(
            "error",
            "Gagal Memuat Katalog",
            "Tidak dapat memuat daftar lagu. Periksa koneksi internet Anda."
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingFeed(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Persist playlists to localStorage
  useEffect(() => {
    setStorageItem(STORAGE_KEYS.PLAYLISTS, playlists);
  }, [playlists]);

  // Persist downloaded songs to localStorage
  useEffect(() => {
    setStorageItem(STORAGE_KEYS.DOWNLOADED_SONGS, downloadedSongs);
  }, [downloadedSongs]);

  // Persist recently played to localStorage
  useEffect(() => {
    setStorageItem(STORAGE_KEYS.RECENTLY_PLAYED, recentlyPlayed);
  }, [recentlyPlayed]);

  // Persist play history to localStorage
  useEffect(() => {
    setStorageItem(STORAGE_KEYS.PLAY_HISTORY, playHistory);
  }, [playHistory]);

  // Persist play counts to localStorage
  useEffect(() => {
    setStorageItem(STORAGE_KEYS.SONG_PLAY_COUNTS, Array.from(songPlayCounts.entries()));
  }, [songPlayCounts]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.ARTIST_PLAY_COUNTS, Array.from(artistPlayCounts.entries()));
  }, [artistPlayCounts]);

  // Initialize YouTube Iframe Player API with better error handling
  useEffect(() => {
    const initYT = () => {
      if (!window.YT || !window.YT.Player) return;
      if (ytPlayerRef.current) return;

      try {
        ytPlayerRef.current = new window.YT.Player("senja-yt-iframe-player", {
          height: "100%",
          width: "100%",
          videoId: (currentTrack as any).videoId || currentTrack.id || "2A9Atl2hUkg",
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              console.log("YouTube Player ready");
              isPlayerReadyRef.current = true;
              playerErrorCount.current = 0; // Reset error count on success
              event.target.setVolume(volume);
              if (pendingPlayRef.current) {
                event.target.playVideo();
                pendingPlayRef.current = false;
              }
            },
            onStateChange: (event: any) => {
              // 1 = playing, 2 = paused, 0 = ended, 3 = buffering, 5 = cued
              if (event.data === 1) {
                setIsPlaying(true);
                playerErrorCount.current = 0; // Reset on successful play
              } else if (event.data === 2) {
                setIsPlaying(false);
              } else if (event.data === 0) {
                setIsPlaying(false);
                playNext();
              }
            },
            onError: (event: any) => {
              console.error("YouTube Player error:", event.data);
              playerErrorCount.current++;
              
              // Error codes: 2 = invalid param, 5 = HTML5 error, 100 = not found, 101/150 = embed not allowed
              let errorTitle = "Kesalahan Pemutaran";
              let errorMessage = "Terjadi kesalahan saat memutar lagu.";
              
              if (event.data === 100) {
                errorTitle = "Lagu Tidak Ditemukan";
                errorMessage = "Video tidak tersedia. Mencoba lagu berikutnya...";
              } else if (event.data === 101 || event.data === 150) {
                errorTitle = "Lagu Tidak Dapat Diputar";
                errorMessage = "Video tidak dapat diputar di sini. Melewati ke lagu berikutnya...";
              } else if (event.data === 5) {
                errorTitle = "Kesalahan Player";
                errorMessage = "Terjadi kesalahan HTML5 player. Mencoba lagi...";
              } else if (event.data === 2) {
                errorTitle = "Parameter Tidak Valid";
                errorMessage = "ID video tidak valid. Mencoba lagu berikutnya...";
              }
              
              showToast("error", errorTitle, errorMessage);
              
              if (event.data === 100 || event.data === 101 || event.data === 150) {
                console.warn("Video unavailable or restricted, skipping to next");
                // Skip to next song after a brief delay
                setTimeout(() => {
                  if (playerErrorCount.current < maxRetries) {
                    playNext();
                  } else {
                    console.error("Too many playback errors, stopping playback");
                    showToast(
                      "error",
                      "Terlalu Banyak Kesalahan",
                      "Pemutaran dihentikan karena terlalu banyak error. Coba lagu lain."
                    );
                    setIsPlaying(false);
                  }
                }, 1000);
              } else if (playerErrorCount.current >= maxRetries) {
                console.error("Max retries reached, stopping playback");
                showToast(
                  "error",
                  "Pemutaran Dihentikan",
                  "Gagal memutar lagu setelah beberapa percobaan."
                );
                setIsPlaying(false);
              }
            },
          },
        });
      } catch (e) {
        console.error("YT Player init error:", e);
        playerErrorCount.current++;
        
        showToast(
          "error",
          "Kesalahan Inisialisasi Player",
          "Gagal memuat YouTube player. Mencoba lagi..."
        );
        
        // Retry initialization if not exceeded max retries
        if (playerErrorCount.current < maxRetries) {
          setTimeout(() => {
            ytPlayerRef.current = null;
            initYT();
          }, 2000);
        } else {
          showToast(
            "error",
            "Player Tidak Dapat Dimuat",
            "Tidak dapat menginisialisasi music player. Refresh halaman atau periksa koneksi."
          );
        }
      }
    };

    if (window.YT && window.YT.Player) {
      initYT();
    } else {
      // Load YouTube IFrame API
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.onerror = () => {
        console.error("Failed to load YouTube IFrame API");
        playerErrorCount.current++;
        showToast(
          "error",
          "Gagal Memuat API",
          "Tidak dapat memuat YouTube API. Periksa koneksi internet Anda."
        );
      };
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        console.log("YouTube IFrame API loaded");
        initYT();
      };
    }

    // Cleanup
    return () => {
      if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {
          console.warn("Error destroying player:", e);
        }
      }
    };
  }, []);

  // Timer loop when playing to update current time & duration
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        if (ytPlayerRef.current && isPlayerReadyRef.current) {
          try {
            const current = ytPlayerRef.current.getCurrentTime?.();
            const dur = ytPlayerRef.current.getDuration?.();
            if (typeof current === "number" && !isNaN(current)) {
              setCurrentTime(Math.floor(current));
            }
            if (typeof dur === "number" && !isNaN(dur) && dur > 0) {
              setDuration(Math.floor(dur));
            }
          } catch (e) {
            // Player might not be ready yet
          }
        } else {
          // Local fallback simulation if iframe hasn't loaded video yet
          setCurrentTime((prev) => (prev >= duration ? 0 : prev + 1));
        }
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, duration]);

  // Fetch lyrics whenever currentTrack changes
  useEffect(() => {
    if (!currentTrack) return;
    const controller = new AbortController();

    const titleParam = encodeURIComponent(currentTrack.originalTitle || currentTrack.title);
    const artistParam = encodeURIComponent(currentTrack.artist);
    const videoIdParam = encodeURIComponent(currentTrack.id);
    const apiBase = (window as any).__API_BASE_URL__ || '';

    fetch(`${apiBase}/api/yt/lyrics?title=${titleParam}&artist=${artistParam}&videoId=${videoIdParam}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data: LyricsResponse) => {
        if (data && data.lines && data.lines.length > 0) {
          setLyrics(data.lines);
          setIsLyricsSynced(data.synced ?? true);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.warn("Lyrics fetch error:", err);
        }
      });

    return () => {
      controller.abort();
    };
  }, [currentTrack.id]);

  // Compute active lyric line index based on currentTime
  const activeLyricIndex = React.useMemo(() => {
    if (!lyrics || lyrics.length === 0) return -1;
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) {
        return i;
      }
    }
    return 0;
  }, [lyrics, currentTime]);

  // Player controls
  const playTrack = (song: Song) => {
    const targetVideoId = (song as any).videoId || song.id || ((song as any).id?.videoId) || "";
    
    // Validate videoId - must be 11 characters (YouTube standard)
    if (!targetVideoId || targetVideoId.length !== 11 || targetVideoId.includes('/') || targetVideoId.includes('?')) {
      console.error("Invalid videoId:", targetVideoId);
      showToast(
        "error",
        "Lagu Tidak Valid",
        "ID video tidak valid. Coba pilih lagu lain."
      );
      return;
    }
    
    const normalizedSong: Song = {
      ...song,
      id: targetVideoId || song.id,
    };
    setCurrentTrack(normalizedSong);
    setCurrentTime(0);
    setDuration(song.duration || 220);
    setIsPlaying(true);

    // Track play history
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((s) => s.id !== normalizedSong.id);
      return [normalizedSong, ...filtered].slice(0, 50);
    });

    // Update play counts
    setSongPlayCounts((prev) => {
      const newMap = new Map(prev);
      const currentCount = newMap.get(normalizedSong.id) as number || 0;
      newMap.set(normalizedSong.id, currentCount + 1);
      return newMap;
    });

    setArtistPlayCounts((prev) => {
      const newMap = new Map(prev);
      const currentCount = newMap.get(normalizedSong.artist) as number || 0;
      newMap.set(normalizedSong.artist, currentCount + 1);
      return newMap;
    });

    // Add to play history
    setPlayHistory((prev) => [
      ...prev,
      {
        songId: normalizedSong.id,
        artist: normalizedSong.artist,
        timestamp: Date.now(),
        duration: song.duration || 220,
      },
    ]);

    if (ytPlayerRef.current && isPlayerReadyRef.current) {
      try {
        ytPlayerRef.current.loadVideoById({
          videoId: targetVideoId,
          startSeconds: 0,
        });
        ytPlayerRef.current.playVideo();
      } catch (e) {
        console.error("loadVideoById error:", e);
        showToast(
          "error",
          "Gagal Memuat Lagu",
          "Terjadi kesalahan saat memuat video. Mencoba lagu berikutnya..."
        );
      }
    } else {
      pendingPlayRef.current = true;
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (ytPlayerRef.current && isPlayerReadyRef.current) {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      setIsPlaying(true);
      if (ytPlayerRef.current && isPlayerReadyRef.current) {
        try {
          ytPlayerRef.current.playVideo();
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const seekTo = (seconds: number) => {
    const clamped = Math.max(0, Math.min(seconds, duration));
    setCurrentTime(clamped);
    if (ytPlayerRef.current && isPlayerReadyRef.current) {
      try {
        ytPlayerRef.current.seekTo(clamped, true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const setVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(100, val));
    setVolumeState(clamped);
    setStorageItem(STORAGE_KEYS.VOLUME, clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
    if (ytPlayerRef.current && isPlayerReadyRef.current) {
      try {
        ytPlayerRef.current.setVolume(clamped);
        if (clamped === 0) {
          ytPlayerRef.current.mute();
        } else {
          ytPlayerRef.current.unMute();
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (ytPlayerRef.current && isPlayerReadyRef.current) {
      try {
        if (nextMuted) {
          ytPlayerRef.current.mute();
        } else {
          ytPlayerRef.current.unMute();
          ytPlayerRef.current.setVolume(volume || 50);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const playNext = () => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex((s) => s.id === currentTrack.id);
    let nextIndex = currentIndex + 1;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      nextIndex = isRepeat ? 0 : 0;
    }
    
    // Try to find next valid song (skip invalid videoIds)
    let attempts = 0;
    const maxAttempts = queue.length;
    
    while (attempts < maxAttempts) {
      const nextSong = queue[nextIndex];
      if (nextSong) {
        const videoId = (nextSong as any).videoId || nextSong.id;
        // Check if videoId is valid (11 chars, no special chars)
        if (videoId && videoId.length === 11 && !videoId.includes('/') && !videoId.includes('?')) {
          playTrack(nextSong);
          return;
        }
      }
      // Invalid song, try next one
      nextIndex = (nextIndex + 1) % queue.length;
      attempts++;
    }
    
    // All songs in queue are invalid
    showToast("warning", "Antrean Kosong", "Tidak ada lagu valid di antrean.");
  };

  const playPrev = () => {
    if (queue.length === 0) return;
    // If more than 3 seconds in, restart track
    if (currentTime > 3) {
      seekTo(0);
      return;
    }
    const currentIndex = queue.findIndex((s) => s.id === currentTrack.id);
    let prevIndex = currentIndex - 1 < 0 ? queue.length - 1 : currentIndex - 1;
    
    // Try to find previous valid song (skip invalid videoIds)
    let attempts = 0;
    const maxAttempts = queue.length;
    
    while (attempts < maxAttempts) {
      const prevSong = queue[prevIndex];
      if (prevSong) {
        const videoId = (prevSong as any).videoId || prevSong.id;
        // Check if videoId is valid (11 chars, no special chars)
        if (videoId && videoId.length === 11 && !videoId.includes('/') && !videoId.includes('?')) {
          playTrack(prevSong);
          return;
        }
      }
      // Invalid song, try previous one
      prevIndex = prevIndex - 1 < 0 ? queue.length - 1 : prevIndex - 1;
      attempts++;
    }
    
    // All songs in queue are invalid
    showToast("warning", "Antrean Kosong", "Tidak ada lagu valid di antrean.");
  };

  const toggleShuffle = () => {
    setIsShuffle((prev) => {
      const newValue = !prev;
      setStorageItem(STORAGE_KEYS.IS_SHUFFLE, newValue);
      return newValue;
    });
  };

  const toggleRepeat = () => {
    setIsRepeat((prev) => {
      const newValue = !prev;
      setStorageItem(STORAGE_KEYS.IS_REPEAT, newValue);
      return newValue;
    });
  };

  const toggleLike = (songId?: string) => {
    const id = songId || currentTrack.id;
    setLikedSongs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      setStorageItem(STORAGE_KEYS.LIKED_SONGS, Array.from(next));
      return next;
    });
  };

  const isLiked = likedSongs.has(currentTrack.id);

  // Playlist Management Functions
  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}`,
      name,
      tracks: [],
      creator: "Amanda",
      createdAt: Date.now(),
    };
    setPlaylists((prev) => [...prev, newPlaylist]);
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists((prev) => prev.filter((pl) => pl.id !== playlistId));
  };

  const addToPlaylist = (playlistId: string, song: Song) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          // Check if song already exists
          if (pl.tracks.find((t) => t.id === song.id)) {
            return pl;
          }
          return { ...pl, tracks: [...pl.tracks, song] };
        }
        return pl;
      })
    );
  };

  const removeFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          return { ...pl, tracks: pl.tracks.filter((t) => t.id !== songId) };
        }
        return pl;
      })
    );
  };

  // Download Management Functions
  const toggleDownload = (song: Song) => {
    setDownloadedSongs((prev) => {
      const exists = prev.find((s) => s.id === song.id);
      if (exists) {
        return prev.filter((s) => s.id !== song.id);
      }
      return [...prev, song];
    });
  };

  const isDownloaded = (songId: string) => {
    return downloadedSongs.some((s) => s.id === songId);
  };

  // Queue Management Functions
  const addToQueue = (song: Song) => {
    setQueue((prev) => [...prev, song]);
  };

  const removeFromQueue = (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
    // Adjust queueIndex if needed
    if (index < queueIndex) {
      setQueueIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const clearQueue = () => {
    setQueue([]);
    setQueueIndex(0);
  };

  const playFromQueue = (index: number) => {
    if (index >= 0 && index < queue.length) {
      setQueueIndex(index);
      playTrack(queue[index]);
    }
  };

  const moveQueueItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || fromIndex >= queue.length || toIndex < 0 || toIndex >= queue.length) {
      return;
    }
    
    setQueue((prev) => {
      const newQueue = [...prev];
      const [removed] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, removed);
      return newQueue;
    });

    // Adjust queueIndex if the current song was moved
    if (fromIndex === queueIndex) {
      setQueueIndex(toIndex);
    } else if (fromIndex < queueIndex && toIndex >= queueIndex) {
      setQueueIndex(queueIndex - 1);
    } else if (fromIndex > queueIndex && toIndex <= queueIndex) {
      setQueueIndex(queueIndex + 1);
    }
  };

  // Get liked songs as array
  const likedSongsArray = React.useMemo(() => {
    const allItems: Song[] = [];
    if (feed.shelves && Array.isArray(feed.shelves)) {
      feed.shelves.forEach((shelf: any) => {
        if (shelf.items && Array.isArray(shelf.items)) {
          allItems.push(...shelf.items);
        }
      });
    }
    
    const allSongs = [
      currentTrack,
      feed.featured,
      feed.nowPlayingInitial,
      ...allItems,
      ...queue,
    ].filter((s) => s && likedSongs.has(s.id));
    
    // Deduplicate by id
    const seen = new Set();
    return allSongs.filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [likedSongs, feed, queue, currentTrack]);

  // Calculate listening stats
  const listeningStats = React.useMemo<ListeningStats>(() => {
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;

    // Total listening time (in seconds)
    const totalListeningTime = playHistory.reduce((sum, item) => sum + item.duration, 0);
    
    // This week vs last week
    const thisWeekTime = playHistory
      .filter((item) => item.timestamp >= oneWeekAgo)
      .reduce((sum, item) => sum + item.duration, 0);
    
    const lastWeekTime = playHistory
      .filter((item) => item.timestamp >= twoWeeksAgo && item.timestamp < oneWeekAgo)
      .reduce((sum, item) => sum + item.duration, 0);

    const weeklyGrowth = lastWeekTime > 0 ? ((thisWeekTime - lastWeekTime) / lastWeekTime) * 100 : 0;

    // Unique songs and artists
    const uniqueSongIds = new Set(playHistory.map((item) => item.songId));
    const uniqueArtistNames = new Set(playHistory.map((item) => item.artist));

    // Top artists
    const topArtists = Array.from(artistPlayCounts.entries())
      .map(([name, playCount]) => ({
        name,
        playCount,
        thumbnail: recentlyPlayed.find((s) => s.artist === name)?.thumbnail,
      }))
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, 10);

    // Top songs
    const allItemsForStats: Song[] = [];
    if (feed.shelves && Array.isArray(feed.shelves)) {
      feed.shelves.forEach((shelf: any) => {
        if (shelf.items && Array.isArray(shelf.items)) {
          allItemsForStats.push(...shelf.items);
        }
      });
    }
    
    const allSongs = [
      currentTrack,
      feed.featured,
      feed.nowPlayingInitial,
      ...allItemsForStats,
      ...recentlyPlayed,
      ...queue,
    ];

    const topSongs = Array.from(songPlayCounts.entries())
      .map(([songId, playCount]) => {
        const song = allSongs.find((s) => s.id === songId);
        return song ? { song, playCount } : null;
      })
      .filter((item): item is { song: Song; playCount: number } => item !== null)
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, 10);

    return {
      totalListeningTime,
      uniqueSongs: uniqueSongIds.size,
      uniqueArtists: uniqueArtistNames.size,
      topArtists,
      topSongs,
      recentlyPlayed: recentlyPlayed.slice(0, 20),
      weeklyGrowth,
    };
  }, [playHistory, songPlayCounts, artistPlayCounts, recentlyPlayed, feed, queue, currentTrack]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        isRepeat,
        isLiked,
        queue,
        feed,
        isLoadingFeed,
        lyrics,
        isLyricsSynced,
        activeLyricIndex,
        likedSongs: likedSongsArray,
        playlists,
        downloadedSongs,
        recentlyPlayed,
        listeningStats,
        userName,
        setUserName,
        userEmail,
        setUserEmail,
        selectedFont,
        setSelectedFont,
        playTrack,
        togglePlay,
        seekTo,
        setVolume,
        toggleMute,
        playNext,
        playPrev,
        toggleShuffle,
        toggleRepeat,
        toggleLike,
        createPlaylist,
        deletePlaylist,
        addToPlaylist,
        removeFromPlaylist,
        toggleDownload,
        isDownloaded,
        addToQueue,
        toasts,
        showToast,
        dismissToast,
        removeFromQueue,
        clearQueue,
        playFromQueue,
        moveQueueItem,
        isQueueOpen,
        setIsQueueOpen,
        isNowPlayingOpen,
        setIsNowPlayingOpen,
        isLyricsOpen,
        setIsLyricsOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        isCommunityOpen,
        setIsCommunityOpen,
        selectedCommunityPlaylist,
        setSelectedCommunityPlaylist,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
      {/* Hidden container for YouTube Iframe to ensure standard audio playback */}
      <div
        id="senja-yt-iframe-container"
        className="fixed -bottom-[9999px] -left-[9999px] w-[1px] h-[1px] opacity-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div id="senja-yt-iframe-player"></div>
      </div>
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within PlayerProvider");
  }
  return context;
};
