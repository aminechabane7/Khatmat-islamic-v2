import { Ayah, QuranOfflineStatus, SurahDetail, SurahMeta } from '../types';
import { ALL_SURAHS, TOTAL_AYAHS, TOTAL_SURAHS } from '../data/surahs';

// Documented open source: Tanzil Project (Hafs Uthmani Script, CC-BY 3.0) via Alquran Cloud API
export const QURAN_DATASET_SOURCE = 'Tanzil Project (Hafs Uthmani Text) / Al-Quran Cloud API';

const DB_NAME = 'khatmati_quran_cache_db';
const STORE_NAME = 'surahs_store';
const METADATA_STORE = 'quran_meta_store';

function openQuranDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB غير مدعوم في هذا المتصفح'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, 2);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'number' });
      }
      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        db.createObjectStore(METADATA_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('فشل فتح قاعدة البيانات المحلية'));
  });
}

/**
 * Validate that a Surah's ayahs meet integrity constraints:
 * - Count must match exact verified ayah count in ALL_SURAHS
 * - Sequential numberInSurah from 1 to N
 * - Non-empty Uthmani text
 * - Valid Medina Mushaf page range 1..604
 */
export function validateSurahIntegrity(surahNumber: number, ayahs: Ayah[]): { isValid: boolean; reason?: string } {
  const meta = ALL_SURAHS.find((s) => s.number === surahNumber);
  if (!meta) {
    return { isValid: false, reason: `سورة رقم ${surahNumber} غير موجودة في الفهرس المعتمد` };
  }

  if (!Array.isArray(ayahs) || ayahs.length !== meta.numberOfAyahs) {
    return {
      isValid: false,
      reason: `عدد آيات سورة ${meta.name} (${ayahs?.length || 0}) لا يطابق العدد المعتمد (${meta.numberOfAyahs})`,
    };
  }

  for (let i = 0; i < ayahs.length; i++) {
    const expectedNumInSurah = i + 1;
    const ayah = ayahs[i];
    if (ayah.numberInSurah !== expectedNumInSurah) {
      return {
        isValid: false,
        reason: `ترتيب الآيات غير مطابق في سورة ${meta.name} عند الآية ${expectedNumInSurah}`,
      };
    }
    if (!ayah.text || typeof ayah.text !== 'string' || ayah.text.trim().length === 0) {
      return {
        isValid: false,
        reason: `نص الآية ${expectedNumInSurah} في سورة ${meta.name} فارغ أو غير صالح`,
      };
    }
    if (ayah.page && (ayah.page < 1 || ayah.page > 604)) {
      return {
        isValid: false,
        reason: `رقم صفحة المصحف (${ayah.page}) خارج النطاق المعتمد (1-604)`,
      };
    }
  }

  return { isValid: true };
}

