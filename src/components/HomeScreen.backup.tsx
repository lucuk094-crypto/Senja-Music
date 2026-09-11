import React, { useEffect, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { Song } from "../types";
import { CommunitySection } from "./CommunitySection";
import { CuratedCollectionsSection } from "./CuratedCollectionsSection";
import { HOME_SECTION_QUERIES } from "../categories";
import { getSimilarArtist, searchMusic } from "../services/musicApi";
import { CURATED_COLLECTIONS_DATA } from "../data/curatedCollections";

interface CategoryTab {
  id: string;
  name: string;
  query: string;
  icon: string;
}

const HOME_CATEGORIES: CategoryTab[] = [
  { id: "all", name: "Semua", query: "lagu indonesia terpopuler 2024", icon: "all_inclusive" },
  { id: "hot-dangdut", name: "Hot Dangdut", query: "dangdut hits terbaru", icon: "headset" },
  { id: "hot-koplo", name: "Hot Koplo", query: "dangdut koplo terpopuler", icon: "graphic_eq" },
  { id: "pop-indonesia", name: "Pop Indonesia", query: "lagu pop indonesia terbaru", icon: "music_note" },
  { id: "hits-zaman-now", name: "Hits Zaman Now", query: "hits indonesia terkini", icon: "trending_up" },
  { id: "kemarau-chill", name: "Kemarau Chill", query: "lagu indie santai mood cerah", icon: "wb_sunny" },
  { id: "rock-sepanjang-masa", name: "Rock Sepanjang Masa", query: "rock indonesia legendaris", icon: "electric_bolt" },
  { id: "indie", name: "Indie Senja", query: "lagu indie indonesia senja", icon: "wb_twilight" },
  { id: "akustik", name: "Akustik Nusantara", query: "akustik santai indonesia gitar", icon: "piano" },
  { id: "lofi", name: "Lo-Fi & Santai", query: "lofi hip hop chill beats relax", icon: "spa" },
];

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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categorySongs, setCategorySongs] = useState<Song[]>([]);
  const [loadingCategory, setLoadingCategory] = useState<boolean>(false);

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
        } else if (feed.keepListening?.length > 0) {
          setKeepListeningList(feed.keepListening);
        }
      })
      .catch((err) => {
        console.warn("Keep Listening fetch error, fallback to feed:", err);
        if (isMounted && feed.keepListening) setKeepListeningList(feed.keepListening);
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
        } else if (feed.kemarauChill?.length > 0) {
          setKemarauChillList(feed.kemarauChill);
        }
      })
      .catch((err) => {
        console.warn("Kemarau Chill fetch error, fallback to feed:", err);
        if (isMounted && feed.kemarauChill) setKemarauChillList(feed.kemarauChill);
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
        } else if (feed.similarSessions?.length > 0) {
          setSimilarArtistData({
            artistName: HOME_SECTION_QUERIES.similarArtist.artistName,
            artistThumbnail: feed.similarSessions[0]?.thumbnail,
            songs: feed.similarSessions,
          });
        }
      })
      .catch((err) => {
        console.warn("Similar artist fetch error, fallback to feed:", err);
        if (isMounted && feed.similarSessions?.length > 0) {
          setSimilarArtistData({
            artistName: HOME_SECTION_QUERIES.similarArtist.artistName,
            artistThumbnail: feed.similarSessions[0]?.thumbnail,
            songs: feed.similarSessions,
          });
        }
      })
      .finally(() => {
        if (isMounted) setLoadingSimilarArtist(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch lagu kategori saat user memilih kategori tertentu di Home
  useEffect(() => {
    if (selectedCategory === "all") {
      setCategorySongs([]);
      return;
    }

    const cat = HOME_CATEGORIES.find((c) => c.id === selectedCategory);
    if (!cat) return;

    // Check if matched in CURATED_COLLECTIONS_DATA for immediate rich data
    const matchedCurated = CURATED_COLLECTIONS_DATA.find((c) => c.id === selectedCategory);
    if (matchedCurated && matchedCurated.songs.length > 0) {
      setCategorySongs(matchedCurated.songs);
    }

    let isMounted = true;
    setLoadingCategory(true);

    searchMusic(cat.query)
      .then((res) => {
        if (isMounted) {
          if (res && res.length > 0) {
            // If we have curated songs, combine them smoothly
            if (matchedCurated && matchedCurated.songs.length > 0) {
              const existingIds = new Set(matchedCurated.songs.map((s) => s.id));
              const combined = [
                ...matchedCurated.songs,
                ...res.filter((s) => !existingIds.has(s.id)),
              ].slice(0, 16);
              setCategorySongs(combined);
            } else {
              setCategorySongs(res.slice(0, 12));
            }
          }
        }
      })
      .catch((err) => console.warn("Category load error:", err))
      .finally(() => {
        if (isMounted) setLoadingCategory(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

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
      {/* SECTION KATEGORI MUSIK (GENRE BROWSER DI BERANDA) */}
      {/* ========================================================================= */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center space-x-1.5">
            <span className="material-symbols-outlined text-[18px] text-white/70">category</span>
            <span>Kategori & Genre Musik</span>
          </h3>
          <span
            onClick={() => setActiveTab("explore")}
            className="text-xs font-semibold text-white/40 hover:text-white cursor-pointer transition-colors"
          >
            Explore
          </span>
        </div>

        {/* Category horizontal glass pills */}
        <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1">
          {HOME_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? "bg-white text-black border-white shadow-md scale-100"
                    : "bg-white/[0.05] hover:bg-white/[0.1] text-white/70 hover:text-white border-white/10"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* When a specific category is chosen, display live songs for that genre */}
        {selectedCategory !== "all" && (
          <div className="mt-3.5 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white">
                Daftar Lagu: {HOME_CATEGORIES.find((c) => c.id === selectedCategory)?.name}
              </span>
              <button
                onClick={() => setSelectedCategory("all")}
                className="text-[11px] text-white/50 hover:text-white font-medium"
              >
                Tutup Kategori
              </button>
            </div>

            {loadingCategory ? (
              <div className="h-32 flex items-center justify-center text-white/40 text-xs space-x-2">
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                <span>Memuat lagu genre...</span>
              </div>
            ) : categorySongs.length > 0 ? (
              <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-1">
                {categorySongs.map((song) => {
                  const isThis = isCurrentSongActive(song);
                  return (
                    <div
                      key={song.id}
                      onClick={() => handleSongClick(song)}
                      className="w-32 flex-shrink-0 group cursor-pointer"
                    >
                      <div className="relative w-32 h-32 rounded-xl overflow-hidden mb-2 bg-neutral-900 border border-white/10 shadow-sm">
                        <img
                          src={song.thumbnail}
                          alt={song.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div
                          className={`absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shadow-md transition-all ${
                            isThis ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-100 scale-90"
                          }`}
                        >
                          <span
                            className="material-symbols-outlined text-[16px] ml-0.5"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            {isThis && isPlaying ? "pause" : "play_arrow"}
                          </span>
                        </div>
                      </div>
                      <h5 className="text-xs font-bold text-white truncate">{song.title}</h5>
                      <p className="text-[10.5px] text-white/50 truncate mt-0.5">{song.artist}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-white/40 text-center py-4">Tidak ada lagu ditemukan.</p>
            )}
          </div>
        )}
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
      {/* SECTION KOLEKSI SPESIAL NUSANTARA (6 KATEGORI HITS LENGKAP) */}
      {/* ========================================================================= */}
      <CuratedCollectionsSection />

      {/* ========================================================================= */}
      {/* SECTION 1: Keep Listening (Live dari API) */}
      {/* ========================================================================= */}
      {loadingKeepListening ? (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3.5">
            <div className="h-5 w-32 bg-white/10 rounded-md animate-pulse"></div>
            <div className="h-4 w-16 bg-white/5 rounded-md animate-pulse"></div>
          </div>
          <div className="flex space-x-3.5 overflow-x-hidden -mx-1 px-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-36 flex-shrink-0">
                <div className="w-36 h-36 rounded-2xl bg-white/[0.04] border border-white/5 animate-pulse mb-2"></div>
                <div className="h-3 w-24 bg-white/10 rounded animate-pulse mb-1"></div>
                <div className="h-2.5 w-16 bg-white/5 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </section>
      ) : keepListeningList.length > 0 ? (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Keep Listening</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/70"></span>
            </h3>
            <span
              onClick={() => setActiveTab("library")}
              className="text-xs font-semibold text-white/40 hover:text-white cursor-pointer transition-colors"
            >
              Lihat Semua
            </span>
          </div>

          <div className="flex space-x-3.5 overflow-x-auto no-scrollbar -mx-1 px-1 pb-2">
            {keepListeningList.map((song) => {
              const isThisTrack = isCurrentSongActive(song);
              return (
                <div
                  key={song.id}
                  onClick={() => handleSongClick(song)}
                  className="flex-shrink-0 w-36 group cursor-pointer select-none"
                >
                  <div className="relative w-36 h-36 rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-[#141211] mb-2.5">
                    <img
                      src={song.thumbnail}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>

                    {/* Play pill hover overlay (Elegant Glass - No Neon) */}
                    <div
                      className={`absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-md transition-all duration-300 ${
                        isThisTrack ? "scale-100 opacity-100" : "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[18px] ml-0.5"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {isThisTrack && isPlaying ? "pause" : "play_arrow"}
                      </span>
                    </div>
                  </div>

                  <h4 className={`text-xs font-bold truncate leading-tight ${isThisTrack ? "text-white font-black" : "text-white"}`}>
                    {song.title}
                  </h4>
                  <p className="text-[11px] text-white/55 truncate mt-0.5">
                    {song.artist}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* ========================================================================= */}
      {/* SECTION 2: Kemarau Chill (Live dari API) */}
      {/* ========================================================================= */}
      {loadingKemarauChill ? (
        <section className="mb-8">
          <div className="h-3 w-40 bg-white/10 rounded animate-pulse mb-2"></div>
          <div className="h-5 w-28 bg-white/15 rounded animate-pulse mb-3.5"></div>
          <div className="flex space-x-4 overflow-x-hidden -mx-1 px-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-44 h-48 rounded-2xl bg-white/[0.04] border border-white/5 animate-pulse p-3 flex-shrink-0">
                <div className="w-full h-32 rounded-xl bg-white/10 mb-2"></div>
                <div className="h-3 w-28 bg-white/10 rounded mb-1"></div>
                <div className="h-2.5 w-16 bg-white/5 rounded"></div>
              </div>
            ))}
          </div>
        </section>
      ) : kemarauChillList.length > 0 ? (
        <section className="mb-8">
          <div className="mb-3.5">
            <span className="text-[10px] font-extrabold tracking-widest text-white/50 uppercase">
              SUASANA MENYENANGKAN & LAGU-LAGU CERIA 🍹
            </span>
            <h3 className="text-base font-extrabold text-white tracking-tight mt-0.5">
              Kemarau Chill
            </h3>
          </div>

          <div className="flex space-x-4 overflow-x-auto no-scrollbar -mx-1 px-1 pb-2">
            {kemarauChillList.map((song) => {
              const isThisTrack = isCurrentSongActive(song);
              return (
                <div
                  key={song.id}
                  onClick={() => handleSongClick(song)}
                  className="flex-shrink-0 w-44 rounded-2xl p-3 bg-white/[0.035] border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="relative w-full h-32 rounded-xl overflow-hidden mb-2.5 bg-[#141211]">
                    <img
                      src={song.thumbnail}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    {song.badge && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-bold text-white/90 border border-white/20">
                        {song.badge}
                      </span>
                    )}
                    <div
                      className={`absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shadow-md transition-all ${
                        isThisTrack ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px] ml-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {isThisTrack && isPlaying ? "pause" : "play_arrow"}
                      </span>
                    </div>
                  </div>

                  <h4 className={`text-xs font-bold truncate leading-tight ${isThisTrack ? "text-white font-black" : "text-white"}`}>
                    {song.title}
                  </h4>
                  <p className="text-[10.5px] text-white/50 truncate mt-0.5">
                    {song.artist}
                  </p>
                  {song.tag && (
                    <span className="inline-block text-[9.5px] text-white/40 mt-1 font-medium">
                      {song.tag}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* ========================================================================= */}
      {/* SECTION 3: Similar to Artist (Live dari API) */}
      {/* ========================================================================= */}
      {loadingSimilarArtist ? (
        <section className="mb-8">
          <div className="flex items-center space-x-2 mb-3.5">
            <div className="w-5 h-5 rounded-full bg-white/10 animate-pulse"></div>
            <div className="h-4 w-36 bg-white/10 rounded animate-pulse"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse p-2.5 flex items-center space-x-3">
                <div className="w-14 h-14 rounded-xl bg-white/10 flex-shrink-0"></div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 w-32 bg-white/10 rounded"></div>
                  <div className="h-2.5 w-20 bg-white/5 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : similarArtistData && similarArtistData.songs.length > 0 ? (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full overflow-hidden border border-white/20 bg-black flex-shrink-0">
                <img
                  src={
                    similarArtistData.artistThumbnail ||
                    "https://lh3.googleusercontent.com/aida/AEtjO1VY4KdWS7zOzoLqOa3TRPpttDSJm5qDTedUqM3bfzBv0Nbu3DcVaY0PuPRIKyEdrkir6ULFfxUGURZq6k1XvMkyOLaj4xtCyDnb66Csd9tHQisQ3BO30-DeJHIntN2edB7fHl6FcqUBfgroZgRiyW6lLPt0huSAurxthNtnE1EmvYPFO4W_T5AIb8Qiv1oQScaDnX_idvoMBgpSJ1pBg0e7D_0B_QYNr82Fuj24UaVARVwN3kOuZ-9Xvqg"
                  }
                  alt={similarArtistData.artistName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Similar to {similarArtistData.artistName}
              </h3>
            </div>
            <span
              onClick={() => setActiveTab("explore")}
              className="text-xs font-semibold text-white/40 hover:text-white cursor-pointer transition-colors"
            >
              Explore
            </span>
          </div>

          <div className="space-y-3">
            {similarArtistData.songs.slice(0, 6).map((session) => {
              const isThisTrack = isCurrentSongActive(session);
              return (
                <div
                  key={session.id}
                  onClick={() => handleSongClick(session)}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[#161311] border border-white/10">
                      <img
                        src={session.thumbnail}
                        alt={session.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                        <span className="material-symbols-outlined text-white text-[20px]">
                          play_circle
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className={`text-xs sm:text-sm font-bold truncate ${isThisTrack ? "text-white font-black" : "text-white"}`}>
                        {session.title}
                      </h4>
                      <p className="text-[11px] text-white/60 truncate mt-0.5">
                        {session.artist}
                      </p>
                      <span className="text-[10px] text-white/50 font-medium">
                        {session.album || "Acoustic Session"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSongClick(session);
                    }}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white group-hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {isThisTrack && isPlaying ? "pause" : "play_arrow"}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* ========================================================================= */}
      {/* SECTION 4: Community Playlists (Real Music Data & Real Song Covers) */}
      {/* ========================================================================= */}
      <CommunitySection />
    </div>
  );
};
