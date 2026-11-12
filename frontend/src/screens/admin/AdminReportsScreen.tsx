import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { BarChart3, Download, Calendar, Filter, FileSpreadsheet } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminReportsScreen: React.FC<{ onNavigate: (path: string) => void; onLogout: () => void }> = ({
  onNavigate,
  onLogout,
}) => {
  const { showToast } = useToast();
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('last_30_days');

  const handleExportCSV = () => {
    // Generate CSV content
    const csvContent =
      'data:text/csv;charset=utf-8,Period,Store,Metric,Value\nNov 2026,Artisan Handcrafts,Gross Sales,$8,400.00\nNov 2026,Heritage Textiles,Gross Sales,$4,080.00\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MWB_${reportType}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      type: 'success',
      title: 'Report Exported',
      description: `CSV file downloaded for ${reportType} report.`,
    });
  };

  return (
    <AdminLayout currentPath="/admin/reports" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-ink">Analytical Reports</h1>
            <p className="text-sm text-muted mt-1">
              Export comprehensive sales, store performance, customer traffic, and growth telemetry.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-5 py-2.5 rounded-xl bg-forest text-paper text-xs font-semibold hover:bg-forest/90 cursor-pointer shadow-xs flex items-center gap-2 self-start md:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filter Configuration */}
        <div className="bg-paper rounded-2xl border border-sand p-6 shadow-xs flex flex-wrap gap-4 items-center">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-muted uppercase tracking-wider">Report Domain</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="bg-sand/60 rounded-xl px-4 py-2.5 text-xs font-semibold text-ink outline-none cursor-pointer"
            >
              <option value="sales">Gross Sales & Orders Breakdown</option>
              <option value="stores">Store Performance & Fulfillment Metrics</option>
              <option value="users">User Growth & Approval Turnaround</option>
              <option value="traffic">Category Traffic & Search Insights</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-muted uppercase tracking-wider">Time Window</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-sand/60 rounded-xl px-4 py-2.5 text-xs font-semibold text-ink outline-none cursor-pointer"
            >
              <option value="today">Today (Realtime)</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="this_quarter">Current Quarter</option>
              <option value="year_to_date">Year to Date</option>
            </select>
          </div>
        </div>

        {/* Mock Analytics Report Summary */}
        <div className="bg-paper rounded-2xl border border-sand p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-sand pb-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-forest" />
              <h3 className="font-heading font-bold text-base text-ink">Aggregated Summary</h3>
            </div>
            <span className="text-xs text-muted">Generated Nov 12, 2026</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-sand/30">
              <span className="text-xs text-muted block mb-1">Captured Orders</span>
              <span className="text-xl font-heading font-bold text-ink">1,482</span>
            </div>
            <div className="p-4 rounded-xl bg-sand/30">
              <span className="text-xs text-muted block mb-1">Avg Order Value</span>
              <span className="text-xl font-heading font-bold text-forest">$84.20</span>
            </div>
            <div className="p-4 rounded-xl bg-sand/30">
              <span className="text-xs text-muted block mb-1">Store Participation</span>
              <span className="text-xl font-heading font-bold text-ink">100% active</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

