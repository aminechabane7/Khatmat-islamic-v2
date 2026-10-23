import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-16 left-4 right-4 z-40 mx-auto max-w-md flex items-center justify-between gap-3 rounded-xl bg-amber-600/95 text-white px-4 py-2.5 shadow-lg backdrop-blur-xs text-xs font-medium border border-amber-400/40 animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
        <span>أنت غير متصل بالإنترنت — المحتوى المحفوظ والقرآن المخزن متاحان بالكامل</span>
      </div>
      <span className="bg-amber-800/80 px-2 py-0.5 rounded text-[10px] whitespace-nowrap">وضع عدم الاتصال</span>
    </div>
  );
};
