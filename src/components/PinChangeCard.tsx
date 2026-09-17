import React, { useState } from 'react';
import { KeyRound, Check, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const PinChangeCard: React.FC = () => {
  const { settings, changeAdminPin, logSystemError } = useStore();
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!currentPinInput || !newPinInput || !confirmPinInput) {
      setStatusMessage({ type: 'error', text: 'Please fill out all PIN fields.' });
      return;
    }

    if (newPinInput.length !== 4 || !/^\d{4}$/.test(newPinInput)) {
      setStatusMessage({ type: 'error', text: 'New PIN must be exactly 4 numeric digits.' });
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setStatusMessage({ type: 'error', text: 'New PIN and Confirmation PIN do not match.' });
      return;
    }

    const result = changeAdminPin(currentPinInput, newPinInput);

    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setStatusMessage((prev) => (prev?.type === 'success' ? null : prev));
      }, 5000);
    } else {
      setStatusMessage({ type: 'error', text: result.message });
      logSystemError('Security Access', `Failed PIN change attempt: ${result.message}`, 'warning');
    }
  };

  return (
    <div id="admin-pin-change-card" className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-stone-900 font-['Outfit',sans-serif] flex items-center gap-2">
              <span>Security PIN Management</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold border border-stone-200">
                Current: {showPins ? settings.adminPin || '1234' : '••••'}
              </span>
            </h3>
            <p className="text-[11px] text-stone-500">
              Update the 4-digit security code used to unlock the Owner Dashboard from the footer lock.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPins(!showPins)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500 hover:text-stone-800 transition-colors self-start sm:self-auto"
        >
          {showPins ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{showPins ? 'Hide Digits' : 'Reveal Digits'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Current PIN */}
          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1">
              Current PIN
            </label>
            <input
              id="input-current-pin"
              type={showPins ? 'text' : 'password'}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={currentPinInput}
              onChange={(e) => setCurrentPinInput(e.target.value.replace(/[^\d]/g, '').slice(0, 4))}
              placeholder="e.g. 1234"
              className="w-full px-3 py-2 text-xs font-mono font-bold bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden transition-all text-center tracking-widest"
            />
          </div>

          {/* New PIN */}
          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1">
              New 4-Digit PIN
            </label>
            <input
              id="input-new-pin"
              type={showPins ? 'text' : 'password'}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={newPinInput}
              onChange={(e) => setNewPinInput(e.target.value.replace(/[^\d]/g, '').slice(0, 4))}
              placeholder="4 digits"
              className="w-full px-3 py-2 text-xs font-mono font-bold bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden transition-all text-center tracking-widest"
            />
          </div>

          {/* Confirm PIN */}
          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1">
              Confirm New PIN
            </label>
            <input
              id="input-confirm-pin"
              type={showPins ? 'text' : 'password'}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={confirmPinInput}
              onChange={(e) => setConfirmPinInput(e.target.value.replace(/[^\d]/g, '').slice(0, 4))}
              placeholder="Repeat new PIN"
              className="w-full px-3 py-2 text-xs font-mono font-bold bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden transition-all text-center tracking-widest"
            />
          </div>
        </div>

        {/* Status Notification Message */}
        {statusMessage && (
          <div
            id="pin-change-status-alert"
            className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border animate-fade-in ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
        )}

        {/* Form Action */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-stone-400">
            PIN changes take effect immediately across all sessions on this device.
          </span>
          <button
            id="btn-submit-change-pin"
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 active:scale-95 text-white text-xs font-bold transition-all shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Update Security PIN</span>
          </button>
        </div>
      </form>
    </div>
  );
};
