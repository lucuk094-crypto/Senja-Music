import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-md text-center">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-rose-400 text-[32px]">
                  error
                </span>
              </div>
              
              <h2 className="text-xl font-bold text-white mb-2">
                Oops! Terjadi Kesalahan
              </h2>
              
              <p className="text-sm text-white/70 mb-4">
                Aplikasi mengalami error yang tidak terduga. Silakan coba refresh halaman.
              </p>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="text-xs text-white/50 cursor-pointer hover:text-white mb-2">
                    Detail Error (Development)
                  </summary>
                  <pre className="text-[10px] text-rose-400 bg-black/30 p-3 rounded-xl overflow-auto max-h-40">
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex space-x-2 mt-6">
                <button
                  onClick={this.handleReset}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all"
                >
                  Coba Lagi
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all"
                >
                  Refresh Halaman
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Spinner Component
export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "Memuat..." }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 py-12">
      <span className="material-symbols-outlined text-4xl text-white/80 animate-spin">
        progress_activity
      </span>
      <p className="text-sm text-white/60 font-medium">{message}</p>
    </div>
  );
};

// Error Message Component
export const ErrorMessage: React.FC<{ message: string; onRetry?: () => void }> = ({
  message,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 py-12 px-4">
      <div className="w-14 h-14 rounded-full bg-rose-500/20 flex items-center justify-center">
        <span className="material-symbols-outlined text-rose-400 text-[28px]">
          error
        </span>
      </div>
      <p className="text-sm text-white/70 text-center max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
};

// Empty State Component
export const EmptyState: React.FC<{ 
  icon?: string; 
  title: string; 
  message?: string;
  action?: { label: string; onClick: () => void };
}> = ({ icon = "inbox", title, message, action }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
        <span className="material-symbols-outlined text-white/40 text-[32px]">
          {icon}
        </span>
      </div>
      <h3 className="text-base font-bold text-white">{title}</h3>
      {message && (
        <p className="text-xs text-white/60 text-center max-w-xs">{message}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all mt-2"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
