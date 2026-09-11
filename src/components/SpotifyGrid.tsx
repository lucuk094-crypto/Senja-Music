import React from "react";
import { Song } from "../types";

interface SpotifyGridProps {
  title: string;
  songs: Song[];
  isPlaying: boolean;
  currentTrack: Song;
  onSongClick: (song: Song) => void;
  showAll?: () => void;
}

export const SpotifyGrid: React.FC<SpotifyGridProps> = ({
  title,
  songs,
  isPlaying,
  currentTrack,
  onSongClick,
  showAll,
}) => {
  const isCurrentSong = (song: Song) => {
    const currentVideoId = (currentTrack as any).videoId || currentTrack.id;
    const targetVideoId = (song as any).videoId || song.id;
    return Boolean(currentVideoId && targetVideoId && currentVideoId === targetVideoId);
  };

  if (songs.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5 px-2">
        <h2 className="text-2xl font-black text-white tracking-tight hover:underline cursor-pointer">
          {title}
        </h2>
        {showAll && (
          <button
            onClick={showAll}
            className="text-sm font-bold text-neutral-400 hover:text-white transition-colors uppercase tracking-wider"
          >
            Show all
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 px-2">
        {songs.map((song) => {
          const isActive = isCurrentSong(song);
          
          return (
            <div
              key={song.id}
              onClick={() => onSongClick(song)}
              className="group cursor-pointer rounded-md p-4 bg-neutral-900/40 hover:bg-neutral-800/60 transition-all duration-300"
            >
              {/* Album Cover */}
              <div className="relative aspect-square w-full rounded-md overflow-hidden mb-4 shadow-lg">
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // Fallback to YouTube thumbnail
                    target.src = `https://i.ytimg.com/vi/${song.id}/hqdefault.jpg`;
                  }}
                />
                
                {/* Play Button Overlay - Spotify Style */}
                <div
                  className={`absolute bottom-2 right-2 w-12 h-12 rounded-full bg-green-500 hover:bg-green-400 hover:scale-110 flex items-center justify-center shadow-2xl transition-all duration-300 ${
                    isActive
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-black text-[26px] ml-0.5"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {isActive && isPlaying ? "pause" : "play_arrow"}
                  </span>
                </div>
              </div>

              {/* Song Info */}
              <div className="space-y-1">
                <h3
                  className={`text-base font-bold truncate ${
                    isActive ? "text-green-400" : "text-white"
                  } group-hover:text-green-400 transition-colors`}
                  title={song.title}
                >
                  {song.title}
                </h3>
                <p className="text-sm text-neutral-400 truncate" title={song.artist}>
                  {song.artist}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
