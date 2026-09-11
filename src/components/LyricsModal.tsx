import React, { useEffect, useRef } from "react";
import { usePlayer } from "../context/PlayerContext";
import { formatRemainingTime, formatTime } from "../utils/format";

export const LyricsModal: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seekTo,
    playNext,
    playPrev,
    isLiked,
    toggleLike,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    lyrics,
    activeLyricIndex,
    isLyricsOpen,
    setIsLyricsOpen,
    setIsNowPlayingOpen,
  } = usePlayer();

  const activeLineRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to active lyric line smoothly
  useEffect(() => {
    if (isLyricsOpen && activeLineRef.current && scrollContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeLyricIndex, isLyricsOpen]);

  if (!isLyricsOpen) return null;

  const progressPct = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div
      id="lyrics-screen-modal"
      className="fixed inset-0 z-50 bg-[#0c0907] flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-300"
    >
      {/* Heavy Blurred Ambient Artwork Backdrop */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={currentTrack.thumbnail}
          alt={currentTrack.title}
          className="w-full h-full object-cover object-center filter blur-[60px] opacity-35 scale-125"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0907]/90 via-[#0c0907]/75 to-[#0c0907]/95"></div>
      </div>

      {/* Top Header */}
      <header className="relative z-20 pt-6 px-6 pb-3 flex items-center justify-between max-w-[440px] w-full mx-auto">
        <button
          id="lyrics-back-btn"
          onClick={() => {
            setIsLyricsOpen(false);
            setIsNowPlayingOpen(true);
          }}
          title="Kembali ke Now Playing"
          aria-label="Kembali"
          className="w-11 h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/15 text-white shadow-lg cursor-pointer transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>

        <div className="flex flex-col items-center text-center px-2 max-w-[240px]">
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/60">
            LIRIK BERJALAN
          </span>
          <p className="text-xs font-semibold text-white truncate w-full mt-0.5">
            {currentTrack.title} • {currentTrack.artist}
          </p>
        </div>

        <button
          title="Opsi Lirik"
          aria-label="Opsi Lirik"
          className="w-11 h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/15 text-white shadow-lg cursor-pointer transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">more_horiz</span>
        </button>
      </header>

      {/* Synchronized Scrolling Lyrics Content */}
      <main
        ref={scrollContainerRef}
        className="relative z-10 flex-1 overflow-y-auto px-6 py-12 flex flex-col space-y-7 no-scrollbar max-w-[440px] w-full mx-auto"
      >
        {lyrics.map((line, index) => {
          const isActive = index === activeLyricIndex;
          const isPast = index < activeLyricIndex;

          return (
            <div
              key={index}
              ref={isActive ? activeLineRef : null}
              onClick={() => seekTo(line.time)}
              className={`transition-all duration-300 cursor-pointer group select-none ${
                isActive
                  ? "scale-[1.03] origin-left py-2"
                  : isPast
                  ? "opacity-40 hover:opacity-75"
                  : "opacity-45 hover:opacity-80"
              }`}
            >
              {isActive && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 border border-white/25 text-[10.5px] font-bold text-white tracking-wider mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  <span>VERSE • {formatTime(line.time)}</span>
                </div>
              )}

              <p
                className={`font-serif tracking-tight leading-relaxed transition-all ${
                  isActive
                    ? "text-2xl sm:text-[26px] font-bold text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.45)]"
                    : "text-lg sm:text-xl font-medium text-white/70 group-hover:text-white"
                }`}
              >
                {line.text}
              </p>
            </div>
          );
        })}

        <div className="h-28"></div>
      </main>

      {/* Bottom Docked Player Controller */}
      <footer className="relative z-20 p-5 bg-[#140f0c]/90 backdrop-blur-2xl border-t border-white/10 max-w-[440px] w-full mx-auto">
        {/* Top Mini Row: Thumbnail, Title, Artist, Lossless Badge, Like */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div
            onClick={() => {
              setIsLyricsOpen(false);
              setIsNowPlayingOpen(true);
            }}
            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 border border-white/20 shadow-md">
              <img
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-white truncate leading-tight">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-white/60 truncate mt-0.5">
                {currentTrack.artist}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-white/10 text-[9.5px] font-semibold text-white/75 border border-white/10">
              LOSSLESS
            </span>
            <button
              onClick={() => toggleLike()}
              title="Sukai"
              aria-label="Sukai lagu"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isLiked ? "text-rose-400" : "text-white/60 hover:text-white"
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={isLiked ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                favorite
              </span>
            </button>
          </div>
        </div>

        {/* Progress Bar & Seek */}
        <div className="mb-3">
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const pct = Math.max(0, Math.min(1, clickX / rect.width));
              seekTo(pct * duration);
            }}
            className="relative h-4 flex items-center cursor-pointer group"
          >
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden group-hover:h-1.5 transition-all">
              <div
                className="h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between text-[11px] font-mono text-white/50 -mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatRemainingTime(currentTime, duration)}</span>
          </div>
        </div>

        {/* Controls Row: Prev, Solid White Play/Pause, Next + Volume Control */}
        <div className="flex items-center justify-between pt-1">
          {/* Playback buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={playPrev}
              title="Lagu Sebelumnya"
              aria-label="Putar lagu sebelumnya"
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white active:scale-90 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[26px]">skip_previous</span>
            </button>

            <button
              onClick={togglePlay}
              title={isPlaying ? "Jeda" : "Putar"}
              aria-label="Tombol Play atau Pause"
              className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-[0_4px_16px_rgba(255,255,255,0.25)] hover:bg-white/90 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span
                className="material-symbols-outlined text-[26px] ml-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {isPlaying ? "pause" : "play_arrow"}
              </span>
            </button>

            <button
              onClick={playNext}
              title="Lagu Berikutnya"
              aria-label="Putar lagu berikutnya"
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white active:scale-90 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[26px]">skip_next</span>
            </button>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center space-x-2 w-32 sm:w-36">
            <button
              onClick={toggleMute}
              title={isMuted ? "Bunyikan Suara" : "Bisukan Suara"}
              aria-label="Pengaturan suara"
              className="text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isMuted || volume === 0 ? "volume_off" : volume < 50 ? "volume_down" : "volume_up"}
              </span>
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Tingkat volume"
              className="w-full h-1.5 bg-white/20 accent-white rounded-full cursor-pointer"
            />
          </div>
        </div>
      </footer>
    </div>
  );
};
