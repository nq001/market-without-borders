import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { DollarSign, TrendingUp, Percent, ArrowUpRight, ArrowDownRight, Download, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { useToast } from '../../context/ToastContext';

interface StorePayout {
  id: string;
  store_name: string;
  gross_sales: number;
  commission_deducted: number;
  net_payout: number;
  status: 'PENDING' | 'PAID';
  period: string;
}

export const AdminFinanceScreen: React.FC<{ onNavigate: (path: string) => void; onLogout: () => void }> = ({
  onNavigate,
  onLogout,
}) => {
  const { showToast } = useToast();
  const [globalCommission, setGlobalCommission] = useState(10); // 10%
  const [payouts, setPayouts] = useState<StorePayout[]>([
    {
      id: 'po-1',
      store_name: 'Artisan Handcrafts',
      gross_sales: 840000,
      commission_deducted: 84000,
      net_payout: 756000,
      status: 'PENDING',
      period: 'Nov 1 - Nov 10, 2026',
    },
    {
      id: 'po-2',
      store_name: 'Heritage Textiles',
      gross_sales: 408000,
      commission_deducted: 40800,
      net_payout: 367200,
      status: 'PAID',
      period: 'Oct 15 - Oct 31, 2026',
    },
  ]);

  const handleProcessPayout = (id: string) => {
    setPayouts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'PAID' } : p)),
    );
    showToast({
      type: 'success',
      title: 'Payout Processed',
      description: 'Transfer issued to store settlement account.',
    });
  };

  return (
    <AdminLayout currentPath="/admin/finance" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-ink">Finance & Payouts</h1>
            <p className="text-sm text-muted mt-1">
              Platform gross sales, commissions, refund volume, and store payout ledgers.
            </p>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-paper border border-sand shadow-xs">
            <span className="text-xs font-semibold text-muted">Platform Gross Sales</span>
            <div className="text-2xl font-heading font-bold text-ink mt-1.5">{formatCurrency(1248000)}</div>
            <span className="text-[11px] text-forest font-semibold flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% vs last month
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-paper border border-sand shadow-xs">
            <span className="text-xs font-semibold text-muted">Commission Retained</span>
            <div className="text-2xl font-heading font-bold text-forest mt-1.5">{formatCurrency(124800)}</div>
            <span className="text-[11px] text-muted mt-1 block">Avg rate {globalCommission}%</span>
          </div>

          <div className="p-5 rounded-2xl bg-paper border border-sand shadow-xs">
            <span className="text-xs font-semibold text-muted">Pending Payouts</span>
            <div className="text-2xl font-heading font-bold text-amber mt-1.5">{formatCurrency(756000)}</div>
            <span className="text-[11px] text-muted mt-1 block">1 payout batch ready</span>
          </div>

          <div className="p-5 rounded-2xl bg-paper border border-sand shadow-xs">
            <span className="text-xs font-semibold text-muted">Settled Refunds</span>
            <div className="text-2xl font-heading font-bold text-ink mt-1.5">{formatCurrency(15400)}</div>
            <span className="text-[11px] text-muted mt-1 block">1.2% total return rate</span>
          </div>
        </div>

        {/* Global Commission Setting */}
        <div className="bg-paper rounded-2xl border border-sand p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-heading font-bold text-base text-ink">Global Commission Rate</h3>
            <p className="text-xs text-muted">
              Default marketplace transaction fee deducted from store sales automatically.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-sand/60 px-3 py-1.5 rounded-xl">
              <input
                type="number"
                min="0"
                max="50"
                value={globalCommission}
                onChange={(e) => setGlobalCommission(Number(e.target.value))}
                className="w-12 bg-transparent text-sm font-bold text-ink outline-none text-right"
              />
              <span className="text-xs font-semibold text-muted">%</span>
            </div>
            <button
              type="button"
              onClick={() => showToast({ type: 'success', title: 'Commission Updated', description: `Global rate saved at ${globalCommission}%.` })}
              className="px-4 py-2 rounded-xl bg-forest text-paper text-xs font-semibold hover:bg-forest/90 cursor-pointer"
            >
              Update Rate
            </button>
          </div>
        </div>

        {/* Payouts Ledger Table */}
        <div className="bg-paper rounded-2xl border border-sand overflow-hidden shadow-xs">
          <div className="p-5 border-b border-sand flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-ink">Store Payout Settlements</h3>
            <span className="text-xs text-muted">Auto-generated bi-weekly batches</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand/40 border-b border-sand text-muted font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Store</th>
                  <th className="p-4">Settlement Period</th>
                  <th className="p-4">Gross Sales</th>
                  <th className="p-4">Commission Fee</th>
                  <th className="p-4">Net Payout</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-sand/20 transition-colors">
                    <td className="p-4 font-bold text-ink">{p.store_name}</td>
                    <td className="p-4 text-muted">{p.period}</td>
                    <td className="p-4 font-semibold text-ink">{formatCurrency(p.gross_sales)}</td>
                    <td className="p-4 text-forest font-semibold">{formatCurrency(p.commission_deducted)}</td>
                    <td className="p-4 font-bold text-ink">{formatCurrency(p.net_payout)}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-[999px] text-[10px] font-bold ${
                          p.status === 'PAID' ? 'bg-forest/10 text-forest' : 'bg-amber text-ink'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {p.status === 'PENDING' ? (
                        <button
                          type="button"
                          onClick={() => handleProcessPayout(p.id)}
                          className="px-3 py-1.5 rounded-xl bg-forest text-paper text-xs font-semibold hover:bg-forest/90 cursor-pointer shadow-xs"
                        >
                          Disburse
                        </button>
                      ) : (
                        <span className="text-muted text-xs">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

