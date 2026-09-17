import React, { useState, useEffect } from 'react';
import { X, Save, MessageSquare, Phone, Store, MapPin, Bike, Lock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { StoreSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useStore();
  const [formData, setFormData] = useState<StoreSettings>(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFormData(settings);
    setSaved(false);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-stone-200 animate-scale-in">
        <div className="px-5 py-4 border-b border-stone-200 bg-amber-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base font-['Outfit',sans-serif]">
                Eatery & WhatsApp Settings
              </h3>
              <p className="text-xs text-stone-500">
                Configure your order destination and eatery info
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {/* WhatsApp Phone Number */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              WhatsApp Phone Number (with Country Code) <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-settings-whatsapp"
              type="text"
              required
              value={formData.whatsappNumber}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  whatsappNumber: e.target.value.replace(/[^\d+]/g, ''),
                }))
              }
              placeholder="e.g. +233557448975"
              className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
            <p className="text-[10px] text-stone-500 mt-1">
              Customer orders open WhatsApp and send directly to this number (wa.me/{formData.whatsappNumber.replace(/[^\d]/g, '') || '233557448975'}).
            </p>
          </div>

          {/* Shop Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-amber-600" />
              Eatery Name
            </label>
            <input
              id="input-settings-shop-name"
              type="text"
              required
              value={formData.shopName}
              onChange={(e) => setFormData((prev) => ({ ...prev, shopName: e.target.value }))}
              placeholder="e.g. UniqueTrain"
              className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Tagline / Subtitle
            </label>
            <input
              id="input-settings-tagline"
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
              placeholder="Freshly Baked Pastries & Crunchy Snacks"
              className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Physical Address */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              Physical Address / Pickup Location
            </label>
            <input
              id="input-settings-address"
              type="text"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              placeholder="e.g. Diamond-City, Happy Home"
              className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Delivery Fee in Cedis */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <Bike className="w-3.5 h-3.5 text-amber-600" />
              Standard Delivery Fee (GH₵)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-stone-500">
                GH₵
              </span>
              <input
                id="input-settings-delivery-fee"
                type="number"
                step="1"
                min="0"
                value={formData.deliveryFee}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    deliveryFee: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full pl-12 pr-3 py-2 text-xs font-bold font-['Outfit',sans-serif] bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Admin Security PIN */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              Admin Security PIN (4 Digits)
            </label>
            <input
              id="input-settings-admin-pin"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={formData.adminPin || '1234'}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  adminPin: e.target.value.replace(/[^\d]/g, '').slice(0, 4),
                }))
              }
              placeholder="1234"
              className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
            <p className="text-[10px] text-stone-500 mt-1">
              Required to unlock the Admin Dashboard from the footer lock icon. Default: 1234.
            </p>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-save-settings"
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saved ? 'Saved!' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
