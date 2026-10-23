export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  pageStart: number;
  juzStart: number;
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  juz?: number;
  page?: number;
  hizbQuarter?: number;
  sajda?: boolean;
}

export interface SurahDetail extends SurahMeta {
  ayahs: Ayah[];
}

export interface Bookmark {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  ayahText: string;
  pageNumber: number;
  createdAt: number;
  note?: string;
}

export interface KhatmaState {
  currentSurahNumber: number;
  currentAyahNumber: number;
  currentPageNumber: number; // 1 - 604
  completedPages: number[];
  dailyGoalPages: number;
  targetDays: number;
  startDate: string;
  dailyLogs: { [dateKey: string]: number }; // dateKey 'YYYY-MM-DD' (local calendar) -> pages count
  completedKhatmasCount: number;
  khatmaCompletedAwarded?: boolean;
}

export type AdhkarCategory = 'morning' | 'evening' | 'sleep' | 'after_prayer';

export interface DhikrItem {
  id: string;
  category: AdhkarCategory;
  text: string;
  count: number; // total needed
  reward?: string; // فضل الذكر
  reference: string; // المصدر (صحيح البخاري، مسلم، إلخ)
  hadithNumber?: string;
  verificationStatus?: 'verified' | 'needs_review';
}

export interface PrayerTimeItem {
  name: string;
  arabicName: string;
  time: string;
  dateObj: Date;
  isNext: boolean;
  isCurrent: boolean;
  iconName: string;
  isObligatory: boolean; // True for the 5 Fard prayers, false for sunrise (الشروق)
}

export type CalculationMethodType =
  | 'MWL'
  | 'UmmAlQura'
  | 'Egyptian'
  | 'ISNA'
  | 'Dubai'
  | 'Qatar'
  | 'Kuwait'
  | 'Morocco';

export interface AppSettings {
  theme: 'light' | 'dark';
  arabicFontSize: number; // in px: 20 - 38
  quranFont: 'amiri' | 'cairo';
  selectedCityId: string;
  customCoordinates?: { lat: number; lng: number; name: string };
  calculationMethod: CalculationMethodType;
  madhab: 'shafi' | 'hanafi';
  hapticEnabled: boolean;
  showTranslation: boolean;
}

export interface QuranOfflineStatus {
  isFullyDownloaded: boolean;
  downloadedSurahsCount: number;
  totalSurahs: number;
  downloadedAyahsCount: number;
  totalAyahs: number;
  lastVerifiedAt?: number;
}
