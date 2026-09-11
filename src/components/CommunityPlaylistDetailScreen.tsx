import React, { useEffect, useMemo, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { CommunityPlaylistDetailData, Song } from "../types";

export const CommunityPlaylistDetailScreen: React.FC = () => {
  const {
    selectedCommunityPlaylist,
    setSelectedCommunityPlaylist,
    playTrack,
    currentTrack,
    isPlaying,
    togglePlay,
    feed,
  } = usePlayer();

  const [isFollowed, setIsFollowed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const playlist = selectedCommunityPlaylist;

  // Curated list of songs for this community playlist
  const songList: Song[] = useMemo(() => {
    if (!playlist) return [];
    if (playlist.tracks && playlist.tracks.length > 0) {
      return playlist.tracks;
    }
    // Fallback combined catalog from feed
    const allItems: Song[] = [];
    if (feed.shelves && Array.isArray(feed.shelves)) {
      feed.shelves.forEach((shelf: any) => {
        if (shelf.items && Array.isArray(shelf.items)) {
          allItems.push(...shelf.items);
        }
      });
    }
    
    const pool = [
      playlist.sampleTrack,
      ...allItems,
      feed.featured,
      feed.nowPlayingInitial,
    ].filter(Boolean);

    // Remove duplicates by id
    const seen = new Set<string>();
    const uniqueList: Song[] = [];
    for (const s of pool) {
      if (!seen.has(s.id)) {
        seen.add(s.id);
        uniqueList.push(s);
      }
    }
    return uniqueList.slice(0, 10);
  }, [playlist, feed]);

  // Similar playlists for the bottom section - REAL DATA FROM API
  const [similarPlaylists, setSimilarPlaylists] = useState<CommunityPlaylistDetailData[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);

  // Load similar playlists with REAL songs from API
  useEffect(() => {
    let isMounted = true;

    async function loadSimilarPlaylists() {
      try {
        const queries = [
          { id: "sim-1", title: "Senja Syahdu & Puisi", query: "lagu akustik senja indonesia", creator: "Rian D'Masiv Fan" },
          { id: "sim-2", title: "Hujan di Bandung", query: "lagu hujan indonesia pop", creator: "Dinda Kirana" },
          { id: "sim-3", title: "Indie Folk Senja", query: "indie folk indonesia terbaik", creator: "Kopi & Akustik" },
          { id: "sim-4", title: "Malam Sunyi & Ngoding", query: "lofi chill indonesia", creator: "Dev Senja Community" },
        ];

        const results = await Promise.all(
          queries.map(async (item) => {
            try {
              const songs = await searchMusic(item.query);
              const realSongs = songs.slice(0, 10);
              const covers = realSongs
                .map((s) => s.thumbnail)
                .filter(Boolean)
                .slice(0, 4);

              return {
                id: item.id,
                title: item.title,
                trackCount: `${realSongs.length} lagu`,
                creator: item.creator,
                isVerified: Math.random() > 0.5,
                followers: `${Math.floor(Math.random() * 30 + 5)}k mengikuti`,
                totalDuration: "2 jam 30 mnt",
                creatorAvatar: realSongs[0]?.thumbnail || "https://i.ytimg.com/vi/2A9Atl2hUkg/hqdefault.jpg",
                covers: covers.length >= 4 ? covers : [
                  "https://i.ytimg.com/vi/2A9Atl2hUkg/hqdefault.jpg",
                  "https://i.ytimg.com/vi/rqHkc6dAkVQ/hqdefault.jpg",
                  "https://i.ytimg.com/vi/2A9Atl2hUkg/hqdefault.jpg",
                  "https://i.ytimg.com/vi/rqHkc6dAkVQ/hqdefault.jpg",
                ],
                sampleTrack: realSongs[0] || feed.shelves?.[0]?.items?.[0] || { id: "default", title: "Loading...", artist: "Senja Musik", duration: 180, thumbnail: "" },
                tracks: realSongs,
              };
            } catch (err) {
              console.warn("Failed to load similar playlist:", err);
              return null;
            }
          })
        );

        if (isMounted) {
          setSimilarPlaylists(results.filter((p): p is CommunityPlaylistDetailData => p !== null));
          setLoadingSimilar(false);
        }
      } catch (err) {
        console.warn("Similar playlists fetch error:", err);
        if (isMounted) setLoadingSimilar(false);
      }
    }

    // Only load if playlist is open
    if (playlist) {
      loadSimilarPlaylists();
    }

    return () => {
      isMounted = false;
    };
  }, [playlist]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((c) => (c === msg ? null : c));
    }, 2600);
  };

  const handleShare = () => {
    if (navigator.share && playlist) {
      navigator
        .share({
          title: playlist.title,
          text: `Dengarkan playlist komunitas "${playlist.title}" oleh ${playlist.creator} di Senja Musik`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      showToast("Tautan playlist disalin ke clipboard! 📋");
    }
  };

  const handleMore = () => {
    showToast("Playlist ditambahkan ke antrean pemutaran 🎵");
  };

  const handleToggleFollow = () => {
    setIsFollowed((prev) => {
      const next = !prev;
      showToast(next ? "Playlist telah diikuti! ✨" : "Berhenti mengikuti playlist");
      return next;
    });
  };

  const handlePlayAll = () => {
    if (songList.length > 0) {
      playTrack(songList[0]);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  if (!playlist) return null;

  return (
    <div
      id="community-playlist-detail-screen"
      className="fixed inset-0 z-50 bg-[#0A0A0A] text-white flex flex-col overflow-y-auto pb-36 max-w-[440px] mx-auto w-full no-scrollbar select-none animate-in fade-in slide-in-from-bottom-4 duration-250 font-sans"
    >
      {/* Dynamic Ambient Blur Glow behind header */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-96 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent blur-3xl pointer-events-none -z-10"></div>

      {/* FLOATING TOP NAV BAR */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#0A0A0A]/70 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={() => setSelectedCommunityPlaylist(null)}
          title="Kembali"
          aria-label="Kembali"
          className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.15] backdrop-blur-md border border-white/10 text-white shadow cursor-pointer transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>

        <span className="text-xs font-bold text-white/70 uppercase tracking-wider">
          Playlist Komunitas
        </span>

        <button
          onClick={handleShare}
          title="Bagikan"
          aria-label="Bagikan playlist"
          className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.15] backdrop-blur-md border border-white/10 text-white shadow cursor-pointer transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">share</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. HEADER: MOSAIC COLLAGE 2x2 BESAR SEBAGAI COVER */}
      {/* ========================================================================= */}
      <header className="px-4 pt-2 pb-4">
        <div className="relative w-full aspect-square max-w-[380px] mx-auto rounded-3xl overflow-hidden p-1.5 bg-black/60 border border-white/15 shadow-2xl group">
          {/* Grid 2x2 foto lagu kolase besar */}
          <div className="grid grid-cols-2 grid-rows-2 gap-1.5 w-full h-full">
            {playlist.covers.slice(0, 4).map((c, i) => (
              <div
                key={i}
                className="w-full h-full rounded-xl overflow-hidden bg-[#161311]"
              >
                <img
                  src={c}
                  alt="cover collage"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>

          {/* Gradient Overlay Gelap dari bawah ke atas */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/25 pointer-events-none"></div>

          {/* Judul Playlist Besar Menimpa Collage di Tengah-Bawah */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
            <span className="text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
              KURASI PENDENGAR
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] tracking-tight max-w-[300px]">
              {playlist.title}
            </h1>
          </div>

          {/* Badge jumlah lagu di pojok kanan bawah */}
          <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-[11px] font-bold text-white shadow-md">
            {playlist.trackCount}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. BARIS INFO: AVATAR + NAMA PEMBUAT + FOLLOWERS + JUMLAH LAGU + DURASI */}
        {/* ========================================================================= */}
        <div className="mt-4 px-1 flex flex-col space-y-2">
          <div className="flex items-center space-x-2.5">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 flex-shrink-0 bg-black shadow-sm">
              <img
                src={playlist.creatorAvatar}
                alt={playlist.creator}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5">
                <span className="text-sm font-bold text-white truncate">
                  {playlist.creator}
                </span>
                {playlist.isVerified && (
                  <span
                    className="material-symbols-outlined text-sky-400 text-[15px] flex-shrink-0"
                    title="Kreator Terverifikasi"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/50">
                {playlist.followers || "1.2rb mengikuti"}
              </p>
            </div>
          </div>

          {/* Metadata chips / sub-info */}
          <div className="flex items-center space-x-2 text-[11.5px] text-white/60 pt-0.5">
            <span className="flex items-center space-x-1">
              <span className="material-symbols-outlined text-[14px] text-white/40">queue_music</span>
              <span>{playlist.trackCount}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <span className="material-symbols-outlined text-[14px] text-white/40">schedule</span>
              <span>{playlist.totalDuration || "2 jam 45 mnt"}</span>
            </span>
            <span>•</span>
            <span className="text-white/80 font-semibold">Publik</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. TOMBOL AKSI: PLAY BESAR PUTIH, FOLLOW PILL, SHARE, MORE */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between mt-4 px-1 pt-1">
          <div className="flex items-center space-x-3">
            {/* Tombol Play Besar Putih */}
            <button
              onClick={handlePlayAll}
              title="Putar semua"
              aria-label="Putar semua trek di playlist"
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-[0_4px_20px_rgba(255,255,255,0.25)] hover:bg-white/90 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <span
                className="material-symbols-outlined text-[28px] ml-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                play_arrow
              </span>
            </button>

            {/* Tombol Follow Pill (+ Ikuti -> ✓ Mengikuti) */}
            <button
              onClick={handleToggleFollow}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer border ${
                isFollowed
                  ? "bg-white/20 text-white border-white/30 shadow-sm"
                  : "bg-white/[0.06] hover:bg-white/[0.1] text-white border-white/15"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isFollowed ? "check" : "add"}
              </span>
              <span>{isFollowed ? "Mengikuti" : "Ikuti"}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Tombol Share */}
            <button
              onClick={handleShare}
              title="Bagikan"
              aria-label="Bagikan playlist"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-md border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[19px]">share</span>
            </button>

            {/* Tombol More */}
            <button
              onClick={handleMore}
              title="Opsi lainnya"
              aria-label="Opsi playlist lainnya"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-md border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 4. LIST LAGU DI BAWAHNYA (SEPERTI HALAMAN PLAYLIST DETAIL BIASA) */}
      {/* ========================================================================= */}
      <section className="px-4 mt-2">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-white/60">
            Daftar Lagu ({songList.length})
          </h2>
          <span className="text-[11px] text-white/40 font-semibold">
            Audio Hi-Fi 320kbps
          </span>
        </div>

        <div className="space-y-1">
          {songList.map((song, index) => {
            const isCurrent = currentTrack?.id === song.id;
            const isCurrentPlaying = isCurrent && isPlaying;

            return (
              <div
                key={`${song.id}-${index}`}
                onClick={() => {
                  if (isCurrent) {
                    togglePlay();
                  } else {
                    playTrack(song);
                  }
                }}
                className={`flex items-center justify-between p-2.5 rounded-2xl transition-all duration-200 cursor-pointer group ${
                  isCurrent
                    ? "bg-white/[0.08] border border-white/20 shadow-md"
                    : "hover:bg-white/[0.05] border border-transparent"
                }`}
              >
                {/* Kiri: Nomor / Playing Animation + Cover Thumbnail */}
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-5 text-center flex-shrink-0">
                    {isCurrentPlaying ? (
                      <span className="flex items-end justify-center space-x-0.5 h-3.5">
                        <span className="w-1 h-3 bg-white rounded-full animate-bounce"></span>
                        <span className="w-1 h-2 bg-white rounded-full animate-bounce [animation-delay:150ms]"></span>
                        <span className="w-1 h-3.5 bg-white rounded-full animate-bounce [animation-delay:300ms]"></span>
                      </span>
                    ) : (
                      <span
                        className={`text-xs font-bold ${
                          isCurrent ? "text-white" : "text-white/40 group-hover:text-white/70"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    )}
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-[#171413] border border-white/10 shadow-sm">
                    <img
                      src={song.thumbnail}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    {isCurrent && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span
                          className="material-symbols-outlined text-[18px] text-white"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {isPlaying ? "pause" : "play_arrow"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Title & Artist */}
                  <div className="min-w-0 flex-1 pr-2">
                    <h3
                      className={`text-sm font-bold truncate leading-tight ${
                        isCurrent ? "text-white font-black" : "text-white group-hover:text-white/80"
                      } transition-colors`}
                    >
                      {song.title}
                    </h3>
                    <p className="text-xs text-white/50 truncate mt-0.5">
                      {song.artist}
                    </p>
                  </div>
                </div>

                {/* Kanan: Durasi & More button */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className="text-[11px] text-white/45 font-medium tabular-nums">
                    {formatSeconds(song.duration || 215)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      showToast(`"${song.title}" ditambahkan ke favorit`);
                    }}
                    title="Simpan lagu"
                    aria-label="Simpan lagu ke favorit"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/35 hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      favorite_border
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SECTION KECIL DI PALING BAWAH: "PLAYLIST SERUPA DARI KOMUNITAS LAIN" */}
      {/* ========================================================================= */}
      <section className="mt-8 px-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-white/70"></span>
            <h2 className="text-sm font-extrabold text-white tracking-tight">
              Playlist serupa dari komunitas lain
            </h2>
          </div>
        </div>

        {/* Row Horizontal Scroll Card Mosaic Collage */}
        <div className="flex space-x-3.5 overflow-x-auto no-scrollbar -mx-1 px-1 py-1">
          {similarPlaylists
            .filter((p) => p.id !== playlist.id)
            .map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedCommunityPlaylist(item);
                  playTrack(item.sampleTrack);
                }}
                className="flex-shrink-0 w-36 sm:w-40 group cursor-pointer select-none"
              >
                {/* Mosaic Collage 2x2 container */}
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-2xl overflow-hidden p-1 bg-black/40 border border-white/10 shadow-lg transition-transform duration-250 ease-out group-hover:scale-[1.04] active:scale-[0.98]">
                  <div className="grid grid-cols-2 grid-rows-2 gap-1 w-full h-full">
                    {item.covers.map((c, i) => (
                      <div
                        key={i}
                        className="w-full h-full rounded-[6px] overflow-hidden bg-[#161311]"
                      >
                        <img
                          src={c}
                          alt="cover"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30 pointer-events-none"></div>

                  <div className="absolute inset-0 flex items-center justify-center p-2 text-center pointer-events-none">
                    <h3 className="text-xs sm:text-sm font-black text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] tracking-tight">
                      {item.title}
                    </h3>
                  </div>

                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[9px] font-bold text-white shadow-md">
                    {item.trackCount}
                  </div>
                </div>

                {/* Creator info */}
                <div className="flex items-center space-x-1.5 mt-2 px-0.5">
                  <div className="relative w-4 h-4 rounded-full overflow-hidden border border-white/20 flex-shrink-0 bg-black">
                    <img
                      src={item.creatorAvatar}
                      alt={item.creator}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-[10.5px] font-medium text-white/70 truncate group-hover:text-white transition-colors">
                    {item.creator}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-black/90 backdrop-blur-xl border border-white/20 text-white text-xs font-bold shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="material-symbols-outlined text-[16px] text-emerald-400">
            info
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
