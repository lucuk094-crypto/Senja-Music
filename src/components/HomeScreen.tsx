import React, { useEffect, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { Song } from "../types";
import { CommunitySection } from "./CommunitySection";
import { CuratedCollectionsSection } from "./CuratedCollectionsSection";
import { SpotifyGrid } from "./SpotifyGrid";
import { HOME_SECTION_QUERIES } from "../categories";
import { getSimilarArtist, searchMusic } from "../services/musicApi";
import { CURATED_COLLECTIONS_DATA } from "../data/curatedCollections";

// HOME_CATEGORIES dihapus - tidak dipakai lagi, langsung pakai shelves dari feed API

export const HomeScreen: React.FC = () => {
  const {
    feed,
    playTrack,
    currentTrack,
    isPlaying,
    togglePlay,
    setActiveTab,
    setIsSettingsOpen,
  } = usePlayer();

  const [activePill, setActivePill] = useState<"history" | "stats" | "liked" | "downloaded">("history");
  // State untuk kategori dihapus - tidak dipakai lagi

  // Notifications modal state (aktif & interaktif)
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);

  // State data live dari API untuk setiap section Home
  const [featuredTrack, setFeaturedTrack] = useState<Song | null>(null);
  const [keepListeningList, setKeepListeningList] = useState<Song[]>([]);
  const [kemarauChillList, setKemarauChillList] = useState<Song[]>([]);
  const [similarArtistData, setSimilarArtistData] = useState<{
    artistName: string;
    artistThumbnail?: string;
    songs: Song[];
  } | null>(null);

  // Loading state untuk masing-masing section
  const [loadingHero, setLoadingHero] = useState<boolean>(true);
  const [loadingKeepListening, setLoadingKeepListening] = useState<boolean>(true);
  const [loadingKemarauChill, setLoadingKemarauChill] = useState<boolean>(true);
  const [loadingSimilarArtist, setLoadingSimilarArtist] = useState<boolean>(true);

  // Fetch data live dari API YouTube Music saat HomeScreen dimuat
  useEffect(() => {
    let isMounted = true;

    // 1. Featured Mix Hero
    searchMusic(HOME_SECTION_QUERIES.featuredHero.query)
      .then((results) => {
        if (!isMounted) return;
        if (results && results.length > 0) {
          const topSong = results[0];
          setFeaturedTrack({
            ...topSong,
            badge: "DAILY ACOUSTIC MIX",
            subtitle: "Kurasi Spesial Senja",
          });
        } else if (feed.featured) {
          setFeaturedTrack(feed.featured);
        }
      })
      .catch((err) => {
        console.warn("Featured Hero fetch error, fallback to feed:", err);
        if (isMounted && feed.featured) setFeaturedTrack(feed.featured);
      })
      .finally(() => {
        if (isMounted) setLoadingHero(false);
      });

    // 2. Section "Keep Listening"
    searchMusic(HOME_SECTION_QUERIES.keepListening.query)
      .then((results) => {
        if (!isMounted) return;
        if (results && results.length > 0) {
          setKeepListeningList(results.slice(0, 10));
        } else {
          // Fallback to feed shelves - "Keep listening" is shelves[0]
          const keepListeningShelf = feed.shelves?.find((s: any) => s.title === "Keep listening");
          if (keepListeningShelf?.items?.length > 0) {
            setKeepListeningList(keepListeningShelf.items);
          }
        }
      })
      .catch((err) => {
        console.warn("Keep Listening fetch error, fallback to feed:", err);
        if (isMounted) {
          const keepListeningShelf = feed.shelves?.find((s: any) => s.title === "Keep listening");
          if (keepListeningShelf?.items) setKeepListeningList(keepListeningShelf.items);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingKeepListening(false);
      });

    // 3. Section "Kemarau Chill"
    searchMusic(HOME_SECTION_QUERIES.kemarauChill.query)
      .then((results) => {
        if (!isMounted) return;
        if (results && results.length > 0) {
          const enriched = results.slice(0, 10).map((song, idx) => ({
            ...song,
            badge: idx % 2 === 0 ? "CHILL MIX" : "POP SENJA",
            tag: idx % 2 === 0 ? "Akustik Hangat Sore" : "Indo Indie On Repeat",
          }));
          setKemarauChillList(enriched);
        } else {
          // Fallback to feed shelves - "Kemarau Chill" is shelves[3]
          const kemarauChillShelf = feed.shelves?.find((s: any) => s.title === "Kemarau Chill");
          if (kemarauChillShelf?.items?.length > 0) {
            setKemarauChillList(kemarauChillShelf.items);
          }
        }
      })
      .catch((err) => {
        console.warn("Kemarau Chill fetch error, fallback to feed:", err);
        if (isMounted) {
          const kemarauChillShelf = feed.shelves?.find((s: any) => s.title === "Kemarau Chill");
          if (kemarauChillShelf?.items) setKemarauChillList(kemarauChillShelf.items);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingKemarauChill(false);
      });

    // 4. Section "Similar to Artist"
    getSimilarArtist(
      HOME_SECTION_QUERIES.similarArtist.artistName,
      HOME_SECTION_QUERIES.similarArtist.fallbackQuery
    )
      .then((data) => {
        if (!isMounted) return;
        if (data && data.songs && data.songs.length > 0) {
          setSimilarArtistData(data);
        } else {
          // Fallback to any shelf with items
          const anyShelf = feed.shelves?.find((s: any) => s.items?.length > 0);
          if (anyShelf) {
            setSimilarArtistData({
              artistName: HOME_SECTION_QUERIES.similarArtist.artistName,
              artistThumbnail: anyShelf.items[0]?.thumbnail,
              songs: anyShelf.items,
            });
          }
        }
      })
      .catch((err) => {
        console.warn("Similar artist fetch error, fallback to feed:", err);
        if (isMounted) {
          const anyShelf = feed.shelves?.find((s: any) => s.items?.length > 0);
          if (anyShelf) {
            setSimilarArtistData({
              artistName: HOME_SECTION_QUERIES.similarArtist.artistName,
              artistThumbnail: anyShelf.items[0]?.thumbnail,
              songs: anyShelf.items,
            });
          }
        }
      })
      .finally(() => {
        if (isMounted) setLoadingSimilarArtist(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);
  // useEffect untuk kategori dihapus - tidak dipakai lagi

  const handleSongClick = (song: Song) => {
    const currentVideoId = (currentTrack as any).videoId || currentTrack.id;
    const targetVideoId = (song as any).videoId || song.id;
    if (currentVideoId && targetVideoId && currentVideoId === targetVideoId) {
      togglePlay();
    } else {
      playTrack(song);
    }
  };

  const isCurrentSongActive = (song: Song) => {
    const currentVideoId = (currentTrack as any).videoId || currentTrack.id;
    const targetVideoId = (song as any).videoId || song.id;
    return Boolean(currentVideoId && targetVideoId && currentVideoId === targetVideoId);
  };

  const heroItem = featuredTrack || feed.featured;

  return (
    <div id="home-screen-view" className="flex-1 overflow-y-auto pb-44 pt-4 px-4 sm:px-6 max-w-[440px] mx-auto w-full no-scrollbar">
      {/* Notifications Drawer Modal */}
      {isNotificationOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-neutral-900/90 border border-white/15 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-white text-[20px]">notifications</span>
                <h3 className="text-sm font-bold text-white">Notifikasi Musik</h3>
              </div>
              <button
                onClick={() => setIsNotificationOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/5 flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-white mt-0.5">
                  <span className="material-symbols-outlined text-[16px]">album</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Rilisan Baru Ditambahkan</h4>
                  <p className="text-[11px] text-white/60 mt-0.5">
                    Lagu terbaru Sal Priadi & Nadhif Basalamah kini tersedia di Senja Musik.
                  </p>
                  <span className="text-[9px] text-white/40 mt-1 block">Baru saja</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/5 flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-white mt-0.5">
                  <span className="material-symbols-outlined text-[16px]">groups</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Playlist Komunitas Diperbarui</h4>
                  <p className="text-[11px] text-white/60 mt-0.5">
                    "Senja Syahdu & Puisi" menerima 4 lagu baru dari kurasi pendengar.
                  </p>
                  <span className="text-[9px] text-white/40 mt-1 block">2 jam lalu</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsNotificationOpen(false)}
              className="mt-4 w-full py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-white/90 transition-all"
            >
              Tutup Notifikasi
            </button>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 mb-4">
        {/* User Profile Avatar with Soft Status Dot */}
        <div className="flex items-center space-x-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20 shadow-md">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdNUYxGYihi4Z1zYx-YElwiNjn1t0yZKuKhFRIivdojfrGgF1_ssSw3G1zX5pXNpXxLVBsVc-n0zFRJxoH80nY0Ai0PLulNQJ6wMvWoOgSu8v-MmqwEtQz3Wg9EAIIOE1zTAMUiAMW4YstoTT_o6PepaL7CTc2MH7t-7tGhhlrP3gpPaViY5I_0LVk9xeLZiAMTnYsZb5zY4xJ770hTrIKg5JcIiDMalbvDdfdaALipZe7uokA7rdQ"
              alt="Amanda"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0A0A0A]"></span>
          </div>
        </div>

        {/* Action Icons: Search, Notifications, Settings */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab("search")}
            title="Pencarian"
            aria-label="Cari musik"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.15] backdrop-blur-md border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>

          <button
            onClick={() => setIsNotificationOpen(true)}
            title="Pemberitahuan"
            aria-label="Notifikasi"
            className="relative w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.15] backdrop-blur-md border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-white ring-2 ring-[#0A0A0A]"></span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            title="Pengaturan"
            aria-label="Buka Pengaturan"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.15] backdrop-blur-md border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
        </div>
      </header>

      {/* Greeting Title */}
      <section className="mb-4">
        <div className="flex items-center space-x-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-white/70 animate-pulse"></span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Hi, Amanda
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-white/60 font-medium">
          Siap untuk memulai harimu dengan alunan musik nusantara?
        </p>
      </section>

      {/* Quick Filter Pills Row (Frosted Glass Style) */}
      <section className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1 mb-5">
        <button
          onClick={() => setActivePill("history")}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
            activePill === "history"
              ? "bg-white/20 text-white border-white/40 shadow-sm"
              : "bg-white/[0.05] text-white/60 hover:text-white border-white/10"
          }`}
        >
          {activePill === "history" && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
          <span>History</span>
        </button>

        <button
          onClick={() => {
            setActivePill("stats");
            setActiveTab("stats");
          }}
          className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/[0.05] text-white/60 hover:text-white border border-white/10 transition-all cursor-pointer"
        >
          Stats
        </button>

        <button
          onClick={() => {
            setActivePill("liked");
            setActiveTab("library");
          }}
          className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/[0.05] text-white/60 hover:text-white border border-white/10 transition-all cursor-pointer"
        >
          Liked
        </button>

        <button
          onClick={() => {
            setActivePill("downloaded");
            setActiveTab("library");
          }}
          className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/[0.05] text-white/60 hover:text-white border border-white/10 transition-all cursor-pointer"
        >
          Downloaded
        </button>
      </section>

      {/* ========================================================================= */}
      {/* SECTION HERO: Featured Mix Coverflow Hero Card (Live dari API) */}
      {/* ========================================================================= */}
      {loadingHero && !heroItem ? (
        <div className="h-64 sm:h-72 w-full rounded-3xl bg-white/[0.04] border border-white/10 animate-pulse mb-8 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-2 text-white/40">
            <span className="material-symbols-outlined text-3xl animate-spin">progress_activity</span>
            <span className="text-xs font-medium">Memuat Daily Mix...</span>
          </div>
        </div>
      ) : heroItem ? (
        <section
          className="relative rounded-3xl overflow-hidden mb-8 border border-white/15 shadow-2xl group cursor-pointer"
          onClick={() => handleSongClick(heroItem)}
        >
          <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-[#12100e]">
            <img
              src={heroItem.thumbnail}
              alt={heroItem.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0908] via-black/40 to-transparent"></div>

            {/* Top Badge (Glass Style - No Neon) */}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/25 text-[10px] font-bold text-white tracking-wider uppercase shadow">
                {heroItem.badge || "KHUSUS UNTUKMU"}
              </span>
            </div>

            {/* Bottom Info & Play Button */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div className="pr-3">
                <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">
                  {heroItem.subtitle || "Daily Acoustic Mix"}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight mt-0.5 drop-shadow">
                  {heroItem.title}
                </h3>
                <p className="text-xs text-white/70 mt-1 line-clamp-1">
                  {heroItem.artist}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSongClick(heroItem);
                }}
                title="Putar Daily Mix"
                aria-label="Putar mix harian"
                className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center flex-shrink-0 shadow-[0_4px_24px_rgba(255,255,255,0.25)] group-hover:scale-108 active:scale-95 transition-all cursor-pointer"
              >
                <span
                  className="material-symbols-outlined text-[28px] ml-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {isCurrentSongActive(heroItem) && isPlaying ? "pause" : "play_arrow"}
                </span>
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {/* ========================================================================= */}
      {/* SECTION: RENDER ALL 10 SHELVES FROM FEED */}
      {/* Community Section diletakkan setelah shelf pertama (Keep listening) */}
      {/* ========================================================================= */}
      {feed.shelves && feed.shelves.length > 0 ? (
        feed.shelves.map((shelf: any, shelfIndex: number) => (
          <React.Fragment key={shelf.title || shelfIndex}>
            <section className="mb-8">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>{shelf.title}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/70"></span>
                </h3>
                <span
                  onClick={() => setActiveTab("explore")}
                  className="text-xs font-semibold text-white/40 hover:text-white cursor-pointer transition-colors"
                >
                  Lihat Semua
                </span>
              </div>

              <div className="flex space-x-3.5 overflow-x-auto no-scrollbar -mx-1 px-1 pb-2">
                {(shelf.items || []).slice(0, 10).map((song: Song) => {
                  const isThisTrack = isCurrentSongActive(song);
                  return (
                    <div
                      key={song.id}
                      onClick={() => handleSongClick(song)}
                      className="w-36 flex-shrink-0 group cursor-pointer"
                    >
                      <div className="relative w-36 h-36 rounded-2xl overflow-hidden bg-black/50 border border-white/10 mb-2.5 shadow-lg group-hover:shadow-2xl transition-all group-hover:scale-[1.02]">
                        <img
                          src={song.thumbnail}
                          alt={song.title}
                          className="w-full h-full object-cover group-hover:brightness-75 transition-all"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                        {isThisTrack && (
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center animate-pulse shadow-xl">
                              {isPlaying ? (
                                <span className="material-symbols-outlined text-black text-[24px] font-bold">pause</span>
                              ) : (
                                <span className="material-symbols-outlined text-black text-[24px] font-bold">play_arrow</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white truncate">{song.title}</h4>
                      <p className="text-[11px] text-white/50 truncate mt-0.5">{song.artist}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Tampilkan Community Section setelah shelf pertama (Keep listening) */}
            {shelfIndex === 0 && <CommunitySection />}
          </React.Fragment>
        ))
      ) : (
        <div className="text-center py-8 text-white/40">Loading shelves...</div>
      )}
    </div>
  );
};
