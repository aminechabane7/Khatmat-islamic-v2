import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  CheckCircle2,
  Calendar,
  Flame,
  Target,
  Trophy,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  Check,
  Award,
  Layers,
} from 'lucide-react';
import { useAppStore } from '../context/AppContext';
import { ALL_SURAHS, TOTAL_JUZ, TOTAL_PAGES } from '../data/surahs';
import { getLocalDateKey } from '../services/storageService';

export const KhatmaPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    khatma,
    updateKhatma,
    togglePageCompleted,
    markPagesUpTo,
    resetKhatma,
    triggerHaptic,
  } = useAppStore();

  const [activeView, setActiveView] = useState<'overview' | 'juz' | 'pages'>('overview');
  const [showResetModal, setShowResetModal] = useState(false);

  // Goal calculation
  const completedCount = khatma.completedPages.length;
  const progressPercent = Math.min(100, Math.round((completedCount / TOTAL_PAGES) * 100));
  const remainingPages = Math.max(0, TOTAL_PAGES - completedCount);
  const estimatedDaysLeft = Math.ceil(remainingPages / (khatma.dailyGoalPages || 4));

  // Today's reading in local calendar date
  const todayKey = getLocalDateKey();
  const pagesReadToday = khatma.dailyLogs[todayKey] || 0;
  const isTodayGoalReached = pagesReadToday >= khatma.dailyGoalPages;
  const isKhatmaComplete = completedCount >= TOTAL_PAGES;

  // Current Surah details
  const currentSurah =
    ALL_SURAHS.find((s) => s.number === khatma.currentSurahNumber) || ALL_SURAHS[0];

  const handleFinishTodayPortion = () => {
    triggerHaptic([40, 50, 60]);
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#D5B779', '#123D32', '#185244', '#F7F4EB'],
    });

    const targetPage = Math.min(604, (khatma.currentPageNumber || 1) + khatma.dailyGoalPages);
    markPagesUpTo(targetPage);
  };

  const handleQuickPageJump = (page: number) => {
    const targetSurah = [...ALL_SURAHS].reverse().find((s) => s.pageStart <= page) || ALL_SURAHS[0];
    triggerHaptic(20);
    navigate(`/quran?surah=${targetSurah.number}`);
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Khatma Completed Milestone Banner */}
      {isKhatmaComplete && (
        <div className="bg-gradient-to-l from-amber-500 to-[#D5B779] text-[#123D32] p-5 rounded-3xl shadow-lg border border-amber-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/40 rounded-2xl">
              <Trophy className="w-6 h-6 text-[#123D32]" />
            </div>
            <div>
              <h2 className="font-bold text-base">مبارك! أتممت ختم القرآن الكريم كاملاً</h2>
              <p className="text-xs text-[#123D32]/80">
                تقبل الله طاعتكم وكتب لكم بكل حرف حسنة إلى عشر أمثالها.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowResetModal(true)}
            className="bg-[#123D32] text-[#F7F4EB] px-4 py-2 rounded-xl text-xs font-bold shadow hover:bg-[#185244] transition whitespace-nowrap"
          >
            بدء ختمة جديدة
          </button>
        </div>
      )}

      {/* Hero Stats Card */}
      <div className="bg-gradient-to-br from-[#123D32] via-[#16483c] to-[#0a251e] text-[#F7F4EB] rounded-3xl p-6 shadow-xl border border-[#D5B779]/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#D5B779]/20 text-[#D5B779]">
              برنامج ختم القرآن الكريم
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-sans text-white">
              متابعة الختمة الشريفة
            </h1>
            <p className="text-xs text-[#EDE6D4]/80 flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-[#D5B779]" />
              <span>الهدف اليومي: {khatma.dailyGoalPages} صفحات</span>
              <span className="opacity-50">•</span>
              <span>المتبقي: {remainingPages} صفحة ({estimatedDaysLeft} يوم)</span>
            </p>
          </div>

          {/* Quick Continue Button */}
          <button
            onClick={() => {
              triggerHaptic(20);
              navigate(`/quran?surah=${khatma.currentSurahNumber}&ayah=${khatma.currentAyahNumber}`);
            }}
            className="flex items-center gap-2 bg-[#D5B779] text-[#123D32] px-4 py-2.5 rounded-2xl font-bold text-xs shadow hover:bg-[#F3E5AB] active:scale-95 transition"
          >
            <BookOpen className="w-4 h-4" />
            <span>متابعة من سورة {currentSurah.name}</span>
          </button>
        </div>

        {/* Large Progress Bar & Stats */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#EDE6D4]">
              تمت قراءة {completedCount} من أصل 604 صفحة
            </span>
            <span className="font-bold text-[#D5B779] font-mono text-sm">
              {progressPercent}%
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-black/30 overflow-hidden p-0.5 border border-[#D5B779]/20">
            <div
              className="h-full rounded-full bg-gradient-to-l from-[#D5B779] to-[#F3E5AB] transition-all duration-700 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Today's reading achievement button */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">إنجاز اليوم</p>
              <p className="text-[11px] text-[#EDE6D4]/80">
                {pagesReadToday} من {khatma.dailyGoalPages} صفحات مقروءة
              </p>
            </div>
          </div>

          <button
            onClick={handleFinishTodayPortion}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow ${
              isTodayGoalReached
                ? 'bg-emerald-600/90 text-white'
                : 'bg-white/15 hover:bg-white/25 text-[#F7F4EB] border border-white/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-[#D5B779]" />
            <span>{isTodayGoalReached ? 'أتممت ورد اليوم بنجاح!' : `تسجيل إتمام ورد اليوم (+${khatma.dailyGoalPages} ص)`}</span>
          </button>
        </div>
      </div>

      {/* Sub Views Switcher */}
      <div className="bg-white dark:bg-[#132E27] rounded-2xl p-1 shadow-sm border border-[#E8E2D2] dark:border-[#1E443A] flex text-xs font-bold">
        <button
          onClick={() => {
            triggerHaptic(15);
            setActiveView('overview');
          }}
          className={`flex-1 py-2 rounded-xl transition ${
            activeView === 'overview'
              ? 'bg-[#123D32] text-[#F7F4EB] shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          خطة الختمة
        </button>
        <button
          onClick={() => {
            triggerHaptic(15);
            setActiveView('juz');
          }}
          className={`flex-1 py-2 rounded-xl transition ${
            activeView === 'juz'
              ? 'bg-[#123D32] text-[#F7F4EB] shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          الأجزاء الثلاثون (30)
        </button>
        <button
          onClick={() => {
            triggerHaptic(15);
            setActiveView('pages');
          }}
          className={`flex-1 py-2 rounded-xl transition ${
            activeView === 'pages'
              ? 'bg-[#123D32] text-[#F7F4EB] shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          فهرس الصفحات (604)
        </button>
      </div>

      {/* View 1: Overview & Goal Customization */}
      {activeView === 'overview' && (
        <div className="space-y-4">
          {/* Daily Goal Settings Box */}
          <div className="bg-white dark:bg-[#132E27] rounded-3xl p-5 shadow-sm border border-[#E8E2D2] dark:border-[#1E443A] space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-[#F7F4EB] flex items-center gap-2">
              <Target className="w-4 h-4 text-[#D5B779]" />
              <span>تحديد وتعديل الهدف اليومي</span>
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              اختر عدد الصفحات التي ترغب في قراءتها يومياً لتوزيع الختمة:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { pages: 2, label: 'صفحتان', duration: 'ختمة في 10 أشهر' },
                { pages: 4, label: '4 صفحات (صفحة بعد كل صلاة)', duration: 'ختمة في 5 أشهر' },
                { pages: 10, label: 'نصف جزء (10 صفحات)', duration: 'ختمة في شهرين' },
                { pages: 20, label: 'جزء كامل (20 صفحة)', duration: 'ختمة في 30 يوماً' },
              ].map((plan) => (
                <button
                  key={plan.pages}
                  onClick={() => {
                    triggerHaptic(20);
                    updateKhatma({ dailyGoalPages: plan.pages });
                  }}
                  className={`p-3 rounded-2xl border text-right transition-all ${
                    khatma.dailyGoalPages === plan.pages
                      ? 'border-[#D5B779] bg-[#D5B779]/10 ring-2 ring-[#D5B779]'
                      : 'border-[#E8E2D2] dark:border-[#1E443A] hover:bg-slate-50 dark:hover:bg-[#1c4d40]/40'
                  }`}
                >
                  <p className="font-bold text-xs text-slate-800 dark:text-[#F7F4EB]">
                    {plan.label}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {plan.duration}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Khatma History & Completed Count */}
          <div className="bg-white dark:bg-[#132E27] rounded-3xl p-5 shadow-sm border border-[#E8E2D2] dark:border-[#1E443A] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-[#D5B779] flex items-center justify-center font-bold">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-[#F7F4EB]">
                  الختمات المكتملة سابقاً
                </h4>
                <p className="text-xs text-slate-400">
                  {khatma.completedKhatmasCount || 0} ختمة مسجلة بفضل الله
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowResetModal(true)}
              className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 p-2 rounded-xl"
              title="بدء ختمة جديدة"
            >
              <RotateCcw className="w-4 h-4" />
              <span>بدء ختمة جديدة</span>
            </button>
          </div>
        </div>
      )}

      {/* View 2: 30 Juz Breakdown */}
      {activeView === 'juz' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => {
              const startPage = (juzNum - 1) * 20 + 1;
              const endPage = Math.min(604, juzNum * 20);
              const juzTotalPages = endPage - startPage + 1;
              const completedInJuz = khatma.completedPages.filter(
                (p) => p >= startPage && p <= endPage
              ).length;
              const isJuzComplete = completedInJuz >= juzTotalPages;

              return (
                <div
                  key={juzNum}
                  onClick={() => handleQuickPageJump(startPage)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all hover:shadow-md ${
                    isJuzComplete
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                      : 'bg-white dark:bg-[#132E27] border-[#E8E2D2] dark:border-[#1E443A] hover:border-[#D5B779]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-800 dark:text-[#F7F4EB]">
                      الجزء {juzNum}
                    </span>
                    {isJuzComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        {completedInJuz}/{juzTotalPages} ص
                      </span>
                    )}
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isJuzComplete ? 'bg-emerald-500' : 'bg-[#D5B779]'
                      }`}
                      style={{ width: `${Math.round((completedInJuz / juzTotalPages) * 100)}%` }}
                    />
                  </div>

                  <p className="text-[10px] text-slate-400">
                    من صـ {startPage} إلى صـ {endPage}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View 3: 604 Pages Grid with Interactive Toggle */}
      {activeView === 'pages' && (
        <div className="bg-white dark:bg-[#132E27] rounded-3xl p-5 shadow-sm border border-[#E8E2D2] dark:border-[#1E443A] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-[#F7F4EB]">
                صفحات المصحف الشريف (1 - 604)
              </h3>
              <p className="text-xs text-slate-400">
                انقر نقرة واحدة لتحديد الصفحة كمقروءة / غير مقروءة صراحة، أو نقراً مزدوجاً للانتقال إليها
              </p>
            </div>
            <span className="text-xs font-bold text-[#123D32] dark:text-[#D5B779] bg-[#D5B779]/20 px-2.5 py-1 rounded-xl">
              {completedCount} / 604 مقروء
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-96 overflow-y-auto p-2 border border-slate-100 dark:border-[#1E443A] rounded-2xl">
            {Array.from({ length: 604 }, (_, i) => i + 1).map((pageNum) => {
              const isDone = khatma.completedPages.includes(pageNum);
              const isCurrent = khatma.currentPageNumber === pageNum;

              return (
                <button
                  key={pageNum}
                  onClick={() => togglePageCompleted(pageNum)}
                  onDoubleClick={() => handleQuickPageJump(pageNum)}
                  className={`w-9 h-9 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center justify-center ${
                    isDone
                      ? 'bg-[#123D32] text-[#D5B779] shadow-xs'
                      : isCurrent
                      ? 'border-2 border-[#D5B779] text-[#123D32] dark:text-[#D5B779]'
                      : 'bg-slate-100 dark:bg-[#0C1E19] text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                  title={`صفحة ${pageNum} (انقر للتحديد، انقر نقراً مزدوجاً لفتح السورة)`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Reset Khatma Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#132E27] p-6 shadow-2xl border border-[#D5B779]/30 space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-[#F7F4EB]">
              بدء ختمة جديدة؟
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              سيتم إعادة تعيين صفحات الختمة الحالية إلى البداية، مع تسجيل الختمة المكتملة في رصيد ختماتك بدقة دون احتساب مكرر.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  resetKhatma();
                  setShowResetModal(false);
                  triggerHaptic([30, 40]);
                }}
                className="flex-1 rounded-xl bg-[#123D32] text-[#F7F4EB] py-2.5 text-xs font-bold hover:bg-[#185244] transition"
              >
                نعم، ابدأ ختمة جديدة
              </button>
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 text-xs font-semibold hover:bg-slate-200 transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
