import React, { useEffect } from "react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const icons = {
    success: "check_circle",
    error: "error",
    warning: "warning",
    info: "info",
  };

  const colors = {
    success: "bg-green-500/20 border-green-500/40 text-green-400",
    error: "bg-red-500/20 border-red-500/40 text-red-400",
    warning: "bg-yellow-500/20 border-yellow-500/40 text-yellow-400",
    info: "bg-blue-500/20 border-blue-500/40 text-blue-400",
  };

  return (
    <div
      className={`w-full max-w-[380px] rounded-xl border backdrop-blur-xl p-4 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300 ${
        colors[toast.type]
      }`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <span className="material-symbols-outlined text-[22px]">
            {icons[toast.type]}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white mb-0.5">{toast.title}</p>
          <p className="text-xs text-white/80 leading-relaxed">{toast.message}</p>
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white transition-all"
          aria-label="Tutup notifikasi"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
  );
};

export default Toast;
