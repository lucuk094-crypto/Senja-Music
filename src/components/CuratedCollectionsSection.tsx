import React, { useState, useEffect } from "react";
import { usePlayer } from "../context/PlayerContext";
import { Song } from "../types";
import { CURATED_COLLECTIONS_DATA, CuratedCollectionItem } from "../data/curatedCollections";
import { searchMusic } from "../services/musicApi";

export const CuratedCollectionsSection: React.FC = () => {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();

  // Active selected collection (default to "hot-dangdut")
  const [activeCollectionId, setActiveCollectionId] = useState<string>("hot-dangdut");

  // Track collections state with fallback & API live enhancement
  const [collections, setCollections] = useState<CuratedCollectionItem[]>(CURATED_COLLECTIONS_DATA);
  const [loadingLive, setLoadingLive] = useState<boolean>(false);

  // Active collection object
  const activeCollection =
    collections.find((c) => c.id === activeCollectionId) || collections[0];

  // Helper check if song is currently playing
  const isCurrentActive = (song: Song) => {
    return currentTrack?.id === song.id || currentTrack?.videoId === song.id;
  };

  const handleSongClick = (song: Song) => {
    if (isCurrentActive(song)) {
      togglePlay();
    } else {
      playTrack(song);
    }
  };

  const handlePlayAll = () => {
    if (activeCollection && activeCollection.songs.length > 0) {
      playTrack(activeCollection.songs[0]);
    }
  };

  // Format seconds into mm:ss
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "03:45";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Asynchronously attempt to enrich songs from live YouTube Music API if available
  useEffect(() => {
    let isMounted = true;
    const fetchLiveForActive = async () => {
      if (!activeCollection.query) return;
      try {
        setLoadingLive(true);
        const liveResults = await searchMusic(activeCollection.query);
        if (isMounted && liveResults && liveResults.length >= 4) {
          setCollections((prev) =>
            prev.map((col) => {
              if (col.id === activeCollectionId) {
                // Merge unique songs, keeping top curated songs first
                const existingIds = new Set(col.songs.map((s) => s.id));
                const newAdditions = liveResults.filter((s) => !existingIds.has(s.id));
                return {
                  ...col,
                  songs: [...col.songs, ...newAdditions].slice(0, 16),
                };
              }
              return col;
            })
          );
        }
      } catch (err) {
        console.warn("Could not fetch live additions, using curated fallback tracks:", err);
      } finally {
        if (isMounted) setLoadingLive(false);
      }
    };

    fetchLiveForActive();
    return () => {
      isMounted = false;
    };
  }, [activeCollectionId]);

  return (
    <section id="koleksi-spesial-section" className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest text-white/50 uppercase">
            KOLEKSI HITS TERLENGKAP
          </span>
          <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
            <span>Koleksi Pilihan Nusantara</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/70"></span>
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-white/50 bg-white/[0.06] px-2.5 py-1 rounded-full border border-white/10">
          6 Kategori
        </span>
      </div>

      {/* Collection Tab Selector (Horizontal Scroll with frosted glass pills) */}
      <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2.5 pt-0.5 -mx-1 px-1">
        {collections.map((col) => {
          const isSelected = col.id === activeCollectionId;
          return (
            <button
              key={col.id}
              onClick={() => setActiveCollectionId(col.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer border backdrop-blur-md shadow-sm ${
                isSelected
                  ? "bg-white text-black border-white scale-100 shadow-md font-extrabold"
                  : "bg-white/[0.06] hover:bg-white/[0.12] text-white/75 hover:text-white border-white/10 hover:border-white/20"
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">{col.icon}</span>
              <span>{col.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
                  isSelected ? "bg-black/10 text-black" : "bg-white/10 text-white/60"
                }`}
              >
                {col.songs.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Collection Showcase Banner */}
      <div className="mt-2.5 rounded-3xl p-4 sm:p-5 bg-white/[0.04] border border-white/10 backdrop-blur-xl relative overflow-hidden shadow-xl">
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/[0.03] rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-white/80 text-[10px] font-mono uppercase tracking-wider">
                {activeCollection.badge}
              </span>
              <span className="text-[11px] text-white/45 italic font-medium">
                "{activeCollection.query}"
              </span>
            </div>
            <h4 className="text-lg font-black text-white leading-snug">
              {activeCollection.name}
            </h4>
            <p className="text-xs text-white/60 mt-0.5 line-clamp-2 max-w-md">
              {activeCollection.description}
            </p>
          </div>

          <div className="flex items-center space-x-2.5 self-start sm:self-auto">
            <button
              onClick={handlePlayAll}
              className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-white text-black hover:bg-white/90 text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                play_arrow
              </span>
              <span>Putar Semua ({activeCollection.songs.length})</span>
            </button>
          </div>
        </div>

        {/* Complete Song List within the Collection */}
        <div className="space-y-1.5">
          {activeCollection.songs.map((song, idx) => {
            const isThis = isCurrentActive(song);
            return (
              <div
                key={song.id + idx}
                onClick={() => handleSongClick(song)}
                className={`flex items-center justify-between p-2.5 rounded-2xl transition-all duration-200 cursor-pointer group border ${
                  isThis
                    ? "bg-white/15 border-white/25 shadow-inner"
                    : "bg-white/[0.02] hover:bg-white/[0.08] border-transparent hover:border-white/10"
                }`}
              >
                {/* Left: Thumbnail, Track Number, Title & Artist */}
                <div className="flex items-center space-x-3 min-w-0 pr-3">
                  {/* Track index or animated equalizer */}
                  <div className="w-5 text-center flex-shrink-0">
                    {isThis && isPlaying ? (
                      <div className="flex items-end justify-center space-x-0.5 h-3">
                        <span className="w-0.5 h-3 bg-white animate-pulse"></span>
                        <span className="w-0.5 h-2 bg-white animate-ping"></span>
                        <span className="w-0.5 h-2.5 bg-white animate-pulse"></span>
                      </div>
                    ) : (
                      <span className="text-[11px] font-mono text-white/40 group-hover:text-white/80">
                        {(idx + 1).toString().padStart(2, "0")}
                      </span>
                    )}
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 flex-shrink-0 shadow-sm">
                    <img
                      src={song.thumbnail}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div
                      className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                        isThis ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[20px] text-white"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {isThis && isPlaying ? "pause" : "play_arrow"}
                      </span>
                    </div>
                  </div>

                  {/* Title and Artist Info */}
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <h5
                        className={`text-xs font-bold truncate leading-tight ${
                          isThis ? "text-white font-black" : "text-white/90 group-hover:text-white"
                        }`}
                      >
                        {song.title}
                      </h5>
                      {song.badge && (
                        <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-white/10 border border-white/15 text-white/70 font-semibold flex-shrink-0 uppercase">
                          {song.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/50 truncate mt-0.5">
                      {song.artist} {song.album ? `• ${song.album}` : ""}
                    </p>
                  </div>
                </div>

                {/* Right: Duration and Audio Quality */}
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <span className="text-[10px] font-mono text-white/45 hidden sm:inline-block">
                    LOSSLESS
                  </span>
                  <span className="text-[11px] font-mono text-white/60">
                    {formatTime(song.duration)}
                  </span>
                  <button
                    aria-label="Play song"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSongClick(song);
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                      isThis
                        ? "bg-white text-black border-white"
                        : "bg-white/5 group-hover:bg-white/15 text-white/70 border-white/10"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[15px] ml-0.5"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {isThis && isPlaying ? "pause" : "play_arrow"}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info note */}
        <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/45">
          <div className="flex items-center space-x-1.5">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            <span>Data musik resmi YouTube Music • Audio Lossless</span>
          </div>
          {loadingLive && (
            <span className="text-[10.5px] text-white/50 flex items-center gap-1">
              <span className="material-symbols-outlined animate-spin text-[12px]">progress_activity</span>
              Memperbarui daftar...
            </span>
          )}
        </div>
      </div>
    </section>
  );
};
