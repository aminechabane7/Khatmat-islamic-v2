import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Bookmark as BookmarkIcon,
  BookOpen,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  Check,
  Share2,
  Trash2,
  ZoomIn,
  ZoomOut,
  AlertCircle,
  Loader2,
  CheckCircle,
  X,
  HardDriveDownload,
  CheckCircle2,
} from 'lucide-react';
import { ALL_SURAHS, TOTAL_SURAHS } from '../data/surahs';
import { Ayah, SurahDetail, SurahMeta } from '../types';
import { getSurahDetail, isSurahOfflineAvailable, preCacheSurah } from '../services/quranService';
import { useAppStore } from '../context/AppContext';

export const QuranPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    settings,
    updateSettings,
    khatma,
    setReadingPosition,
    togglePageCompleted,
    isPageCompleted,
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    triggerHaptic,
    quranOfflineStatus,
    downloadQuranOffline,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'surahs' | 'bookmarks'>(
    searchParams.get('tab') === 'bookmarks' ? 'bookmarks' : 'surahs'
  );

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [revelationFilter, setRevelationFilter] = useState<'all' | 'Meccan' | 'Medinan'>('all');

  // Active Reading Surah
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(() => {
    const s = searchParams.get('surah');
    return s ? parseInt(s, 10) : null;
  });

  const [targetAyahNumber, setTargetAyahNumber] = useState<number | null>(() => {
    const a = searchParams.get('ayah');
    return a ? parseInt(a, 10) : null;
  });

  // Reader state
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [caching, setCaching] = useState(false);
  const [copiedAyahNum, setCopiedAyahNum] = useState<number | null>(null);

  // Bulk download state
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Font size local control
  const fontSize = settings.arabicFontSize || 26;

  // Filtered Surahs list
  const filteredSurahs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return ALL_SURAHS.filter((surah) => {
      const matchSearch =
        !query ||
        surah.name.includes(query) ||
        surah.englishName.toLowerCase().includes(query) ||
        surah.englishNameTranslation.toLowerCase().includes(query) ||
        String(surah.number) === query;

      const matchFilter =
        revelationFilter === 'all' || surah.revelationType === revelationFilter;

      return matchSearch && matchFilter;
    });
  }, [searchQuery, revelationFilter]);

  // Handle URL params changes
  useEffect(() => {
    const s = searchParams.get('surah');
    const a = searchParams.get('ayah');
    const tab = searchParams.get('tab');
    if (tab === 'bookmarks') setActiveTab('bookmarks');
    if (s) {
      const parsed = parseInt(s, 10);
      if (parsed >= 1 && parsed <= TOTAL_SURAHS) {
        setSelectedSurahNumber(parsed);
        if (a) setTargetAyahNumber(parseInt(a, 10));
      }
    }
  }, [searchParams]);

  // Load Surah Detail when selected
  useEffect(() => {
    if (!selectedSurahNumber) {
      setSurahDetail(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    // Check offline cache status
    isSurahOfflineAvailable(selectedSurahNumber).then((cached) => {
      if (isMounted) setIsCached(cached);
    });

    getSurahDetail(selectedSurahNumber)
      .then((detail) => {
        if (isMounted) {
          setSurahDetail(detail);
          setLoading(false);

          // Update Khatma reading position ONLY (does NOT complete the page)
          const firstAyah = detail.ayahs[0];
          setReadingPosition(
            detail.number,
            targetAyahNumber || firstAyah?.numberInSurah || 1,
            firstAyah?.page || detail.pageStart
          );
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'حدث خطأ في تحميل السورة الكريمة');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSurahNumber]);

  // Scroll to target ayah after loading
  useEffect(() => {
    if (targetAyahNumber && surahDetail) {
      setTimeout(() => {
        const el = document.getElementById(`ayah-${targetAyahNumber}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 250);
    }
  }, [targetAyahNumber, surahDetail]);

  const handleSelectSurah = (num: number, ayahNum?: number) => {
    triggerHaptic(20);
    setSelectedSurahNumber(num);
    setTargetAyahNumber(ayahNum || 1);
    setSearchParams({ surah: String(num), ...(ayahNum ? { ayah: String(ayahNum) } : {}) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseReader = () => {
    triggerHaptic(15);
    setSelectedSurahNumber(null);
    setSurahDetail(null);
    setSearchParams({});
  };

  const handlePrecache = async () => {
    if (!selectedSurahNumber) return;
    setCaching(true);
    triggerHaptic(20);
    const ok = await preCacheSurah(selectedSurahNumber);
    setCaching(false);
    if (ok) {
      setIsCached(true);
      triggerHaptic([30, 40]);
    }
  };

  const handleDownloadAllQuran = async () => {
    setIsDownloadingAll(true);
    setDownloadError(null);
    setDownloadProgress(0);
    triggerHaptic(25);

    try {
      await downloadQuranOffline((percent) => {
        setDownloadProgress(percent);
      });
      triggerHaptic([40, 50, 60]);
    } catch (err: any) {
      setDownloadError(err.message || 'فشل تحميل المصحف الشريف للعمل دون اتصال');
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const handleCopyAyah = (ayah: Ayah, surahName: string) => {
    const textToCopy = `﴿${ayah.text}﴾ [سورة ${surahName}: الآية ${ayah.numberInSurah}]`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedAyahNum(ayah.numberInSurah);
      triggerHaptic(25);
      setTimeout(() => setCopiedAyahNum(null), 2000);
    }
  };

  const handleToggleBookmark = (ayah: Ayah, surah: SurahDetail) => {
    if (isBookmarked(surah.number, ayah.numberInSurah)) {
      const found = bookmarks.find(
        (b) => b.surahNumber === surah.number && b.ayahNumber === ayah.numberInSurah
      );
      if (found) removeBookmark(found.id);
    } else {
      addBookmark({
        surahNumber: surah.number,
        surahName: surah.name,
        ayahNumber: ayah.numberInSurah,
        ayahText: ayah.text,
        pageNumber: ayah.page || surah.pageStart,
      });
    }
  };

  const handleSetFontSize = (delta: number) => {
    triggerHaptic(15);
    const newSize = Math.max(18, Math.min(40, fontSize + delta));
    updateSettings({ arabicFontSize: newSize });
  };

  // Reader View
  if (selectedSurahNumber && (surahDetail || loading || error)) {
    const meta = ALL_SURAHS.find((s) => s.number === selectedSurahNumber);
    const currentPageInReader = surahDetail?.ayahs[0]?.page || meta?.pageStart || 1;
    const isThisPageDone = isPageCompleted(currentPageInReader);

    return (
      <div className="space-y-4 pb-12 animate-in fade-in duration-200">
        {/* Reader Top Action Bar */}
        <div className="sticky top-16 z-20 bg-white/95 dark:bg-[#132E27]/95 backdrop-blur-md rounded-2xl p-3 shadow-md border border-[#E8E2D2] dark:border-[#1E443A] flex items-center justify-between">
          <button
            onClick={handleCloseReader}
            className="flex items-center gap-1.5 text-xs font-bold text-[#123D32] dark:text-[#D5B779] bg-[#123D32]/10 dark:bg-[#D5B779]/15 px-3 py-1.5 rounded-xl hover:bg-[#123D32]/20 transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span>فهرس السور</span>
          </button>

          {/* Surah Title in Header */}
          <div className="text-center">
            <h2 className="text-sm font-bold text-slate-800 dark:text-[#F7F4EB]">
              سورة {meta?.name}
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              الجزء {meta?.juzStart} • صـ {currentPageInReader}
            </p>
          </div>

          {/* Font Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleSetFontSize(-2)}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#1c4d40] text-slate-700 dark:text-[#F7F4EB] hover:bg-slate-200 text-xs font-bold"
              title="تصغير الخط"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1">{fontSize}</span>
            <button
              onClick={() => handleSetFontSize(2)}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#1c4d40] text-slate-700 dark:text-[#F7F4EB] hover:bg-slate-200 text-xs font-bold"
              title="تكبير الخط"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-[#132E27] rounded-3xl p-12 text-center shadow-sm border border-[#E8E2D2] dark:border-[#1E443A] space-y-3">
            <Loader2 className="w-8 h-8 text-[#D5B779] animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-[#F7F4EB]">
              جاري تحميل آيات سورة {meta?.name} من المصحف المعتمد...
            </p>
            <p className="text-xs text-slate-400">
              يتم حفظ السورة تلقائياً للاستخدام الدائم دون إنترنت
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 rounded-3xl p-6 text-center border border-red-200 dark:border-red-800 space-y-3">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <h3 className="text-base font-bold text-red-800 dark:text-red-200">
              تعذر استرجاع السورة
            </h3>
            <p className="text-xs text-red-600 dark:text-red-300 max-w-sm mx-auto">
              {error}
            </p>
            <button
              onClick={() => handleSelectSurah(selectedSurahNumber)}
              className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow hover:bg-red-700 transition"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Loaded Surah Content */}
        {surahDetail && (
          <div className="space-y-4">
            {/* Surah Header Card with Explicit Page Completion Toggle */}
            <div className="bg-gradient-to-br from-[#123D32] to-[#185244] text-[#F7F4EB] rounded-3xl p-6 shadow-md border border-[#D5B779]/30 text-center relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <div className="inline-block px-3 py-1 rounded-full bg-[#D5B779]/20 text-[#D5B779] text-xs font-semibold">
                  سورة {surahDetail.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • عدد آياتها {surahDetail.numberOfAyahs}
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold font-quran text-[#D5B779]">
                  سورة {surahDetail.name}
                </h1>
                <p className="text-xs text-[#EDE6D4]/80">
                  {surahDetail.englishName} ({surahDetail.englishNameTranslation})
                </p>

                {/* Explicit Page Completion Action Bar (Priority 1) */}
                <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => togglePageCompleted(currentPageInReader)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                      isThisPageDone
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white/15 hover:bg-white/25 text-[#F7F4EB] border border-white/20'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#D5B779]" />
                    <span>
                      {isThisPageDone
                        ? `صفحة ${currentPageInReader} محددة كمقروءة ✓`
                        : `تحديد صفحة ${currentPageInReader} كمقروءة في الختمة`}
                    </span>
                  </button>

                  {/* Cache tag */}
                  {isCached ? (
                    <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-900/60 text-emerald-200 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      محفوظة دون إنترنت
                    </span>
                  ) : (
                    <button
                      onClick={handlePrecache}
                      disabled={caching}
                      className="inline-flex items-center gap-1 text-[11px] bg-[#D5B779] text-[#123D32] px-2.5 py-1 rounded-lg font-bold shadow hover:bg-[#F3E5AB] transition"
                    >
                      {caching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                      حفظ السورة
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bismillah Header (except Surah 9 At-Tawbah and Surah 1 Al-Fatiha where it's ayah 1) */}
            {surahDetail.number !== 9 && surahDetail.number !== 1 && (
              <div className="text-center py-4 text-2xl sm:text-3xl font-quran text-[#123D32] dark:text-[#D5B779]">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>
            )}

            {/* Ayahs Flow List */}
            <div className="bg-white dark:bg-[#132E27] rounded-3xl p-5 sm:p-8 shadow-sm border border-[#E8E2D2] dark:border-[#1E443A] space-y-6">
              {surahDetail.ayahs.map((ayah) => {
                const bookmarked = isBookmarked(surahDetail.number, ayah.numberInSurah);
                const isCurrentRead =
                  khatma.currentSurahNumber === surahDetail.number &&
                  khatma.currentAyahNumber === ayah.numberInSurah;

                return (
                  <div
                    key={ayah.numberInSurah}
                    id={`ayah-${ayah.numberInSurah}`}
                    className={`p-4 rounded-2xl transition-all duration-300 border ${
                      isCurrentRead
                        ? 'bg-[#D5B779]/15 border-[#D5B779] shadow-xs'
                        : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-[#1c4d40]/40'
                    }`}
                  >
                    <div className="flex flex-col gap-3">
                      <p
                        className="font-quran leading-[2.4] text-slate-900 dark:text-[#F7F4EB] text-justify selection:bg-[#D5B779]/30"
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        {ayah.text}{' '}
                        <span className="inline-flex items-center justify-center w-7 h-7 mx-1 text-xs font-bold text-[#123D32] bg-[#D5B779] rounded-full align-middle shadow-xs">
                          {ayah.numberInSurah}
                        </span>
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#1E443A]/60 text-xs">
                        <div className="flex items-center gap-2">
                          {/* Bookmark */}
                          <button
                            onClick={() => handleToggleBookmark(ayah, surahDetail)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition ${
                              bookmarked
                                ? 'bg-amber-500 text-white'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1c4d40]'
                            }`}
                          >
                            <BookmarkIcon className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
                            <span>{bookmarked ? 'محفوظة' : 'حفظ'}</span>
                          </button>

                          {/* Set reading mark ONLY (does NOT mark completed) */}
                          <button
                            onClick={() => {
                              triggerHaptic(20);
                              setReadingPosition(
                                surahDetail.number,
                                ayah.numberInSurah,
                                ayah.page || surahDetail.pageStart
                              );
                            }}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition ${
                              isCurrentRead
                                ? 'bg-[#123D32] text-[#F7F4EB]'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1c4d40]'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isCurrentRead ? 'موضع القراءة الحالي' : 'موقفي هنا'}</span>
                          </button>
                        </div>

                        {/* Copy Verse */}
                        <button
                          onClick={() => handleCopyAyah(ayah, surahDetail.name)}
                          className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white px-2 py-1 rounded-lg transition"
                          title="نسخ الآية الكريمة"
                        >
                          {copiedAyahNum === ayah.numberInSurah ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-500">تم النسخ</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3.5 h-3.5" />
                              <span>مشاركة</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Next / Previous Surah Navigation */}
            <div className="flex items-center justify-between pt-4">
              {surahDetail.number > 1 ? (
                <button
                  onClick={() => handleSelectSurah(surahDetail.number - 1)}
                  className="flex items-center gap-2 bg-white dark:bg-[#132E27] border border-[#E8E2D2] dark:border-[#1E443A] px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-800 dark:text-[#F7F4EB] hover:border-[#D5B779] transition shadow-xs"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السورة السابقة ({ALL_SURAHS[surahDetail.number - 2]?.name})</span>
                </button>
              ) : <div />}

              {surahDetail.number < TOTAL_SURAHS && (
                <button
                  onClick={() => handleSelectSurah(surahDetail.number + 1)}
                  className="flex items-center gap-2 bg-[#123D32] text-[#F7F4EB] px-4 py-2.5 rounded-2xl text-xs font-bold hover:bg-[#185244] transition shadow-xs"
                >
                  <span>السورة التالية ({ALL_SURAHS[surahDetail.number]?.name})</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Index / Bookmarks View
  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Complete Quran Offline Download Manager Card */}
      <div className="bg-white dark:bg-[#132E27] rounded-3xl p-5 shadow-sm border border-[#E8E2D2] dark:border-[#1E443A] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#123D32]/10 dark:bg-[#D5B779]/20 text-[#123D32] dark:text-[#D5B779]">
              <HardDriveDownload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-[#F7F4EB]">
                التخزين المحلي للمصحف الشريف (114 سورة)
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {quranOfflineStatus.isFullyDownloaded
                  ? 'تم تحميل وتدقيق المصحف كاملاً (114 سورة - 6236 آية) للعمل دون إنترنت'
                  : `متاح محلياً: ${quranOfflineStatus.downloadedSurahsCount} من 114 سورة (${quranOfflineStatus.downloadedAyahsCount} آية)`}
              </p>
            </div>
          </div>

          {!quranOfflineStatus.isFullyDownloaded && (
            <button
              onClick={handleDownloadAllQuran}
              disabled={isDownloadingAll}
              className="bg-[#123D32] hover:bg-[#185244] text-[#D5B779] px-3.5 py-1.5 rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {isDownloadingAll ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{downloadProgress}%</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل الكل الآن</span>
                </>
              )}
            </button>
          )}

          {quranOfflineStatus.isFullyDownloaded && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl">
              <CheckCircle className="w-4 h-4" />
              <span>جاهز بدون إنترنت</span>
            </span>
          )}
        </div>

        {/* Progress bar during download */}
        {isDownloadingAll && (
          <div className="space-y-1">
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-[#D5B779] to-[#123D32] transition-all duration-300 rounded-full"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 text-center">
              جاري فحص وتخزين سور القرآن الكريم في الذاكرة المحلية ({downloadProgress}%)...
            </p>
          </div>
        )}

        {downloadError && (
          <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 p-2.5 rounded-xl">
            {downloadError}
          </p>
        )}
      </div>

      {/* Header & Tabs */}
      <div className="bg-white dark:bg-[#132E27] rounded-3xl p-5 shadow-sm border border-[#E8E2D2] dark:border-[#1E443A] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-[#F7F4EB]">
              فهرس القرآن الكريم
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              114 سورة موثقة بالرسم العثماني
            </p>
          </div>

          <button
            onClick={() => handleSelectSurah(khatma.currentSurahNumber, khatma.currentAyahNumber)}
            className="flex items-center gap-1.5 bg-[#123D32] hover:bg-[#185244] text-[#D5B779] px-3 py-1.5 rounded-xl text-xs font-bold shadow transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>تابع القراءة</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-2xl bg-slate-100 dark:bg-[#0C1E19] p-1 text-xs font-bold">
          <button
            onClick={() => {
              triggerHaptic(15);
              setActiveTab('surahs');
            }}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === 'surahs'
                ? 'bg-white dark:bg-[#132E27] text-[#123D32] dark:text-[#D5B779] shadow-xs'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            فهرس السور (114)
          </button>
          <button
            onClick={() => {
              triggerHaptic(15);
              setActiveTab('bookmarks');
            }}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'bookmarks'
                ? 'bg-white dark:bg-[#132E27] text-[#123D32] dark:text-[#D5B779] shadow-xs'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <span>العلامات المرجعية</span>
            {bookmarks.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#D5B779] text-[#123D32] text-[10px] flex items-center justify-center font-bold">
                {bookmarks.length}
              </span>
            )}
          </button>
        </div>

        {/* Search & Filter Bar */}
        {activeTab === 'surahs' && (
          <div className="space-y-2.5">
            <div className="relative">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم السورة بالعربية أو الإنجليزية أو رقمها..."
                className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-[#F7F4EB] dark:bg-[#0C1E19] border border-[#E8E2D2] dark:border-[#1E443A] text-xs text-slate-800 dark:text-[#F7F4EB] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#D5B779]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Revelation Filter Pills */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[11px] text-slate-400">التصنيف:</span>
              <button
                onClick={() => setRevelationFilter('all')}
                className={`px-3 py-1 rounded-xl font-medium transition ${
                  revelationFilter === 'all'
                    ? 'bg-[#123D32] text-[#F7F4EB]'
                    : 'bg-slate-100 dark:bg-[#0C1E19] text-slate-600 dark:text-slate-300'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setRevelationFilter('Meccan')}
                className={`px-3 py-1 rounded-xl font-medium transition ${
                  revelationFilter === 'Meccan'
                    ? 'bg-[#123D32] text-[#F7F4EB]'
                    : 'bg-slate-100 dark:bg-[#0C1E19] text-slate-600 dark:text-slate-300'
                }`}
              >
                مكية
              </button>
              <button
                onClick={() => setRevelationFilter('Medinan')}
                className={`px-3 py-1 rounded-xl font-medium transition ${
                  revelationFilter === 'Medinan'
                    ? 'bg-[#123D32] text-[#F7F4EB]'
                    : 'bg-slate-100 dark:bg-[#0C1E19] text-slate-600 dark:text-slate-300'
                }`}
              >
                مدنية
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Surahs List */}
      {activeTab === 'surahs' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredSurahs.map((surah) => {
            const isCurrent = khatma.currentSurahNumber === surah.number;
            return (
              <div
                key={surah.number}
                onClick={() => handleSelectSurah(surah.number)}
                className={`cursor-pointer rounded-2xl p-3.5 bg-white dark:bg-[#132E27] border transition-all duration-200 flex items-center justify-between hover:shadow-md hover:border-[#D5B779] ${
                  isCurrent
                    ? 'border-[#D5B779] ring-1 ring-[#D5B779]/40 bg-[#D5B779]/5'
                    : 'border-[#E8E2D2] dark:border-[#1E443A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#123D32]/10 dark:bg-[#0C1E19] text-[#123D32] dark:text-[#D5B779] flex items-center justify-center font-bold text-sm shrink-0 border border-[#D5B779]/30 font-mono">
                    {surah.number}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-800 dark:text-[#F7F4EB]">
                        سورة {surah.name}
                      </h3>
                      {isCurrent && (
                        <span className="text-[10px] bg-[#D5B779] text-[#123D32] font-bold px-1.5 py-0.2 rounded-md">
                          موقفك
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {surah.englishName} • {surah.numberOfAyahs} آية
                    </p>
                  </div>
                </div>

                <div className="text-left shrink-0">
                  <span className="text-xs font-semibold text-[#123D32] dark:text-[#D5B779] block">
                    صـ {surah.pageStart}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    جزء {surah.juzStart}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredSurahs.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">لم يتم العثور على سور مطابقة للبحث</p>
            </div>
          )}
        </div>
      )}

      {/* Bookmarks List */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-3">
          {bookmarks.map((bm) => (
            <div
              key={bm.id}
              className="bg-white dark:bg-[#132E27] rounded-2xl p-4 border border-[#E8E2D2] dark:border-[#1E443A] shadow-sm flex items-start justify-between gap-3 hover:border-[#D5B779] transition"
            >
              <div
                onClick={() => handleSelectSurah(bm.surahNumber, bm.ayahNumber)}
                className="flex-1 cursor-pointer space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#123D32] dark:text-[#D5B779] bg-[#123D32]/10 dark:bg-[#D5B779]/20 px-2.5 py-0.5 rounded-lg">
                    سورة {bm.surahName} • آية {bm.ayahNumber}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    صـ {bm.pageNumber}
                  </span>
                </div>

                <p className="font-quran text-slate-800 dark:text-[#F7F4EB] text-sm line-clamp-2">
                  ﴿{bm.ayahText}﴾
                </p>

                {bm.note && (
                  <p className="text-[11px] text-slate-500 italic">
                    ملاحظة: {bm.note}
                  </p>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeBookmark(bm.id);
                }}
                className="p-2 text-slate-400 hover:text-red-500 transition rounded-lg"
                title="حذف العلامة"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {bookmarks.length === 0 && (
            <div className="bg-white dark:bg-[#132E27] rounded-3xl p-12 text-center border border-[#E8E2D2] dark:border-[#1E443A] space-y-3">
              <BookmarkIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-700 dark:text-[#F7F4EB]">
                لا توجد علامات مرجعية محفوظة
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                يمكنك حفظ أي آية كريمة أثناء قراءة السور للرجوع إليها بسرعة من هذه الصفحة.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
