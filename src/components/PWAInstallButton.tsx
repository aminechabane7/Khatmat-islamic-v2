import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  variant?: 'navbar' | 'card' | 'settings';
}

export const PWAInstallButton: React.FC<Props> = ({ variant = 'navbar' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    if (variant === 'settings') {
      return (
        <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>التطبيق مثبت ويعمل بكامل مزايا PWA</span>
        </div>
      );
    }
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'card') {
      return (
        <div className="bg-gradient-to-l from-[#123D32] to-[#185244] text-[#F7F4EB] p-4 rounded-2xl shadow-md flex items-center justify-between border border-[#D5B779]/30">
          <div className="space-y-1">
            <h4 className="font-bold text-base flex items-center gap-2 text-[#D5B779]">
              <Download className="w-5 h-5" />
              تثبيت تطبيق ختمتي على جهازك
            </h4>
            <p className="text-xs text-[#EDE6D4] max-w-xs">
              تصفح القرآن الكريم واستمع للأذكار ومواقيت الصلاة في أي وقت دون الحاجة لفتح المتصفح.
            </p>
          </div>
          <button
            onClick={install}
            className="bg-[#D5B779] text-[#123D32] px-4 py-2 rounded-xl font-bold text-sm shadow hover:bg-[#F3E5AB] active:scale-95 transition"
          >
            تثبيت الآن
          </button>
        </div>
      );
    }

    if (variant === 'settings') {
      return (
        <button
          onClick={install}
          className="w-full flex items-center justify-center gap-2 bg-[#123D32] hover:bg-[#185244] text-[#F7F4EB] p-3 rounded-xl font-bold text-sm shadow transition active:scale-98"
        >
          <Download className="w-4 h-4 text-[#D5B779]" />
          <span>تثبيت تطبيق ختمتي على الشاشة الرئيسية</span>
        </button>
      );
    }

    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 bg-[#D5B779] text-[#123D32] px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-[#F3E5AB] active:scale-95 transition"
        title="تثبيت التطبيق"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">تثبيت التطبيق</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        {variant === 'card' ? (
          <div className="bg-[#123D32]/10 dark:bg-emerald-950/30 border border-[#D5B779]/30 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#123D32] dark:text-[#D5B779]">تثبيت ختمتي على iPhone / iPad</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">أضف التطبيق لشاشتك لتجربة سريعة وسلسة</p>
            </div>
            <button
              onClick={() => setShowIOSGuide(true)}
              className="bg-[#123D32] dark:bg-[#D5B779] text-[#F7F4EB] dark:text-[#123D32] px-3 py-1.5 rounded-xl text-xs font-bold shadow"
            >
              طريقة التثبيت
            </button>
          </div>
        ) : variant === 'settings' ? (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="w-full flex items-center justify-center gap-2 border border-[#D5B779] text-[#123D32] dark:text-[#D5B779] p-3 rounded-xl font-bold text-sm hover:bg-[#D5B779]/10 transition"
          >
            <Download className="w-4 h-4" />
            <span>تعليمات التثبيت على نظام iOS (أبل)</span>
          </button>
        ) : (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center gap-1.5 border border-[#D5B779] text-[#123D32] dark:text-[#D5B779] px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-[#D5B779]/10 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تثبيت على iOS</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#132E27] p-6 shadow-2xl border border-[#D5B779]/30 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800 dark:text-[#F7F4EB]">
                  التثبيت على أجهزة iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#1c4d40] text-[#123D32] dark:text-[#D5B779]">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-[#F7F4EB]">الخطوة الأولى</p>
                    <p className="text-xs">اضغط على زر المشاركة (Share) في شريط متصفح سفاري بالأسفل.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#1c4d40] text-[#123D32] dark:text-[#D5B779]">
                    <PlusSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-[#F7F4EB]">الخطوة الثانية</p>
                    <p className="text-xs">مرر لأسفل واختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-[#123D32] text-[#F7F4EB] py-2.5 text-sm font-bold shadow hover:bg-[#185244] transition"
              >
                فهمت، شكراً لك
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
