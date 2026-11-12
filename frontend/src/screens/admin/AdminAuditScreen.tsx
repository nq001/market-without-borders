import React, { useState } from 'react';
import { ShieldAlert, Eye } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Drawer } from '../../components/common/Drawer';

interface AuditLogRow {
  id: string;
  actor: string;
  action: string;
  entity: string;
  ip_address: string;
  timestamp: string;
  diff: Record<string, any>;
}

interface AdminAuditScreenProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const AdminAuditScreen: React.FC<AdminAuditScreenProps> = ({
  onNavigate,
  onLogout,
}) => {
  const [logs] = useState<AuditLogRow[]>([
    {
      id: 'aud-991',
      actor: 'admin@mwb.example',
      action: 'UPDATE_INVENTORY',
      entity: 'Inventory:LAP-123',
      ip_address: '127.0.0.1',
      timestamp: 'Nov 10, 2026, 11:00 AM',
      diff: { available: { old: 40, new: 50 }, reason: 'Restock batch' },
    },
    {
      id: 'aud-990',
      actor: 'SYSTEM_WEBHOOK',
      action: 'ORDER_PAID',
      entity: 'Order:ord-94821',
      ip_address: '::1',
      timestamp: 'Nov 10, 2026, 10:15 AM',
      diff: { status: { old: 'PENDING_PAYMENT', new: 'PAID' }, amount: 150000 },
    },
    {
      id: 'aud-989',
      actor: 'customer_1@test.com',
      action: 'CHECKOUT_RESERVE',
      entity: 'Order:ord-94821',
      ip_address: '127.0.0.1',
      timestamp: 'Nov 10, 2026, 10:14 AM',
      diff: { items: [{ sku: 'LAP-123', quantity: 1 }] },
    },
  ]);

  const [selectedLog, setSelectedLog] = useState<AuditLogRow | null>(null);

  return (
    <AdminLayout
      currentPath="/admin/audit"
      breadcrumbs={['Security', 'Audit Logs']}
      title="Security & System Audit Trail"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="bg-paper border border-sand rounded-[28px] p-6 space-y-6 shadow-xs max-w-5xl">
        <div className="flex items-center gap-2 pb-3 border-b border-sand text-forest font-heading font-semibold text-lg">
          <ShieldAlert className="w-5 h-5 text-forest" />
          <span>Immutable Audit Events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-sand text-muted uppercase tracking-wider">
                <th className="pb-3">Log ID</th>
                <th className="pb-3">Actor</th>
                <th className="pb-3">Action</th>
                <th className="pb-3">Entity Target</th>
                <th className="pb-3">IP Address</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/60">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-sand/20 transition-colors">
                  <td className="py-4 font-mono font-bold text-ink">{log.id}</td>
                  <td className="py-4 font-medium text-ink">{log.actor}</td>
                  <td className="py-4 font-mono font-semibold text-forest">{log.action}</td>
                  <td className="py-4 text-muted">{log.entity}</td>
                  <td className="py-4 font-mono text-muted">{log.ip_address}</td>
                  <td className="py-4 text-muted">{log.timestamp}</td>
                  <td className="py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedLog(log)}
                      className="p-1 text-muted hover:text-forest transition-colors cursor-pointer"
                      title="Inspect Diff"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      <Drawer
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={`Audit Event: ${selectedLog?.action}`}
      >
        {selectedLog && (
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3.5 bg-sand/40 rounded-xl space-y-1 text-ink">
              <div><strong>Actor:</strong> {selectedLog.actor}</div>
              <div><strong>Entity:</strong> {selectedLog.entity}</div>
              <div><strong>IP:</strong> {selectedLog.ip_address}</div>
              <div><strong>Timestamp:</strong> {selectedLog.timestamp}</div>
            </div>

            <div>
              <span className="font-sans font-semibold text-muted uppercase tracking-wider block mb-2">
                Event State Diff
              </span>
              <pre className="p-4 bg-ink text-sand rounded-2xl overflow-x-auto text-[11px] leading-relaxed">
                {JSON.stringify(selectedLog.diff, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Drawer>
    </AdminLayout>
  );
};

