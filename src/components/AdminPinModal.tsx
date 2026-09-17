import React, { useState, useEffect, useRef } from 'react';
import { Lock, X, KeyRound, AlertCircle, Check, Delete } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const AdminPinModal: React.FC = () => {
  const { isAdminPinModalOpen, setIsAdminPinModalOpen, unlockAdmin, settings } = useStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdminPinModalOpen) {
      setPin('');
      setError('');
      setIsShaking(false);
      // Auto-focus the input after animation
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAdminPinModalOpen]);

  if (!isAdminPinModalOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    setError('');

    if (nextPin.length === 4) {
      verifyPin(nextPin);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const verifyPin = (candidatePin: string) => {
    const success = unlockAdmin(candidatePin);
    if (!success) {
      setError('Incorrect security PIN. Please try again.');
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
        setPin('');
      }, 600);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsAdminPinModalOpen(false);
    } else if (e.key === 'Enter') {
      if (pin.length === 4) {
        verifyPin(pin);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d]/g, '').slice(0, 4);
    setPin(val);
    setError('');
    if (val.length === 4) {
      verifyPin(val);
    }
  };

  return (
    <div
      id="admin-pin-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={() => setIsAdminPinModalOpen(false)}
      onKeyDown={handleKeyDown}
    >
      <div
        id="admin-pin-modal-card"
        onClick={(e) => e.stopPropagation()}
        className={`bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-stone-200 relative transition-transform ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Close Button */}
        <button
          id="btn-close-pin-modal"
          type="button"
          onClick={() => setIsAdminPinModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Lock Icon */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs mb-3">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-stone-900 font-['Outfit',sans-serif]">
            Store Administration
          </h2>
          <p className="text-xs text-stone-500 mt-1 max-w-xs">
            Enter the 4-digit owner security PIN to open the management dashboard.
          </p>
        </div>

        {/* Hidden physical input for keyboard typing / mobile keyboard */}
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={pin}
          onChange={handleInputChange}
          className="opacity-0 absolute -z-10 w-1 h-1 pointer-events-none"
          autoFocus
          aria-label="Security PIN"
        />

        {/* 4-Digit Display Indicator */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="flex justify-center items-center gap-3 my-6 cursor-pointer"
        >
          {[0, 1, 2, 3].map((index) => {
            const hasDigit = index < pin.length;
            return (
              <div
                key={index}
                className={`w-12 h-14 rounded-2xl flex items-center justify-center text-xl font-mono font-bold border-2 transition-all ${
                  hasDigit
                    ? 'border-amber-600 bg-amber-50/50 text-amber-950 shadow-xs scale-105'
                    : 'border-stone-200 bg-stone-50 text-stone-300'
                } ${error ? 'border-rose-400 bg-rose-50 text-rose-700' : ''}`}
              >
                {hasDigit ? '•' : ''}
              </div>
            );
          })}
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 font-medium mb-4 text-center">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* On-screen Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num)}
              className="h-12 rounded-xl bg-stone-100 hover:bg-amber-100 active:bg-amber-200 text-stone-800 hover:text-amber-900 font-bold text-base font-mono transition-all flex items-center justify-center select-none"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-500 font-medium text-xs transition-colors flex items-center justify-center select-none"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-12 rounded-xl bg-stone-100 hover:bg-amber-100 active:bg-amber-200 text-stone-800 hover:text-amber-900 font-bold text-base font-mono transition-all flex items-center justify-center select-none"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-500 transition-colors flex items-center justify-center select-none"
            title="Backspace"
            aria-label="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Cancel button */}
        <div className="text-center pt-2 border-t border-stone-100 flex items-center justify-end px-2 text-[11px]">
          <button
            type="button"
            onClick={() => setIsAdminPinModalOpen(false)}
            className="text-stone-500 hover:text-stone-800 font-semibold px-2 py-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
