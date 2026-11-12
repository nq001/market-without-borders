import React from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { formatPrice } from '../utils/currency';

interface PrintableReceiptScreenProps {
  orderId: string;
  onBack: () => void;
}

export const PrintableReceiptScreen: React.FC<PrintableReceiptScreenProps> = ({
  orderId,
  onBack,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-sand/20 py-8 px-4 font-sans text-ink">
      {/* Print Trigger Bar (Hidden during actual print) */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-forest hover:text-amber transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Order</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold px-6 py-2.5 text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Receipt / Save PDF</span>
        </button>
      </div>

      {/* Invoice Card */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-14 shadow-lg border border-sand print:border-none print:shadow-none print:p-0">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-sand">
          <Logo className="h-9 w-auto" />
          <div className="sm:text-right text-xs text-muted space-y-1">
            <h2 className="text-xl font-heading font-bold text-ink">OFFICIAL RECEIPT</h2>
            <div>Invoice #: <strong className="font-mono text-ink">INV-{orderId}</strong></div>
            <div>Date: November 10, 2026</div>
            <div>Payment: Paid via Credit Card (Auth: 99421)</div>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-2 gap-8 py-8 border-b border-sand text-xs leading-relaxed">
          <div>
            <span className="font-bold uppercase text-muted block mb-1">Billed To</span>
            <div className="font-semibold text-sm text-ink">Jane Doe</div>
            <div className="text-muted">100 Market Street, Suite 400</div>
            <div className="text-muted">San Francisco, CA 94105, United States</div>
            <div className="text-muted">+1 555-0182</div>
          </div>
          <div>
            <span className="font-bold uppercase text-muted block mb-1">Merchant Details</span>
            <div className="font-semibold text-sm text-ink">Market Without Borders Inc.</div>
            <div className="text-muted">Tax ID: US-992-8819-01</div>
            <div className="text-muted">support@mwb.example</div>
          </div>
        </div>

        {/* Items Table with Multi-Store Partitioning (Section 4.4) */}
        <div className="py-8 border-b border-sand space-y-6">
          <div className="space-y-4">
            <div className="text-xs font-bold text-forest uppercase tracking-wider">
              Store Sub-Order 1: Artisan Handcrafts (Status: Placed & Routing to Workshop)
            </div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-sand text-muted uppercase tracking-wider text-[10px]">
                  <th className="pb-2">Description</th>
                  <th className="pb-2">SKU</th>
                  <th className="pb-2 text-center">Qty</th>
                  <th className="pb-2 text-right">Price</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/50">
                <tr>
                  <td className="py-3 font-semibold text-ink">Terracotta Handcrafted Vase</td>
                  <td className="py-3 text-muted font-mono">THV-001</td>
                  <td className="py-3 text-center">2</td>
                  <td className="py-3 text-right">{formatPrice(4500)}</td>
                  <td className="py-3 text-right font-semibold">{formatPrice(9000)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-4 pt-4 border-t border-sand/40">
            <div className="text-xs font-bold text-forest uppercase tracking-wider">
              Store Sub-Order 2: Heritage Textiles (Status: Placed & Routing to Workshop)
            </div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-sand text-muted uppercase tracking-wider text-[10px]">
                  <th className="pb-2">Description</th>
                  <th className="pb-2">SKU</th>
                  <th className="pb-2 text-center">Qty</th>
                  <th className="pb-2 text-right">Price</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/50">
                <tr>
                  <td className="py-3 font-semibold text-ink">Organic Indigo Wool Blanket</td>
                  <td className="py-3 text-muted font-mono">IWB-002</td>
                  <td className="py-3 text-center">1</td>
                  <td className="py-3 text-right">{formatPrice(12000)}</td>
                  <td className="py-3 text-right font-semibold">{formatPrice(12000)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="py-6 space-y-2 text-xs">
          <div className="flex justify-between text-muted">
            <span>Subtotal (Multi-Store Consolidated)</span>
            <span>{formatPrice(21000)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Shipping</span>
            <span>0.00 (Free Express)</span>
          </div>
          <div className="flex justify-between text-base font-bold text-ink pt-3 border-t border-sand">
            <span>Total Paid</span>
            <span className="font-heading text-xl">{formatPrice(21000)}</span>
          </div>
        </div>

        <div className="text-center text-[11px] text-muted pt-8 border-t border-sand">
          Thank you for choosing Market Without Borders. For questions, contact support@mwb.example.
        </div>
      </div>
    </div>
  );
};

