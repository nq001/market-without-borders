import React from 'react';
import { ArrowLeft, Search, Compass } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';

interface NotFoundScreenProps {
  onBackToHome: () => void;
  onNavigateCatalog: () => void;
}

export const NotFoundScreen: React.FC<NotFoundScreenProps> = ({
  onBackToHome,
  onNavigateCatalog,
}) => {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-sand mx-auto flex items-center justify-center text-forest">
          <Compass className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-muted block">Error 404</span>

        <h1 className="text-4xl sm:text-5xl font-heading text-ink">
          Lost in transit.
        </h1>

        <p className="text-sm sm:text-base text-muted max-w-md mx-auto leading-relaxed">
          The requested page or department does not exist, or has been moved to a new aisle.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={onBackToHome}
            className="w-full sm:w-auto rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold px-8 py-3.5 text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </button>

          <button
            type="button"
            onClick={onNavigateCatalog}
            className="w-full sm:w-auto rounded-[999px] bg-sand hover:bg-sand-hover text-ink font-semibold px-8 py-3.5 text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Explore Catalog</span>
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

