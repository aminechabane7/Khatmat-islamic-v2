import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Type,
  MapPin,
  RotateCcw,
  Smartphone,
  ShieldCheck,
  Info,
  Check,
  Vibrate,
  BookOpen,
  HardDriveDownload,
  Loader2,
  CheckCircle,
  Download,
} from 'lucide-react';
import { useAppStore } from '../context/AppContext';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { POPULAR_CITIES } from '../data/cities';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetAllAppData,
    triggerHaptic,
    quranOfflineStatus,
    downloadQuranOffline,
  } = useAppStore();

  const [showResetModal, setShowResetModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleFontSizeChange = (val: number) => {
    triggerHaptic(15);
    updateSettings({ arabicFontSize: val });
  };

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    triggerHaptic(20);
    try {
      await downloadQuranOffline((p) => setDownloadProgress(p));
      triggerHaptic([30, 40]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Page Title */}
      <div className="bg-white dark:bg-[#132E27] rounded-3xl p-5 shadow-sm border border-[#E8E2D2] dark:border-[#1E443A]">
        <h1 className="text-xl font-bold text-slate-800 dark:text-[#F7F4EB]">
          الإعدادات والتفضيلات
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          تخصيص المظهر، خطوط القراءة، مواقيت الصلاة وبيانات التطبيق
        </p>
      </div>

      {/* PWA Installation Section */}
      <div className="bg-white dark:bg-[#132E27] rounded-3xl p-5 shadow-sm border border-[#E8E2D2] dark:border-[#1E443A] space-y-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-[#D5B779]" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-[#F7F4EB]">
            تثبيت التطبيق (PWA)
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          يمكنك تثبيت "ختمتي" كتطبيق مستقل وسريع على نظام أندرويد أو iOS أو جهاز الكمبيوتر ليعمل دون الحاجة لمتصفح.
        </p>
        <PWAInstallButton variant="settings" />
      </div>

      {/* Offline Quran Storage Status (Priority 2 & 5) */}
      <div className="bg-white dark:bg-[#132E27] rounded-3xl p-5 shadow-sm border border-[#E8E2D2] dark:border-[#1E443A] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDriveDownload className="w-5 h-5 text-[#D5B779]" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-[#F7F4EB]">
              حالة التخزين بدون إنترنت (Offline Quran)
            </h2>
          </div>

          {quranOfflineStatus.isFullyDownloaded ? (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl">
              <CheckCircle className="w-4 h-4" />
              <span>مكتمل وموثق</span>
            </span>
          ) : (
            <button
              onClick={handleDownloadAll}
              disabled={isDownloading}
              className="bg-[#123D32] hover:bg-[#185244] text-[#D5B779] px-3 py-1.5 rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{downloadProgress}%</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل كل السور</span>
                </>
              )}
            </button>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          {quranOfflineStatus.isFullyDownloaded
            ? 'المصحف الشريف بكامل سوره الـ 114 وآياته الـ 6,236 مخزن محلياً في ذاكرة جهازك ويعمل دون اتصال بالإنترنت.'
            : `تم تخزين ${quranOfflineStatus.downloadedSurahsCount} من أصل 114 سورة في الذاكرة المحلية.`}
        </p>

        {isDownloading && (
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-[#D5B779] to-[#123D32] transition-all duration-300 rounded-full"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Theme Settings */}
      <div className="bg-white dark:bg-[#132E27] rounded-3xl p-5 shadow-sm border border-[#E8E2D2] dark:border-[#1E443A] space-y-3">
        <h2 className="text-sm font-bold text-slate-800 dark:text-[#F7F4EB] flex items-center gap-2">
          {settings.theme === 'dark' ? (
            <Moon className="w-4 h-4 text-[#D5B779]" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          <span>مظهر التطبيق</span>
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              triggerHaptic(20);
              updateSettings({ theme: 'light' });
            }}
            className={`p-3 rounded-2xl border text-center transition flex items-center justify-center gap-2 font-bold text-xs ${
              settings.theme === 'light'
                ? 'border-[#D5B779] bg-[#D5B779]/10 text-[#123D32]'
                : 'border-[#E8E2D2] dark:border-[#1E443A] text-slate-500'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>الوضع النهاري (عاجي)</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic(20);
              updateSettings({ theme: 'dark' });
            }}
            className={`p-3 rounded-2xl border text-center transition flex items-center justify-center gap-2 font-bold text-xs ${
              settings.theme === 'dark'
                ? 'border-[#D5B779] bg-[#D5B779]/15 text-[#D5B779]'
                : 'border-[#E8E2D2] dark:border-[#1E443A] text-slate-500'
            }`}
          >
            <Moon className="w-4 h-4 text-[#D5B779]" />
            <span>الوضع الليلي (زمردي داكن)</span>
          </button>
        </div>
      </div>

      {/* Arabic Font Size Slider & Live Preview */}
      <div className="bg-white dark:bg-[#132E27] rounded-3xl p-5 shadow-sm border border-[#E8E2D2] dark:border-[#1E443A] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 dark:text-[#F7F4EB] flex items-center gap-2">
            <Type className="w-4 h-4 text-[#D5B779]" />
            <span>حجم خط المصحف والأذكار</span>
          </h2>
          <span className="font-mono text-xs font-bold text-[#123D32] dark:text-[#D5B779] bg-slate-100 dark:bg-[#0C1E19] px-2.5 py-0.5 rounded-lg">
            {settings.arabicFontSize}px
          </span>
        </div>

        <input
          type="range"
          min="18"
          max="38"
          step="1"
          value={settings.arabicFontSize}
          onChange={(e) => handleFontSizeChange(parseInt(e.target.value, 10))}
          className="w-full accent-[#123D32] dark:accent-[#D5B779] cursor-pointer"
        />

        {/* Live Preview Box */}
        <div className="bg-[#F7F4EB] dark:bg-[#0C1E19] p-4 rounded-2xl border border-[#E8E2D2] dark:border-[#1E443A] text-center">
          <span className="text-[10px] text-slate-400 block mb-2">معاينة مباشرة:</span>
          <p
            className="font-quran text-[#123D32] dark:text-[#D5B779] leading-relaxed transition-all"
            style={{ fontSize: `${settings.arabicFontSize}px` }}
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾
          </p>
        </div>
      </div>

      {/* Haptic & Interaction Feedback */}
      <div className="bg-white dark:bg-[#132E27] rounded-3xl p-5 shadow-sm border border-[#E8E2D2] dark:border-[#1E443A] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#0C1E19] text-slate-600 dark:text-[#D5B779]">
            <Vibrate className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-[#F7F4EB]">
              الاهتزاز التفاعلي اللمسي (Haptics)
            </h3>
            <p className="text-[11px] text-slate-400">
              اهتزاز خفيف عند التسبيح والنقر على الأذكار
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const next = !settings.hapticEnabled;
            if (next) triggerHaptic([30, 40]);
            updateSettings({ hapticEnabled: next });
          }}
          className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
            settings.hapticEnabled ? 'bg-[#123D32] dark:bg-[#D5B779]' : 'bg-slate-300 dark:bg-slate-700'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white transition-transform ${
              settings.hapticEnabled ? '-translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Verified Content & System Architecture Transparency */}
      <div className="bg-white dark:bg-[#132E27] rounded-3xl p-5 shadow-sm border border-[#E8E2D2] dark:border-[#1E443A] space-y-3">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
          <h2 className="text-sm font-bold">توثيق المصادر والبيانات الدينية</h2>
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
          <p>
            • <strong>نصوص القرآن الكريم:</strong> مستمدة من مشروع تنزيل (Tanzil Project) بالرسم العثماني برواية حفص عن عاصم، بمطابقة تامة مع مصحف مجمع الملك فهد (604 صفحات، 30 جزءاً، 114 سورة، 6236 آية). لا يتم توليد أي حرف أو آية بالذكاء الاصطناعي نهائياً.
          </p>
          <p>
            • <strong>الأذكار والأدعية:</strong> جميع الأذكار مأخوذة بنصوصها وتخريجها المعتمد من صحيحي البخاري ومسلم وسنن أبي داود والترمذي والنسائي وابن ماجه وحصن المسلم، مع إيراد رقم الحديث وصحته.
          </p>
          <p>
            • <strong>مواقيت الصلاة:</strong> محسوبة فلكياً وفق إحداثيات كل مدينة والمنطقة الزمنية المحلية الخاصة بها باستخدام مكتبة adhan.js، مع دعم زوايا الأوقاف المغربية (19°/17°) وتقويم أم القرى والهيئة العامة المصرية للمساحة ورابطة العالم الإسلامي.
          </p>
        </div>
      </div>

      {/* Reset Progress Section */}
      <div className="bg-white dark:bg-[#132E27] rounded-3xl p-5 shadow-sm border border-red-200 dark:border-red-900/50 space-y-3">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <RotateCcw className="w-4 h-4" />
          <h2 className="text-sm font-bold">إعادة تعيين البيانات</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          إذا أردت مسح سجل الختمة أو العلامات المرجعية والبدء من جديد.
        </p>
        <button
          onClick={() => setShowResetModal(true)}
          className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-bold hover:bg-red-100 transition"
        >
          إعادة تعيين كافة البيانات المحفوظة
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#132E27] p-6 shadow-2xl border border-red-300 dark:border-red-800 space-y-4">
            <h3 className="text-base font-bold text-red-700 dark:text-red-300">
              تأكيد حذف البيانات المحلية؟
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              سيتم حذف سجل قراءتك في الختمة وجميع العلامات المرجعية وإعادة ضبط الإعدادات الافتراضية. لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => resetAllAppData()}
                className="flex-1 rounded-xl bg-red-600 text-white py-2.5 text-xs font-bold hover:bg-red-700 transition"
              >
                تأكيد ومسح الكل
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
