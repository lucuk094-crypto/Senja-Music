import React, { useEffect, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { searchMusic } from "../services/api";
import { Song } from "../types";

export const SearchScreen: React.FC = () => {
  const {
    feed,
    playTrack,
    currentTrack,
    isPlaying,
    searchQuery,
    setSearchQuery,
  } = usePlayer();

  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Nadin Amizah",
    "Tulus Sewindu",
    "Hindia Evaluasi",
    "Senja Folk",
  ]);

  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Live search debounced with /api/search?q={query}
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const items = await searchMusic(searchQuery.trim());
        const songs: Song[] = items.map((r) => ({
          id: r.videoId,
          title: r.title,
          artist: r.artist,
          album: r.album || "Single",
          duration: r.duration || 210,
          thumbnail: r.thumbnail,
          audioQuality: "LOSSLESS 24-BIT / 96kHz",
        }));
        setSearchResults(songs);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSong = (song: Song) => {
    playTrack(song);
    // Add to recent searches if not present
    if (!recentSearches.includes(song.title)) {
      setRecentSearches((prev) => [song.title, ...prev.slice(0, 5)]);
    }
  };

  const clearAllRecent = () => setRecentSearches([]);

  return (
    <div id="search-screen-view" className="flex-1 overflow-y-auto pb-44 pt-4 px-4 sm:px-6 max-w-[440px] mx-auto w-full no-scrollbar">
      {/* Top Header */}
      <header className="flex items-center justify-between py-2 mb-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest text-white/50 uppercase">
            EKSPLORASI AUDIO
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">
            Pencarian
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            title="Notifikasi"
            aria-label="Notifikasi"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.08] backdrop-blur-md border border-white/10 text-white/80"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdNUYxGYihi4Z1zYx-YElwiNjn1t0yZKuKhFRIivdojfrGgF1_ssSw3G1zX5pXNpXxLVBsVc-n0zFRJxoH80nY0Ai0PLulNQJ6wMvWoOgSu8v-MmqwEtQz3Wg9EAIIOE1zTAMUiAMW4YstoTT_o6PepaL7CTc2MH7t-7tGhhlrP3gpPaViY5I_0LVk9xeLZiAMTnYsZb5zY4xJ770hTrIKg5JcIiDMalbvDdfdaALipZe7uokA7rdQ"
              alt="Avatar"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      {/* Search Input Bar */}
      <section className="mb-6">
        <div className="relative flex items-center w-full">
          <span className="absolute left-4 material-symbols-outlined text-[22px] text-white/70 pointer-events-none">
            search
          </span>
          <input
            type="text"
            id="search-input-field"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari lagu, artis, atau lirik..."
            className="w-full pl-12 pr-11 py-3.5 rounded-2xl bg-white/[0.07] hover:bg-white/[0.1] focus:bg-white/[0.12] border border-white/15 focus:border-white/40 text-white placeholder-white/40 text-sm font-medium outline-none transition-all shadow-inner"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              title="Hapus Teks"
              aria-label="Bersihkan pencarian"
              className="absolute right-3 w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          ) : (
            <button
              title="Pencarian Suara"
              aria-label="Pencarian Suara"
              className="absolute right-3 w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">mic</span>
            </button>
          )}
        </div>
      </section>

      {/* Live Search Results (If user typed a query) */}
      {searchQuery.trim().length > 0 ? (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Hasil Pencarian</span>
              {isSearching && <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>}
            </h3>
            <span className="text-xs text-white/40">{searchResults.length} ditemukan</span>
          </div>

          {isSearching && searchResults.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-white/50 space-y-2">
              <span className="material-symbols-outlined text-[32px] animate-spin text-white/80">
                progress_activity
              </span>
              <p className="text-xs">Mencari di YouTube Music...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-2.5">
              {searchResults.map((song) => {
                const isCurrent = currentTrack.id === song.id;
                return (
                  <div
                    key={song.id}
                    onClick={() => handleSelectSong(song)}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#141211] border border-white/10">
                        <img
                          src={song.thumbnail}
                          alt={song.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-white text-[20px]">
                            play_arrow
                          </span>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className={`text-xs sm:text-sm font-bold truncate leading-tight ${isCurrent ? "text-white font-extrabold" : "text-white"}`}>
                          {song.title}
                        </h4>
                        <p className="text-xs text-white/55 truncate mt-0.5">
                          {song.artist} • {song.album}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSong(song);
                      }}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-[22px]">
                        {isCurrent && isPlaying ? "pause" : "play_arrow"}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center text-white/45">
              <span className="material-symbols-outlined text-[36px] text-white/20 mb-1">
                sentiment_dissatisfied
              </span>
              <p className="text-xs">Tidak menemukan hasil untuk "{searchQuery}"</p>
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Pencarian Terkini */}
          {recentSearches.length > 0 && (
            <section className="mb-7">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-white tracking-tight">
                  Pencarian Terkini
                </h3>
                <button
                  onClick={clearAllRecent}
                  className="text-xs font-semibold text-white/40 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Hapus Semua
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => setSearchQuery(term)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/5 text-xs font-semibold text-white/80 hover:text-white transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px] text-white/40">history</span>
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Paling Banyak Dicari (Trending Top 5) */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Paling Banyak Dicari</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/60"></span>
              </h3>
            </div>

            <div className="space-y-2.5">
              {(feed.shelves?.find((s: any) => s.title === "Playlist trending komunitas")?.items || []).slice(0, 5).map((item: any, idx: number) => {
                const isCurrent = currentTrack.id === item.id;
                const rank = String(idx + 1).padStart(2, '0');
                return (
                  <div
                    key={item.id || idx}
                    onClick={() => handleSelectSong(item)}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                      <span className="font-mono text-sm font-bold text-white/40 group-hover:text-white w-5 text-center">
                        {rank}
                      </span>
                      <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-[#161311] border border-white/10">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-xs sm:text-sm font-bold truncate leading-tight ${isCurrent ? "text-white font-extrabold" : "text-white"}`}>
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-white/50 truncate mt-0.5">
                          {item.artist}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[10px] font-bold text-emerald-400">
                        {item.searches}
                      </span>
                      <span className="material-symbols-outlined text-white/30 group-hover:text-white transition-colors text-[20px]">
                        play_circle
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Cari Berdasarkan Suasana */}
          <section className="mb-6">
            <h3 className="text-base font-extrabold text-white tracking-tight mb-3">
              Cari Berdasarkan Suasana
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "Fokus Kerja", icon: "laptop", bg: "from-blue-900/40 to-slate-900/60", q: "Lagu Fokus Kerja Instrumental" },
                { label: "Tidur Tenang", icon: "bedtime", bg: "from-purple-900/40 to-slate-900/60", q: "Lagu Tidur Pengantar Tidur" },
                { label: "Lagu Galau", icon: "mood_bad", bg: "from-cyan-900/40 to-slate-900/60", q: "Lagu Galau Indonesia Akustik" },
                { label: "Pembangkit Mood", icon: "electric_bolt", bg: "from-amber-900/40 to-orange-950/60", q: "Lagu Semangat Pagi Indonesia" },
              ].map((mood) => (
                <div
                  key={mood.label}
                  onClick={() => setSearchQuery(mood.q)}
                  className={`p-3.5 rounded-2xl bg-gradient-to-br ${mood.bg} border border-white/10 hover:border-white/25 transition-all cursor-pointer flex items-center space-x-3`}
                >
                  <span className="material-symbols-outlined text-[22px] text-white/80">
                    {mood.icon}
                  </span>
                  <span className="text-xs font-bold text-white">
                    {mood.label}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
