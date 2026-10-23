import { AppSettings, Bookmark, KhatmaState } from '../types';

const SETTINGS_KEY = 'khatmati_settings_v1';
const KHATMA_KEY = 'khatmati_khatma_v1';
const BOOKMARKS_KEY = 'khatmati_bookmarks_v1';
const ADHKAR_PROGRESS_KEY = 'khatmati_adhkar_progress_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  arabicFontSize: 24,
  quranFont: 'amiri',
  selectedCityId: 'makkah',
  calculationMethod: 'UmmAlQura',
  madhab: 'shafi',
  hapticEnabled: true,
  showTranslation: true,
};

export const DEFAULT_KHATMA_STATE: KhatmaState = {
  currentSurahNumber: 1,
  currentAyahNumber: 1,
  currentPageNumber: 1,
  completedPages: [],
  dailyGoalPages: 4, // 4 pages a day or after prayers
  targetDays: 30, // 30-day Khatma default
  startDate: new Date().toISOString().split('T')[0],
  dailyLogs: {},
  completedKhatmasCount: 0,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Failed to load settings from storage', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {
    console.warn('Failed to save settings', e);
  }
}

export function loadKhatmaState(): KhatmaState {
  try {
    const raw = localStorage.getItem(KHATMA_KEY);
    if (raw) return { ...DEFAULT_KHATMA_STATE, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Failed to load Khatma state', e);
  }
  return DEFAULT_KHATMA_STATE;
}

export function saveKhatmaState(state: KhatmaState): void {
  try {
    localStorage.setItem(KHATMA_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save Khatma state', e);
  }
}

export function loadBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load bookmarks', e);
  }
  return [
    {
      id: 'default-1',
      surahNumber: 1,
      surahName: 'الفاتحة',
      ayahNumber: 1,
      ayahText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      pageNumber: 1,
      createdAt: Date.now(),
      note: 'بداية تلاوة القرآن الكريم',
    },
  ];
}

export function saveBookmarks(bookmarks: Bookmark[]): void {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch (e) {
    console.warn('Failed to save bookmarks', e);
  }
}

export interface AdhkarProgressState {
  dateKey: string;
  counts: { [dhikrId: string]: number }; // remaining count
}

export function loadAdhkarProgress(): AdhkarProgressState {
  const todayKey = new Date().toISOString().split('T')[0];
  try {
    const raw = localStorage.getItem(ADHKAR_PROGRESS_KEY);
    if (raw) {
      const parsed: AdhkarProgressState = JSON.parse(raw);
      if (parsed.dateKey === todayKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load adhkar progress', e);
  }
  return { dateKey: todayKey, counts: {} };
}

export function saveAdhkarProgress(progress: AdhkarProgressState): void {
  try {
    localStorage.setItem(ADHKAR_PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to save adhkar progress', e);
  }
}

export function resetAllData(): void {
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(KHATMA_KEY);
  localStorage.removeItem(BOOKMARKS_KEY);
  localStorage.removeItem(ADHKAR_PROGRESS_KEY);
  window.location.reload();
}
