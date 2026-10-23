import React from 'react';
import { WifiOff, CheckCircle } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useAppStore } from '../context/AppContext';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { quranOfflineStatus } = useAppStore();

  if (isOnline) return null;

  return (
    <div className="fixed top-16 left-4 right-4 z-40 mx-auto max-w-lg flex items-center justify-between gap-3 rounded-2xl bg-amber-600/95 text-white px-4 py-2.5 shadow-lg backdrop-blur-xs text-xs font-medium border border-amber-400/40 animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 shrink-0 animate-pulse text-amber-200" />
        <span>
          {quranOfflineStatus.isFullyDownloaded
            ? 'وضع عدم الاتصال: المصحف الشريف كامل (114 سورة) والأذكار متاحة محلياً'
            : `وضع عدم الاتصال: متاح (${quranOfflineStatus.downloadedSurahsCount}/114) سورة والأذكار ومواقيت الصلاة`}
        </span>
      </div>
      <span className="bg-amber-800/80 px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap">
        أوفلاين
      </span>
    </div>
  );
};
