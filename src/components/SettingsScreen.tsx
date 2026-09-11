import React, { useState, useEffect } from "react";
import { usePlayer } from "../context/PlayerContext";
import { FONT_OPTIONS, applyFont } from "../data/fonts";

type SettingModuleKey =
  | "appearance"
  | "aod"
  | "account"
  | "content"
  | "audio"
  | "listen_together"
  | "storage"
  | "backup";

export const SettingsScreen: React.FC = () => {
  const { 
    isSettingsOpen, 
    setIsSettingsOpen,
    userName,
    setUserName,
    userEmail,
    setUserEmail,
    selectedFont,
    setSelectedFont
  } = usePlayer();

  // Active sub-page in settings (null = main list)
  const [activeSubPage, setActiveSubPage] = useState<SettingModuleKey | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Apply font on mount and when font changes
  useEffect(() => {
    applyFont(selectedFont);
  }, [selectedFont]);

  // --- Setting States ---
  // Appearance
  const [glassIntensity, setGlassIntensity] = useState<"low" | "medium" | "high">("medium");
  const [glassBlur, setGlassBlur] = useState<boolean>(true);
  const [accentTone, setAccentTone] = useState<"pearl" | "champagne" | "slate" | "amber">("pearl");
  const [albumGlow, setAlbumGlow] = useState<boolean>(true);

  // AOD
  const [aodEnabled, setAodEnabled] = useState<boolean>(true);
  const [aodClockStyle, setAodClockStyle] = useState<"minimal" | "analogue">("minimal");
  const [aodDimLevel, setAodDimLevel] = useState<number>(40);
  const [burnInProtection, setBurnInProtection] = useState<boolean>(true);

  // Account - userName & userEmail dari context (auto-save)
  const [historyTracking, setHistoryTracking] = useState<boolean>(true);
  const [cloudSync, setCloudSync] = useState<boolean>(true);

  // Content
  const [filterExplicit, setFilterExplicit] = useState<boolean>(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([
    "Indonesia",
    "Daerah (Jawa, Sunda, Minang)",
    "Inggris",
  ]);
  const [autoplayRecommendations, setAutoplayRecommendations] = useState<boolean>(true);

  // Audio & Player
  const [audioQuality, setAudioQuality] = useState<string>("Lossless 24-Bit / 96kHz");
  const [eqPreset, setEqPreset] = useState<string>("Acoustic Senja");
  const [gapless, setGapless] = useState<boolean>(true);
  const [crossfade, setCrossfade] = useState<number>(3);
  const [sleepTimer, setSleepTimer] = useState<string>("Matikan");

  // Listen Together
  const [roomCode, setRoomCode] = useState<string>("SENJA-8821");
  const [roomPrivacy, setRoomPrivacy] = useState<"link" | "public">("link");

  // Storage
  const [imageCacheSize, setImageCacheSize] = useState<string>("420 MB");
  const [audioCacheSize, setAudioCacheSize] = useState<string>("980 MB");
  const [wifiOnlyDownload, setWifiOnlyDownload] = useState<boolean>(true);

  // Backup
  const [autoBackup, setAutoBackup] = useState<string>("Harian");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  if (!isSettingsOpen) return null;

  const settingsModules: {
    key: SettingModuleKey;
    title: string;
    desc: string;
    icon: string;
  }[] = [
    { key: "appearance", title: "Appearance & Glass", desc: "Tema, font style, blur glass, aksen warna", icon: "palette" },
    { key: "aod", title: "Always On Display", desc: "Tampilan layar siaga & pelindung OLED", icon: "screen_lock_portrait" },
    { key: "account", title: "Account & Profile", desc: "Profil pengguna Amanda, sinkronisasi cloud", icon: "person" },
    { key: "content", title: "Content & Bahasa", desc: "Filter eksplisit, preferensi genre & bahasa", icon: "tune" },
    { key: "audio", title: "Player and Audio", desc: "Lossless, Equalizer, Crossfade, Sleep Timer", icon: "graphic_eq" },
    { key: "listen_together", title: "Listen Together", desc: "Sesi dengar bersama via kode room", icon: "group" },
    { key: "storage", title: "Storage & Cache", desc: "Kelola cache gambar & audio buffer", icon: "storage" },
    { key: "backup", title: "Backup and Restore", desc: "Cadangkan & pulihkan daftar putar", icon: "cloud_sync" },
  ];

  const filteredModules = settingsModules.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      id="settings-screen-modal"
      className="fixed inset-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-2xl flex flex-col justify-between overflow-y-auto pb-12 pt-4 px-4 sm:px-6 max-w-[440px] mx-auto w-full no-scrollbar select-none animate-in fade-in duration-300"
    >
      <div>
        {/* Top Header Bar */}
        <header className="flex items-center justify-between py-2 mb-4">
          <button
            onClick={() => {
              if (activeSubPage) {
                setActiveSubPage(null);
              } else {
                setIsSettingsOpen(false);
              }
            }}
            title="Kembali"
            aria-label="Kembali"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.07] hover:bg-white/[0.15] backdrop-blur-md border border-white/10 text-white shadow cursor-pointer transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>

          <h1 className="text-lg font-extrabold text-white tracking-tight">
            {activeSubPage
              ? settingsModules.find((m) => m.key === activeSubPage)?.title
              : "Pengaturan"}
          </h1>

          <div className="w-10 h-10 flex items-center justify-center">
            {activeSubPage && (
              <button
                onClick={() => setActiveSubPage(null)}
                className="text-xs font-semibold text-white/50 hover:text-white transition-colors"
              >
                Tutup
              </button>
            )}
          </div>
        </header>

        {/* Toast feedback */}
        {toastMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-white/[0.12] backdrop-blur-xl border border-white/20 text-white text-xs font-semibold flex items-center space-x-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="material-symbols-outlined text-white text-[18px]">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SUB-PAGE: APPEARANCE */}
        {/* ===================================================================== */}
        {activeSubPage === "appearance" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Intensitas Efek Frosted Glass
              </h3>
              <p className="text-xs text-white/50 mb-3">
                Atur kepekatan transparansi kaca pada panel dan kartu pemutar
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(["low", "medium", "high"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      setGlassIntensity(lvl);
                      showToast(`Intensitas Glass diubah ke ${lvl.toUpperCase()}`);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                      glassIntensity === lvl
                        ? "bg-white/20 text-white border-white/40 shadow-sm"
                        : "bg-white/[0.03] text-white/60 border-white/5 hover:text-white"
                    }`}
                  >
                    {lvl === "low" ? "Ringan" : lvl === "medium" ? "Sedang" : "Pekat"}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Glass Blur Effect</h4>
                <p className="text-xs text-white/50 mt-0.5">Aktifkan efek blur latar belakang</p>
              </div>
              <button
                onClick={() => {
                  setGlassBlur(!glassBlur);
                  showToast(glassBlur ? "Blur dinonaktifkan" : "Blur diaktifkan");
                }}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-300 ${
                  glassBlur ? "bg-white text-black" : "bg-white/10"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black transition-transform duration-300 ${
                    glassBlur ? "translate-x-6 bg-black" : "translate-x-0 bg-white/40"
                  }`}
                ></div>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Aksen Warna Elegan (Tanpa Neon)
              </h3>
              <p className="text-xs text-white/50 mb-3">
                Pilih aksen palet kaca yang tenang dan mewah
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "pearl", name: "Silver Pearl", color: "bg-white/80" },
                  { id: "champagne", name: "Warm Champagne", color: "bg-amber-200/80" },
                  { id: "slate", name: "Midnight Slate", color: "bg-slate-300/80" },
                  { id: "amber", name: "Golden Senja", color: "bg-amber-400/80" },
                ].map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => {
                      setAccentTone(tone.id as any);
                      showToast(`Aksen ${tone.name} dipilih`);
                    }}
                    className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      accentTone === tone.id
                        ? "bg-white/15 text-white border-white/30"
                        : "bg-white/[0.03] text-white/60 border-white/5"
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${tone.color} shadow-sm`}></span>
                    <span>{tone.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Picker Section */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Font Style
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5">
                    Pilih font untuk seluruh aplikasi
                  </p>
                </div>
                <span className="material-symbols-outlined text-white/40 text-[20px]">
                  text_fields
                </span>
              </div>
              
              {/* Current Font Display */}
              <div className="mb-3 p-3 rounded-xl bg-white/[0.06] border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">Font Aktif:</span>
                  <span className="text-xs font-bold text-white">{FONT_OPTIONS.find(f => f.name === selectedFont)?.displayName || selectedFont}</span>
                </div>
                <p 
                  className="text-sm text-white font-medium"
                  style={{ fontFamily: FONT_OPTIONS.find(f => f.name === selectedFont)?.fallback }}
                >
                  {FONT_OPTIONS.find(f => f.name === selectedFont)?.preview || "Preview Text"}
                </p>
              </div>

              {/* Font Categories */}
              <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                {["sans-serif", "serif", "display", "handwriting", "mono"].map((category) => {
                  const fontsInCategory = FONT_OPTIONS.filter(f => f.category === category);
                  if (fontsInCategory.length === 0) return null;
                  
                  return (
                    <div key={category}>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5 px-1">
                        {category === "sans-serif" ? "Sans-Serif" : 
                         category === "serif" ? "Serif" :
                         category === "display" ? "Display" :
                         category === "handwriting" ? "Script" :
                         "Monospace"}
                      </p>
                      <div className="space-y-1.5">
                        {fontsInCategory.map((font) => (
                          <button
                            key={font.name}
                            onClick={() => {
                              setSelectedFont(font.name);
                              applyFont(font.name);
                              showToast(`Font diubah: ${font.displayName}`);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                              selectedFont === font.name
                                ? "bg-white/15 border-white/30 text-white"
                                : "bg-white/[0.02] border-white/5 text-white/70 hover:bg-white/[0.06] hover:text-white"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold">{font.displayName}</span>
                              {selectedFont === font.name && (
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                              )}
                            </div>
                            <p 
                              className="text-[11px] mt-1 opacity-80"
                              style={{ fontFamily: font.fallback }}
                            >
                              {font.preview}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Dynamic Album Art Glow</h4>
                <p className="text-xs text-white/50 mt-0.5">Pendaran halus warna cover lagu</p>
              </div>
              <button
                onClick={() => {
                  setAlbumGlow(!albumGlow);
                  showToast(albumGlow ? "Glow dinonaktifkan" : "Glow diaktifkan");
                }}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-300 ${
                  albumGlow ? "bg-white text-black" : "bg-white/10"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full transition-transform duration-300 ${
                    albumGlow ? "translate-x-6 bg-black" : "translate-x-0 bg-white/40"
                  }`}
                ></div>
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SUB-PAGE: ALWAYS ON DISPLAY (AOD) */}
        {/* ===================================================================== */}
        {activeSubPage === "aod" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Layar Siaga (AOD)</h4>
                <p className="text-xs text-white/50 mt-0.5">Tampilkan jam & musik saat istirahat</p>
              </div>
              <button
                onClick={() => {
                  setAodEnabled(!aodEnabled);
                  showToast(aodEnabled ? "AOD Dimatikan" : "AOD Diaktifkan");
                }}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-300 ${
                  aodEnabled ? "bg-white text-black" : "bg-white/10"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full transition-transform duration-300 ${
                    aodEnabled ? "translate-x-6 bg-black" : "translate-x-0 bg-white/40"
                  }`}
                ></div>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Gaya Jam Layar Siaga
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setAodClockStyle("minimal");
                    showToast("Gaya Jam: Minimalis Digital");
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border ${
                    aodClockStyle === "minimal"
                      ? "bg-white/15 text-white border-white/30"
                      : "bg-white/[0.03] text-white/50 border-white/5"
                  }`}
                >
                  Digital Minimalis
                </button>
                <button
                  onClick={() => {
                    setAodClockStyle("analogue");
                    showToast("Gaya Jam: Jarum Analog");
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border ${
                    aodClockStyle === "analogue"
                      ? "bg-white/15 text-white border-white/30"
                      : "bg-white/[0.03] text-white/50 border-white/5"
                  }`}
                >
                  Jarum Analog
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Keredupan Layar AOD
                </h4>
                <span className="text-xs font-mono text-white/70">{aodDimLevel}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={aodDimLevel}
                onChange={(e) => setAodDimLevel(Number(e.target.value))}
                className="w-full accent-white h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Pixel Burn-in Shield</h4>
                <p className="text-xs text-white/50 mt-0.5">Geser elemen berkala untuk layar OLED</p>
              </div>
              <button
                onClick={() => {
                  setBurnInProtection(!burnInProtection);
                  showToast(burnInProtection ? "Shield dimatikan" : "Shield diaktifkan");
                }}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-300 ${
                  burnInProtection ? "bg-white text-black" : "bg-white/10"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full transition-transform duration-300 ${
                    burnInProtection ? "translate-x-6 bg-black" : "translate-x-0 bg-white/40"
                  }`}
                ></div>
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SUB-PAGE: ACCOUNT */}
        {/* ===================================================================== */}
        {activeSubPage === "account" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-center space-x-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden border border-white/20 shadow-md">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdNUYxGYihi4Z1zYx-YElwiNjn1t0yZKuKhFRIivdojfrGgF1_ssSw3G1zX5pXNpXxLVBsVc-n0zFRJxoH80nY0Ai0PLulNQJ6wMvWoOgSu8v-MmqwEtQz3Wg9EAIIOE1zTAMUiAMW4YstoTT_o6PepaL7CTc2MH7t-7tGhhlrP3gpPaViY5I_0LVk9xeLZiAMTnYsZb5zY4xJ770hTrIKg5JcIiDMalbvDdfdaALipZe7uokA7rdQ"
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-base font-extrabold text-white truncate">{userName}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-bold text-white border border-white/20">
                    VIP
                  </span>
                </div>
                <p className="text-xs text-white/50 truncate mt-0.5">{userEmail}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md space-y-3">
              <div>
                <label className="text-xs font-bold text-white/70 block mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs font-medium focus:border-white/30 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/70 block mb-1.5">Email Pengguna</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs font-medium focus:border-white/30 outline-none transition-colors"
                />
              </div>

              <div className="flex items-center space-x-2 text-xs text-white/50 pt-1">
                <span className="material-symbols-outlined text-[14px] text-green-400">check_circle</span>
                <span>Perubahan tersimpan otomatis</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Sinkronisasi Cloud Library</h4>
                <p className="text-xs text-white/50 mt-0.5">Tersinkron otomatis di semua perangkat</p>
              </div>
              <button
                onClick={() => {
                  setCloudSync(!cloudSync);
                  showToast(cloudSync ? "Cloud Sync dimatikan" : "Cloud Sync aktif");
                }}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-300 ${
                  cloudSync ? "bg-white text-black" : "bg-white/10"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full transition-transform duration-300 ${
                    cloudSync ? "translate-x-6 bg-black" : "translate-x-0 bg-white/40"
                  }`}
                ></div>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Catat Riwayat Putar</h4>
                <p className="text-xs text-white/50 mt-0.5">Untuk statistik dan kurasi mingguan</p>
              </div>
              <button
                onClick={() => {
                  setHistoryTracking(!historyTracking);
                  showToast(historyTracking ? "Riwayat dijeda" : "Riwayat diaktifkan");
                }}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-300 ${
                  historyTracking ? "bg-white text-black" : "bg-white/10"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full transition-transform duration-300 ${
                    historyTracking ? "translate-x-6 bg-black" : "translate-x-0 bg-white/40"
                  }`}
                ></div>
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SUB-PAGE: CONTENT & BAHASA */}
        {/* ===================================================================== */}
        {activeSubPage === "content" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Filter Konten Eksplisit</h4>
                <p className="text-xs text-white/50 mt-0.5">Sembunyikan lirik & lagu berlabel dewasa</p>
              </div>
              <button
                onClick={() => {
                  setFilterExplicit(!filterExplicit);
                  showToast(filterExplicit ? "Filter dimatikan" : "Filter diaktifkan");
                }}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-300 ${
                  filterExplicit ? "bg-white text-black" : "bg-white/10"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full transition-transform duration-300 ${
                    filterExplicit ? "translate-x-6 bg-black" : "translate-x-0 bg-white/40"
                  }`}
                ></div>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Bahasa Musik Prioritas
              </h4>
              <p className="text-xs text-white/50 mb-3">
                Pilih rekomendasi bahasa lagu yang paling sering diputar
              </p>
              <div className="space-y-2">
                {[
                  "Indonesia",
                  "Daerah (Jawa, Sunda, Minang)",
                  "Inggris",
                  "Melayu & Nusantara",
                  "Korea & Jepang",
                ].map((lang) => {
                  const isChecked = selectedLanguages.includes(lang);
                  return (
                    <div
                      key={lang}
                      onClick={() => {
                        if (isChecked) {
                          setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
                        } else {
                          setSelectedLanguages([...selectedLanguages, lang]);
                        }
                        showToast(`Preferensi bahasa diperbarui`);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        isChecked
                          ? "bg-white/15 text-white border-white/20"
                          : "bg-white/[0.02] text-white/50 border-white/5 hover:text-white"
                      }`}
                    >
                      <span>{lang}</span>
                      <span className="material-symbols-outlined text-[18px]">
                        {isChecked ? "check_box" : "check_box_outline_blank"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Autoplay Rekomendasi</h4>
                <p className="text-xs text-white/50 mt-0.5">Lanjut putar lagu serupa saat antrean habis</p>
              </div>
              <button
                onClick={() => {
                  setAutoplayRecommendations(!autoplayRecommendations);
                  showToast(autoplayRecommendations ? "Autoplay mati" : "Autoplay aktif");
                }}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-300 ${
                  autoplayRecommendations ? "bg-white text-black" : "bg-white/10"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full transition-transform duration-300 ${
                    autoplayRecommendations ? "translate-x-6 bg-black" : "translate-x-0 bg-white/40"
                  }`}
                ></div>
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SUB-PAGE: PLAYER AND AUDIO */}
        {/* ===================================================================== */}
        {activeSubPage === "audio" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Kualitas Aliran Audio (Bitrate)
              </h4>
              <div className="space-y-2">
                {[
                  { name: "Lossless 24-Bit / 96kHz", note: "Audio master jernih tanpa kompresi" },
                  { name: "High Definition (320 kbps)", note: "Kualitas studio optimal" },
                  { name: "Standar (192 kbps)", note: "Keseimbangan kuota dan kualitas" },
                  { name: "Penghemat Kuota (128 kbps)", note: "Paling hemat untuk jaringan seluler" },
                ].map((item) => (
                  <div
                    key={item.name}
                    onClick={() => {
                      setAudioQuality(item.name);
                      showToast(`Kualitas diubah: ${item.name}`);
                    }}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      audioQuality === item.name
                        ? "bg-white/15 text-white border-white/30"
                        : "bg-white/[0.02] text-white/60 border-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-white">
                      <span>{item.name}</span>
                      {audioQuality === item.name && (
                        <span className="material-symbols-outlined text-[18px]">check</span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/50 mt-0.5">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Preset Equalizer Senja
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Acoustic Senja",
                  "Vocal Booster",
                  "Deep Bass Warmth",
                  "Flat Studio",
                  "Pop Nusantara",
                  "Ambient Lo-Fi",
                ].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setEqPreset(preset);
                      showToast(`Equalizer: ${preset}`);
                    }}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all truncate ${
                      eqPreset === preset
                        ? "bg-white/15 text-white border-white/30"
                        : "bg-white/[0.02] text-white/50 border-white/5"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Crossfade Antar Lagu
                </h4>
                <span className="text-xs font-mono text-white/70">{crossfade} detik</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                value={crossfade}
                onChange={(e) => setCrossfade(Number(e.target.value))}
                className="w-full accent-white h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Sleep Timer (Pengatur Waktu Tidur)
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {["Matikan", "15 Menit", "30 Menit", "45 Menit", "60 Menit", "Lagu Selesai"].map((timer) => (
                  <button
                    key={timer}
                    onClick={() => {
                      setSleepTimer(timer);
                      showToast(`Sleep Timer: ${timer}`);
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      sleepTimer === timer
                        ? "bg-white/20 text-white border-white/30"
                        : "bg-white/[0.02] text-white/50 border-white/5"
                    }`}
                  >
                    {timer}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SUB-PAGE: LISTEN TOGETHER */}
        {/* ===================================================================== */}
        {activeSubPage === "listen_together" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-5 rounded-3xl bg-white/[0.05] border border-white/10 backdrop-blur-xl text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white mb-3">
                <span className="material-symbols-outlined text-[28px]">group</span>
              </div>
              <h3 className="text-lg font-black text-white">Dengar Bareng Teman</h3>
              <p className="text-xs text-white/50 mt-1 max-w-xs mx-auto">
                Dengarkan musik bersama secara real-time dengan sinkronisasi waktu akurat
              </p>

              <div className="mt-4 p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-white/40 block">KODE ROOM AKTIF</span>
                  <span className="text-base font-black font-mono tracking-wider text-white">
                    {roomCode}
                  </span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(roomCode);
                    showToast("Kode Room disalin ke clipboard!");
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-white/90 active:scale-95 transition-all cursor-pointer"
                >
                  Salin Kode
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Privasi Sesi Dengar Bersama
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setRoomPrivacy("link");
                    showToast("Privasi: Hanya Pemilik Tautan");
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                    roomPrivacy === "link"
                      ? "bg-white/15 text-white border-white/30"
                      : "bg-white/[0.02] text-white/50 border-white/5"
                  }`}
                >
                  Tautan & Teman Saja
                </button>
                <button
                  onClick={() => {
                    setRoomPrivacy("public");
                    showToast("Privasi: Terbuka untuk Komunitas");
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                    roomPrivacy === "public"
                      ? "bg-white/15 text-white border-white/30"
                      : "bg-white/[0.02] text-white/50 border-white/5"
                  }`}
                >
                  Publik Komunitas
                </button>
              </div>
            </div>

            <button
              onClick={() => showToast("Sesi Mendengarkan Bersama Telah Dimulai!")}
              className="w-full py-3 rounded-2xl bg-white text-black font-extrabold text-xs shadow-xl hover:bg-white/90 active:scale-95 transition-all"
            >
              Mulai Sesi Siaran Baru
            </button>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SUB-PAGE: STORAGE & CACHE */}
        {/* ===================================================================== */}
        {activeSubPage === "storage" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <div className="flex justify-between items-center mb-1.5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Penggunaan Penyimpanan
                </h4>
                <span className="text-xs font-mono font-bold text-white">1.4 GB / 32 GB</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-2">
                <div className="h-full bg-white rounded-full w-[24%]"></div>
              </div>
              <p className="text-[11px] text-white/50">
                Penyimpanan lokal digunakan untuk cache gambar album dan buffer pemutaran
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Cache Cover Album</h4>
                <p className="text-xs text-white/50 mt-0.5">Ukuran: {imageCacheSize}</p>
              </div>
              <button
                onClick={() => {
                  setImageCacheSize("0 MB");
                  showToast("Cache cover album berhasil dibersihkan!");
                }}
                className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-xs font-bold text-white transition-all active:scale-95"
              >
                Bersihkan
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Cache Audio Buffer</h4>
                <p className="text-xs text-white/50 mt-0.5">Ukuran: {audioCacheSize}</p>
              </div>
              <button
                onClick={() => {
                  setAudioCacheSize("0 MB");
                  showToast("Cache buffer audio berhasil dibersihkan!");
                }}
                className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-xs font-bold text-white transition-all active:scale-95"
              >
                Bersihkan
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Hanya Unduh Lewat Wi-Fi</h4>
                <p className="text-xs text-white/50 mt-0.5">Hindari pemakaian kuota seluler</p>
              </div>
              <button
                onClick={() => {
                  setWifiOnlyDownload(!wifiOnlyDownload);
                  showToast(wifiOnlyDownload ? "Mode Wi-Fi saja mati" : "Mode Wi-Fi saja aktif");
                }}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-300 ${
                  wifiOnlyDownload ? "bg-white text-black" : "bg-white/10"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full transition-transform duration-300 ${
                    wifiOnlyDownload ? "translate-x-6 bg-black" : "translate-x-0 bg-white/40"
                  }`}
                ></div>
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SUB-PAGE: BACKUP AND RESTORE */}
        {/* ===================================================================== */}
        {activeSubPage === "backup" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <h4 className="text-sm font-bold text-white">Cadangan Otomatis</h4>
              <p className="text-xs text-white/50 mt-0.5 mb-3">
                Simpan daftar putar dan riwayat ke cloud secara terjadwal
              </p>
              <div className="grid grid-cols-3 gap-2">
                {["Harian", "Mingguan", "Manual"].map((freq) => (
                  <button
                    key={freq}
                    onClick={() => {
                      setAutoBackup(freq);
                      showToast(`Jadwal cadangan: ${freq}`);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      autoBackup === freq
                        ? "bg-white/20 text-white border-white/30"
                        : "bg-white/[0.02] text-white/50 border-white/5"
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md space-y-3">
              <h4 className="text-sm font-bold text-white">Cadangkan & Ekspor File</h4>
              <p className="text-xs text-white/50">
                Unduh file JSON berisi semua lagu tersimpan dan playlist buatan Anda
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => showToast("Cadangan library berhasil diekspor (senja-backup.json)!")}
                  className="py-2.5 px-3 rounded-xl bg-white text-black font-bold text-xs shadow hover:bg-white/90 active:scale-95 transition-all"
                >
                  Ekspor Sekarang
                </button>
                <button
                  onClick={() => showToast("Pilih file cadangan JSON untuk dipulihkan")}
                  className="py-2.5 px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-white font-bold text-xs active:scale-95 transition-all"
                >
                  Pulihkan File
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-white/40 text-xs font-mono">
              Cadangan terakhir: Hari ini, 07:15 WIB (Aman)
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* MAIN SETTINGS LIST (ketika tidak membuka sub-halaman) */}
        {/* ===================================================================== */}
        {!activeSubPage && (
          <div>
            {/* Search Input */}
            <div className="relative mb-5">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Cari pengaturan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.05] border border-white/10 text-white placeholder-white/35 text-xs font-medium focus:border-white/30 outline-none transition-colors"
              />
            </div>

            {/* Hero Brand Identity Card - Glass Luxury Theme (No Neon) */}
            <section className="p-5 rounded-3xl bg-white/[0.04] border border-white/12 backdrop-blur-xl mb-6 flex flex-col items-center text-center shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.08] border border-white/20 flex items-center justify-center mb-3 shadow-inner">
                <span className="material-symbols-outlined text-white text-[28px]">
                  graphic_eq
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Senja Musik
              </h2>
              <p className="text-xs text-white/50 mt-0.5 max-w-[260px] leading-relaxed">
                Pemutar musik bernuansa glassmorphism elegan dengan YouTube Music & Lirik Sinkron
              </p>

              <div className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold text-white tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                <span>VERSI ELEGAN GLASS • AKTIF</span>
              </div>
            </section>

            {/* General Settings List */}
            <section className="mb-6">
              <span className="text-[10px] font-extrabold tracking-widest text-white/40 uppercase block mb-3 px-1">
                FITUR & KONFIGURASI
              </span>

              <div className="space-y-2">
                {filteredModules.map((item) => (
                  <div
                    key={item.key}
                    onClick={() => setActiveSubPage(item.key)}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center flex-shrink-0 text-white group-hover:bg-white/15 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">
                          {item.icon}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-white group-hover:text-white/90 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-xs text-white/50 truncate mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <span className="material-symbols-outlined text-white/30 text-[18px] group-hover:text-white transition-colors">
                      chevron_right
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Footer info */}
      <footer className="pt-4 border-t border-white/10 text-center">
        <p className="text-[11px] text-white/40 font-mono">
          Senja Musik v2.4.0 • Glass Edition • YouTube Iframe & LRCLIB
        </p>
      </footer>
    </div>
  );
};
