import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { AppSettings, Bookmark, KhatmaState } from '../types';
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
  resetAllData,
} from '../services/storageService';

interface AppContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  khatma: KhatmaState;
  updateKhatma: (newState: Partial<KhatmaState>) => void;
  setReadingPosition: (surahNumber: number, ayahNumber: number, pageNumber: number) => void;
  togglePageCompleted: (pageNumber: number) => void;
  markPagesUpTo: (pageNumber: number) => void;
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
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettingsState] = useState<AppSettings>(() => loadSettings());
  const [khatma, setKhatmaState] = useState<KhatmaState>(() => loadKhatmaState());
  const [bookmarks, setBookmarksState] = useState<Bookmark[]>(() => loadBookmarks());
  const [adhkarProgress, setAdhkarProgressState] = useState<AdhkarProgressState>(() => loadAdhkarProgress());

  // Apply dark mode theme on initial mount
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

  const setReadingPosition = (surahNumber: number, ayahNumber: number, pageNumber: number) => {
    const todayKey = new Date().toISOString().split('T')[0];
    setKhatmaState((prev) => {
      // Add page to completed pages if not present
      const completedSet = new Set(prev.completedPages);
      const isNewPage = !completedSet.has(pageNumber);
      if (isNewPage) {
        completedSet.add(pageNumber);
      }

      const currentDayPages = (prev.dailyLogs[todayKey] || 0) + (isNewPage ? 1 : 0);
      const updated: KhatmaState = {
        ...prev,
        currentSurahNumber: surahNumber,
        currentAyahNumber: ayahNumber,
        currentPageNumber: pageNumber,
        completedPages: Array.from(completedSet).sort((a, b) => a - b),
        dailyLogs: {
          ...prev.dailyLogs,
          [todayKey]: currentDayPages,
        },
      };
      saveKhatmaState(updated);
      return updated;
    });
  };

  const togglePageCompleted = (pageNumber: number) => {
    setKhatmaState((prev) => {
      const set = new Set(prev.completedPages);
      if (set.has(pageNumber)) {
        set.delete(pageNumber);
      } else {
        set.add(pageNumber);
      }
      const updated = {
        ...prev,
        completedPages: Array.from(set).sort((a, b) => a - b),
      };
      saveKhatmaState(updated);
      return updated;
    });
    triggerHaptic(20);
  };

  const markPagesUpTo = (pageNumber: number) => {
    setKhatmaState((prev) => {
      const set = new Set(prev.completedPages);
      for (let i = 1; i <= pageNumber; i++) {
        set.add(i);
      }
      const updated = {
        ...prev,
        currentPageNumber: pageNumber,
        completedPages: Array.from(set).sort((a, b) => a - b),
      };
      saveKhatmaState(updated);
      return updated;
    });
    triggerHaptic([30, 50, 30]);
  };

  const resetKhatma = () => {
    const newState: KhatmaState = {
      ...DEFAULT_KHATMA_STATE,
      completedKhatmasCount: (khatma.completedKhatmasCount || 0) + (khatma.completedPages.length >= 604 ? 1 : 0),
      startDate: new Date().toISOString().split('T')[0],
      dailyGoalPages: khatma.dailyGoalPages,
      targetDays: khatma.targetDays,
    };
    setKhatmaState(newState);
    saveKhatmaState(newState);
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
    const todayKey = new Date().toISOString().split('T')[0];
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
      togglePageCompleted,
      markPagesUpTo,
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
    }),
    [settings, khatma, bookmarks, adhkarProgress]
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
