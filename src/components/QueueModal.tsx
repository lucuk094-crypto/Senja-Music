import React from "react";
import { usePlayer } from "../context/PlayerContext";
import { Song } from "../types";
import { formatTime } from "../utils/format";

export const QueueModal: React.FC = () => {
  const {
    queue,
    currentTrack,
    isQueueOpen,
    setIsQueueOpen,
    playFromQueue,
    removeFromQueue,
    clearQueue,
    moveQueueItem,
    isPlaying,
  } = usePlayer();

  if (!isQueueOpen) return null;

  const currentIndex = queue.findIndex((s) => s.id === currentTrack.id);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (fromIndex !== toIndex) {
      moveQueueItem(fromIndex, toIndex);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-end justify-center animate-in fade-in duration-300"
      onClick={() => setIsQueueOpen(false)}
    >
      <div
        className="w-full max-w-[440px] bg-[#0f0e0d] rounded-t-3xl border-t border-x border-white/15 overflow-hidden flex flex-col max-h-[85vh] shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0f0e0d]/95 backdrop-blur-xl border-b border-white/10 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsQueueOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
                aria-label="Tutup antrean"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
              <div>
                <h2 className="text-lg font-extrabold text-white tracking-tight">Antrean</h2>
                <p className="text-xs text-white/50 font-medium">{queue.length} lagu</p>
              </div>
            </div>

            {queue.length > 1 && (
              <button
                onClick={clearQueue}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all active:scale-95"
              >
                Hapus Semua
              </button>
            )}
          </div>

          {/* Now Playing Indicator */}
          {currentIndex >= 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10">
              <div className="flex items-center gap-1.5">
                {isPlaying && (
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 h-3 bg-white rounded-full animate-pulse"></span>
                    <span className="w-0.5 h-4 bg-white rounded-full animate-bounce"></span>
                    <span className="w-0.5 h-2 bg-white rounded-full animate-pulse"></span>
                  </div>
                )}
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
                  Sedang Diputar
                </span>
              </div>
              <span className="text-[10px] text-white/50">•</span>
              <span className="text-[10px] text-white/60 truncate flex-1">
                {currentTrack.title}
              </span>
            </div>
          )}
        </div>

        {/* Queue List */}
        <div className="flex-1 overflow-y-auto px-5 py-3 no-scrollbar">
          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="material-symbols-outlined text-[48px] text-white/20 mb-3">
                queue_music
              </span>
              <p className="text-sm font-semibold text-white/60">Antrean kosong</p>
              <p className="text-xs text-white/40 mt-1">Tambahkan lagu untuk mulai mendengarkan</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {queue.map((song, index) => {
                const isCurrent = index === currentIndex;
                return (
                  <div
                    key={`${song.id}-${index}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`group flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-white/[0.12] border border-white/20"
                        : "bg-white/[0.04] hover:bg-white/[0.08] border border-transparent"
                    }`}
                    onClick={() => !isCurrent && playFromQueue(index)}
                  >
                    {/* Drag Handle */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-[18px] text-white/40 cursor-grab active:cursor-grabbing">
                        drag_indicator
                      </span>
                    </div>

                    {/* Thumbnail */}
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-black/30">
                      <img
                        src={song.thumbnail}
                        alt={song.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {isCurrent && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-[20px]">
                            {isPlaying ? "volume_up" : "pause"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-bold truncate ${
                          isCurrent ? "text-white" : "text-white/90"
                        }`}
                      >
                        {song.title}
                      </p>
                      <p className="text-xs text-white/50 truncate">{song.artist}</p>
                    </div>

                    {/* Duration & Remove Button */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-white/40 font-medium tabular-nums">
                        {formatTime(song.duration || 0)}
                      </span>
                      {!isCurrent && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromQueue(index);
                          }}
                          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 text-white/50 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                          aria-label="Hapus dari antrean"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
