import React from 'react';
import { OwnerLayout } from '../../components/owner/OwnerLayout';
import { DollarSign, ArrowUpRight, Clock, CheckCircle2, Download } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export const OwnerEarningsScreen: React.FC<{ onNavigate: (path: string) => void; onLogout: () => void }> = ({
  onNavigate,
  onLogout,
}) => {
  const earningsSummary = {
    grossSales: 840000, // $8,400.00
    commissionDeducted: 84000, // $840.00 (10%)
    netEarnings: 756000, // $7,560.00
    pendingPayout: 756000,
    paidPayouts: 3120000, // $31,200.00
  };

  const payoutHistory = [
    {
      id: 'PO-902',
      date: 'Oct 31, 2026',
      period: 'Oct 15 - Oct 31',
      amount: 142000,
      status: 'PAID',
      method: 'Bank Wire (...9012)',
    },
    {
      id: 'PO-881',
      date: 'Oct 15, 2026',
      period: 'Oct 01 - Oct 15',
      amount: 170000,
      status: 'PAID',
      method: 'Bank Wire (...9012)',
    },
  ];

  return (
    <OwnerLayout currentPath="/owner/earnings" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-ink">Earnings & Payouts</h1>
            <p className="text-sm text-muted mt-1">
              Track store revenue, platform fee deductions, and scheduled banking disbursements.
            </p>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-paper border border-sand shadow-xs">
            <span className="text-xs font-semibold text-muted">Store Gross Sales</span>
            <div className="text-2xl font-heading font-bold text-ink mt-1.5">{formatCurrency(earningsSummary.grossSales)}</div>
            <span className="text-[11px] text-forest font-semibold flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% this cycle
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-paper border border-sand shadow-xs">
            <span className="text-xs font-semibold text-muted">Platform Fee (10%)</span>
            <div className="text-2xl font-heading font-bold text-muted mt-1.5">{formatCurrency(earningsSummary.commissionDeducted)}</div>
            <span className="text-[11px] text-muted mt-1 block">Automatic standard fee</span>
          </div>

          <div className="p-5 rounded-2xl bg-paper border border-sand shadow-xs">
            <span className="text-xs font-semibold text-muted">Net Earnings</span>
            <div className="text-2xl font-heading font-bold text-forest mt-1.5">{formatCurrency(earningsSummary.netEarnings)}</div>
            <span className="text-[11px] text-forest font-semibold mt-1 block">Disbursable balance</span>
          </div>

          <div className="p-5 rounded-2xl bg-paper border border-sand shadow-xs">
            <span className="text-xs font-semibold text-muted">Next Scheduled Payout</span>
            <div className="text-2xl font-heading font-bold text-amber mt-1.5">{formatCurrency(earningsSummary.pendingPayout)}</div>
            <span className="text-[11px] text-muted mt-1 block">Scheduled for Nov 15</span>
          </div>
        </div>

        {/* Historical Disbursements Table */}
        <div className="bg-paper rounded-2xl border border-sand overflow-hidden shadow-xs">
          <div className="p-5 border-b border-sand flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-ink">Settlement History</h3>
            <span className="text-xs text-muted">Direct deposit receipts</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-sand/40 border-b border-sand text-muted font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Reference</th>
                <th className="p-4">Sales Cycle</th>
                <th className="p-4">Disbursed Amount</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {payoutHistory.map((po) => (
                <tr key={po.id} className="hover:bg-sand/20 transition-colors">
                  <td className="p-4 font-bold text-ink">{po.id}</td>
                  <td className="p-4 text-muted">{po.period}</td>
                  <td className="p-4 font-bold text-ink">{formatCurrency(po.amount)}</td>
                  <td className="p-4 text-muted">{po.method}</td>
                  <td className="p-4">
                    <span className="text-forest font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {po.status}
                    </span>
                  </td>
                  <td className="p-4 text-right text-muted">{po.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </OwnerLayout>
  );
};

