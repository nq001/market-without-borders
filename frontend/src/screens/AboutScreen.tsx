import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { ShieldCheck, Truck, Sparkles, HeartHandshake, Mail, MapPin } from 'lucide-react';

interface AboutScreenProps {
  onNavigateHome: () => void;
  onNavigateStores: () => void;
  onNavigateOrders: () => void;
  onNavigateAbout: () => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({
  onNavigateHome,
  onNavigateStores,
  onNavigateOrders,
  onNavigateAbout,
}) => {
  return (
    <div className="min-h-screen bg-sand-light flex flex-col justify-between">
      <div>
        <Header
          onNavigateHome={onNavigateHome}
          onNavigateStores={onNavigateStores}
          onNavigateOrders={onNavigateOrders}
          onNavigateAbout={onNavigateAbout}
        />

        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-16 space-y-16">
          {/* Mission Hero */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold text-forest uppercase tracking-widest bg-forest/10 px-3.5 py-1.5 rounded-[999px]">
              Our Heritage & Philosophy
            </span>
            <h1 className="text-3xl sm:text-5xl font-heading font-bold text-ink tracking-tight">
              A Unified Marketplace Without Borders
            </h1>
            <p className="text-base sm:text-lg text-muted leading-relaxed">
              We connect conscious patrons directly with verified independent craft workshops worldwide. One unified cart, transparent artisan splits, and ethical commerce without intermediaries.
            </p>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-paper border border-sand space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-forest/10 text-forest flex items-center justify-center">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-ink">Independent Artisans First</h3>
              <p className="text-xs text-muted leading-relaxed">
                Every store on MWB is vetted for authentic craftsmanship, ethical material provenance, and sustainable studio practices.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-paper border border-sand space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-forest/10 text-forest flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-ink">One Cart, Unified Checkout</h3>
              <p className="text-xs text-muted leading-relaxed">
                Add ceramics from Lisbon, handloom scarves from Jaipur, and woodwork from Kyoto in a single transaction. Each store receives its own dedicated fulfillment pipeline.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-paper border border-sand space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-forest/10 text-forest flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-ink">Buyer & Artisan Protection</h3>
              <p className="text-xs text-muted leading-relaxed">
                Automated inventory reservations, escrow settlements, and a supervised dispute resolution tribunal safeguard every order.
              </p>
            </div>
          </div>

          {/* Platform Policies & Legal Summary */}
          <div className="bg-paper rounded-3xl border border-sand p-8 sm:p-12 space-y-8 shadow-xs">
            <h2 className="text-2xl font-heading font-bold text-ink">Marketplace Policies & Guarantees</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-ink/80 leading-relaxed">
              <div>
                <h4 className="font-bold text-sm text-ink mb-2">Terms of Service</h4>
                <p className="text-muted">
                  Users agree to engage respectfully. Store owners maintain intellectual copyright over bespoke creations and are liable for honest fulfillment descriptions.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-sm text-ink mb-2">Return & Refund Policy</h4>
                <p className="text-muted">
                  Patrons may report defective or damaged handcrafted pieces within 14 days of delivery. Verified complaints initiate immediate merchant resolution or platform refund.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-sm text-ink mb-2">Data Privacy & Sovereignty</h4>
                <p className="text-muted">
                  We never broker personal patronage habits. Customer addresses and payment tokens are stored with bank-grade encryption strictly for order fulfillment.
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-sand flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-muted">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-forest" />
                <span>Global Headquarters: Market Without Borders HQ, Zurich & Amman</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-forest" />
                <span>support@mwb.example</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

