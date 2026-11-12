import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Store,
  ArrowRight,
  Search,
  Filter,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface EditRequest {
  id: string;
  store_id: string;
  store_name: string;
  owner_email: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESUBMITTED';
  rejection_reason?: string;
  created_at: string;
  current_values: Record<string, any>;
  requested_changes: Record<string, any>;
}

interface AdminEditRequestsScreenProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const AdminEditRequestsScreen: React.FC<AdminEditRequestsScreenProps> = ({
  onNavigate,
  onLogout,
}) => {
  const { showToast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<EditRequest | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const [requests, setRequests] = useState<EditRequest[]>([
    {
      id: 'req-1',
      store_id: 'store-1',
      store_name: 'Artisan Handcrafts',
      owner_email: 'staff@mwb.com',
      status: 'PENDING',
      created_at: '2026-11-12 11:30 AM',
      current_values: {
        name: 'Artisan Handcrafts',
        description: 'Handmade pottery, woven ceramics, and fine woodcraft items.',
        theme_primary_color: '#123B30',
        support_phone: '+1 555-0199',
      },
      requested_changes: {
        name: 'Artisan Studio & Handcrafts',
        description: 'Exquisite bespoke artisan pottery, sustainable textiles, and heirloom ceramics.',
        theme_primary_color: '#1A4D3E',
        support_phone: '+1 555-0244',
      },
    },
    {
      id: 'req-2',
      store_id: 'store-2',
      store_name: 'Heritage Textiles',
      owner_email: 'marcus@heritage.com',
      status: 'RESUBMITTED',
      created_at: '2026-11-11 04:15 PM',
      current_values: {
        name: 'Heritage Textiles',
        banner_url: 'https://images.unsplash.com/photo-textiles',
      },
      requested_changes: {
        name: 'Heritage Loom & Dye Co.',
        banner_url: 'https://images.unsplash.com/photo-handloom-artisan',
      },
    },
  ]);

  const handleApprove = (reqId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'APPROVED' } : r)),
    );
    setSelectedRequest(null);
    showToast({
      type: 'success',
      title: 'Store Edit Request Approved',
      description: 'Changes have been merged into the store profile.',
    });
  };

  const handleReject = () => {
    if (!selectedRequest || !rejectReasonInput.trim()) return;

    setRequests((prev) =>
      prev.map((r) =>
        r.id === selectedRequest.id
          ? { ...r, status: 'REJECTED', rejection_reason: rejectReasonInput }
          : r,
      ),
    );
    showToast({
      type: 'info',
      title: 'Store Edit Request Rejected',
      description: 'The owner has been notified and may resubmit with corrections.',
    });
    setIsRejectModalOpen(false);
    setSelectedRequest(null);
    setRejectReasonInput('');
  };

  return (
    <AdminLayout currentPath="/admin/edit-requests" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-ink">Store Edit Requests</h1>
          <p className="text-sm text-muted mt-1">
            Review store modifications requested by owners with side-by-side verification.
          </p>
        </div>

        {/* Requests List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">Submitted Requests</h2>
            {requests.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRequest(r)}
                className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
                  selectedRequest?.id === r.id
                    ? 'border-forest bg-forest/5'
                    : 'border-sand bg-paper hover:border-forest/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-heading font-bold text-sm text-ink truncate">{r.store_name}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-[999px] ${
                      r.status === 'APPROVED'
                        ? 'bg-forest/10 text-forest'
                        : r.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber/20 text-ink'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <p className="text-xs text-muted truncate">{r.owner_email}</p>
                <p className="text-[10px] text-muted mt-2">{r.created_at}</p>
              </div>
            ))}
          </div>

          {/* Side-by-Side Review Panel (Section 2.7) */}
          <div className="lg:col-span-2">
            {selectedRequest ? (
              <div className="bg-paper rounded-2xl border border-sand p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-sand pb-4">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-ink">
                      Comparing Changes: {selectedRequest.store_name}
                    </h3>
                    <p className="text-xs text-muted">Submitted by {selectedRequest.owner_email}</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-[999px] ${
                      selectedRequest.status === 'APPROVED'
                        ? 'bg-forest text-paper'
                        : selectedRequest.status === 'REJECTED'
                        ? 'bg-red-200 text-red-900'
                        : 'bg-amber text-ink'
                    }`}
                  >
                    {selectedRequest.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-sand/30 border border-sand space-y-3">
                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Current Values</h4>
                    {Object.entries(selectedRequest.current_values).map(([k, v]) => (
                      <div key={k} className="text-xs">
                        <span className="font-semibold text-ink block capitalize">{k.replace(/_/g, ' ')}:</span>
                        <span className="text-muted break-all">{String(v)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-forest/5 border border-forest/20 space-y-3">
                    <h4 className="text-xs font-bold text-forest uppercase tracking-wider">Requested Changes</h4>
                    {Object.entries(selectedRequest.requested_changes).map(([k, v]) => (
                      <div key={k} className="text-xs">
                        <span className="font-semibold text-forest block capitalize">{k.replace(/_/g, ' ')}:</span>
                        <span className="text-ink font-medium break-all">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedRequest.rejection_reason && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                    <span className="font-bold">Rejection Reason: </span>
                    <span>{selectedRequest.rejection_reason}</span>
                  </div>
                )}

                {/* Review Actions */}
                {selectedRequest.status !== 'APPROVED' && selectedRequest.status !== 'REJECTED' && (
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-sand">
                    <button
                      type="button"
                      onClick={() => setIsRejectModalOpen(true)}
                      className="px-4 py-2 rounded-xl border border-red-300 text-red-800 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                    >
                      Reject Request
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedRequest.id)}
                      className="px-5 py-2 rounded-xl bg-forest text-paper hover:bg-forest/90 text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      Approve & Apply
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-sand/20 border border-dashed border-sand rounded-2xl p-12 text-center text-muted text-sm">
                Select a store edit request on the left to inspect side-by-side changes.
              </div>
            )}
          </div>
        </div>

        {/* Rejection Reason Modal */}
        {isRejectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-paper rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
              <h3 className="font-heading font-bold text-lg text-ink">Reject Edit Request</h3>
              <p className="text-xs text-muted">
                Provide a clear reason for rejection so the store owner can adjust and resubmit.
              </p>
              <textarea
                value={rejectReasonInput}
                onChange={(e) => setRejectReasonInput(e.target.value)}
                placeholder="Explain what needs to be corrected (e.g. invalid trademark name, low resolution logo)..."
                rows={4}
                className="w-full bg-sand/60 rounded-xl p-3 text-xs text-ink outline-none focus:ring-1 focus:ring-forest"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-sand text-ink text-xs font-semibold hover:bg-sand-hover cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!rejectReasonInput.trim()}
                  onClick={handleReject}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

