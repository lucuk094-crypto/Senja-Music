import React, { useEffect, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { CommunitySection } from "./CommunitySection";
import { getCategories, getCategorySongs, searchMusic } from "../services/musicApi";
import { Song } from "../types";

export const ExploreScreen: React.FC = () => {
  const { setActiveTab, setSearchQuery, playTrack, feed, currentTrack, isPlaying, togglePlay } = usePlayer();
  
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categorySongs, setCategorySongs] = useState<Song[]>([]);
  const [loadingCategorySongs, setLoadingCategorySongs] = useState(false);

  // Load categories from API
  useEffect(() => {
    let isMounted = true;
    setLoadingCategories(true);

    getCategories()
      .then((cats) => {
        if (isMounted && cats && cats.length > 0) {
          setCategories(cats);
        }
      })
      .catch((err) => console.warn("Failed to load categories:", err))
      .finally(() => {
        if (isMounted) setLoadingCategories(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Load songs for selected category
  useEffect(() => {
    if (!selectedCategory) {
      setCategorySongs([]);
      return;
    }

    let isMounted = true;
    setLoadingCategorySongs(true);

    const category = categories.find((c) => c.id === selectedCategory);
    if (!category) return;

    // Try getting category songs from API
    getCategorySongs(selectedCategory)
      .then((songs) => {
        if (isMounted && songs && songs.length > 0) {
          setCategorySongs(songs.slice(0, 12));
        } else {
          // Fallback: search with category query
          return searchMusic(category.query);
        }
      })
      .then((searchResults) => {
        if (isMounted && searchResults && searchResults.length > 0) {
          setCategorySongs(searchResults.slice(0, 12));
        }
      })
      .catch((err) => console.warn("Failed to load category songs:", err))
      .finally(() => {
        if (isMounted) setLoadingCategorySongs(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, categories]);

  const isCurrentSongActive = (song: Song) => {
    const currentVideoId = (currentTrack as any).videoId || currentTrack.id;
    const targetVideoId = (song as any).videoId || song.id;
    return Boolean(currentVideoId && targetVideoId && currentVideoId === targetVideoId);
  };

  const handleSongClick = (song: Song) => {
    if (isCurrentSongActive(song)) {
      togglePlay();
    } else {
      playTrack(song);
    }
  };

  const moods = [
    { name: "Fokus", icon: "spa", gradient: "from-blue-600/30 to-indigo-900/40", border: "border-blue-500/20" },
    { name: "Santai", icon: "deck", gradient: "from-amber-600/30 to-orange-950/40", border: "border-amber-500/20" },
    { name: "Sedih", icon: "water_drop", gradient: "from-cyan-600/30 to-slate-900/40", border: "border-cyan-500/20" },
    { name: "Semangat", icon: "bolt", gradient: "from-lime-600/30 to-emerald-950/40", border: "border-lime-500/20" },
    { name: "Tidur Nyenyak", icon: "bedtime", gradient: "from-purple-600/30 to-slate-950/40", border: "border-purple-500/20" },
    { name: "Romantis", icon: "favorite", gradient: "from-rose-600/30 to-pink-950/40", border: "border-rose-500/20" },
    { name: "Olahraga", icon: "fitness_center", gradient: "from-orange-600/30 to-red-950/40", border: "border-orange-500/20" },
    { name: "Pesta", icon: "celebration", gradient: "from-fuchsia-600/30 to-violet-950/40", border: "border-fuchsia-500/20" },
  ];

  const curatedNusantara = categories.length > 0 
    ? categories.slice(0, 6) 
    : [
        {
          id: "pop-indonesia",
          name: "Pop Indonesia",
          query: "lagu pop indonesia terbaru",
          badge: "POP",
          icon: "music_note",
          listeners: "3.2M",
        },
        {
          id: "hits-zaman-now",
          name: "Hits Zaman Now",
          query: "hits indonesia terkini",
          badge: "TRENDING",
          icon: "trending_up",
          listeners: "2.9M",
        },
        {
          id: "kemarau-chill",
          name: "Kemarau Chill",
          query: "lagu indie santai mood cerah",
          badge: "CHILL",
          icon: "wb_sunny",
          listeners: "1.4M",
        },
        {
          id: "rock-sepanjang-masa",
          name: "Rock Sepanjang Masa",
          query: "rock indonesia legendaris",
          badge: "ROCK",
          icon: "electric_bolt",
          listeners: "1.6M",
        },
      ];

  const genres = categories.length > 6 
    ? categories.slice(6, 16).map((cat, idx) => ({
        num: String(idx + 1).padStart(2, '0'),
        name: cat.name,
        query: cat.query,
        listeners: "1.2M",
        featured: idx === 3,
      }))
    : [
        { num: "01", name: "Blues", query: "blues indonesia", listeners: "420k" },
        { num: "02", name: "Bollywood", query: "bollywood hits", listeners: "1.2M" },
        { num: "03", name: "Dance & Elektronik", query: "edm electronic dance", listeners: "850k" },
        { num: "04", name: "Indie Indonesia", query: "indie indonesia", listeners: "2.4M", featured: true },
        { num: "05", name: "Pop", query: "pop indonesia", listeners: "3.1M" },
        { num: "06", name: "Hip-Hop & R&B", query: "hip hop rnb indonesia", listeners: "1.8M" },
        { num: "07", name: "Rock & Alternatif", query: "rock alternatif indonesia", listeners: "960k" },
        { num: "08", name: "Jazz & Soul", query: "jazz soul indonesia", listeners: "710k" },
        { num: "09", name: "Klasik & Akustik", query: "klasik akustik indonesia", listeners: "630k" },
        { num: "10", name: "Reggae", query: "reggae ska indonesia", listeners: "340k" },
      ];

  const handleMoodClick = (mood: string) => {
    setSearchQuery(mood + " Indonesia");
    setActiveTab("search");
  };

  const handleGenreClick = (genreQuery: string, categoryId?: string) => {
    if (categoryId) {
      // Open category detail view in-screen
      setSelectedCategory(categoryId);
    } else {
      // Go to search with query
      setSearchQuery(genreQuery);
      setActiveTab("search");
    }
  };

  return (
    <div id="explore-screen-view" className="flex-1 overflow-y-auto pb-44 pt-4 px-4 sm:px-6 max-w-[440px] mx-auto w-full no-scrollbar">
      {/* Top Header */}
      <header className="flex items-center justify-between py-2 mb-4">
        <h1 className="text-2xl font-black text-white tracking-tight">
          Explore
        </h1>
        <div className="flex items-center space-x-2">
          <button
            title="Notifikasi"
            aria-label="Pemberitahuan"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.08] backdrop-blur-md border border-white/10 text-white/80"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdNUYxGYihi4Z1zYx-YElwiNjn1t0yZKuKhFRIivdojfrGgF1_ssSw3G1zX5pXNpXxLVBsVc-n0zFRJxoH80nY0Ai0PLulNQJ6wMvWoOgSu8v-MmqwEtQz3Wg9EAIIOE1zTAMUiAMW4YstoTT_o6PepaL7CTc2MH7t-7tGhhlrP3gpPaViY5I_0LVk9xeLZiAMTnYsZb5zY4xJ770hTrIKg5JcIiDMalbvDdfdaALipZe7uokA7rdQ"
              alt="Profile"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      {/* Hero & Search Bar */}
      <section className="mb-6">
        <div className="mb-3">
          <span className="text-[10px] font-extrabold tracking-widest text-white/50 uppercase">
            TEMUKAN MUSIK
          </span>
          <h2 className="text-xl font-black text-white mt-0.5">
            Jelajahi Dunia Suara
          </h2>
        </div>

        <div
          onClick={() => setActiveTab("search")}
          className="flex items-center space-x-3 px-4 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 backdrop-blur-md cursor-pointer transition-all text-white/50 hover:text-white/80 shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px] text-white/70">
            search
          </span>
          <span className="text-xs sm:text-sm font-medium">
            Cari lagu, artis, atau playlist...
          </span>
        </div>

        {/* Micro Tag */}
        <div className="flex items-center space-x-2 mt-3 px-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <p className="text-[11px] text-white/55 font-medium">
            Sedang tren saat ini: <strong className="text-white">Senja Akustik</strong> • 14.8k pendengar
          </p>
        </div>
      </section>

      {/* Mood & Momen (8 Cards) */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Mood & Momen</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/60"></span>
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {moods.map((m) => (
            <div
              key={m.name}
              onClick={() => handleMoodClick(m.name)}
              className={`p-3 rounded-2xl bg-gradient-to-br ${m.gradient} border ${m.border} hover:border-white/30 backdrop-blur-md transition-all cursor-pointer group flex flex-col justify-between h-24 shadow-sm hover:scale-[1.02]`}
            >
              <span className="material-symbols-outlined text-[24px] text-white/80 group-hover:scale-110 group-hover:text-white transition-all">
                {m.icon}
              </span>
              <span className="text-xs font-bold text-white tracking-tight">
                {m.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Kurasi Mingguan Banner */}
      <section
        onClick={() => playTrack(feed.featured)}
        className="relative rounded-3xl overflow-hidden mb-8 border border-white/15 p-5 bg-gradient-to-r from-neutral-900/80 via-neutral-800/60 to-black/90 backdrop-blur-xl cursor-pointer group shadow-xl"
      >
        <div className="relative z-10 flex items-center justify-between">
          <div className="pr-4">
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 text-[9.5px] font-bold uppercase tracking-wider border border-white/15 backdrop-blur-md">
              KURASI MINGGUAN
            </span>
            <h4 className="text-lg font-black text-white mt-1.5 leading-tight">
              Alunan Suara Nusantara
            </h4>
            <p className="text-xs text-white/65 mt-1">
              Kompilasi melodi folk & akustik terhangat minggu ini
            </p>
          </div>

          <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center flex-shrink-0 shadow-[0_4px_20px_rgba(255,255,255,0.25)] group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[28px] ml-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
              play_arrow
            </span>
          </div>
        </div>
      </section>

      {/* Koleksi Pilihan Nusantara */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <span className="text-[10px] font-extrabold tracking-widest text-white/50 uppercase">
              HITS TERLENGKAP
            </span>
            <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2 mt-0.5">
              <span>Koleksi Pilihan Nusantara</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/60"></span>
            </h3>
          </div>
          <span
            onClick={() => setActiveTab("home")}
            className="text-xs font-semibold text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            Buka di Beranda
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {curatedNusantara.map((item) => (
            <div
              key={item.id}
              onClick={() => handleGenreClick(item.query, item.id)}
              className="p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-start space-x-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:text-black transition-colors text-white/80">
                  <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <h4 className="text-sm font-extrabold text-white group-hover:text-white truncate">
                      {item.name}
                    </h4>
                  </div>
                  <p className="text-[10.5px] text-white/50 leading-relaxed line-clamp-2">
                    {item.description || item.query}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 font-bold text-white/70 uppercase tracking-wider">
                    {item.badge || "HITS"}
                  </span>
                  <span className="text-[10px] text-white/40 font-medium">{item.listeners || "1M+"} pendengar</span>
                </div>
                <span className="material-symbols-outlined text-[18px] text-white/40 group-hover:text-white transition-colors">
                  chevron_right
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Genre Section */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base font-extrabold text-white tracking-tight">
            Genre & Kategori
          </h3>
          <span
            onClick={() => {
              setSearchQuery("Top Hits Indonesia");
              setActiveTab("search");
            }}
            className="text-xs font-semibold text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            Semua Genre
          </span>
        </div>

        <div className="space-y-2">
          {genres.map((g) => (
            <div
              key={g.num}
              onClick={() => handleGenreClick(g.query || g.name)}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-md border border-white/5 hover:border-white/15 transition-all cursor-pointer group"
            >
              <div className="flex items-center space-x-3.5">
                <span className="text-xs font-mono font-bold text-white/40 group-hover:text-white transition-colors">
                  {g.num}
                </span>
                <span className="text-sm font-bold text-white group-hover:text-white transition-colors">
                  {g.name}
                </span>
                {g.featured && (
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[9.5px] font-bold border border-white/15">
                    POPULER
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-white/40 font-medium">
                  {g.listeners}
                </span>
                <span className="material-symbols-outlined text-white/30 text-[18px] group-hover:text-white transition-colors">
                  chevron_right
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category Detail Modal/View */}
      {selectedCategory && (
        <section className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl overflow-y-auto">
          <div className="min-h-screen px-4 py-6 pb-44">
            <div className="max-w-[440px] mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </button>
                <h2 className="text-xl font-black text-white">
                  {categories.find((c) => c.id === selectedCategory)?.name || "Kategori"}
                </h2>
                <div className="w-10"></div>
              </div>

              {/* Category Info */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/15 backdrop-blur-md mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px] text-white">
                      {categories.find((c) => c.id === selectedCategory)?.icon || "music_note"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {categories.find((c) => c.id === selectedCategory)?.name}
                    </h3>
                    <p className="text-xs text-white/60 mt-0.5">
                      {categorySongs.length} lagu tersedia
                    </p>
                  </div>
                </div>
                <p className="text-xs text-white/70">
                  {categories.find((c) => c.id === selectedCategory)?.description || "Koleksi lagu terbaik dari kategori ini"}
                </p>
              </div>

              {/* Songs Grid */}
              {loadingCategorySongs ? (
                <div className="h-64 flex items-center justify-center text-white/40">
                  <div className="flex flex-col items-center space-y-2">
                    <span className="material-symbols-outlined text-3xl animate-spin">progress_activity</span>
                    <span className="text-xs font-medium">Memuat lagu...</span>
                  </div>
                </div>
              ) : categorySongs.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {categorySongs.map((song) => {
                    const isActive = isCurrentSongActive(song);
                    return (
                      <div
                        key={song.id}
                        onClick={() => handleSongClick(song)}
                        className="group cursor-pointer"
                      >
                        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#141211] border border-white/10 mb-2 shadow-md">
                          <img
                            src={song.thumbnail}
                            alt={song.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <div
                            className={`absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-lg transition-all ${
                              isActive ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                            }`}
                          >
                            <span
                              className="material-symbols-outlined text-[18px] ml-0.5"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              {isActive && isPlaying ? "pause" : "play_arrow"}
                            </span>
                          </div>
                        </div>
                        <h4 className={`text-xs font-bold truncate ${isActive ? "text-white" : "text-white/90"}`}>
                          {song.title}
                        </h4>
                        <p className="text-[10.5px] text-white/55 truncate mt-0.5">
                          {song.artist}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-white/40">
                  <span className="material-symbols-outlined text-4xl mb-2">music_off</span>
                  <p className="text-sm">Tidak ada lagu ditemukan</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Community Playlists Section */}
      <CommunitySection />
    </div>
  );
};
