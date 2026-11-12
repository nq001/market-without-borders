import React, { useState } from 'react';
import { Truck, CheckCircle2, ArrowRight } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../utils/currency';

interface ShipmentRow {
  id: string;
  order_id: string;
  customer_name: string;
  destination: string;
  carrier: string;
  tracking_number: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED';
  total: number;
}

interface AdminShippingScreenProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const AdminShippingScreen: React.FC<AdminShippingScreenProps> = ({
  onNavigate,
  onLogout,
}) => {
  const { showToast } = useToast();
  const [shipments, setShipments] = useState<ShipmentRow[]>([
    {
      id: 'shp-1',
      order_id: 'ord-94821',
      customer_name: 'Jane Doe',
      destination: 'San Francisco, CA',
      carrier: 'DHL Express',
      tracking_number: 'EXP-99281944',
      status: 'IN_TRANSIT',
      total: 150000,
    },
    {
      id: 'shp-2',
      order_id: 'ord-94822',
      customer_name: 'Sarah Connor',
      destination: 'Los Angeles, CA',
      carrier: 'FedEx Priority',
      tracking_number: '',
      status: 'PENDING',
      total: 89000,
    },
  ]);

  const [selectedForDispatch, setSelectedForDispatch] = useState<ShipmentRow | null>(null);
  const [carrier, setCarrier] = useState('DHL Express');
  const [trackingNumber, setTrackingNumber] = useState('');

  const openDispatchModal = (s: ShipmentRow) => {
    setSelectedForDispatch(s);
    setCarrier('DHL Express');
    setTrackingNumber(`TRK-${Date.now().toString().slice(-6)}`);
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForDispatch) return;

    setShipments((prev) =>
      prev.map((s) =>
        s.id === selectedForDispatch.id
          ? { ...s, carrier, tracking_number: trackingNumber, status: 'IN_TRANSIT' }
          : s,
      ),
    );

    showToast({
      type: 'success',
      title: 'Consignment Dispatched',
      description: `Order #${selectedForDispatch.order_id} marked as SHIPPED with courier ${carrier}.`,
    });
    setSelectedForDispatch(null);
  };

  const handleMarkDelivered = (id: string, orderId: string) => {
    setShipments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'DELIVERED' } : s)),
    );

    showToast({
      type: 'success',
      title: 'Delivery Confirmed',
      description: `Order #${orderId} marked as DELIVERED in order state machine.`,
    });
  };

  return (
    <AdminLayout
      currentPath="/admin/shipping"
      breadcrumbs={['Fulfillment', 'Shipping & Couriers']}
      title="Courier Consignment & Shipping Logistics"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="bg-paper border border-sand rounded-[28px] p-6 space-y-6 shadow-xs max-w-5xl">
        <div className="flex items-center gap-2 pb-3 border-b border-sand text-forest font-heading font-semibold text-lg">
          <Truck className="w-5 h-5 text-forest" />
          <span>Active Consignment Queue</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-sand text-muted uppercase tracking-wider">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Destination</th>
                <th className="pb-3">Carrier</th>
                <th className="pb-3">Tracking #</th>
                <th className="pb-3">Value</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Fulfillment Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/60">
              {shipments.map((s) => (
                <tr key={s.id} className="hover:bg-sand/20 transition-colors">
                  <td className="py-4 font-mono font-bold text-ink">{s.order_id}</td>
                  <td className="py-4 font-medium text-ink">
                    <div>{s.customer_name}</div>
                    <div className="text-muted">{s.destination}</div>
                  </td>
                  <td className="py-4 text-muted">{s.carrier || 'Unassigned'}</td>
                  <td className="py-4 font-mono text-muted">{s.tracking_number || '—'}</td>
                  <td className="py-4 font-heading font-semibold text-ink">{formatPrice(s.total)}</td>
                  <td className="py-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-[999px] ${
                        s.status === 'DELIVERED'
                          ? 'bg-[#C6D8C9] text-forest'
                          : s.status === 'IN_TRANSIT'
                            ? 'bg-blue-50 text-blue-800'
                            : 'bg-amber/15 text-amber-900'
                      }`}
                    >
                      {s.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 text-right space-x-2">
                    {s.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => openDispatchModal(s)}
                        className="rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold px-4 py-1.5 transition-colors cursor-pointer"
                      >
                        Dispatch
                      </button>
                    )}

                    {s.status === 'IN_TRANSIT' && (
                      <button
                        type="button"
                        onClick={() => handleMarkDelivered(s.id, s.order_id)}
                        className="rounded-[999px] bg-[#C6D8C9] hover:bg-[#b0c7b4] text-forest font-semibold px-4 py-1.5 transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Delivery</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Courier Consignment Modal */}
      <Modal
        isOpen={!!selectedForDispatch}
        onClose={() => setSelectedForDispatch(null)}
        title={`Dispatch Shipment: ${selectedForDispatch?.order_id}`}
      >
        <form onSubmit={handleDispatchSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold uppercase text-muted mb-1">
              Select Courier Partner
            </label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full bg-sand/60 rounded-xl px-3.5 py-2.5 text-ink outline-none focus:ring-1 focus:ring-forest cursor-pointer"
            >
              <option value="DHL Express">DHL Express</option>
              <option value="FedEx Priority">FedEx Priority</option>
              <option value="UPS Worldwide">UPS Worldwide</option>
              <option value="Local Courier Fleet">Local Courier Fleet</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-muted mb-1">
              Consignment Tracking Number
            </label>
            <input
              type="text"
              required
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full bg-sand/60 rounded-xl px-3.5 py-2.5 text-ink font-mono outline-none focus:ring-1 focus:ring-forest"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-[999px] bg-forest hover:bg-forest-light text-paper font-semibold py-3 text-sm transition-all shadow-md mt-2 cursor-pointer"
          >
            Confirm Dispatch & Notify Customer
          </button>
        </form>
      </Modal>
    </AdminLayout>
  );
};

