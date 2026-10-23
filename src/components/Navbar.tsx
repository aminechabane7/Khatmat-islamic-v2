import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Moon, Sun, Settings, Sparkles } from 'lucide-react';
import { useAppStore } from '../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';
import { getHijriDate } from '../services/prayerService';

export const Navbar: React.FC = () => {
  const { settings, updateSettings, triggerHaptic } = useAppStore();
  const location = useLocation();
  const hijriStr = getHijriDate();

  const toggleTheme = () => {
    triggerHaptic(20);
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <header className="sticky top-0 z-30 bg-[#123D32] text-[#F7F4EB] shadow-md border-b border-[#D5B779]/20">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#185244] to-[#0a251e] border border-[#D5B779] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 text-[#D5B779]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-wide text-[#F7F4EB] font-sans">
                خَتْمَتِي
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-[#D5B779]/20 text-[#D5B779] font-medium hidden sm:inline">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-[#EDE6D4]/80 hidden sm:block">
              {hijriStr}
            </p>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PWA Install Button */}
          <PWAInstallButton variant="navbar" />

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-[#F7F4EB] transition active:scale-90"
            title={settings.theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
            aria-label="تبديل المظهر"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-5 h-5 text-[#D5B779]" />
            ) : (
              <Moon className="w-5 h-5 text-[#EDE6D4]" />
            )}
          </button>

          {/* Settings Link */}
          <Link
            to="/settings"
            className={`p-2 rounded-xl transition active:scale-90 ${
              location.pathname === '/settings'
                ? 'bg-[#D5B779] text-[#123D32]'
                : 'bg-white/10 hover:bg-white/15 text-[#F7F4EB]'
            }`}
            title="الإعدادات"
            aria-label="الإعدادات"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
};
