import React, { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { ShareSongModal } from "./ShareSongModal";
import { AddToPlaylistModal } from "./AddToPlaylistModal";

export const MiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    playNext,
    setIsNowPlayingOpen,
    isNowPlayingOpen,
    isLyricsOpen,
  } = usePlayer();

  const [showShareModal, setShowShareModal] = useState(false);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  if (isNowPlayingOpen || isLyricsOpen) return null;

  const progressPct = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div
      id="floating-mini-player"
      className="fixed bottom-[74px] left-0 right-0 z-40 px-4 pb-safe pointer-events-none flex justify-center"
    >
      <div className="relative w-full max-w-[410px] pointer-events-auto">
        {/* Subtle Ambient Glow */}
        <div className="absolute -inset-1 rounded-full bg-white/[0.06] blur-lg -z-10 opacity-70 pointer-events-none"></div>

        {/* Mini Player Pill Capsule */}
        <div className="relative w-full rounded-full bg-[#100f0e]/85 backdrop-blur-[24px] border border-white/15 p-2 pl-2.5 pr-3 flex items-center justify-between shadow-[0_12px_32px_rgba(0,0,0,0.8)] overflow-hidden group">
          {/* Linear Progress Bar at bottom */}
          <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-white/10 rounded-full overflow-hidden pointer-events-none">
            <div
              className="h-full bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.5)] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>

          {/* Left: Thumbnail & Info (Clickable to open Now Playing) */}
          <div
            onClick={() => setIsNowPlayingOpen(true)}
            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer pr-2 select-none"
            role="button"
            aria-label="Buka Pemutar Musik Lengkap"
          >
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-white/20 shadow-md bg-[#1a1715]">
              <img
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="min-w-0 flex-1 flex flex-col justify-center">
              <p className="text-xs font-bold text-white truncate leading-tight group-hover:text-white/90 transition-colors">
                {currentTrack.title}
              </p>
              <p className="text-[10.5px] text-white/55 truncate leading-tight mt-0.5">
                {currentTrack.artist} {currentTrack.album ? `• ${currentTrack.album}` : ""}
              </p>
            </div>
          </div>

          {/* Right: Controls (Next + Solid Play/Pause Circle) */}
          <div className="flex items-center gap-1.5 flex-shrink-0 pl-1 z-10">
            {/* Quick Actions Menu Button (3-dot) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowQuickActions(!showQuickActions);
              }}
              title="Opsi Lainnya"
              aria-label="Menu opsi lagu"
              className="w-9 h-9 flex items-center justify-center rounded-full text-white/70 hover:text-white active:scale-90 transition-transform cursor-pointer relative"
            >
              <span className="material-symbols-outlined text-[18px]">more_vert</span>

              {/* Quick Actions Popover */}
              {showQuickActions && (
                <div
                  className="absolute bottom-12 right-0 w-48 bg-[#1a1715]/95 backdrop-blur-xl border border-white/15 rounded-2xl overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddToPlaylistModal(true);
                      setShowQuickActions(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-white transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-[18px]">playlist_add</span>
                    <span className="text-sm font-medium">Tambah ke Playlist</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowShareModal(true);
                      setShowQuickActions(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-white transition-colors text-left border-t border-white/10"
                  >
                    <span className="material-symbols-outlined text-[18px]">share</span>
                    <span className="text-sm font-medium">Bagikan Lagu</span>
                  </button>
                </div>
              )}
            </button>

            {/* Skip Next Button */}
            <button
              id="mini-next-btn"
              onClick={(e) => {
                e.stopPropagation();
                playNext();
              }}
              title="Lagu Berikutnya"
              aria-label="Putar lagu berikutnya"
              className="w-9 h-9 flex items-center justify-center rounded-full text-white/70 hover:text-white active:scale-90 transition-transform cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                skip_next
              </span>
            </button>

            {/* Play/Pause Button (Solid Pure White Circle) */}
            <button
              id="mini-play-pause-btn"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              title={isPlaying ? "Jeda" : "Putar"}
              aria-label={isPlaying ? "Jeda musik" : "Putar musik"}
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-[0_2px_14px_rgba(255,255,255,0.25)] hover:bg-white/90 hover:scale-105 active:scale-90 transition-all cursor-pointer"
            >
              <span
                className="material-symbols-outlined text-[22px] ml-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {isPlaying ? "pause" : "play_arrow"}
              </span>
            </button>
          </div>
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
