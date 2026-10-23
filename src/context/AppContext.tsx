import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { AppSettings, Bookmark, KhatmaState, QuranOfflineStatus } from '../types';
import {
  DEFAULT_SETTINGS,
  DEFAULT_KHATMA_STATE,
  loadSettings,
  saveSettings,
  loadKhatmaState,
  saveKhatmaState,
  loadBookmarks,
  saveBookmarks,
  loadAdhkarProgress,
  saveAdhkarProgress,
  AdhkarProgressState,
  getLocalDateKey,
  resetAllData,
} from '../services/storageService';
import {
  getQuranOfflineStatus,
  downloadAllQuranForOffline,
} from '../services/quranService';

interface AppContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  khatma: KhatmaState;
  updateKhatma: (newState: Partial<KhatmaState>) => void;
  setReadingPosition: (surahNumber: number, ayahNumber: number, pageNumber: number) => void;
  markPageCompleted: (pageNumber: number, completed: boolean) => void;
  togglePageCompleted: (pageNumber: number) => void;
  markPagesUpTo: (pageNumber: number) => void;
  isPageCompleted: (pageNumber: number) => boolean;
  resetKhatma: () => void;
  bookmarks: Bookmark[];
  addBookmark: (bm: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (surahNumber: number, ayahNumber: number) => boolean;
  adhkarProgress: AdhkarProgressState;
  decrementDhikr: (dhikrId: string, initialCount: number) => number;
  resetAdhkarSection: (dhikrIds: string[]) => void;
  resetAllAppData: () => void;
  triggerHaptic: (pattern?: number | number[]) => void;
  quranOfflineStatus: QuranOfflineStatus;
  refreshOfflineStatus: () => Promise<void>;
  downloadQuranOffline: (
    onProgress?: (percent: number, currentSurah: number) => void
  ) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettingsState] = useState<AppSettings>(() => loadSettings());
  const [khatma, setKhatmaState] = useState<KhatmaState>(() => loadKhatmaState());
  const [bookmarks, setBookmarksState] = useState<Bookmark[]>(() => loadBookmarks());
  const [adhkarProgress, setAdhkarProgressState] = useState<AdhkarProgressState>(() => loadAdhkarProgress());
  const [quranOfflineStatus, setQuranOfflineStatus] = useState<QuranOfflineStatus>({
    isFullyDownloaded: false,
    downloadedSurahsCount: 0,
    totalSurahs: 114,
    downloadedAyahsCount: 0,
    totalAyahs: 6236,
  });

  const refreshOfflineStatus = useCallback(async () => {
    try {
      const status = await getQuranOfflineStatus();
      setQuranOfflineStatus(status);
    } catch (e) {
      console.warn('Failed to get offline status', e);
    }
  }, []);

  // Check offline status on mount
  useEffect(() => {
    refreshOfflineStatus();
  }, [refreshOfflineStatus]);

  // Apply dark mode theme on initial mount and change
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const triggerHaptic = (pattern: number | number[] = 25) => {
    if (settings.hapticEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // ignore if not permitted
      }
    }
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  };

  const updateKhatma = (newState: Partial<KhatmaState>) => {
    setKhatmaState((prev) => {
      const updated = { ...prev, ...newState };
      saveKhatmaState(updated);
      return updated;
    });
  };

  /**
   * PRIORITY 1: setReadingPosition must ONLY update currentSurahNumber, currentAyahNumber and currentPageNumber.
   * NEVER marks a page completed simply because it was opened.
   * Validates page number (1-604), surah number (1-114), and ayah number (>=1).
   */
  const setReadingPosition = (surahNumber: number, ayahNumber: number, pageNumber: number) => {
    const validSurah = Math.max(1, Math.min(114, Math.floor(surahNumber) || 1));
    const validAyah = Math.max(1, Math.floor(ayahNumber) || 1);
    const validPage = Math.max(1, Math.min(604, Math.floor(pageNumber) || 1));

    setKhatmaState((prev) => {
      if (
        prev.currentSurahNumber === validSurah &&
        prev.currentAyahNumber === validAyah &&
        prev.currentPageNumber === validPage
      ) {
        return prev;
      }

      const updated: KhatmaState = {
        ...prev,
        currentSurahNumber: validSurah,
        currentAyahNumber: validAyah,
        currentPageNumber: validPage,
        // completedPages and dailyLogs are strictly untouched here!
      };
      saveKhatmaState(updated);
      return updated;
    });
  };

  /**
   * Explicit action to toggle a page completed or uncompleted.
   * Accurately updates dailyLogs using local calendar date.
   * Prevents duplicate completed pages and handles Khatma completion counting without double-counting.
   */
  const togglePageCompleted = (pageNumber: number) => {
    const validPage = Math.max(1, Math.min(604, Math.floor(pageNumber) || 1));
    const todayKey = getLocalDateKey();

    setKhatmaState((prev) => {
      const pageSet = new Set(prev.completedPages);
      const isAlreadyCompleted = pageSet.has(validPage);
      let todayLogCount = prev.dailyLogs[todayKey] || 0;
      let completedKhatmas = prev.completedKhatmasCount || 0;
      let khatmaAwarded = Boolean(prev.khatmaCompletedAwarded);

      if (isAlreadyCompleted) {
        // Uncompleting page
        pageSet.delete(validPage);
        todayLogCount = Math.max(0, todayLogCount - 1);
      } else {
        // Completing page
        pageSet.add(validPage);
        todayLogCount += 1;

        // Check if all 604 pages are now completed
        if (pageSet.size >= 604 && !khatmaAwarded) {
          completedKhatmas += 1;
          khatmaAwarded = true;
        }
      }

      const sortedPages = Array.from(pageSet).sort((a, b) => a - b);
      const updated: KhatmaState = {
        ...prev,
        completedPages: sortedPages,
        dailyLogs: {
          ...prev.dailyLogs,
          [todayKey]: todayLogCount,
        },
        completedKhatmasCount: completedKhatmas,
        khatmaCompletedAwarded: khatmaAwarded,
      };

      saveKhatmaState(updated);
      return updated;
    });

    triggerHaptic(20);
  };

  /**
   * Explicit action to mark a page completed or uncompleted with explicit boolean.
   */
  const markPageCompleted = (pageNumber: number, completed: boolean) => {
    const validPage = Math.max(1, Math.min(604, Math.floor(pageNumber) || 1));
    const isCurrentlyDone = khatma.completedPages.includes(validPage);
    if (completed && !isCurrentlyDone) {
      togglePageCompleted(validPage);
    } else if (!completed && isCurrentlyDone) {
      togglePageCompleted(validPage);
    }
  };

  /**
   * Explicit action to mark all pages up to a given pageNumber.
   * Adds only newly completed pages and increments dailyLogs accordingly.
   */
  const markPagesUpTo = (pageNumber: number) => {
    const validPage = Math.max(1, Math.min(604, Math.floor(pageNumber) || 1));
    const todayKey = getLocalDateKey();

    setKhatmaState((prev) => {
      const pageSet = new Set(prev.completedPages);
      const initialSize = pageSet.size;

      for (let p = 1; p <= validPage; p++) {
        pageSet.add(p);
      }

      const addedCount = pageSet.size - initialSize;
      const todayLogCount = (prev.dailyLogs[todayKey] || 0) + addedCount;

      let completedKhatmas = prev.completedKhatmasCount || 0;
      let khatmaAwarded = Boolean(prev.khatmaCompletedAwarded);

      if (pageSet.size >= 604 && !khatmaAwarded) {
        completedKhatmas += 1;
        khatmaAwarded = true;
      }

      const sortedPages = Array.from(pageSet).sort((a, b) => a - b);
      const updated: KhatmaState = {
        ...prev,
        currentPageNumber: validPage,
        completedPages: sortedPages,
        dailyLogs: {
          ...prev.dailyLogs,
          [todayKey]: todayLogCount,
        },
        completedKhatmasCount: completedKhatmas,
        khatmaCompletedAwarded: khatmaAwarded,
      };

      saveKhatmaState(updated);
      return updated;
    });

    triggerHaptic([30, 50, 30]);
  };

  const isPageCompleted = (pageNumber: number): boolean => {
    return khatma.completedPages.includes(pageNumber);
  };

  /**
   * Reset Khatma: resets pages, sets position to 1, prevents duplicate completion counts.
   */
  const resetKhatma = () => {
    setKhatmaState((prev) => {
      let completedKhatmas = prev.completedKhatmasCount || 0;
      // If user reached 604 pages and for some reason it wasn't yet credited, credit it once
      if (prev.completedPages.length >= 604 && !prev.khatmaCompletedAwarded) {
        completedKhatmas += 1;
      }

      const newState: KhatmaState = {
        ...DEFAULT_KHATMA_STATE,
        completedPages: [],
        currentPageNumber: 1,
        currentSurahNumber: 1,
        currentAyahNumber: 1,
        startDate: getLocalDateKey(),
        dailyGoalPages: prev.dailyGoalPages,
        targetDays: prev.targetDays,
        dailyLogs: prev.dailyLogs, // Preserve reading history
        completedKhatmasCount: completedKhatmas,
        khatmaCompletedAwarded: false,
      };

      saveKhatmaState(newState);
      return newState;
    });

    triggerHaptic([40, 50]);
  };

  const addBookmark = (bm: Omit<Bookmark, 'id' | 'createdAt'>) => {
    const newBm: Bookmark = {
      ...bm,
      id: `bm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };
    setBookmarksState((prev) => {
      const updated = [newBm, ...prev.filter((b) => !(b.surahNumber === bm.surahNumber && b.ayahNumber === bm.ayahNumber))];
      saveBookmarks(updated);
      return updated;
    });
    triggerHaptic(40);
  };

  const removeBookmark = (id: string) => {
    setBookmarksState((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      saveBookmarks(updated);
      return updated;
    });
    triggerHaptic(20);
  };

  const isBookmarked = (surahNumber: number, ayahNumber: number) => {
    return bookmarks.some((b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber);
  };

  const decrementDhikr = (dhikrId: string, initialCount: number): number => {
    const todayKey = getLocalDateKey();
    let newCount = initialCount - 1;
    setAdhkarProgressState((prev) => {
      const currentRemaining = prev.counts[dhikrId] !== undefined ? prev.counts[dhikrId] : initialCount;
      newCount = Math.max(0, currentRemaining - 1);
      const updated: AdhkarProgressState = {
        dateKey: todayKey,
        counts: {
          ...prev.counts,
          [dhikrId]: newCount,
        },
      };
      saveAdhkarProgress(updated);
      return updated;
    });

    if (newCount === 0) {
      triggerHaptic([30, 40, 60]);
    } else {
      triggerHaptic(20);
    }
    return newCount;
  };

  const resetAdhkarSection = (dhikrIds: string[]) => {
    setAdhkarProgressState((prev) => {
      const newCounts = { ...prev.counts };
      dhikrIds.forEach((id) => delete newCounts[id]);
      const updated = {
        ...prev,
        counts: newCounts,
      };
      saveAdhkarProgress(updated);
      return updated;
    });
    triggerHaptic(30);
  };

  const downloadQuranOffline = async (
    onProgress?: (percent: number, currentSurah: number) => void
  ): Promise<boolean> => {
    const ok = await downloadAllQuranForOffline(onProgress);
    await refreshOfflineStatus();
    return ok;
  };

  const resetAllAppData = () => {
    resetAllData();
  };

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      khatma,
      updateKhatma,
      setReadingPosition,
      markPageCompleted,
      togglePageCompleted,
      markPagesUpTo,
      isPageCompleted,
      resetKhatma,
      bookmarks,
      addBookmark,
      removeBookmark,
      isBookmarked,
      adhkarProgress,
      decrementDhikr,
      resetAdhkarSection,
      resetAllAppData,
      triggerHaptic,
      quranOfflineStatus,
      refreshOfflineStatus,
      downloadQuranOffline,
    }),
    [
      settings,
      khatma,
      bookmarks,
      adhkarProgress,
      quranOfflineStatus,
      refreshOfflineStatus,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
