import React, { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { Song } from "../types";

export const LibraryScreen: React.FC = () => {
  const {
    playTrack,
    feed,
    setActiveTab,
    setIsSettingsOpen,
    likedSongs,
    playlists,
    downloadedSongs,
    createPlaylist,
    deletePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    toggleDownload,
    isDownloaded,
    currentTrack,
    isPlaying,
  } = usePlayer();

  const [activeTabPill, setActiveTabPill] = useState<"playlists" | "songs" | "albums" | "artists" | "local">("playlists");
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"overview" | "downloaded" | "liked" | "top50" | "local">("overview");
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [exportModalOpen, setExportModalOpen] = useState<"spotify" | "youtube" | null>(null);

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName("");
      setIsCreatingPlaylist(false);
    }
  };

  const handleDeletePlaylist = (playlistId: string) => {
    if (confirm("Hapus playlist ini?")) {
      deletePlaylist(playlistId);
      setShowPlaylistMenu(null);
    }
  };

  const isCurrentSongActive = (song: Song) => {
    const currentVideoId = (currentTrack as any).videoId || currentTrack.id;
    const targetVideoId = (song as any).videoId || song.id;
    return Boolean(currentVideoId && targetVideoId && currentVideoId === targetVideoId);
  };

  const handleBentoItemClick = (title: string) => {
    switch (title) {
      case "Downloaded":
        setViewMode("downloaded");
        break;
      case "Liked Songs":
        setViewMode("liked");
        break;
      case "My Top 50":
        setViewMode("top50");
        break;
      case "Local Files":
        setViewMode("local");
        setActiveTabPill("local");
        break;
      case "Import Spotify":
        setExportModalOpen("spotify");
        break;
      case "Import YouTube":
        setExportModalOpen("youtube");
        break;
    }
  };

  const handleLocalFileUpload = (files: FileList) => {
    const audioFiles = Array.from(files).filter(file => 
      file.type.startsWith('audio/')
    );
    
    if (audioFiles.length > 0) {
      setLocalFiles(prev => [...prev, ...audioFiles]);
      alert(`✅ ${audioFiles.length} file berhasil ditambahkan!\n\nNote: Fitur playback untuk local files memerlukan custom audio player. Saat ini file hanya tersimpan di memory.`);
    } else {
      alert('❌ Tidak ada file audio yang valid.\n\nFormat yang didukung: MP3, WAV, OGG, M4A');
    }
  };

  const generateSpotifyExport = () => {
    const songs = likedSongs.length > 0 ? likedSongs : (listeningStats.topSongs.map(t => t.song));
    const playlist = songs.map(song => 
      `${song.artist} - ${song.title}`
    ).join('\n');
    
    const blob = new Blob([playlist], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'senja-musik-playlist-for-spotify.txt';
    a.click();
    URL.revokeObjectURL(url);
    
    alert('✅ Playlist exported!\n\nFile downloaded: senja-musik-playlist-for-spotify.txt\n\nCara import ke Spotify:\n1. Buka Spotify\n2. Buat playlist baru\n3. Search & tambahkan lagu sesuai list');
  };

  const generateYouTubeExport = () => {
    const songs = likedSongs.length > 0 ? likedSongs : (listeningStats.topSongs.map(t => t.song));
    const playlist = songs.map(song => 
      `https://youtube.com/watch?v=${song.id} | ${song.artist} - ${song.title}`
    ).join('\n');
    
    const blob = new Blob([playlist], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'senja-musik-playlist-youtube-links.txt';
    a.click();
    URL.revokeObjectURL(url);
    
    alert('✅ Playlist exported!\n\nFile downloaded: senja-musik-playlist-youtube-links.txt\n\nBerisi link YouTube untuk semua lagu di playlist Anda');
  };

  const handleTabPillClick = (tab: "playlists" | "songs" | "albums" | "artists" | "local") => {
    setActiveTabPill(tab);
    setViewMode("overview");
    setSelectedPlaylist(null);
  };

  const bentoItems = [
    { 
      title: "Downloaded", 
      desc: `${downloadedSongs.length} track offline`, 
      icon: "download_done", 
      color: "text-emerald-400",
      count: downloadedSongs.length 
    },
    { 
      title: "Liked Songs", 
      desc: `${likedSongs.length} lagu disukai`, 
      icon: "favorite", 
      color: "text-rose-400",
      count: likedSongs.length 
    },
    { 
      title: "My Top 50", 
      desc: "Paling sering diputar", 
      icon: "military_tech", 
      color: "text-amber-300",
      count: 50 
    },
    { 
      title: "Local Files", 
      desc: "45 berkas audio", 
      icon: "folder", 
      color: "text-cyan-400",
      count: 45 
    },
    { 
      title: "Import Spotify", 
      desc: "Sinkronisasi playlist", 
      icon: "sync", 
      color: "text-emerald-400",
      count: 0 
    },
    { 
      title: "Import YouTube", 
      desc: "Impor dari akun YT", 
      icon: "smart_display", 
      color: "text-rose-400",
      count: 0 
    },
  ];

  const keepListeningItems = feed.shelves?.find((s: any) => s.title === "Keep listening")?.items || [];
  const kemarauChillItems = feed.shelves?.find((s: any) => s.title === "Kemarau Chill")?.items || [];
  
  const userPlaylists = playlists.length > 0 ? playlists : [
    {
      id: "pl-default-1",
      name: "Senja Akustik Nusantara",
      tracks: keepListeningItems.slice(0, 5),
      creator: "Amanda",
      createdAt: Date.now(),
      cover: keepListeningItems[0]?.thumbnail || "https://i.ytimg.com/vi/rqHkc6dAkVQ/hqdefault.jpg",
    },
    {
      id: "pl-default-2",
      name: "Deep Focus & Coding Flow",
      tracks: kemarauChillItems.slice(0, 4),
      creator: "Amanda",
      createdAt: Date.now(),
      cover: keepListeningItems[1]?.thumbnail || "https://i.ytimg.com/vi/xRj_V3s-xN0/hqdefault.jpg",
    },
    {
      id: "pl-default-3",
      name: "Workout Beast Mood",
      tracks: keepListeningItems.slice(0, 3),
      creator: "Amanda",
      createdAt: Date.now(),
      cover: kemarauChillItems[1]?.thumbnail || "https://i.ytimg.com/vi/3D8_fN_g51Y/hqdefault.jpg",
    },
  ];

  return (
    <div id="library-screen-view" className="flex-1 overflow-y-auto pb-44 pt-4 px-4 sm:px-6 max-w-[440px] mx-auto w-full no-scrollbar">
      {/* Top Header */}
      <header className="flex items-center justify-between py-2 mb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Library
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Koleksi tersimpan di Senja Music
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab("search")}
            title="Cari di Library"
            aria-label="Cari di Library"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.15] backdrop-blur-md border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            title="Pengaturan"
            aria-label="Buka Pengaturan"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.15] backdrop-blur-md border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
        </div>
      </header>

      {/* Category Tabs */}
      <section className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1 mb-5">
        {(["playlists", "songs", "albums", "artists", "local"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabPillClick(tab)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
              activeTabPill === tab
                ? "bg-white text-black shadow-md font-bold scale-100"
                : "bg-white/[0.05] text-white/60 hover:text-white border border-white/5 hover:bg-white/[0.08]"
            }`}
          >
            {tab === "local" ? "Local files" : tab}
          </button>
        ))}
      </section>

      {/* Conditional Content Based on ViewMode and ActiveTab */}
      {viewMode === "downloaded" && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <button
                onClick={() => setViewMode("overview")}
                className="flex items-center space-x-1 text-white/60 hover:text-white mb-2"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span className="text-xs font-semibold">Kembali</span>
              </button>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">download_done</span>
                Downloaded Songs
              </h2>
              <p className="text-xs text-white/50 mt-1">{downloadedSongs.length} lagu tersimpan offline</p>
            </div>
          </div>

          {downloadedSongs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="material-symbols-outlined text-[64px] text-white/20 mb-3">download</span>
              <p className="text-sm font-semibold text-white/60">Belum ada lagu yang didownload</p>
              <p className="text-xs text-white/40 mt-1">Klik icon download di player untuk menyimpan lagu</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {downloadedSongs.map((song) => {
                const isActive = isCurrentSongActive(song);
                return (
                  <div key={song.id} onClick={() => playTrack(song)} className="group cursor-pointer">
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#141211] border border-white/10 mb-2 shadow-md">
                      <img
                        src={song.thumbnail}
                        alt={song.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className={`absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-lg transition-all ${
                        isActive ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                      }`}>
                        <span className="material-symbols-outlined text-[18px] ml-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {isActive && isPlaying ? "pause" : "play_arrow"}
                        </span>
                      </div>
                    </div>
                    <h4 className={`text-xs font-bold truncate ${isActive ? "text-white" : "text-white/90"}`}>{song.title}</h4>
                    <p className="text-[10.5px] text-white/55 truncate mt-0.5">{song.artist}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {viewMode === "liked" && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <button
                onClick={() => setViewMode("overview")}
                className="flex items-center space-x-1 text-white/60 hover:text-white mb-2"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span className="text-xs font-semibold">Kembali</span>
              </button>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-400" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                Liked Songs
              </h2>
              <p className="text-xs text-white/50 mt-1">{likedSongs.length} lagu yang disukai</p>
            </div>
            {likedSongs.length > 0 && (
              <button
                onClick={() => playTrack(likedSongs[0])}
                className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-110 transition-all"
              >
                <span className="material-symbols-outlined text-[24px] ml-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                  play_arrow
                </span>
              </button>
            )}
          </div>

          {likedSongs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="material-symbols-outlined text-[64px] text-white/20 mb-3">favorite</span>
              <p className="text-sm font-semibold text-white/60">Belum ada lagu yang disukai</p>
              <p className="text-xs text-white/40 mt-1">Klik icon hati di player untuk menyukai lagu</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {likedSongs.map((song) => {
                const isActive = isCurrentSongActive(song);
                return (
                  <div key={song.id} onClick={() => playTrack(song)} className="group cursor-pointer">
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#141211] border border-white/10 mb-2 shadow-md">
                      <img
                        src={song.thumbnail}
                        alt={song.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className={`absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-lg transition-all ${
                        isActive ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                      }`}>
                        <span className="material-symbols-outlined text-[18px] ml-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {isActive && isPlaying ? "pause" : "play_arrow"}
                        </span>
                      </div>
                    </div>
                    <h4 className={`text-xs font-bold truncate ${isActive ? "text-white" : "text-white/90"}`}>{song.title}</h4>
                    <p className="text-[10.5px] text-white/55 truncate mt-0.5">{song.artist}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {viewMode === "top50" && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <button
                onClick={() => setViewMode("overview")}
                className="flex items-center space-x-1 text-white/60 hover:text-white mb-2"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span className="text-xs font-semibold">Kembali</span>
              </button>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">military_tech</span>
                My Top 50
              </h2>
              <p className="text-xs text-white/50 mt-1">Lagu paling sering diputar</p>
            </div>
            {listeningStats.topSongs.length > 0 && (
              <button
                onClick={() => playTrack(listeningStats.topSongs[0].song)}
                className="w-12 h-12 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg hover:scale-110 transition-all"
              >
                <span className="material-symbols-outlined text-[24px] ml-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                  play_arrow
                </span>
              </button>
            )}
          </div>

          {listeningStats.topSongs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="material-symbols-outlined text-[64px] text-white/20 mb-3">query_stats</span>
              <p className="text-sm font-semibold text-white/60">Belum ada data listening</p>
              <p className="text-xs text-white/40 mt-1">Putar beberapa lagu untuk melihat statistik</p>
            </div>
          ) : (
            <div className="space-y-2">
              {listeningStats.topSongs.map((item, index) => {
                const isActive = isCurrentSongActive(item.song);
                return (
                  <div
                    key={item.song.id}
                    onClick={() => playTrack(item.song)}
                    className="flex items-center space-x-3 p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 transition-all cursor-pointer group"
                  >
                    <div className="w-8 flex items-center justify-center flex-shrink-0">
                      <span className={`text-sm font-black ${
                        index < 3 ? 'text-amber-400' : 'text-white/40'
                      }`}>
                        #{index + 1}
                      </span>
                    </div>
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#141211] border border-white/10">
                      <img
                        src={item.song.thumbnail}
                        alt={item.song.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      {isActive && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-[20px]">
                            {isPlaying ? "volume_up" : "pause"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-bold truncate ${isActive ? "text-white" : "text-white/90"}`}>
                        {item.song.title}
                      </h4>
                      <p className="text-xs text-white/50 truncate mt-0.5">{item.song.artist}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/40 font-mono">{item.playCount}x</span>
                      <span className="material-symbols-outlined text-white/30 group-hover:text-white text-[20px]">
                        play_arrow
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {viewMode === "local" && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <button
                onClick={() => setViewMode("overview")}
                className="flex items-center space-x-1 text-white/60 hover:text-white mb-2"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span className="text-xs font-semibold">Kembali</span>
              </button>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400">folder</span>
                Local Files
              </h2>
              <p className="text-xs text-white/50 mt-1">Upload file audio dari perangkat</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-full max-w-sm p-8 rounded-3xl bg-white/[0.04] border-2 border-dashed border-white/20 hover:border-white/40 transition-all cursor-pointer group"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'audio/*';
                input.multiple = true;
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files) {
                    handleLocalFileUpload(files);
                  }
                };
                input.click();
              }}
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[40px] text-cyan-400">upload_file</span>
                </div>
                <h4 className="text-base font-bold text-white mb-2">Upload Audio Files</h4>
                <p className="text-xs text-white/50 mb-4">
                  Click untuk pilih file audio<br/>
                  Format: MP3, WAV, OGG, M4A
                </p>
                <button className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-all">
                  Pilih File
                </button>
              </div>
            </div>

            {localFiles.length > 0 && (
              <div className="w-full mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white">Uploaded Files ({localFiles.length})</h3>
                  <button
                    onClick={() => setLocalFiles([])}
                    className="text-xs text-rose-400 hover:text-rose-300"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2">
                  {localFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-2.5 rounded-xl bg-white/[0.04] border border-white/5"
                    >
                      <span className="material-symbols-outlined text-cyan-400">audio_file</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{file.name}</p>
                        <p className="text-[10px] text-white/40">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        onClick={() => setLocalFiles(localFiles.filter((_, i) => i !== index))}
                        className="text-white/30 hover:text-rose-400"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Overview Content (Default) */}
      {viewMode === "overview" && activeTabPill === "playlists" && (
        <>
          {/* Big Liked Songs Card */}
      <section
        onClick={() => likedSongs.length > 0 && playTrack(likedSongs[0])}
        className="relative rounded-3xl overflow-hidden p-5 bg-gradient-to-br from-rose-950/40 via-pink-900/30 to-black/90 backdrop-blur-xl border border-rose-500/20 shadow-xl mb-6 cursor-pointer group hover:border-rose-500/40 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="pr-4">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-rose-400 text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                favorite
              </span>
            </div>
            <h3 className="text-xl font-black text-white leading-tight">
              Lagu yang Disukai
            </h3>
            <p className="text-xs text-white/70 mt-1">
              {likedSongs.length} lagu • {likedSongs.slice(0, 3).map((s) => s.artist).join(", ")}
            </p>
          </div>

          <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center flex-shrink-0 shadow-[0_4px_20px_rgba(255,255,255,0.25)] group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[28px] ml-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
              play_arrow
            </span>
          </div>
        </div>
      </section>

      {/* 2-Column Bento Grid */}
      <section className="grid grid-cols-2 gap-2.5 mb-8">
        {bentoItems.map((item) => (
          <div
            key={item.title}
            onClick={() => handleBentoItemClick(item.title)}
            className="p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-md border border-white/5 hover:border-white/15 transition-all cursor-pointer group shadow-sm active:scale-95"
          >
            <span className={`material-symbols-outlined text-[24px] ${item.color} mb-2 block group-hover:scale-110 transition-transform`}>
              {item.icon}
            </span>
            <h4 className="text-xs font-bold text-white group-hover:text-white">
              {item.title}
            </h4>
            <p className="text-[10.5px] text-white/50 mt-0.5">
              {item.desc}
            </p>
          </div>
        ))}
      </section>

      {/* User Playlists Section */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base font-extrabold text-white tracking-tight">
            Playlists ({playlists.length})
          </h3>
          <button 
            onClick={() => setIsCreatingPlaylist(true)}
            className="flex items-center space-x-1 px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-xs font-bold text-white transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Buat Baru</span>
          </button>
        </div>

        {/* Create Playlist Modal */}
        {isCreatingPlaylist && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl bg-neutral-900/90 border border-white/15 p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <h3 className="text-base font-bold text-white">Buat Playlist Baru</h3>
                <button
                  onClick={() => {
                    setIsCreatingPlaylist(false);
                    setNewPlaylistName("");
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="mb-4">
                <label className="text-xs font-semibold text-white/70 mb-2 block">
                  Nama Playlist
                </label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
                  placeholder="Misal: Lagu Favorit Saya"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.07] hover:bg-white/[0.1] focus:bg-white/[0.12] border border-white/15 focus:border-white/40 text-white placeholder-white/40 text-sm font-medium outline-none transition-all"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setIsCreatingPlaylist(false);
                    setNewPlaylistName("");
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistName.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buat Playlist
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {userPlaylists.map((pl) => (
            <div
              key={pl.id}
              className="flex items-center space-x-3.5 p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-md border border-white/5 hover:border-white/15 transition-all group shadow-sm relative"
            >
              <div 
                onClick={() => pl.tracks.length > 0 && playTrack(pl.tracks[0])}
                className="w-13 h-13 rounded-xl overflow-hidden flex-shrink-0 bg-[#141211] border border-white/10 cursor-pointer"
              >
                <img
                  src={pl.cover || pl.tracks[0]?.thumbnail || "https://i.ytimg.com/vi/2A9Atl2hUkg/hqdefault.jpg"}
                  alt={pl.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div 
                onClick={() => setSelectedPlaylist(pl.id === selectedPlaylist ? null : pl.id)}
                className="min-w-0 flex-1 cursor-pointer"
              >
                <h4 className="text-sm font-bold text-white group-hover:text-white transition-colors truncate">
                  {pl.name}
                </h4>
                <p className="text-xs text-white/55 truncate mt-0.5">
                  {pl.tracks.length} lagu • Dibuat oleh {pl.creator}
                </p>
              </div>

              <button
                onClick={() => setShowPlaylistMenu(showPlaylistMenu === pl.id ? null : pl.id)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all relative"
              >
                <span className="material-symbols-outlined text-[20px]">more_vert</span>
                
                {/* Playlist Menu */}
                {showPlaylistMenu === pl.id && (
                  <div className="absolute right-0 top-10 w-48 rounded-2xl bg-neutral-900 border border-white/15 shadow-2xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        pl.tracks.length > 0 && playTrack(pl.tracks[0]);
                        setShowPlaylistMenu(null);
                      }}
                      className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-white/10 transition-colors text-left"
                    >
                      <span className="material-symbols-outlined text-[18px] text-white/70">play_arrow</span>
                      <span className="text-sm font-semibold text-white">Putar Playlist</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlaylist(pl.id);
                      }}
                      className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-white/10 transition-colors text-left border-t border-white/5"
                    >
                      <span className="material-symbols-outlined text-[18px] text-rose-400">delete</span>
                      <span className="text-sm font-semibold text-rose-400">Hapus Playlist</span>
                    </button>
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Show playlist tracks when expanded */}
        {selectedPlaylist && userPlaylists.find((p) => p.id === selectedPlaylist) && (
          <div className="mt-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-white">
                Lagu dalam Playlist ({userPlaylists.find((p) => p.id === selectedPlaylist)!.tracks.length})
              </h4>
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="text-xs text-white/50 hover:text-white"
              >
                Tutup
              </button>
            </div>
            <div className="space-y-2">
              {userPlaylists.find((p) => p.id === selectedPlaylist)!.tracks.map((song) => {
                const isActive = isCurrentSongActive(song);
                return (
                  <div
                    key={song.id}
                    onClick={() => playTrack(song)}
                    className="flex items-center space-x-2.5 p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#141211] border border-white/10">
                      <img
                        src={song.thumbnail}
                        alt={song.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className={`text-xs font-bold truncate ${isActive ? "text-white" : "text-white/80"}`}>
                        {song.title}
                      </h5>
                      <p className="text-[10.5px] text-white/50 truncate mt-0.5">{song.artist}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromPlaylist(selectedPlaylist, song.id);
                      }}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white/30 hover:text-rose-400 hover:bg-white/10 transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
      </>
      )}

      {/* Songs Tab View - Show All Songs from Feed */}
      {viewMode === "overview" && activeTabPill === "songs" && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">All Songs</h3>
              <p className="text-xs text-white/50 mt-1">Dari semua kategori dan playlist</p>
            </div>
          </div>

          {(() => {
            // Gather all songs from feed shelves
            const allSongs: Song[] = [];
            if (feed.shelves && Array.isArray(feed.shelves)) {
              feed.shelves.forEach((shelf: any) => {
                if (shelf.items && Array.isArray(shelf.items)) {
                  allSongs.push(...shelf.items);
                }
              });
            }
            
            // Deduplicate by id
            const uniqueSongs = allSongs.filter((song, index, self) => 
              index === self.findIndex((s) => s.id === song.id)
            );

            return uniqueSongs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="material-symbols-outlined text-[64px] text-white/20 mb-3">music_note</span>
                <p className="text-sm font-semibold text-white/60">Tidak ada lagu</p>
              </div>
            ) : (
              <div className="space-y-2">
                {uniqueSongs.slice(0, 50).map((song) => {
                  const isActive = isCurrentSongActive(song);
                  return (
                    <div
                      key={song.id}
                      onClick={() => playTrack(song)}
                      className="flex items-center space-x-3 p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 transition-all cursor-pointer group"
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#141211] border border-white/10">
                        <img
                          src={song.thumbnail}
                          alt={song.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        {isActive && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-[20px]">
                              {isPlaying ? "volume_up" : "pause"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-bold truncate ${isActive ? "text-white" : "text-white/90"}`}>
                          {song.title}
                        </h4>
                        <p className="text-xs text-white/50 truncate mt-0.5">{song.artist}</p>
                      </div>
                      <span className="material-symbols-outlined text-white/30 group-hover:text-white text-[20px]">
                        play_arrow
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </section>
      )}

      {/* Albums Tab View - Group Songs by Album */}
      {viewMode === "overview" && activeTabPill === "albums" && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Albums</h3>
              <p className="text-xs text-white/50 mt-1">Dikelompokkan berdasarkan album</p>
            </div>
          </div>

          {(() => {
            // Gather all songs and group by album
            const allSongs: Song[] = [];
            if (feed.shelves && Array.isArray(feed.shelves)) {
              feed.shelves.forEach((shelf: any) => {
                if (shelf.items && Array.isArray(shelf.items)) {
                  allSongs.push(...shelf.items);
                }
              });
            }

            // Group by album
            const albumsMap = new Map<string, Song[]>();
            allSongs.forEach((song) => {
              const albumName = song.album || "Unknown Album";
              if (!albumsMap.has(albumName)) {
                albumsMap.set(albumName, []);
              }
              albumsMap.get(albumName)!.push(song);
            });

            const albums = Array.from(albumsMap.entries()).map(([name, songs]) => ({
              name,
              songs,
              cover: songs[0]?.thumbnail,
              artist: songs[0]?.artist,
            }));

            return albums.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="material-symbols-outlined text-[64px] text-white/20 mb-3">album</span>
                <p className="text-sm font-semibold text-white/60">Tidak ada album</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {albums.slice(0, 20).map((album, idx) => (
                  <div
                    key={idx}
                    onClick={() => playTrack(album.songs[0])}
                    className="group cursor-pointer"
                  >
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#141211] border border-white/10 mb-2 shadow-md">
                      <img
                        src={album.cover}
                        alt={album.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all shadow-xl">
                          <span className="material-symbols-outlined text-[24px] ml-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                            play_arrow
                          </span>
                        </div>
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-white/90 truncate">{album.name}</h4>
                    <p className="text-[10.5px] text-white/55 truncate mt-0.5">{album.artist} • {album.songs.length} lagu</p>
                  </div>
                ))}
              </div>
            );
          })()}
        </section>
      )}

      {/* Artists Tab View - Group Songs by Artist */}
      {viewMode === "overview" && activeTabPill === "artists" && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Artists</h3>
              <p className="text-xs text-white/50 mt-1">Dikelompokkan berdasarkan artis</p>
            </div>
          </div>

          {(() => {
            // Gather all songs and group by artist
            const allSongs: Song[] = [];
            if (feed.shelves && Array.isArray(feed.shelves)) {
              feed.shelves.forEach((shelf: any) => {
                if (shelf.items && Array.isArray(shelf.items)) {
                  allSongs.push(...shelf.items);
                }
              });
            }

            // Group by artist
            const artistsMap = new Map<string, Song[]>();
            allSongs.forEach((song) => {
              const artistName = song.artist || "Unknown Artist";
              if (!artistsMap.has(artistName)) {
                artistsMap.set(artistName, []);
              }
              artistsMap.get(artistName)!.push(song);
            });

            const artists = Array.from(artistsMap.entries())
              .map(([name, songs]) => ({
                name,
                songs,
                cover: songs[0]?.thumbnail,
              }))
              .sort((a, b) => b.songs.length - a.songs.length); // Sort by song count

            return artists.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="material-symbols-outlined text-[64px] text-white/20 mb-3">person</span>
                <p className="text-sm font-semibold text-white/60">Tidak ada artis</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {artists.slice(0, 30).map((artist, idx) => (
                  <div
                    key={idx}
                    onClick={() => playTrack(artist.songs[0])}
                    className="flex items-center space-x-3 p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 transition-all cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-[#141211] border border-white/10">
                      <img
                        src={artist.cover}
                        alt={artist.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white/90 truncate">{artist.name}</h4>
                      <p className="text-xs text-white/50 mt-0.5">{artist.songs.length} lagu</p>
                    </div>
                    <span className="material-symbols-outlined text-white/30 group-hover:text-white text-[20px]">
                      chevron_right
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}
        </section>
      )}

      {/* Local Files Tab View - Upload Feature */}
      {viewMode === "overview" && activeTabPill === "local" && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Local Files</h3>
              <p className="text-xs text-white/50 mt-1">Upload file audio dari perangkat</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.08] border-2 border-dashed border-white/20 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[40px] text-white/30">upload_file</span>
            </div>
            <h4 className="text-base font-bold text-white mb-2">Upload Audio Files</h4>
            <p className="text-xs text-white/50 max-w-xs mb-4">
              Fitur ini memerlukan implementasi backend untuk upload dan storage file audio
            </p>
            <button
              disabled
              className="px-4 py-2 rounded-xl bg-white/10 text-white/50 font-semibold text-sm cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </section>
      )}

      {/* Export Modals */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-neutral-900/90 border border-white/15 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {exportModalOpen === "spotify" ? (
                  <>
                    <span className="material-symbols-outlined text-green-400">sync</span>
                    Export to Spotify
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-red-400">smart_display</span>
                    Export to YouTube
                  </>
                )}
              </h3>
              <button
                onClick={() => setExportModalOpen(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-white/70 mb-4">
                {exportModalOpen === "spotify" 
                  ? "Export daftar lagu Anda untuk di-import ke Spotify" 
                  : "Export playlist dengan link YouTube untuk semua lagu"}
              </p>

              <div className="p-4 rounded-xl bg-white/[0.05] border border-white/10 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">Total Lagu:</span>
                  <span className="text-sm font-bold text-white">
                    {likedSongs.length > 0 ? likedSongs.length : listeningStats.topSongs.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">Format:</span>
                  <span className="text-sm font-bold text-white">
                    {exportModalOpen === "spotify" ? "Text File (.txt)" : "YouTube Links (.txt)"}
                  </span>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-4">
                <p className="text-xs text-blue-300 flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] flex-shrink-0">info</span>
                  <span>
                    {exportModalOpen === "spotify" 
                      ? "Setelah download, buka file dan search lagu-lagu di Spotify untuk menambahkan ke playlist Anda."
                      : "File berisi link YouTube untuk setiap lagu. Bisa digunakan untuk membuat playlist YouTube Music."}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setExportModalOpen(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (exportModalOpen === "spotify") {
                    generateSpotifyExport();
                  } else {
                    generateYouTubeExport();
                  }
                  setExportModalOpen(null);
                }}
                className={`flex-1 py-2.5 rounded-xl ${
                  exportModalOpen === "spotify" 
                    ? "bg-green-500 hover:bg-green-400" 
                    : "bg-red-500 hover:bg-red-400"
                } text-white font-bold text-sm transition-all flex items-center justify-center gap-2`}
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
