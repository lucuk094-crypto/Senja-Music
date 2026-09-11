import React, { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { Song } from "../types";

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  isOpen,
  onClose,
  song,
}) => {
  const { playlists, createPlaylist, addToPlaylist } = usePlayer();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [addedToPlaylists, setAddedToPlaylists] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleCreateAndAdd = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      // Get the newly created playlist (it should be the first one after creation)
      setTimeout(() => {
        if (playlists.length > 0) {
          const newPlaylist = playlists[0];
          addToPlaylist(newPlaylist.id, song);
          setAddedToPlaylists(new Set([newPlaylist.id]));
        }
        setNewPlaylistName("");
        setShowCreateForm(false);
      }, 100);
    }
  };

  const handleAddToPlaylist = (playlistId: string) => {
    addToPlaylist(playlistId, song);
    setAddedToPlaylists((prev) => new Set(prev).add(playlistId));
    setTimeout(() => {
      setAddedToPlaylists((prev) => {
        const next = new Set(prev);
        next.delete(playlistId);
        return next;
      });
    }, 2000);
  };

  const isInPlaylist = (playlistId: string) => {
    const playlist = playlists.find((p) => p.id === playlistId);
    return playlist?.tracks.some((t) => t.id === song.id) || false;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-end justify-center animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] bg-[#0f0e0d] rounded-t-3xl border-t border-x border-white/15 overflow-hidden flex flex-col max-h-[75vh] shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0f0e0d]/95 backdrop-blur-xl border-b border-white/10 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
                aria-label="Tutup"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
              <h2 className="text-lg font-extrabold text-white tracking-tight">
                Tambah ke Playlist
              </h2>
            </div>
          </div>

          {/* Song Info Card */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.06] border border-white/10">
            <img
              src={song.thumbnail}
              alt={song.title}
              className="w-12 h-12 rounded-lg object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{song.title}</p>
              <p className="text-xs text-white/60 truncate">{song.artist}</p>
            </div>
          </div>
        </div>

        {/* Playlist List */}
        <div className="flex-1 overflow-y-auto px-5 py-3 no-scrollbar">
          {/* Create New Playlist Button */}
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 text-white transition-all mb-3 group"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[20px]">add</span>
              </div>
              <span className="text-sm font-semibold">Buat Playlist Baru</span>
            </button>
          ) : (
            <div className="mb-3 p-4 rounded-xl bg-white/[0.08] border border-white/10">
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateAndAdd()}
                placeholder="Nama playlist..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 mb-2"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateAndAdd}
                  disabled={!newPlaylistName.trim()}
                  className="flex-1 px-3 py-2 rounded-lg bg-white text-black font-semibold text-xs hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buat & Tambahkan
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewPlaylistName("");
                  }}
                  className="px-3 py-2 rounded-lg bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition-all"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Existing Playlists */}
          {playlists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-white/20 mb-3">
                library_music
              </span>
              <p className="text-sm font-semibold text-white/60">Belum ada playlist</p>
              <p className="text-xs text-white/40 mt-1">Buat playlist pertamamu sekarang</p>
            </div>
          ) : (
            <div className="space-y-2">
              {playlists.map((playlist) => {
                const inPlaylist = isInPlaylist(playlist.id);
                const justAdded = addedToPlaylists.has(playlist.id);
                const coverImage =
                  playlist.cover || playlist.tracks[0]?.thumbnail || song.thumbnail;

                return (
                  <button
                    key={playlist.id}
                    onClick={() => !inPlaylist && handleAddToPlaylist(playlist.id)}
                    disabled={inPlaylist}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      inPlaylist
                        ? "bg-white/[0.04] border border-white/10 cursor-default"
                        : "bg-white/[0.06] hover:bg-white/[0.1] border border-transparent cursor-pointer"
                    }`}
                  >
                    <img
                      src={coverImage}
                      alt={playlist.name}
                      className="w-12 h-12 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-bold text-white truncate">{playlist.name}</p>
                      <p className="text-xs text-white/50">
                        {playlist.tracks.length} lagu • {playlist.creator}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {inPlaylist ? (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[18px] text-white/60">
                            check
                          </span>
                        </div>
                      ) : justAdded ? (
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[18px] text-green-400">
                            check
                          </span>
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                          <span className="material-symbols-outlined text-[18px] text-white/70">
                            add
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
