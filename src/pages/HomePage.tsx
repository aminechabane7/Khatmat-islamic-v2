import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  ChevronLeft,
  Sun,
  Moon,
  ArrowRight,
  Flame,
  CheckCircle,
  Award,
  Compass,
} from 'lucide-react';
import { useAppStore } from '../context/AppContext';
import { calculatePrayerTimes, PrayerTimesResult } from '../services/prayerService';
import { ALL_SURAHS, TOTAL_PAGES } from '../data/surahs';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { getLocalDateKey } from '../services/storageService';

export const HomePage: React.FC = () => {
  const { settings, khatma, adhkarProgress, triggerHaptic } = useAppStore();
  const navigate = useNavigate();

  const [prayerData, setPrayerData] = useState<PrayerTimesResult>(() =>
    calculatePrayerTimes(settings, new Date())
  );

  // Live timer for prayer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setPrayerData(calculatePrayerTimes(settings, new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, [settings]);

  // Current reading Surah info
  const currentSurah =
    ALL_SURAHS.find((s) => s.number === khatma.currentSurahNumber) || ALL_SURAHS[0];

  // Daily reading progress in local calendar date
  const todayKey = getLocalDateKey();
  const pagesReadToday = khatma.dailyLogs[todayKey] || 0;
  const dailyProgressPercent = Math.min(
    100,
    Math.round((pagesReadToday / (khatma.dailyGoalPages || 1)) * 100)
  );

  // Overall Khatma progress
  const totalCompletedCount = khatma.completedPages.length;
  const overallPercent = Math.min(100, Math.round((totalCompletedCount / TOTAL_PAGES) * 100));

  // Adhkar completion counts
  const morningRemaining = Object.entries(adhkarProgress.counts).filter(
    ([k, v]) => k.startsWith('m-') && v === 0
  ).length;
  const eveningRemaining = Object.entries(adhkarProgress.counts).filter(
    ([k, v]) => k.startsWith('e-') && v === 0
  ).length;

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-300">
      {/* PWA Install Banner */}
      <PWAInstallButton variant="card" />

      {/* Hero Greeting & Hijri Date Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#123D32] via-[#16483c] to-[#0a251e] text-[#F7F4EB] p-6 shadow-xl border border-[#D5B779]/30">
        <div className="absolute top-0 left-0 w-36 h-36 bg-[#D5B779]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-[#D5B779]/20 text-[#D5B779] px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>السلام عليكم ورحمة الله وبركاته</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-sans text-white">
              ختمتي القرآنية
            </h1>
            <p className="text-xs sm:text-sm text-[#EDE6D4]/90 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#D5B779]" />
              <span>{prayerData.hijriDate}</span>
              <span className="opacity-50">|</span>
              <span className="opacity-80">{prayerData.gregorianDate}</span>
            </p>
          </div>

          {/* Quick Continue Quran Floating Button */}
          <button
            onClick={() => {
              triggerHaptic(25);
              navigate(`/quran?surah=${khatma.currentSurahNumber}&ayah=${khatma.currentAyahNumber}`);
            }}
            className="flex items-center justify-between gap-3 bg-gradient-to-l from-[#D5B779] to-[#c7a45e] hover:from-[#e3c78a] hover:to-[#D5B779] text-[#123D32] px-5 py-3 rounded-2xl font-bold shadow-lg shadow-black/20 hover:scale-102 active:scale-98 transition group"
          >
            <div className="text-right">
              <span className="block text-[11px] font-medium text-[#123D32]/80">
                متابعة القراءة من
              </span>
              <span className="block text-sm font-bold">
                سورة {currentSurah.name} (آية {khatma.currentAyahNumber})
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#123D32]/10 flex items-center justify-center group-hover:-translate-x-1 transition-transform">
              <ChevronLeft className="w-5 h-5 text-[#123D32]" />
            </div>
          </button>
        </div>
      </div>

      {/* Next Prayer Countdown Card */}
      <div className="bg-white dark:bg-[#132E27] rounded-3xl p-5 shadow-sm border border-[#E8E2D2] dark:border-[#1E443A] transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#123D32]/10 dark:bg-[#D5B779]/20 text-[#123D32] dark:text-[#D5B779]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-[#F7F4EB]">
                الصلاة القادمة: {prayerData.nextPrayer?.arabicName || 'الفجر'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                في {prayerData.cityName}
              </p>
            </div>
          </div>

          <Link
            to="/prayers"
            className="text-xs font-semibold text-[#123D32] dark:text-[#D5B779] flex items-center gap-1 hover:underline"
          >
            <span>كل المواقيت</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Countdown Box */}
        <div className="bg-[#F7F4EB] dark:bg-[#0C1E19] rounded-2xl p-4 flex items-center justify-between border border-[#E8E2D2]/60 dark:border-[#1E443A]">
          <div className="text-right">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">
              الوقت المتبقي للأذان
            </span>
            <div className="flex items-baseline gap-1.5 font-mono text-xl sm:text-2xl font-bold text-[#123D32] dark:text-[#D5B779]" dir="ltr">
              <span>{String(prayerData.timeUntilNext.hours).padStart(2, '0')}</span>
              <span className="animate-pulse">:</span>
              <span>{String(prayerData.timeUntilNext.minutes).padStart(2, '0')}</span>
              <span className="animate-pulse">:</span>
              <span className="text-base sm:text-lg opacity-80">
                {String(prayerData.timeUntilNext.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="text-left">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">
              موعد الأذان
            </span>
            <span className="text-base font-bold text-slate-800 dark:text-[#F7F4EB]">
              {prayerData.nextPrayer?.time}
            </span>
          </div>
        </div>
      </div>

      {/* Khatma Progress Section */}
      <div className="bg-white dark:bg-[#132E27] rounded-3xl p-5 shadow-sm border border-[#E8E2D2] dark:border-[#1E443A] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-[#D5B779]">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-[#F7F4EB]">
                تتبع الختمة والمصحف الشريف
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                هدف اليوم: {khatma.dailyGoalPages} صفحات
              </p>
            </div>
          </div>

          <Link
            to="/khatma"
            className="text-xs font-semibold text-[#123D32] dark:text-[#D5B779] flex items-center gap-1 hover:underline"
          >
            <span>تفاصيل الختمة</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Progress Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Daily Goal Card */}
          <div className="bg-[#F7F4EB] dark:bg-[#0C1E19] p-3.5 rounded-2xl border border-[#E8E2D2]/60 dark:border-[#1E443A] space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span>ورد اليوم</span>
              <span className="font-bold text-[#123D32] dark:text-[#D5B779]">
                {pagesReadToday} / {khatma.dailyGoalPages} ص
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-[#123D32] to-[#185244] dark:from-[#D5B779] dark:to-[#B38F4D] transition-all duration-500 rounded-full"
                style={{ width: `${dailyProgressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400">
              {dailyProgressPercent >= 100
                ? 'أحسنت! أتممت ورد اليوم بنجاح'
                : `بقي ${Math.max(0, khatma.dailyGoalPages - pagesReadToday)} صفحات لإتمام وردك`}
            </p>
          </div>

          {/* Overall Khatma Card */}
          <div className="bg-[#F7F4EB] dark:bg-[#0C1E19] p-3.5 rounded-2xl border border-[#E8E2D2]/60 dark:border-[#1E443A] space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span>إجمالي الختمة</span>
              <span className="font-bold text-[#123D32] dark:text-[#D5B779]">
                {overallPercent}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-amber-500 to-[#D5B779] transition-all duration-500 rounded-full"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400">
              {totalCompletedCount} من أصل 604 صفحة
            </p>
          </div>
        </div>
      </div>

      {/* Quick Adhkar Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Morning Adhkar */}
        <Link
          to="/adhkar?tab=morning"
          className="bg-white dark:bg-[#132E27] p-4 rounded-3xl shadow-sm border border-[#E8E2D2] dark:border-[#1E443A] hover:border-[#D5B779] transition flex flex-col justify-between group"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <Sun className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-[#123D32] dark:text-[#D5B779]">
              ابدأ
            </span>
          </div>
          <div className="mt-3">
            <h4 className="text-sm font-bold text-slate-800 dark:text-[#F7F4EB]">
              أذكار الصباح
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              حصن المسلم والبركة
            </p>
          </div>
        </Link>

        {/* Evening Adhkar */}
        <Link
          to="/adhkar?tab=evening"
          className="bg-white dark:bg-[#132E27] p-4 rounded-3xl shadow-sm border border-[#E8E2D2] dark:border-[#1E443A] hover:border-[#D5B779] transition flex flex-col justify-between group"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
              <Moon className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-[#123D32] dark:text-[#D5B779]">
              ابدأ
            </span>
          </div>
          <div className="mt-3">
            <h4 className="text-sm font-bold text-slate-800 dark:text-[#F7F4EB]">
              أذكار المساء
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              سكينة المساء وحفظ الليل
            </p>
          </div>
        </Link>
      </div>

      {/* Digital Tasbih & Bookmarks Quick Launch Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          to="/adhkar?tab=tasbih"
          className="bg-gradient-to-r from-[#123D32]/10 to-[#D5B779]/20 dark:from-[#132E27] dark:to-[#1c4d40] p-4 rounded-2xl border border-[#D5B779]/40 flex items-center justify-between hover:shadow-md transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#123D32] text-[#D5B779] flex items-center justify-center font-bold">
              📿
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-[#F7F4EB]">
                المسبحة الإلكترونية
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تسبيح واستغفار مع اهتزاز لمسي
              </p>
            </div>
          </div>
          <ChevronLeft className="w-5 h-5 text-[#123D32] dark:text-[#D5B779]" />
        </Link>

        <Link
          to="/quran?tab=bookmarks"
          className="bg-white dark:bg-[#132E27] p-4 rounded-2xl border border-[#E8E2D2] dark:border-[#1E443A] flex items-center justify-between hover:shadow-md transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#D5B779] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-[#F7F4EB]">
                العلامات المرجعية
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                الآيات المحفوظة للرجوع السريع
              </p>
            </div>
          </div>
          <ChevronLeft className="w-5 h-5 text-[#123D32] dark:text-[#D5B779]" />
        </Link>
      </div>
    </div>
  );
};
