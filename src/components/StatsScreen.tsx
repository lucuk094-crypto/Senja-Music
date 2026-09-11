import React, { useState } from "react";
import { usePlayer } from "../context/PlayerContext";

export const StatsScreen: React.FC = () => {
  const { playTrack, feed, listeningStats, currentTrack, isPlaying } = usePlayer();
  const [timeFilter, setTimeFilter] = useState<"continuous" | "1week" | "1month" | "3months">("1month");

  // Format seconds to hours/minutes
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} jam ${minutes} min`;
    }
    return `${minutes} menit`;
  };

  // Get top artist
  const topArtist = listeningStats.topArtists[0] || {
    name: "Nadin Amizah",
    playCount: 42,
    thumbnail: "https://lh3.googleusercontent.com/aida/AEtjO1VY4KdWS7zOzoLqOa3TRPpttDSJm5qDTedUqM3bfzBv0Nbu3DcVaY0PuPRIKyEdrkir6ULFfxUGURZq6k1XvMkyOLaj4xtCyDnb66Csd9tHQisQ3BO30-DeJHIntN2edB7fHl6FcqUBfgroZgRiyW6lLPt0huSAurxthNtnE1EmvYPFO4W_T5AIb8Qiv1oQScaDnX_idvoMBgpSJ1pBg0e7D_0B_QYNr82Fuj24UaVARVwN3kOuZ-9Xvqg",
  };

  // Get top song
  const topSong = listeningStats.topSongs[0] || {
    song: feed.nowPlayingInitial,
    playCount: 86,
  };

  const isCurrentSongActive = (songId: string) => {
    const currentVideoId = (currentTrack as any).videoId || currentTrack.id;
    return Boolean(currentVideoId && songId && currentVideoId === songId);
  };

  return (
    <div id="stats-screen-view" className="flex-1 overflow-y-auto pb-44 pt-4 px-4 sm:px-6 max-w-[440px] mx-auto w-full no-scrollbar">
      {/* Top Header */}
      <header className="flex items-center justify-between py-2 mb-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest text-white/50 uppercase">
            STATISTIK MENDENGAR
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">
            Stats
          </h1>
        </div>

        <button
          title="Filter Data"
          aria-label="Filter statistik"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.15] backdrop-blur-md border border-white/10 text-white/80 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">bar_chart</span>
        </button>
      </header>

      {/* Filter Pills */}
      <section className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1 mb-6">
        <button
          onClick={() => setTimeFilter("continuous")}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            timeFilter === "continuous"
              ? "bg-white text-black font-bold shadow-md"
              : "bg-white/[0.05] text-white/60 hover:text-white border border-white/5"
          }`}
        >
          <span>Continuous</span>
          <span className="material-symbols-outlined text-[14px]">expand_more</span>
        </button>

        <button
          onClick={() => setTimeFilter("1week")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            timeFilter === "1week"
              ? "bg-white text-black font-bold shadow-md"
              : "bg-white/[0.05] text-white/60 hover:text-white border border-white/5"
          }`}
        >
          1 weeks
        </button>

        <button
          onClick={() => setTimeFilter("1month")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            timeFilter === "1month"
              ? "bg-white text-black font-bold shadow-md"
              : "bg-white/[0.05] text-white/60 hover:text-white border border-white/5"
          }`}
        >
          1 months
        </button>

        <button
          onClick={() => setTimeFilter("3months")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            timeFilter === "3months"
              ? "bg-white text-black font-bold shadow-md"
              : "bg-white/[0.05] text-white/60 hover:text-white border border-white/5"
          }`}
        >
          3 months
        </button>
      </section>

      {/* 2-Column Summary Metrics */}
      <section className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-sm">
          <div className="flex items-center space-x-1.5 text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">
            <span className="material-symbols-outlined text-[14px] text-white/70">schedule</span>
            <span>TOTAL WAKTU</span>
          </div>
          <p className="text-2xl font-black text-white tracking-tight">
            {formatTime(listeningStats.totalListeningTime)}
          </p>
          <span className={`inline-flex items-center space-x-1 text-[11px] font-bold mt-1 ${
            listeningStats.weeklyGrowth >= 0 ? "text-emerald-400" : "text-rose-400"
          }`}>
            <span className="material-symbols-outlined text-[13px]">
              {listeningStats.weeklyGrowth >= 0 ? "trending_up" : "trending_down"}
            </span>
            <span>{listeningStats.weeklyGrowth >= 0 ? "+" : ""}{listeningStats.weeklyGrowth.toFixed(0)}% dari pekan lalu</span>
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-sm">
          <div className="flex items-center space-x-1.5 text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">
            <span className="material-symbols-outlined text-[14px] text-amber-400">music_note</span>
            <span>LAGU UNIK</span>
          </div>
          <p className="text-2xl font-black text-white tracking-tight">
            {listeningStats.uniqueSongs} lagu
          </p>
          <span className="text-[11px] font-medium text-white/50 mt-1 block">
            {listeningStats.uniqueArtists} artis berbeda
          </span>
        </div>
      </section>

      {/* Global Stats & Leaderboard Ranking */}
      <section className="p-5 rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 backdrop-blur-md mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-white/70"></span>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Statistik Global
            </h3>
          </div>
          <button
            title="Muat Ulang Data"
            aria-label="Segarkan statistik"
            className="text-white/40 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border-r border-white/10 pr-3">
            <span className="text-[10.5px] font-bold text-white/50 uppercase tracking-wider">
              TOP LISTENER
            </span>
            <p className="text-xl font-black text-white mt-1">
              Top 2.5%
            </p>
            <span className="text-[10.5px] text-white/50">Di wilayah Indonesia</span>
          </div>

          <div className="pl-3">
            <span className="text-[10.5px] font-bold text-white/50 uppercase tracking-wider">
              PERINGKATMU
            </span>
            <p className="text-xl font-black text-white mt-1">
              #1,420
            </p>
            <span className="text-[10.5px] text-white/50">Dari 280k+ user</span>
          </div>
        </div>
      </section>

      {/* Highlights: Favourite Artist */}
      <section className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md mb-6 relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-[10.5px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">hotel_class</span>
            <span>FAVOURITE ARTIST</span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[9.5px] font-bold border border-white/15">
            #1 DI BULAN INI
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 flex-shrink-0 shadow-lg">
            <img
              src={topArtist.thumbnail || "https://i.ytimg.com/vi/2A9Atl2hUkg/hqdefault.jpg"}
              alt={topArtist.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-base font-extrabold text-white truncate">
              {topArtist.name}
            </h4>
            <p className="text-xs text-white/60 mt-0.5">
              {topArtist.playCount} kali diputar
            </p>
            <span className="text-[11px] text-white/70 font-semibold mt-1 inline-block">
              {listeningStats.topSongs.filter((s) => s.song.artist === topArtist.name).length} lagu di top charts
            </span>
          </div>
        </div>
      </section>

      {/* Highlights: Favourite Song */}
      <section
        onClick={() => playTrack(topSong.song)}
        className="p-5 rounded-3xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 backdrop-blur-md cursor-pointer transition-all group shadow-sm mb-6"
      >
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-[10.5px] font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">favorite</span>
            <span>FAVOURITE SONG</span>
          </span>
          <span className="text-xs text-white/40">Putar Ulang</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3.5 min-w-0 flex-1">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/15 flex-shrink-0 shadow-md">
              <img
                src={topSong.song.thumbnail}
                alt={topSong.song.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-white truncate group-hover:text-white transition-colors">
                {topSong.song.title}
              </h4>
              <p className="text-xs text-white/60 truncate mt-0.5">
                {topSong.song.artist} • {topSong.song.album}
              </p>
              <span className="text-[10.5px] text-white/40 font-semibold mt-1 inline-block">
                Diputar {topSong.playCount}x • Top track #1
              </span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              playTrack(topSong.song);
            }}
            title="Putar Lagu Favorit"
            aria-label="Putar lagu favorit"
            className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center flex-shrink-0 shadow-[0_4px_20px_rgba(255,255,255,0.25)] group-hover:scale-110 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[24px] ml-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isCurrentSongActive(topSong.song.id) && isPlaying ? "pause" : "play_arrow"}
            </span>
          </button>
        </div>
      </section>

      {/* Top 10 Songs List */}
      {listeningStats.topSongs.length > 1 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Top 10 Lagu Kamu</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/70"></span>
            </h3>
          </div>

          <div className="space-y-2">
            {listeningStats.topSongs.slice(0, 10).map((item, index) => {
              const isActive = isCurrentSongActive(item.song.id);
              return (
                <div
                  key={item.song.id}
                  onClick={() => playTrack(item.song)}
                  className="flex items-center space-x-3 p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/15 transition-all cursor-pointer group"
                >
                  <span className="font-mono text-sm font-bold text-white/40 group-hover:text-white w-6 text-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-[#141211] border border-white/10">
                    <img
                      src={item.song.thumbnail}
                      alt={item.song.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className={`text-sm font-bold truncate ${isActive ? "text-white font-extrabold" : "text-white"}`}>
                      {item.song.title}
                    </h4>
                    <p className="text-xs text-white/55 truncate mt-0.5">
                      {item.song.artist}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[10px] font-bold text-white/60">
                      {item.playCount}x
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
      )}

      {/* Top Artists List */}
      {listeningStats.topArtists.length > 1 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Top Artis Kamu</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {listeningStats.topArtists.slice(0, 6).map((artist, index) => (
              <div
                key={artist.name}
                className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/15 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-2.5 mb-2">
                  <span className="text-xl font-black text-white/30 group-hover:text-white/50">
                    #{index + 1}
                  </span>
                  {artist.thumbnail && (
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/15 flex-shrink-0">
                      <img
                        src={artist.thumbnail}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white truncate group-hover:text-white">
                  {artist.name}
                </h4>
                <p className="text-xs text-white/50 mt-0.5">
                  {artist.playCount} kali putar
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
