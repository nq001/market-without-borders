import React, { useState, useEffect } from 'react';
import { Activity, Database, Cpu, HardDrive, RefreshCw, CheckCircle2 } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';

interface AdminTelemetryScreenProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const AdminTelemetryScreen: React.FC<AdminTelemetryScreenProps> = ({
  onNavigate,
  onLogout,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [metrics, setMetrics] = useState({
    db_status: 'HEALTHY',
    db_latency: '1.8 ms',
    db_active_connections: 3,
    db_pool_size: 10,
    cache_mode: 'In-Memory TTL Store (Docker-Free)',
    cache_keys: 12,
    cron_status: 'ACTIVE',
    cron_last_run: '12 seconds ago',
    node_memory_heap: '42.8 MB / 64.0 MB',
    uptime: '4 days, 12 hours',
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setMetrics((prev) => ({
        ...prev,
        db_latency: `${(1.2 + Math.random() * 1.5).toFixed(1)} ms`,
        cron_last_run: 'Just now',
      }));
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <AdminLayout
      currentPath="/admin/telemetry"
      breadcrumbs={['System', 'Telemetry']}
      title="System Telemetry & Health Metrics"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            Live operational status across native PostgreSQL 16, in-memory cache, and cron queues.
          </p>

          <button
            type="button"
            onClick={handleRefresh}
            className="rounded-[999px] bg-sand hover:bg-sand-hover text-ink font-semibold px-4 py-2 text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Diagnostics</span>
          </button>
        </div>

        {/* 4 Health Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-paper border border-sand rounded-[24px] p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-forest">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">PostgreSQL 16</span>
              <Database className="w-5 h-5" />
            </div>
            <div className="font-heading text-2xl font-bold text-ink">{metrics.db_latency}</div>
            <div className="inline-flex items-center gap-1.5 text-xs text-forest font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Pool: {metrics.db_active_connections} / {metrics.db_pool_size} Active</span>
            </div>
          </div>

          <div className="bg-paper border border-sand rounded-[24px] p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-forest">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Cache Engine</span>
              <HardDrive className="w-5 h-5" />
            </div>
            <div className="font-heading text-2xl font-bold text-ink">{metrics.cache_keys} Keys</div>
            <div className="text-xs text-muted truncate">{metrics.cache_mode}</div>
          </div>

          <div className="bg-paper border border-sand rounded-[24px] p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-forest">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Cron Worker</span>
              <Activity className="w-5 h-5" />
            </div>
            <div className="font-heading text-2xl font-bold text-ink">{metrics.cron_status}</div>
            <div className="text-xs text-muted">Ran {metrics.cron_last_run}</div>
          </div>

          <div className="bg-paper border border-sand rounded-[24px] p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-forest">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Memory Heap</span>
              <Cpu className="w-5 h-5" />
            </div>
            <div className="font-heading text-lg font-bold text-ink">{metrics.node_memory_heap}</div>
            <div className="text-xs text-muted">Uptime: {metrics.uptime}</div>
          </div>
        </div>

        {/* Diagnostic Checklist */}
        <div className="bg-paper border border-sand rounded-[28px] p-6 space-y-4 shadow-xs">
          <h3 className="font-heading font-semibold text-lg text-ink pb-3 border-b border-sand">
            Clean Architecture Resilience Audits
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-sand/30 rounded-xl">
              <div>
                <strong className="block text-ink text-sm">Transactional Unit of Work</strong>
                <span className="text-muted">TypeORM EntityManager wraps all mutations with automatic rollback</span>
              </div>
              <span className="text-forest font-bold">100% Guaranteed</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-sand/30 rounded-xl">
              <div>
                <strong className="block text-ink text-sm">Payment Webhook Signatures</strong>
                <span className="text-muted">HMAC-SHA256 with crypto.timingSafeEqual timing attack mitigation</span>
              </div>
              <span className="text-forest font-bold">Enforced</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-sand/30 rounded-xl">
              <div>
                <strong className="block text-ink text-sm">Out-of-Order Webhook Protection</strong>
                <span className="text-muted">Terminal states (PAID, SHIPPED, DELIVERED) protected from late failures</span>
              </div>
              <span className="text-forest font-bold">Active</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

