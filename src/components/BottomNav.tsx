import React from "react";
import { usePlayer } from "../context/PlayerContext";
import { ScreenTab } from "../types";

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, isNowPlayingOpen, isLyricsOpen } = usePlayer();

  // Hide bottom nav if full-screen player or lyrics is open
  if (isNowPlayingOpen || isLyricsOpen) return null;

  const tabs: { id: ScreenTab; label: string; icon: string }[] = [
    { id: "home", label: "Home", icon: "home" },
    { id: "stats", label: "Stats", icon: "bar_chart" },
    { id: "explore", label: "Explore", icon: "explore" },
    { id: "library", label: "Library", icon: "library_music" },
    { id: "search", label: "Search", icon: "search" },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-2xl border-t border-white/[0.08] pb-safe"
    >
      <div className="flex justify-around items-center h-[64px] px-2 max-w-[430px] mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              aria-label={`Buka tab ${tab.label}`}
              className={`flex flex-col items-center justify-center min-w-[58px] py-1 transition-all group ${
                isActive ? "text-white" : "text-white/45 hover:text-white/80"
              }`}
            >
              <div
                className={`flex items-center justify-center transition-all ${
                  isActive
                    ? "px-3.5 py-1 rounded-full bg-white/20 border border-white/30 shadow-[0_2px_12px_rgba(255,255,255,0.15)] backdrop-blur-md"
                    : "p-1 rounded-full group-active:scale-90"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[21px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {tab.icon}
                </span>
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? "font-bold" : "font-medium"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
