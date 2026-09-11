import React, { useState } from "react";
import { Song } from "../types";

interface ShareSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song;
}

export const ShareSongModal: React.FC<ShareSongModalProps> = ({ isOpen, onClose, song }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/?song=${encodeURIComponent(song.id)}`;
  const shareText = `🎵 ${song.title} - ${song.artist}\n\nDengarkan di Senja Musik ✨`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: song.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    }
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`${shareText}\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-end justify-center animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] bg-[#0f0e0d] rounded-t-3xl border-t border-x border-white/15 overflow-hidden p-6 shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold text-white tracking-tight">Bagikan Lagu</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-all"
            aria-label="Tutup"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Song Info Card */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.06] border border-white/10 mb-6">
          <img
            src={song.thumbnail}
            alt={song.title}
            className="w-14 h-14 rounded-lg object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{song.title}</p>
            <p className="text-xs text-white/60 truncate">{song.artist}</p>
          </div>
        </div>

        {/* Share Options */}
        <div className="space-y-2 mb-6">
          {/* Native Share (if supported) */}
          {navigator.share && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 text-white transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[20px]">share</span>
              </div>
              <span className="text-sm font-semibold">Bagikan ke...</span>
            </button>
          )}

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 text-white transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[20px]">
                {copied ? "check" : "link"}
              </span>
            </div>
            <span className="text-sm font-semibold">
              {copied ? "Link tersalin!" : "Salin Link"}
            </span>
          </button>

          {/* WhatsApp */}
          <button
            onClick={shareToWhatsApp}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-white transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-[20px]">💬</span>
            </div>
            <span className="text-sm font-semibold">WhatsApp</span>
          </button>

          {/* Twitter */}
          <button
            onClick={shareToTwitter}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/20 text-white transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-[#1DA1F2]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-[20px]">𝕏</span>
            </div>
            <span className="text-sm font-semibold">Twitter / X</span>
          </button>

          {/* Facebook */}
          <button
            onClick={shareToFacebook}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/20 text-white transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-[#1877F2]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-[20px]">👍</span>
            </div>
            <span className="text-sm font-semibold">Facebook</span>
          </button>
        </div>

        {/* URL Display */}
        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
          <p className="text-xs text-white/50 font-mono break-all">{shareUrl}</p>
        </div>
      </div>
    </div>
  );
};
