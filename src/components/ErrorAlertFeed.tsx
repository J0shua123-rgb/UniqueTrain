import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Trash2,
  X,
  Clock,
  ShieldAlert,
  Info,
  ChevronDown,
  ChevronUp,
  Bug,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ErrorSeverity } from '../types';

export const ErrorAlertFeed: React.FC = () => {
  const { errorAlerts, dismissErrorAlert, clearAllErrorAlerts, logSystemError } = useStore();
  const [filterSeverity, setFilterSeverity] = useState<'all' | ErrorSeverity>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredAlerts =
    filterSeverity === 'all'
      ? errorAlerts
      : errorAlerts.filter((alert) => alert.severity === filterSeverity);

  const criticalCount = errorAlerts.filter((a) => a.severity === 'critical').length;
  const errorCount = errorAlerts.filter((a) => a.severity === 'error').length;
  const warningCount = errorAlerts.filter((a) => a.severity === 'warning').length;

  const handleSimulateTest = (type: 'img' | 'stock' | 'api') => {
    if (type === 'img') {
      logSystemError(
        'Image Asset',
        'Failed to load remote snack thumbnail: network timeout (404/DNS)',
        'warning',
        'URL: https://example.com/missing-pastry-photo.jpg'
      );
    } else if (type === 'stock') {
      logSystemError(
        'Store Engine',
        'Pastry inventory discrepancy detected: Meat Pie quantity out-of-sync',
        'error',
        'Store cache discrepancy resolved with fallback stock state'
      );
    } else {
      logSystemError(
        'Order Dispatch',
        'WhatsApp URL encoder received unhandled special character sequence',
        'critical',
        'Encoded payload truncated safely before opening wa.me endpoint'
      );
    }
  };

  return (
    <div
      id="admin-error-alerts-section"
      className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-2xs space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              errorAlerts.length > 0
                ? 'bg-rose-100 text-rose-700 animate-pulse'
                : 'bg-stone-100 text-stone-600'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-stone-900 font-['Outfit',sans-serif]">
                System Alerts & Error Log
              </h3>
              {errorAlerts.length > 0 ? (
                <span
                  id="error-feed-warning-badge"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs"
                >
                  <AlertTriangle className="w-2.5 h-2.5" />
                  {errorAlerts.length} {errorAlerts.length === 1 ? 'Alert' : 'Alerts'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-2.5 h-2.5" /> All Systems Normal
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Live monitoring of client-side exceptions, broken image loads, and order dispatch events.
            </p>
          </div>
        </div>

        {/* Action buttons & simulation */}
        <div className="flex items-center gap-2 flex-wrap">
          {errorAlerts.length > 0 && (
            <button
              id="btn-clear-all-alerts"
              type="button"
              onClick={clearAllErrorAlerts}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 text-xs font-semibold transition-colors"
              title="Clear all alerts"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Log</span>
            </button>
          )}

          {/* Test log trigger */}
          <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 p-1 rounded-xl">
            <span className="text-[10px] font-semibold text-stone-500 px-1 flex items-center gap-1">
              <Bug className="w-3 h-3 text-stone-400" /> Test:
            </span>
            <button
              type="button"
              onClick={() => handleSimulateTest('img')}
              className="px-2 py-0.5 text-[10px] font-medium bg-white hover:bg-amber-50 text-stone-700 rounded-md border border-stone-200 transition-colors"
            >
              Asset
            </button>
            <button
              type="button"
              onClick={() => handleSimulateTest('stock')}
              className="px-2 py-0.5 text-[10px] font-medium bg-white hover:bg-rose-50 text-stone-700 rounded-md border border-stone-200 transition-colors"
            >
              Engine
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setFilterSeverity('all')}
          className={`px-3 py-1 rounded-lg font-medium transition-all ${
            filterSeverity === 'all'
              ? 'bg-stone-900 text-white font-semibold shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          All ({errorAlerts.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterSeverity('critical')}
          className={`px-3 py-1 rounded-lg font-medium transition-all ${
            filterSeverity === 'critical'
              ? 'bg-rose-600 text-white font-semibold shadow-xs'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
          }`}
        >
          Critical ({criticalCount})
        </button>

        <button
          type="button"
          onClick={() => setFilterSeverity('error')}
          className={`px-3 py-1 rounded-lg font-medium transition-all ${
            filterSeverity === 'error'
              ? 'bg-amber-600 text-white font-semibold shadow-xs'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
          }`}
        >
          Errors ({errorCount})
        </button>

        <button
          type="button"
          onClick={() => setFilterSeverity('warning')}
          className={`px-3 py-1 rounded-lg font-medium transition-all ${
            filterSeverity === 'warning'
              ? 'bg-stone-700 text-white font-semibold shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          Warnings ({warningCount})
        </button>
      </div>

      {/* Alert Items List */}
      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        {filteredAlerts.length === 0 ? (
          <div className="py-8 text-center bg-stone-50/70 rounded-xl border border-dashed border-stone-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5 opacity-80" />
            <p className="text-xs font-bold text-stone-800">No active errors or alerts recorded</p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Frontend components, images, and WhatsApp link generators are operating cleanly.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isExpanded = expandedId === alert.id;
            const severityColor =
              alert.severity === 'critical'
                ? 'border-rose-300 bg-rose-50/70 text-rose-950'
                : alert.severity === 'error'
                ? 'border-amber-300 bg-amber-50/70 text-amber-950'
                : 'border-stone-200 bg-stone-50 text-stone-900';

            const badgeColor =
              alert.severity === 'critical'
                ? 'bg-rose-600 text-white'
                : alert.severity === 'error'
                ? 'bg-amber-600 text-white'
                : 'bg-stone-200 text-stone-700';

            return (
              <div
                key={alert.id}
                id={`alert-card-${alert.id}`}
                className={`p-3 rounded-xl border transition-all text-xs ${severityColor}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <span
                      className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded-md shrink-0 mt-0.5 ${badgeColor}`}
                    >
                      {alert.severity}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="font-bold text-stone-900">{alert.source}</strong>
                        <span className="text-[10px] text-stone-500 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-stone-400" />
                          {alert.timestamp}
                        </span>
                        {alert.count && alert.count > 1 && (
                          <span className="text-[10px] font-bold bg-white/80 px-1.5 py-0.2 rounded-md text-stone-600 border border-stone-200">
                            ×{alert.count}
                          </span>
                        )}
                      </div>

                      <p className="text-stone-700 mt-1 break-words font-medium">
                        {alert.message}
                      </p>

                      {/* Expandable details */}
                      {alert.details && (
                        <div className="mt-1.5">
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-stone-600 hover:text-stone-900 transition-colors"
                          >
                            <span>{isExpanded ? 'Hide Technical Context' : 'View Technical Context'}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>

                          {isExpanded && (
                            <pre className="mt-1 p-2 bg-white/90 rounded-lg text-[10px] font-mono text-stone-800 border border-stone-200 overflow-x-auto whitespace-pre-wrap">
                              {alert.details}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dismiss Single Alert */}
                  <button
                    type="button"
                    onClick={() => dismissErrorAlert(alert.id)}
                    className="p-1 text-stone-400 hover:text-stone-700 hover:bg-white/80 rounded-md transition-colors shrink-0"
                    title="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
