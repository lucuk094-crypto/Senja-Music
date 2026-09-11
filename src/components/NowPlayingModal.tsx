import React, { useRef, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { formatRemainingTime, formatTime } from "../utils/format";
import { ShareSongModal } from "./ShareSongModal";
import { AddToPlaylistModal } from "./AddToPlaylistModal";

export const NowPlayingModal: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seekTo,
    playNext,
    playPrev,
    isShuffle,
    toggleShuffle,
    isRepeat,
    toggleRepeat,
    isLiked,
    toggleLike,
    isNowPlayingOpen,
    setIsNowPlayingOpen,
    setIsLyricsOpen,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    setIsQueueOpen,
    toggleDownload,
    isDownloaded,
  } = usePlayer();

  const progressRef = useRef<HTMLDivElement>(null);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
  
  const downloaded = isDownloaded(currentTrack.id);

  if (!isNowPlayingOpen) return null;

  const progressPct = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || duration <= 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    seekTo(pct * duration);
  };

  return (
    <div
      id="now-playing-modal"
      className="fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-300"
    >
      {/* 1. Full-Bleed Edge-to-Edge Album Artwork */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={currentTrack.thumbnail}
          alt={currentTrack.title}
          className="w-full h-full object-cover object-center filter contrast-[1.05] brightness-[0.96] transition-all duration-700"
          referrerPolicy="no-referrer"
        />
        {/* Ambient color gradient bloom overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30 pointer-events-none"></div>
      </div>

      {/* 2. Top Scrim Overlay */}
      <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-[#0A0A0A]/95 via-[#0A0A0A]/65 to-transparent z-10 pointer-events-none"></div>

      {/* 3. Bottom Scrim Overlay */}
      <div className="absolute bottom-0 inset-x-0 h-[64%] bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/85 to-transparent z-10 pointer-events-none"></div>

      {/* 4. Top Header Bar */}
      <header className="relative z-20 pt-6 px-6 pb-4 flex items-center justify-between max-w-[430px] w-full mx-auto">
        {/* Chevron Down Button (Tutup) */}
        <button
          id="now-playing-close-btn"
          onClick={() => setIsNowPlayingOpen(false)}
          title="Tutup Player"
          aria-label="Kembali ke layar sebelumnya"
          className="w-11 h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/15 text-white/90 hover:text-white shadow-lg cursor-pointer transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[24px]">expand_more</span>
        </button>

        {/* Center Info: NOW PLAYING & Playlist / Album Name */}
        <div className="flex flex-col items-center text-center px-3 max-w-[210px]">
          <div className="flex items-center space-x-1.5 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-ping"></span>
            <span className="text-[10.5px] font-bold tracking-[0.2em] uppercase text-white/70">
              NOW PLAYING
            </span>
          </div>
          <p className="text-xs font-semibold text-white/95 truncate w-full tracking-wide">
            {currentTrack.album || "Senja Akustik Nusantara"}
          </p>
        </div>

        {/* More Options Button */}
        <button
          id="now-playing-more-btn"
          onClick={() => setShowVolumeSlider(!showVolumeSlider)}
          title="Volume"
          aria-label="Kontrol volume"
          className="relative w-11 h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/15 text-white/90 hover:text-white shadow-lg cursor-pointer transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">
            {isMuted ? "volume_off" : volume > 50 ? "volume_up" : volume > 0 ? "volume_down" : "volume_off"}
          </span>

          {/* Volume Slider Popover */}
          {showVolumeSlider && (
            <div
              className="absolute top-14 right-0 w-40 bg-[#1a1715]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMute}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white/80 hover:text-white transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isMuted ? "volume_off" : "volume_up"}
                  </span>
                </button>
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                    style={{
                      background: `linear-gradient(to right, white 0%, white ${isMuted ? 0 : volume}%, rgba(255,255,255,0.2) ${isMuted ? 0 : volume}%, rgba(255,255,255,0.2) 100%)`,
                    }}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-white/40 font-semibold">0</span>
                    <span className="text-[9px] text-white/60 font-bold">{isMuted ? 0 : volume}%</span>
                    <span className="text-[9px] text-white/40 font-semibold">100</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </button>
      </header>

      {/* Middle Spacer / Waveform Tag */}
      <div className="relative z-10 flex-1 flex flex-col justify-end px-6 pb-2 pointer-events-none max-w-[430px] w-full mx-auto">
        <div className="self-start pointer-events-auto mb-3">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-[10.5px] font-semibold text-white/85 tracking-wide shadow-sm">
            <span className="flex items-end gap-0.5 h-3">
              <span className={`w-0.5 bg-white rounded-full ${isPlaying ? "h-3 animate-pulse" : "h-1.5"}`}></span>
              <span className={`w-0.5 bg-white rounded-full ${isPlaying ? "h-4 animate-bounce" : "h-2.5"}`}></span>
              <span className={`w-0.5 bg-white rounded-full ${isPlaying ? "h-2 animate-pulse" : "h-1"}`}></span>
            </span>
            {currentTrack.audioQuality || "LOSSLESS 24-BIT / 96kHz"}
          </span>
        </div>
      </div>

      {/* 5. Bottom Section: Track Info, Seek Bar, Playback Controls & Bottom Row */}
      <div className="relative z-20 px-6 pb-8 pt-2 flex flex-col max-w-[430px] w-full mx-auto">
        {/* Track Info Row + Like Button */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex-1 pr-4 min-w-0">
            <h1 className="text-2xl sm:text-[28px] font-extrabold text-white tracking-tight leading-tight truncate drop-shadow-md font-sans">
              {currentTrack.title}
            </h1>
            <p className="text-[15px] font-medium text-white/75 mt-0.5 truncate tracking-normal">
              {currentTrack.artist}{" "}
              <span className="text-white/40 mx-1">•</span>{" "}
              <span className="text-white/65">{currentTrack.album || "Album Jiwa"}</span>
            </p>
          </div>

          {/* Action Buttons: Like & Options */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Like Button */}
            <button
              id="now-playing-like-btn"
              onClick={() => toggleLike()}
              title={isLiked ? "Hapus dari Favorit" : "Sukai Lagu"}
              aria-label="Sukai lagu ini"
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isLiked ? "text-rose-400 scale-110" : "text-white/70 hover:text-white"
              }`}
            >
              <span
                className="material-symbols-outlined text-[26px]"
                style={isLiked ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                favorite
              </span>
            </button>

            {/* Quick More Button */}
            <button
              onClick={() => toggleDownload(currentTrack)}
              title={downloaded ? "Hapus dari Download" : "Download Lagu"}
              aria-label={downloaded ? "Hapus dari unduhan" : "Unduh lagu ini"}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                downloaded ? "text-green-400 scale-110" : "text-white/80 hover:text-white hover:scale-110"
              } active:scale-95`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={downloaded ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {downloaded ? "download_done" : "download"}
              </span>
            </button>

            {/* Share Button */}
            <button
              onClick={() => setShowShareModal(true)}
              title="Bagikan lagu"
              aria-label="Bagikan lagu ini"
              className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">share</span>
            </button>
            
            {/* Add to Playlist Button */}
            <button
              onClick={() => setShowAddToPlaylistModal(true)}
              title="Tambah ke playlist"
              aria-label="Tambah lagu ke playlist"
              className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
            </button>
          </div>
        </div>

        {/* Playback Seek Bar & Time Stamps */}
        <div className="w-full mb-6">
          <div
            id="now-playing-seek-bar"
            ref={progressRef}
            onClick={handleSeek}
            className="relative group h-6 flex items-center cursor-pointer"
          >
            {/* Background track */}
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm group-hover:h-2 transition-all duration-200">
              {/* Buffer Bar */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 group-hover:h-2 bg-white/30 rounded-full w-[65%] pointer-events-none"></div>
              {/* Played Progress Bar */}
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 group-hover:h-2 bg-white rounded-full pointer-events-none transition-all duration-75 shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>
            {/* Seek Thumb Handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] border border-black/20 group-hover:scale-125 transition-transform duration-150 pointer-events-none"
              style={{ left: `${progressPct}%` }}
            ></div>
          </div>

          {/* Time Indicators */}
          <div className="flex items-center justify-between text-[11.5px] font-semibold text-white/60 -mt-1 px-0.5 tracking-wider font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatRemainingTime(currentTime, duration)}</span>
          </div>
        </div>

        {/* Main Playback Controls: Shuffle, Prev, Large Solid White Play/Pause, Next, Repeat */}
        <div className="flex items-center justify-between px-2 mb-8">
          {/* Shuffle Button */}
          <button
            id="now-playing-shuffle-btn"
            onClick={toggleShuffle}
            title="Acak (Shuffle)"
            aria-label="Mode acak"
            className={`p-2 transition-all active:scale-90 cursor-pointer ${
              isShuffle ? "text-white" : "text-white/50 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">shuffle</span>
          </button>

          {/* Previous Button */}
          <button
            id="now-playing-prev-btn"
            onClick={playPrev}
            title="Lagu Sebelumnya"
            aria-label="Putar lagu sebelumnya"
            className="p-2 text-white/90 hover:text-white active:scale-90 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[32px]">skip_previous</span>
          </button>

          {/* Large Solid White Play/Pause Button */}
          <button
            id="now-playing-play-pause-btn"
            onClick={togglePlay}
            title={isPlaying ? "Jeda Musik" : "Putar Musik"}
            aria-label="Tombol Play atau Pause"
            className="w-[68px] h-[68px] rounded-full bg-white text-black flex items-center justify-center shadow-[0_8px_28px_rgba(255,255,255,0.25)] hover:bg-white/90 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <span
              className="material-symbols-outlined text-[34px] ml-0.5"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isPlaying ? "pause" : "play_arrow"}
            </span>
          </button>

          {/* Next Button */}
          <button
            id="now-playing-next-btn"
            onClick={playNext}
            title="Lagu Berikutnya"
            aria-label="Putar lagu berikutnya"
            className="p-2 text-white/90 hover:text-white active:scale-90 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[32px]">skip_next</span>
          </button>

          {/* Repeat Button */}
          <button
            id="now-playing-repeat-btn"
            onClick={toggleRepeat}
            title="Ulangi (Repeat)"
            aria-label="Ulangi lagu"
            className={`p-2 transition-all active:scale-90 cursor-pointer ${
              isRepeat ? "text-white" : "text-white/50 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">repeat</span>
          </button>
        </div>

        {/* Bottom Row: Queue, Lyrics & Active Audio Device Output (Ponsel) */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
          <div className="flex items-center space-x-2">
            {/* Queue (Antrean) Button */}
            <button
              id="now-playing-queue-btn"
              onClick={() => setIsQueueOpen(true)}
              title="Daftar Antrean"
              aria-label="Buka daftar antrean lagu"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-md border border-white/[0.1] text-xs font-semibold text-white/85 hover:text-white transition-all cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">queue_music</span>
              <span>Antrean</span>
            </button>

            {/* Lyrics (Lirik) Button -> Opens Lyrics Modal */}
            <button
              id="now-playing-lyrics-btn"
              onClick={() => {
                setIsNowPlayingOpen(false);
                setIsLyricsOpen(true);
              }}
              title="Lirik Musik"
              aria-label="Buka lirik lagu sinkron"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-md border border-white/[0.1] text-xs font-semibold text-white/85 hover:text-white transition-all cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">lyrics</span>
              <span>Lirik</span>
            </button>
          </div>

          {/* Right: Active Audio Device Pill (Ponsel) */}
          <button
            title="Perangkat Audio: Ponsel (Speaker)"
            aria-label="Pilih perangkat audio"
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] backdrop-blur-md border border-white/20 text-white transition-all cursor-pointer shadow-sm group active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">
              speaker
            </span>
            <span className="text-xs font-bold tracking-wide">Ponsel</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </button>
        </div>
      </div>

      {/* Share Song Modal */}
      <ShareSongModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        song={currentTrack}
      />

      {/* Add to Playlist Modal */}
      <AddToPlaylistModal
        isOpen={showAddToPlaylistModal}
        onClose={() => setShowAddToPlaylistModal(false)}
        song={currentTrack}
      />
    </div>
  );
};