export async function getCachedSurah(surahNumber: number): Promise<Ayah[] | null> {
  try {
    const db = await openQuranDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.get(surahNumber);
      req.onsuccess = () => {
        if (req.result && Array.isArray(req.result.ayahs)) {
          const check = validateSurahIntegrity(surahNumber, req.result.ayahs);
          if (check.isValid) {
            resolve(req.result.ayahs);
          } else {
            console.warn(`Corrupted cache for surah ${surahNumber}:`, check.reason);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function setCachedSurah(surahNumber: number, ayahs: Ayah[]): Promise<boolean> {
  const check = validateSurahIntegrity(surahNumber, ayahs);
  if (!check.isValid) {
    console.error(`Refusing to cache invalid Surah ${surahNumber}: ${check.reason}`);
    return false;
  }

  try {
    const db = await openQuranDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.put({ number: surahNumber, ayahs, cachedAt: Date.now() });
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn('Failed to cache surah in IndexedDB:', err);
    return false;
  }
}

/**
 * Fetch verified Surah verses from IndexedDB cache, local verified asset,
 * or official Al-Quran Cloud Tanzil Uthmani endpoint.
 * Never hallucinates or generates Quranic text.
 */
export async function getSurahDetail(surahNumber: number): Promise<SurahDetail> {
  const meta = ALL_SURAHS.find((s) => s.number === surahNumber);
  if (!meta) {
    throw new Error(`سورة رقم ${surahNumber} غير موجودة في فهرس القرآن الكريم`);
  }

  // 1. Check IndexedDB verified cache first
  const cached = await getCachedSurah(surahNumber);
  if (cached && cached.length > 0) {
    return {
      ...meta,
      ayahs: cached,
    };
  }

  // 2. Try loading from local bundled asset /data/quran-uthmani.json
  try {
    const localRes = await fetch('/data/quran-uthmani.json');
    if (localRes.ok) {
      const allSurahsData = await localRes.json();
      if (Array.isArray(allSurahsData)) {
        const found = allSurahsData.find((s: any) => s.number === surahNumber);
        if (found && Array.isArray(found.ayahs)) {
          const check = validateSurahIntegrity(surahNumber, found.ayahs);
          if (check.isValid) {
            await setCachedSurah(surahNumber, found.ayahs);
            return {
              ...meta,
              ayahs: found.ayahs,
            };
          }
        }
      }
    }
  } catch {
    // Continue to network fetch
  }

  // 3. Fallback to official verified Tanzil Uthmani API
  try {
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`);
    if (!response.ok) {
      throw new Error(`تعذر جلب السورة من الخادم (${response.status})`);
    }

    const data = await response.json();
    if (data.code === 200 && data.data && Array.isArray(data.data.ayahs)) {
      const parsedAyahs: Ayah[] = data.data.ayahs.map((a: any) => ({
        number: a.number,
        numberInSurah: a.numberInSurah,
        text: a.text,
        juz: a.juz,
        page: a.page,
        hizbQuarter: a.hizbQuarter,
        sajda: a.sajda || false,
      }));

      const check = validateSurahIntegrity(surahNumber, parsedAyahs);
      if (!check.isValid) {
        throw new Error(`بيانات السورة غير مكتملة: ${check.reason}`);
      }

      await setCachedSurah(surahNumber, parsedAyahs);

      return {
        ...meta,
        ayahs: parsedAyahs,
      };
    } else {
      throw new Error('صيغة بيانات المصحف غير متوقعة من المصدر المعتمد');
    }
  } catch (error: any) {
    throw new Error(
      `تعذر تحميل سورة ${meta.name}. يرجى التحقق من الاتصال بالإنترنت لتحميل السورة وحفظها للاستخدام دون إنترنت.`
    );
  }
}

/**
 * Returns accurate offline status by counting verified Surahs and Ayahs in IndexedDB.
 */
export async function getQuranOfflineStatus(): Promise<QuranOfflineStatus> {
  try {
    const db = await openQuranDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const results = req.result || [];
        let validSurahsCount = 0;
        let validAyahsCount = 0;

        for (const item of results) {
          if (item && item.number && Array.isArray(item.ayahs)) {
            const check = validateSurahIntegrity(item.number, item.ayahs);
            if (check.isValid) {
              validSurahsCount += 1;
              validAyahsCount += item.ayahs.length;
            }
          }
        }

        const isFullyDownloaded = validSurahsCount === TOTAL_SURAHS && validAyahsCount === TOTAL_AYAHS;

        resolve({
          isFullyDownloaded,
          downloadedSurahsCount: validSurahsCount,
          totalSurahs: TOTAL_SURAHS,
          downloadedAyahsCount: validAyahsCount,
          totalAyahs: TOTAL_AYAHS,
        });
      };

      req.onerror = () => {
        resolve({
          isFullyDownloaded: false,
          downloadedSurahsCount: 0,
          totalSurahs: TOTAL_SURAHS,
          downloadedAyahsCount: 0,
          totalAyahs: TOTAL_AYAHS,
        });
      };
    });
  } catch {
    return {
      isFullyDownloaded: false,
      downloadedSurahsCount: 0,
      totalSurahs: TOTAL_SURAHS,
      downloadedAyahsCount: 0,
      totalAyahs: TOTAL_AYAHS,
    };
  }
}

/**
 * Download and verify the complete Quran (114 Surahs, 6236 Ayahs) for offline reading.
 * Provides live progress callbacks, error handling, and strict integrity verification.
 */
export async function downloadAllQuranForOffline(
  onProgress?: (percent: number, currentSurah: number) => void
): Promise<boolean> {
  try {
    let allSurahsData: any[] | null = null;

    // 1. Try fetching the full verified dataset asset first
    try {
      const res = await fetch('/data/quran-uthmani.json');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && json.length === TOTAL_SURAHS) {
          allSurahsData = json;
        }
      }
    } catch {
      // fallback
    }

    // 2. If not found locally, fetch from verified Tanzil Uthmani endpoint
    if (!allSurahsData) {
      const res = await fetch('https://api.alquran.cloud/v1/quran/quran-uthmani');
      if (!res.ok) {
        throw new Error('فشل الاتصال بمصدر بيانات القرآن المعتمد');
      }
      const json = await res.json();
      if (json.code === 200 && json.data && Array.isArray(json.data.surahs)) {
        allSurahsData = json.data.surahs;
      } else {
        throw new Error('هيئة استجابة المصحف غير متوافقة');
      }
    }

    if (!allSurahsData || allSurahsData.length !== TOTAL_SURAHS) {
      throw new Error(`البيانات المسترجعة غير مكتملة (تم العثور على ${allSurahsData?.length || 0} سورة فقط)`);
    }

    // 3. Validate and store each surah into IndexedDB with progress reporting
    const db = await openQuranDB();
    for (let i = 0; i < allSurahsData.length; i++) {
      const rawSurah = allSurahsData[i];
      const surahNum = rawSurah.number;
      const ayahs: Ayah[] = rawSurah.ayahs.map((a: any) => ({
        number: a.number,
        numberInSurah: a.numberInSurah,
        text: a.text,
        juz: a.juz,
        page: a.page,
        hizbQuarter: a.hizbQuarter,
        sajda: a.sajda || false,
      }));

      const check = validateSurahIntegrity(surahNum, ayahs);
      if (!check.isValid) {
        throw new Error(`فشل التحقق من السورة رقم ${surahNum}: ${check.reason}`);
      }

      await setCachedSurah(surahNum, ayahs);

      if (onProgress) {
        const percent = Math.round(((i + 1) / TOTAL_SURAHS) * 100);
        onProgress(percent, surahNum);
      }
    }

    return true;
  } catch (error: any) {
    console.error('Download Quran offline failed:', error);
    throw error;
  }
}

export async function preCacheSurah(surahNumber: number): Promise<boolean> {
  try {
    await getSurahDetail(surahNumber);
    return true;
  } catch {
    return false;
  }
}

export async function isSurahOfflineAvailable(surahNumber: number): Promise<boolean> {
  const cached = await getCachedSurah(surahNumber);
  return Boolean(cached && cached.length > 0);
}
