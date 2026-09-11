import React from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { BottomNav } from "./components/BottomNav";
import { CommunityPlaylistDetailScreen } from "./components/CommunityPlaylistDetailScreen";
import { CommunityScreen } from "./components/CommunityScreen";
import { ExploreScreen } from "./components/ExploreScreen";
import { HomeScreen } from "./components/HomeScreen";
import { LibraryScreen } from "./components/LibraryScreen";
import { LyricsModal } from "./components/LyricsModal";
import { MiniPlayer } from "./components/MiniPlayer";
import { NowPlayingModal } from "./components/NowPlayingModal";
import { QueueModal } from "./components/QueueModal";
import { SearchScreen } from "./components/SearchScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { StatsScreen } from "./components/StatsScreen";
import { ToastContainer } from "./components/ToastContainer";
import { PlayerProvider, usePlayer } from "./context/PlayerContext";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

const MainLayout: React.FC = () => {
  const { activeTab, toasts, dismissToast } = usePlayer();
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div className="relative min-h-screen w-full bg-[#0A0A0A] text-white flex flex-col justify-between overflow-x-hidden font-sans">
      {/* Dynamic Background Ambient Blobs */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] h-96 bg-gradient-to-b from-orange-950/20 via-amber-900/10 to-transparent blur-3xl pointer-events-none -z-10"></div>

      {/* Screen Views based on Active Tab */}
      <main className="flex-1 flex flex-col w-full">
        {activeTab === "home" && <HomeScreen />}
        {activeTab === "stats" && <StatsScreen />}
        {activeTab === "explore" && <ExploreScreen />}
        {activeTab === "library" && <LibraryScreen />}
        {activeTab === "search" && <SearchScreen />}
      </main>

      {/* Floating Mini Player (capsule docked above bottom nav) */}
      <MiniPlayer />

      {/* Persistent Bottom Navigation Bar */}
      <BottomNav />

      {/* Full-Screen Modals & Pages */}
      <NowPlayingModal />
      <QueueModal />
      <LyricsModal />
      <SettingsScreen />
      <CommunityScreen />
      <CommunityPlaylistDetailScreen />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <PlayerProvider>
        <MainLayout />
      </PlayerProvider>
    </ErrorBoundary>
  );
}

export default App;
