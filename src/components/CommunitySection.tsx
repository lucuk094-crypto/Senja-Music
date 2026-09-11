import React, { useEffect, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { CommunityPlaylistDetailData, Song } from "../types";
import { searchMusic } from "../services/musicApi";

interface CommunityCardData {
  id: string;
  title: string;
  curator: string;
  saves: string;
  query: string;
  covers: string[];
  songs: Song[];
}

export const CommunitySection: React.FC = () => {
  const { setSelectedCommunityPlaylist, setIsCommunityOpen, playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();

  const [communityList, setCommunityList] = useState<CommunityCardData[]>([
    {
      id: "comm-1",
      title: "Senja Syahdu & Puisi",
      curator: "Komunitas Akustik Bandung • 42 lagu",
      saves: "14.8k saves",
      query: "lagu akustik senja indonesia puisi",
      covers: [],
      songs: [],
    },
    {
      id: "comm-2",
      title: "Dangdut Koplo Modern",
      curator: "Sobat Ambyar Nusantara • 38 lagu",
      saves: "21.3k saves",
      query: "dangdut koplo terbaru 2024 hits",
      covers: [],
      songs: [],
    },
    {
      id: "comm-3",
      title: "Indie Folk & Rintik Hujan",
      curator: "Ruang Temu Senja • 50 lagu",
      saves: "18.5k saves",
      query: "indie folk indonesia rintik hujan",
      covers: [],
      songs: [],
    },
    {
      id: "comm-4",
      title: "Akustik Cafe Sore",
      curator: "Barista Playlist ID • 35 lagu",
      saves: "9.2k saves",
      query: "lagu pop akustik santai cafe sore indonesia",
      covers: [],
      songs: [],
    },
  ]);

  const [loading, setLoading] = useState<boolean>(true);

  // Fetch real tracks & real song thumbnails for community playlists
  useEffect(() => {
    let isMounted = true;

    async function loadCommunityData() {
      try {
        const updated = await Promise.all(
          communityList.map(async (item) => {
            const songs = await searchMusic(item.query);
            const realSongs = songs.slice(0, 10);
            const covers = realSongs
              .map((s) => s.thumbnail)
              .filter(Boolean)
              .slice(0, 4);

            return {
              ...item,
              covers: covers.length >= 4 ? covers : [
                songs[0]?.thumbnail || "https://i.ytimg.com/vi/2A9Atl2hUkg/hqdefault.jpg",
                songs[1]?.thumbnail || "https://i.ytimg.com/vi/rqHkc6dAkVQ/hqdefault.jpg",
                songs[2]?.thumbnail || "https://i.ytimg.com/vi/2A9Atl2hUkg/hqdefault.jpg",
                songs[3]?.thumbnail || "https://i.ytimg.com/vi/rqHkc6dAkVQ/hqdefault.jpg",
              ],
              songs: realSongs,
            };
          })
        );

        if (isMounted) {
          setCommunityList(updated);
          setLoading(false);
        }
      } catch (err) {
        console.warn("Community playlists fetch fallback:", err);
        if (isMounted) setLoading(false);
      }
    }

    loadCommunityData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenPlaylist = (item: CommunityCardData) => {
    const detailData: CommunityPlaylistDetailData = {
      id: item.id,
      title: item.title,
      trackCount: `${item.songs.length || 30} lagu`,
      creator: item.curator.split("•")[0].trim(),
      isVerified: true,
      followers: item.saves,
      totalDuration: "1 jam 45 mnt",
      creatorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCdNUYxGYihi4Z1zYx-YElwiNjn1t0yZKuKhFRIivdojfrGgF1_ssSw3G1zX5pXNpXxLVBsVc-n0zFRJxoH80nY0Ai0PLulNQJ6wMvWoOgSu8v-MmqwEtQz3Wg9EAIIOE1zTAMUiAMW4YstoTT_o6PepaL7CTc2MH7t-7tGhhlrP3gpPaViY5I_0LVk9xeLZiAMTnYsZb5zY4xJ770hTrIKg5JcIiDMalbvDdfdaALipZe7uokA7rdQ",
      covers: item.covers,
      sampleTrack: item.songs[0],
      tracks: item.songs,
    };
    setSelectedCommunityPlaylist(detailData);
  };

  const handlePlayDirect = (e: React.MouseEvent, item: CommunityCardData) => {
    e.stopPropagation();
    if (item.songs && item.songs.length > 0) {
      const topSong = item.songs[0];
      const currentVideoId = (currentTrack as any).videoId || currentTrack.id;
      const targetVideoId = (topSong as any).videoId || topSong.id;
      if (currentVideoId && targetVideoId && currentVideoId === targetVideoId) {
        togglePlay();
      } else {
        playTrack(topSong);
      }
    } else {
      handleOpenPlaylist(item);
    }
  };

  return (
    <section id="community-section" className="mb-10 pt-2 animate-in fade-in duration-300">
      {/* Header */}
      <header className="flex items-center justify-between mb-4 px-0.5">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest text-white/50 uppercase block">
            DIBUAT OLEH PENDENGAR LAIN
          </span>
          <div className="flex items-center space-x-2 mt-0.5">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Playlist Komunitas
            </h2>
            <span
              className="material-symbols-outlined text-[20px] text-white/60"
              title="Komunitas Pendengar"
            >
              groups
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsCommunityOpen(true)}
          className="text-xs font-semibold text-white/50 hover:text-white cursor-pointer transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.05]"
        >
          Lihat Semua
        </button>
      </header>

      {/* Skeletons while loading */}
      {loading ? (
        <div className="flex space-x-3.5 overflow-x-auto no-scrollbar -mx-1 px-1 pb-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-64 h-52 rounded-3xl bg-white/[0.03] border border-white/5 animate-pulse p-4"
            >
              <div className="w-full h-32 rounded-2xl bg-white/10 mb-3"></div>
              <div className="h-3.5 w-36 bg-white/10 rounded mb-2"></div>
              <div className="h-2.5 w-28 bg-white/5 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        /* HORIZONTAL SCROLL - Professional & Minimalist Community Cards */
        <div className="flex space-x-4 overflow-x-auto no-scrollbar -mx-1 px-1 pb-2">
          {communityList.map((item) => {
            const isPlayingThis =
              item.songs.length > 0 &&
              ((currentTrack as any).videoId || currentTrack.id) ===
                ((item.songs[0] as any).videoId || item.songs[0].id) &&
              isPlaying;

            return (
              <div
                key={item.id}
                onClick={() => handleOpenPlaylist(item)}
                className="flex-shrink-0 w-64 group cursor-pointer select-none"
              >
                {/* Elegant Card with Rounded Corners */}
                <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] hover:border-white/20 bg-gradient-to-br from-neutral-900/40 to-black/60 backdrop-blur-sm shadow-xl transition-all duration-300 p-4 pb-5">
                  
                  {/* 4-Grid Album Covers - Real Song Thumbnails */}
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden grid grid-cols-2 grid-rows-2 gap-1 bg-black/60 border border-white/[0.12] mb-3 shadow-lg">
                    {item.covers.slice(0, 4).map((cover, idx) => (
                      <div key={idx} className="relative overflow-hidden">
                        <img
                          src={cover}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src = "https://i.ytimg.com/vi/2A9Atl2hUkg/hqdefault.jpg";
                          }}
                        />
                      </div>
                    ))}
                    
                    {/* Subtle Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent group-hover:from-black/50 transition-all duration-300"></div>

                    {/* Play Button Overlay - Minimalist */}
                    <button
                      onClick={(e) => handlePlayDirect(e, item)}
                      className={`absolute bottom-3 right-3 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
                        isPlayingThis
                          ? "bg-white text-black scale-100 opacity-100"
                          : "bg-white/95 text-black opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[24px] ml-0.5"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {isPlayingThis ? "pause" : "play_arrow"}
                      </span>
                    </button>
                  </div>

                  {/* Playlist Info - Clean Typography */}
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-white leading-tight line-clamp-2 group-hover:text-white transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-white/55 truncate">
                      {item.curator.split("•")[0].trim()}
                    </p>
                    
                    {/* Stats Badge */}
                    <div className="flex items-center space-x-2 pt-1">
                      <span className="px-2 py-0.5 rounded-lg bg-white/[0.08] border border-white/[0.12] text-[10px] font-bold text-white/70">
                        {item.saves}
                      </span>
                      <span className="flex items-center space-x-1 text-[10px] text-white/40">
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        <span>Komunitas</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
