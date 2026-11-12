import React, { useState } from 'react';
import { OwnerLayout } from '../../components/owner/OwnerLayout';
import {
  Settings,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  User,
  LogOut,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface StoreEditRequestRecord {
  id: string;
  storeNameRequested: string;
  themeRequested: string;
  descriptionRequested: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejection_reason?: string;
  submittedAt: string;
}

interface OwnerSettingsScreenProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
  storeName?: string;
}

export const OwnerSettingsScreen: React.FC<OwnerSettingsScreenProps> = ({
  onNavigate,
  onLogout,
  storeName = 'Artisan Handcrafts',
}) => {
  const { showToast } = useToast();

  // Section 3.4: Store Edit Requests State Machine
  const [requests, setRequests] = useState<StoreEditRequestRecord[]>([
    {
      id: 'REQ-501',
      storeNameRequested: 'Artisan Handcrafts & Pottery',
      themeRequested: '#1F3A2B Forest Shade',
      descriptionRequested: 'Studio expanding from pottery into custom kiln-fired clay tableware.',
      status: 'REJECTED',
      rejection_reason: 'Proposed store description exceeds marketplace length criteria. Please consolidate.',
      submittedAt: '2026-11-11',
    },
  ]);

  // Form inputs for new / resubmitted request
  const [reqStoreName, setReqStoreName] = useState(storeName);
  const [reqTheme, setReqTheme] = useState('Deep Forest Emerald');
  const [reqDesc, setReqDesc] = useState('Specialist studio crafting terracotta vases and oak tableware.');
  const [activeResubmitId, setActiveResubmitId] = useState<string | null>('REQ-501');

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeResubmitId) {
      // Resubmit flow (Section 3.4)
      setRequests((prev) =>
        prev.map((r) =>
          r.id === activeResubmitId
            ? {
                ...r,
                storeNameRequested: reqStoreName,
                themeRequested: reqTheme,
                descriptionRequested: reqDesc,
                status: 'PENDING',
                rejection_reason: undefined,
              }
            : r,
        ),
      );
      showToast({
        type: 'success',
        title: 'Request Resubmitted',
        description: 'Updated store edit request sent to Admin for re-evaluation.',
      });
      setActiveResubmitId(null);
    } else {
      // New proposal
      const newReq: StoreEditRequestRecord = {
        id: `REQ-${Math.floor(Math.random() * 900 + 100)}`,
        storeNameRequested: reqStoreName,
        themeRequested: reqTheme,
        descriptionRequested: reqDesc,
        status: 'PENDING',
        submittedAt: new Date().toISOString().split('T')[0],
      };
      setRequests((prev) => [newReq, ...prev]);
      showToast({
        type: 'success',
        title: 'Edit Request Sent',
        description: 'Your proposed changes have been forwarded to the Super Admin.',
      });
    }
  };

  return (
    <OwnerLayout currentPath="/owner/settings" storeName={storeName} onNavigate={onNavigate} onLogout={onLogout}>
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">Store Settings & Edit Requests</h1>
        <p className="text-xs text-muted">Manage your owner profile, session, and propose store metadata edits to platform administration.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
        {/* Left: Store Edit Requests Form (Section 3.4) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-paper border border-sand rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-sand">
              <Send className="w-5 h-5 text-forest" />
              <h2 className="font-heading text-base font-bold text-ink">
                {activeResubmitId ? 'Resubmit Store Edit Request' : 'Request Store Changes (Admin Approval Required)'}
              </h2>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1">Proposed Store Name</label>
                <input
                  type="text"
                  required
                  value={reqStoreName}
                  onChange={(e) => setReqStoreName(e.target.value)}
                  className="w-full bg-sand/40 border border-sand rounded-xl px-3.5 py-2.5 text-xs text-ink outline-none focus:ring-1 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Proposed Theme / Palette</label>
                <input
                  type="text"
                  required
                  value={reqTheme}
                  onChange={(e) => setReqTheme(e.target.value)}
                  className="w-full bg-sand/40 border border-sand rounded-xl px-3.5 py-2.5 text-xs text-ink outline-none focus:ring-1 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Proposed Store Description</label>
                <textarea
                  rows={3}
                  required
                  value={reqDesc}
                  onChange={(e) => setReqDesc(e.target.value)}
                  className="w-full bg-sand/40 border border-sand rounded-xl px-3.5 py-2 text-xs text-ink outline-none focus:ring-1 focus:ring-forest resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold py-3 text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{activeResubmitId ? 'Resubmit Proposal to Admin' : 'Submit Edit Request'}</span>
              </button>
            </form>
          </div>

          {/* Request History & Rejection Details (Section 3.4) */}
          <div className="bg-paper border border-sand rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-base font-bold text-ink pb-2 border-b border-sand">
              Request Status & History
            </h3>
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r.id} className="p-4 rounded-xl border border-sand bg-sand/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-ink">{r.id}</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        r.status === 'PENDING'
                          ? 'bg-amber text-ink'
                          : r.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {r.status === 'PENDING' && <Clock className="w-3 h-3" />}
                      {r.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3" />}
                      {r.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                      <span>{r.status}</span>
                    </span>
                  </div>

                  <div className="text-muted">
                    Requested Name: <strong className="text-ink">{r.storeNameRequested}</strong>
                  </div>

                  {/* Rejection Reason Display & Resubmit Trigger (Section 3.4) */}
                  {r.status === 'REJECTED' && r.rejection_reason && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 space-y-2 mt-2">
                      <div className="flex items-start gap-1.5 font-semibold">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>Admin Rejection Reason:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">{r.rejection_reason}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveResubmitId(r.id);
                          setReqStoreName(r.storeNameRequested);
                          setReqDesc(r.descriptionRequested);
                          showToast({
                            type: 'info',
                            title: 'Resubmit Mode Enabled',
                            description: 'Make your revisions above and click resubmit.',
                          });
                        }}
                        className="px-3 py-1 rounded-[999px] bg-red-700 text-paper font-semibold text-[11px] hover:bg-red-800 flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Resubmit with Revisions</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: My Profile & Session Controls (Section 3.4) */}
        <div className="bg-paper border border-sand rounded-2xl p-6 shadow-xs h-fit space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-sand">
            <User className="w-5 h-5 text-forest" />
            <h2 className="font-heading text-base font-bold text-ink">My Profile</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted block text-[11px] font-semibold uppercase">Logged in as</span>
              <div className="font-bold text-sm text-ink mt-0.5">Fulfillment Staff</div>
              <div className="text-muted">staff@mwb.com</div>
            </div>

            <div>
              <span className="text-muted block text-[11px] font-semibold uppercase">Platform Role</span>
              <div className="inline-block px-2.5 py-0.5 rounded-[999px] bg-purple-100 text-purple-800 font-semibold text-[10px] mt-1">
                STORE OWNER / STAFF
              </div>
            </div>

            <div>
              <span className="text-muted block text-[11px] font-semibold uppercase">Assigned Store</span>
              <div className="font-semibold text-forest mt-0.5">{storeName}</div>
            </div>
          </div>

          <div className="pt-4 border-t border-sand">
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[999px] bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
};

