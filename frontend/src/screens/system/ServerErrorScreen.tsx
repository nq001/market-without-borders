import React, { useState } from 'react';
import { AlertOctagon, RefreshCw, ArrowLeft } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';

interface ServerErrorScreenProps {
  onRetry: () => void;
  onBackToHome: () => void;
}

export const ServerErrorScreen: React.FC<ServerErrorScreenProps> = ({
  onRetry,
  onBackToHome,
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      onRetry();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-100 mx-auto flex items-center justify-center text-red-600">
          <AlertOctagon className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-red-800 block">
          Error 500 — Service Offline
        </span>

        <h1 className="text-4xl sm:text-5xl font-heading text-ink">
          Temporary Outage.
        </h1>

        <p className="text-sm sm:text-base text-muted max-w-md mx-auto leading-relaxed">
          We encountered an unexpected database connection pause. Your active checkout session and reserved items remain protected.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            type="button"
            disabled={isRetrying}
            onClick={handleRetry}
            className="w-full sm:w-auto rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold px-8 py-3.5 text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Re-establishing connection...' : 'Retry Connection'}</span>
          </button>

          <button
            type="button"
            onClick={onBackToHome}
            className="w-full sm:w-auto rounded-[999px] bg-sand hover:bg-sand-hover text-ink font-semibold px-8 py-3.5 text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Store</span>
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

