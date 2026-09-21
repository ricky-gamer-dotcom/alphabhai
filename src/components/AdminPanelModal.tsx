import React, { useState } from 'react';
import {
  X,
  Lock,
  Upload,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Save,
  Globe,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { LandingPageConfig } from '../types';
import { resetPixelTestLocks } from '../utils/pixel';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: LandingPageConfig;
  onUpdateConfig: (newConfig: Partial<LandingPageConfig> & { isNewGalleryUpload?: boolean }) => Promise<boolean> | void;
  onResetDefaults: () => void;
}

export function AdminPanelModal({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onResetDefaults,
}: AdminPanelModalProps) {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixelResetSuccess, setPixelResetSuccess] = useState(false);

  if (!isOpen) return null;

  const handleResetPixelTest = () => {
    resetPixelTestLocks();
    setPixelResetSuccess(true);
    setTimeout(() => setPixelResetSuccess(false), 3000);
  };

  // Ultra-fast client side image optimization for crystal clear 800px retina display
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800; // Perfect for 144px avatar at 4x retina
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.9));
          } else {
            resolve(reader.result as string);
          }
        };
        img.onerror = () => resolve(reader.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        const optimizedDataUrl = await compressImage(file);
        
        // Direct call to permanent lock endpoint
        await fetch('/api/lock-avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarUrl: optimizedDataUrl }),
        });

        await onUpdateConfig({ avatarUrl: optimizedDataUrl, isNewGalleryUpload: true });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      } catch (err) {
        console.error('Error optimizing image:', err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSaveAll = async () => {
    setIsProcessing(true);
    try {
      await onUpdateConfig({ ...config });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false),
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to lock config on server', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div
        id="admin-panel-container"
        className="relative w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl bg-[#140b07] border-2 border-[#fb923c]/40 text-slate-100 shadow-[0_0_60px_rgba(251,146,60,0.25)] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-amber-950/80 flex items-center justify-between bg-[#0a0503]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-[#fb923c]/30">
              <Lock className="w-4 h-4 text-[#fb923c]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Admin Control Panel
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-orange-500/20 text-[#fb923c] border border-orange-500/40">
                  JACK AGENCY
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Settings & 1000% Permanent DP Lock</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status banner when locked */}
        <div className="bg-gradient-to-r from-orange-950/60 via-amber-950/40 to-orange-950/60 px-4 py-2 border-b border-orange-500/20 flex items-center justify-between text-[11px] text-orange-200">
          <span className="flex items-center gap-1.5 font-medium">
            <Globe className="w-3.5 h-3.5 text-[#fb923c]" />
            Public Link Server Sync:
          </span>
          <span className="font-bold text-[#fb923c] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            1000% Active & Locked
          </span>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* GALLERY IMAGE UPLOAD SECTION */}
          <div className="p-4 rounded-2xl bg-[#1d100a] border border-orange-500/40 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#fb923c]" />
                Gallery Photo (Profile DP)
              </span>
              <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                1000% Locked
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full p-[3px] bg-gradient-to-tr from-[#ea580c] via-[#fb923c] to-[#fed7aa] shadow-[0_0_20px_rgba(251,146,60,0.6)] overflow-hidden shrink-0">
                <img
                  src={config.avatarUrl}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="admin-gallery-file-input"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#fb923c] to-[#f97316] hover:from-[#f97316] hover:to-[#ea580c] text-[#0f0703] font-black cursor-pointer shadow-md transition-transform active:scale-95 text-xs"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isProcessing ? 'Saving to Public Link...' : 'Change Gallery Photo'}</span>
                  <input
                    id="admin-gallery-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleGalleryUpload}
                    disabled={isProcessing}
                    className="hidden"
                  />
                </label>
                <div className="mt-2 p-2 rounded-lg bg-black/40 border border-orange-500/20 text-[10px] text-amber-200/90 leading-tight">
                  🔒 <strong>Permanent Lock Active:</strong> Aap niche Channel Name ya koi bhi setting badlein, yeh gallery photo <strong>kabhi change nahi hogi</strong> (public link par 1000% locked rahegi).
                </div>
              </div>
            </div>
          </div>

          {/* CHANNEL DETAILS SECTION */}
          <div className="space-y-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Channel Name</label>
              <input
                id="admin-channel-name-input"
                type="text"
                value={config.channelName}
                onChange={(e) => onUpdateConfig({ channelName: e.target.value })}
                placeholder="ALPHA BHAI"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-white focus:outline-none focus:border-[#fb923c] transition-colors font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Members Count</label>
              <input
                id="admin-members-count-input"
                type="text"
                value={config.membersCount}
                onChange={(e) => onUpdateConfig({ membersCount: e.target.value })}
                placeholder="28.5K+"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-white focus:outline-none focus:border-[#fb923c] transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Telegram Channel Link</label>
              <input
                id="admin-telegram-link-input"
                type="url"
                value={config.telegramLink}
                onChange={(e) => onUpdateConfig({ telegramLink: e.target.value })}
                placeholder="https://t.me/+mVO1R7zmazwyMDg9"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-white focus:outline-none focus:border-[#fb923c] transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Button Text</label>
              <input
                id="admin-button-text-input"
                type="text"
                value={config.buttonText}
                onChange={(e) => onUpdateConfig({ buttonText: e.target.value })}
                placeholder="JOIN NOW"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-white focus:outline-none focus:border-[#fb923c] transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Footer Copyright Text</label>
              <input
                id="admin-footer-text-input"
                type="text"
                value={config.footerText}
                onChange={(e) => onUpdateConfig({ footerText: e.target.value })}
                placeholder="© 2026 JACK AGENCY"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-white focus:outline-none focus:border-[#fb923c] transition-colors"
              />
            </div>

            {/* LIVE Badge Toggle */}
            <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">Show Red LIVE Badge</span>
                <span className="text-slate-500 text-[10px]">Pulsing status badge below profile photo</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.isLive}
                  onChange={(e) => onUpdateConfig({ isLive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#fb923c]" />
              </label>
            </div>

            {/* META PIXEL STATUS (1061117969965797) */}
            <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-orange-200 text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Meta Pixel 100% Lock Active
                </span>
                <span className="text-[10px] font-mono text-amber-300 bg-black/40 px-2 py-0.5 rounded border border-orange-500/30">
                  1061117969965797
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                ✓ <strong>PageView</strong>: Strictly 1 baar manual fire<br />
                ✓ <strong>Subscribe (Button)</strong>: 1000% single-fire lock (multiple taps par bhi duplicate fire nahi hoga)<br />
                ✓ <strong>Automatic Tracking</strong>: Band (Only controlled manual setup)
              </p>

              <div className="pt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetPixelTest}
                  className="px-2.5 py-1 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 text-[10px] font-semibold flex items-center gap-1 transition-all"
                  title="Testing karte waqt agar aapko dobara 1 baar test event dekhna ho toh yahan se reset karein"
                >
                  <RotateCcw className="w-3 h-3" />
                  {pixelResetSuccess ? 'Test Locks Cleared! (Ready for test)' : 'Reset Pixel Locks for Test'}
                </button>
                {pixelResetSuccess && (
                  <span className="text-[10px] text-emerald-400 font-medium animate-pulse">
                    ✓ Cleared
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-amber-950 bg-[#0a0503] flex items-center justify-between">
          <button
            type="button"
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#fb923c] transition-colors"
            title="Resets texts to default, but keeps your locked gallery DP"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Texts
          </button>

          <button
            id="admin-save-button"
            type="button"
            onClick={handleSaveAll}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#fb923c] to-[#f97316] hover:from-[#f97316] hover:to-[#ea580c] text-[#0f0703] font-black text-xs tracking-wider uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(251,146,60,0.4)] transition-all transform active:scale-95"
          >
            {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saveSuccess ? '1000% Locked on Public Link!' : 'Lock & Save for Everyone'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
