import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Store,
  User,
  Calendar,
  Search,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface ComplaintItem {
  id: string;
  customer_name: string;
  customer_email: string;
  store_name: string;
  store_id: string;
  order_id?: string;
  reason: string;
  details: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  admin_action: 'NONE' | 'STORE_SUSPENDED' | 'WARNING_ISSUED';
  created_at: string;
}

interface AdminComplaintsScreenProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const AdminComplaintsScreen: React.FC<AdminComplaintsScreenProps> = ({
  onNavigate,
  onLogout,
}) => {
  const { showToast } = useToast();
  const [complaints, setComplaints] = useState<ComplaintItem[]>([
    {
      id: 'CMP-101',
      customer_name: 'Jane Customer',
      customer_email: 'customer@mwb.com',
      store_name: 'Artisan Handcrafts',
      store_id: 'store-1',
      order_id: 'ORD-8821',
      reason: 'Defective product received & unresponsive support',
      details: 'Vase was broken on arrival. Store owner has not responded to replacement inquiries for 4 days.',
      status: 'PENDING',
      admin_action: 'NONE',
      created_at: '2026-11-12',
    },
    {
      id: 'CMP-100',
      customer_name: 'David Kim',
      customer_email: 'david.kim@example.com',
      store_name: 'Heritage Textiles',
      store_id: 'store-2',
      reason: 'Misrepresented fabric blend',
      details: 'Item was advertised as 100% organic wool but tag indicates synthetic blend.',
      status: 'RESOLVED',
      admin_action: 'WARNING_ISSUED',
      created_at: '2026-11-09',
    },
  ]);

  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);

  // Section 2.4: Admin Verifies Complaint and Suspends Store
  const handleSuspendStoreAction = (complaintId: string, storeName: string) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId
          ? { ...c, status: 'RESOLVED', admin_action: 'STORE_SUSPENDED' }
          : c,
      ),
    );

    showToast({
      type: 'warning',
      title: 'Store Suspended',
      description: `Store "${storeName}" has been suspended due to verified customer complaint.`,
    });
    setSelectedComplaint(null);
  };

  const handleDismissComplaint = (complaintId: string) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId
          ? { ...c, status: 'DISMISSED', admin_action: 'NONE' }
          : c,
      ),
    );

    showToast({
      type: 'info',
      title: 'Complaint Dismissed',
      description: 'Complaint marked as dismissed after review.',
    });
    setSelectedComplaint(null);
  };

  return (
    <AdminLayout currentPath="/admin/complaints" onNavigate={onNavigate} onLogout={onLogout}>
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">Customer Complaints & Disputes</h1>
        <p className="text-xs text-muted">Verify customer complaints against stores and enforce platform compliance or store suspensions.</p>
      </div>

      {/* Complaints List (Section 2.4) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Queue */}
        <div className="lg:col-span-2 space-y-4">
          {complaints.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedComplaint(c)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                selectedComplaint?.id === c.id
                  ? 'bg-paper border-forest ring-1 ring-forest shadow-md'
                  : 'bg-paper border-sand hover:border-sand-hover shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-ink">{c.id}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        c.status === 'PENDING'
                          ? 'bg-amber text-ink font-bold'
                          : c.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-sand text-muted'
                      }`}
                    >
                      {c.status}
                    </span>
                    {c.admin_action === 'STORE_SUSPENDED' && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                        Store Suspended
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading text-sm font-bold text-ink mt-2">{c.reason}</h3>
                  <p className="text-xs text-muted line-clamp-2 mt-1">{c.details}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-sand flex items-center justify-between text-xs text-muted">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-forest" />
                    <strong className="text-ink">{c.store_name}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>{c.customer_name}</span>
                  </span>
                </div>
                <span>{c.created_at}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Verification & Action Panel */}
        <div className="bg-paper border border-sand rounded-2xl p-6 shadow-xs h-fit sticky top-24">
          <h2 className="font-heading text-base font-bold text-ink mb-4 pb-3 border-b border-sand">
            Complaint Investigation
          </h2>

          {selectedComplaint ? (
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-muted block text-[11px] font-semibold uppercase">Target Store</span>
                <div className="font-bold text-sm text-ink mt-0.5">{selectedComplaint.store_name}</div>
              </div>

              <div>
                <span className="text-muted block text-[11px] font-semibold uppercase">Complainant</span>
                <div className="font-medium text-ink mt-0.5">{selectedComplaint.customer_name} ({selectedComplaint.customer_email})</div>
              </div>

              {selectedComplaint.order_id && (
                <div>
                  <span className="text-muted block text-[11px] font-semibold uppercase">Order Reference</span>
                  <div className="font-mono text-ink mt-0.5">{selectedComplaint.order_id}</div>
                </div>
              )}

              <div>
                <span className="text-muted block text-[11px] font-semibold uppercase">Claim Details</span>
                <div className="p-3 bg-sand/30 rounded-xl text-ink leading-relaxed mt-1">
                  {selectedComplaint.details}
                </div>
              </div>

              {/* Action Buttons (Section 2.4) */}
              {selectedComplaint.status === 'PENDING' && (
                <div className="pt-4 border-t border-sand space-y-2.5">
                  <button
                    type="button"
                    onClick={() => handleSuspendStoreAction(selectedComplaint.id, selectedComplaint.store_name)}
                    className="w-full rounded-[999px] bg-red-700 hover:bg-red-800 text-paper font-semibold py-2.5 text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Verify & Suspend Store</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDismissComplaint(selectedComplaint.id)}
                    className="w-full rounded-[999px] bg-sand hover:bg-sand-hover text-ink font-semibold py-2.5 text-xs transition-all cursor-pointer"
                  >
                    Dismiss Complaint
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-muted text-xs">
              Select a complaint from the queue to verify details and take administrative action.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

