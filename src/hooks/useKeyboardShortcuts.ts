import { useEffect } from "react";
import { usePlayer } from "../context/PlayerContext";

/**
 * Custom hook for keyboard shortcuts
 * 
 * Supported shortcuts:
 * - Space: Play/Pause
 * - ArrowRight: Seek forward 10s
 * - ArrowLeft: Seek backward 10s
 * - ArrowUp: Volume up
 * - ArrowDown: Volume down
 * - N: Next track
 * - P: Previous track
 * - M: Mute/Unmute
 * - S: Toggle shuffle
 * - R: Toggle repeat
 * - L: Toggle like current track
 * - /: Focus search (when on home/explore)
 */
export function useKeyboardShortcuts() {
  const {
    isPlaying,
    togglePlay,
    seekTo,
    currentTime,
    duration,
    volume,
    setVolume,
    toggleMute,
    playNext,
    playPrev,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    setActiveTab,
    setSearchQuery,
  } = usePlayer();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Exception: Allow "/" to focus search even in input
        if (e.key !== "/") {
          return;
        }
      }

      // Prevent default for media keys
      const mediaKeys = [" ", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
      if (mediaKeys.includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case " ":
          // Space: Play/Pause
          togglePlay();
          break;

        case "ArrowRight":
          // Right arrow: Seek forward 10s
          seekTo(Math.min(currentTime + 10, duration));
          break;

        case "ArrowLeft":
          // Left arrow: Seek backward 10s
          seekTo(Math.max(currentTime - 10, 0));
          break;

        case "ArrowUp":
          // Up arrow: Volume up
          setVolume(Math.min(volume + 10, 100));
          break;

        case "ArrowDown":
          // Down arrow: Volume down
          setVolume(Math.max(volume - 10, 0));
          break;

        case "n":
        case "N":
          // N: Next track
          playNext();
          break;

        case "p":
        case "P":
          // P: Previous track
          playPrev();
          break;

        case "m":
        case "M":
          // M: Mute/Unmute
          toggleMute();
          break;

        case "s":
        case "S":
          // S: Toggle shuffle
          toggleShuffle();
          break;

        case "r":
        case "R":
          // R: Toggle repeat
          toggleRepeat();
          break;

        case "l":
        case "L":
          // L: Like current track
          toggleLike();
          break;

        case "/":
          // /: Focus search
          e.preventDefault();
          setActiveTab("search");
          // Focus search input after a brief delay
          setTimeout(() => {
            const searchInput = document.getElementById("search-input-field");
            if (searchInput) {
              searchInput.focus();
            }
          }, 100);
          break;

        case "Escape":
          // Escape: Clear search or close modals
          const searchInput = document.getElementById("search-input-field");
          if (searchInput && document.activeElement === searchInput) {
            setSearchQuery("");
            searchInput.blur();
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isPlaying,
    togglePlay,
    seekTo,
    currentTime,
    duration,
    volume,
    setVolume,
    toggleMute,
    playNext,
    playPrev,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    setActiveTab,
    setSearchQuery,
  ]);
}
