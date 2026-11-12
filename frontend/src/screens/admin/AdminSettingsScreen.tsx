import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  Palette,
  Sliders,
  Image as ImageIcon,
  Check,
  Save,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface AdminSettingsScreenProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const AdminSettingsScreen: React.FC<AdminSettingsScreenProps> = ({
  onNavigate,
  onLogout,
}) => {
  const { showToast } = useToast();

  // Section 2.5: Everything is editable including theme, backgrounds, appearance
  const [platformName, setPlatformName] = useState('Market Without Borders (MWB)');
  const [tagline, setTagline] = useState('Global artisan marketplace uniting independent studios.');
  const [primaryThemeColor, setPrimaryThemeColor] = useState('#123B30'); // Forest
  const [accentColor, setAccentColor] = useState('#E6A93B'); // Amber
  const [paperBackground, setPaperBackground] = useState('#F4EFE6'); // Paper
  const [allowInstantRegistration, setAllowInstantRegistration] = useState(false);
  const [disputeAutoHoldDays, setDisputeAutoHoldDays] = useState(7);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast({
      type: 'success',
      title: 'Platform Settings Saved',
      description: 'Marketplace theme, background, and operational rules updated.',
    });
  };

  const handleResetDefaults = () => {
    setPrimaryThemeColor('#123B30');
    setAccentColor('#E6A93B');
    setPaperBackground('#F4EFE6');
    showToast({
      type: 'info',
      title: 'Defaults Restored',
      description: 'Default design system palette restored.',
    });
  };

  return (
    <AdminLayout currentPath="/admin/settings" onNavigate={onNavigate} onLogout={onLogout}>
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">Marketplace Platform Settings</h1>
        <p className="text-xs text-muted">Customize visual themes, background palette, registration policies, and platform defaults.</p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
        {/* Appearance & Themes (Section 2.5) */}
        <div className="bg-paper border border-sand rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-sand">
            <Palette className="w-5 h-5 text-forest" />
            <h2 className="font-heading text-base font-bold text-ink">Theme & Background Customization</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Primary Brand / Forest */}
            <div>
              <label className="block font-semibold text-ink mb-1.5">Primary Theme Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryThemeColor}
                  onChange={(e) => setPrimaryThemeColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-sand"
                />
                <input
                  type="text"
                  value={primaryThemeColor}
                  onChange={(e) => setPrimaryThemeColor(e.target.value)}
                  className="w-24 bg-sand/40 border border-sand rounded-lg px-2 py-1.5 font-mono text-xs"
                />
              </div>
            </div>

            {/* Accent / Amber */}
            <div>
              <label className="block font-semibold text-ink mb-1.5">Accent Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-sand"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-24 bg-sand/40 border border-sand rounded-lg px-2 py-1.5 font-mono text-xs"
                />
              </div>
            </div>

            {/* Background / Paper */}
            <div>
              <label className="block font-semibold text-ink mb-1.5">Background Tone (Paper)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={paperBackground}
                  onChange={(e) => setPaperBackground(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-sand"
                />
                <input
                  type="text"
                  value={paperBackground}
                  onChange={(e) => setPaperBackground(e.target.value)}
                  className="w-24 bg-sand/40 border border-sand rounded-lg px-2 py-1.5 font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Platform Identity */}
        <div className="bg-paper border border-sand rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-sand">
            <Sliders className="w-5 h-5 text-forest" />
            <h2 className="font-heading text-base font-bold text-ink">General & Operational Policies</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-ink mb-1">Marketplace Platform Title</label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full bg-sand/40 border border-sand rounded-xl px-3.5 py-2.5 text-xs text-ink outline-none focus:ring-1 focus:ring-forest"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">Marketplace Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-sand/40 border border-sand rounded-xl px-3.5 py-2.5 text-xs text-ink outline-none focus:ring-1 focus:ring-forest"
              />
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-sand">
              <div>
                <div className="font-semibold text-ink">New User Manual Review Policy</div>
                <div className="text-muted text-[11px]">Require admin review before newly registered accounts can shop.</div>
              </div>
              <input
                type="checkbox"
                checked={!allowInstantRegistration}
                onChange={(e) => setAllowInstantRegistration(!e.target.checked)}
                className="w-4 h-4 rounded text-forest focus:ring-forest cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[999px] bg-sand hover:bg-sand-hover text-ink text-xs font-semibold transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Colors</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-[999px] bg-forest hover:bg-forest-light text-paper text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};
