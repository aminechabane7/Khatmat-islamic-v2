import { Ayah, SurahDetail } from '../types';
import { ALL_SURAHS } from '../data/surahs';

// Verified pre-bundled authentic Quranic text in Uthmani script for immediate offline availability
const BUNDLED_SURAHS: Record<number, Ayah[]> = {
  // Surah Al-Fatiha (1)
  1: [
    { number: 1, numberInSurah: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", juz: 1, page: 1 },
    { number: 2, numberInSurah: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", juz: 1, page: 1 },
    { number: 3, numberInSurah: 3, text: "الرَّحْمَٰنِ الرَّحِيمِ", juz: 1, page: 1 },
    { number: 4, numberInSurah: 4, text: "مَالِكِ يَوْمِ الدِّينِ", juz: 1, page: 1 },
    { number: 5, numberInSurah: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", juz: 1, page: 1 },
    { number: 6, numberInSurah: 6, text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", juz: 1, page: 1 },
    { number: 7, numberInSurah: 7, text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", juz: 1, page: 1 }
  ],
  // Surah Al-Mulk (67)
  67: [
    { number: 5242, numberInSurah: 1, text: "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ", juz: 29, page: 562 },
    { number: 5243, numberInSurah: 2, text: "الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ", juz: 29, page: 562 },
    { number: 5244, numberInSurah: 3, text: "الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ ۖ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ", juz: 29, page: 562 },
    { number: 5245, numberInSurah: 4, text: "ثُمَّ ارْجِعِ الْبَصَرَ كَرَّتَيْنِ يَنقَلِبْ إِلَيْكَ الْبَصَرُ خَاسِئًا وَهُوَ حَسِيرٌ", juz: 29, page: 562 },
    { number: 5246, numberInSurah: 5, text: "وَلَقَدْ زَيَّنَّا السَّمَاءَ الدُّنْيَا بِمَصَابِيحَ وَجَعَلْنَاهَا رُجُومًا لِّلشَّيَاطِينِ ۖ وَأَعْتَدْنَا لَهُمْ عَذَابَ السَّعِيرِ", juz: 29, page: 562 },
    { number: 5247, numberInSurah: 6, text: "وَلِلَّذِينَ كَفَرُوا بِرَبِّهِمْ عَذَابُ جَهَنَّمَ ۖ وَبِئْسَ الْمَصِيرُ", juz: 29, page: 562 },
    { number: 5248, numberInSurah: 7, text: "إِذَا أُلْقُوا فِيهَا سَمِعُوا لَهَا شَهِيقًا وَهِيَ تَفُورُ", juz: 29, page: 562 },
    { number: 5249, numberInSurah: 8, text: "تَكَادُ تَمَيَّزُ مِنَ الْغَيْظِ ۖ كُلَّمَا أُلْقِيَ فِيهَا فَوْجٌ سَأَلَهُمْ خَزَنَتُهَا أَلَمْ يَأْتِكُمْ نَذِيرٌ", juz: 29, page: 562 },
    { number: 5250, numberInSurah: 9, text: "قَالُوا بَلَىٰ قَدْ جَاءَنَا نَذِيرٌ فَكَذَّبْنَا وَقُلْنَا مَا نَزَّلَ اللَّهُ مِن شَيْءٍ إِنْ أَنتُمْ إِلَّا فِي ضَلَالٍ كَبِيرٍ", juz: 29, page: 562 },
    { number: 5251, numberInSurah: 10, text: "وَقَالُوا لَوْ كُنَّا نَسْمَعُ أَوْ نَعْقِلُ مَا كُنَّا فِي أَصْحَابِ السَّعِيرِ", juz: 29, page: 562 },
    { number: 5252, numberInSurah: 11, text: "فَاعْتَرَفُوا بِذَنبِهِمْ فَسُحْقًا لِّأَصْحَابِ السَّعِيرِ", juz: 29, page: 563 },
    { number: 5253, numberInSurah: 12, text: "إِنَّ الَّذِينَ يَخْشَوْنَ رَبَّهُم بِالْغَيْبِ لَهُم مَّغْفِرَةٌ وَأَجْرٌ كَبِيرٌ", juz: 29, page: 563 },
    { number: 5254, numberInSurah: 13, text: "وَأَسِرُّوا قَوْلَكُمْ أَوِ اجْهَرُوا بِهِ ۖ إِنَّهُ عَلِيمٌ بِذَاتِ الصُّدُورِ", juz: 29, page: 563 },
    { number: 5255, numberInSurah: 14, text: "أَلَا يَعْلَمُ مَنْ خَلَقَ وَهُوَ اللَّطِيفُ الْخَبِيرُ", juz: 29, page: 563 },
    { number: 5256, numberInSurah: 15, text: "هُوَ الَّذِي جَعَلَ لَكُمُ الْأَرْضَ ذَلُولًا فَامْشُوا فِي مَنَاكِبِهَا وَكُلُوا مِن رِّزْقِهِ ۖ وَإِلَيْهِ النُّشُورُ", juz: 29, page: 563 },
    { number: 5257, numberInSurah: 16, text: "أَأَمِنتُم مَّن فِي السَّمَاءِ أَن يَخْسِفَ بِكُمُ الْأَرْضَ فَإِذَا هِيَ تَمُورُ", juz: 29, page: 563 },
    { number: 5258, numberInSurah: 17, text: "أَمْ أَمِنتُم مَّن فِي السَّمَاءِ أَن يُرْسِلَ عَلَيْكُمْ حَاصِبًا ۖ فَسَتَعْلَمُونَ كَيْفَ نَذِيرِ", juz: 29, page: 563 },
    { number: 5259, numberInSurah: 18, text: "وَلَقَدْ كَذَّبَ الَّذِينَ مِن قَبْلِهِمْ فَكَيْفَ كَانَ نَكِيرِ", juz: 29, page: 563 },
    { number: 5260, numberInSurah: 19, text: "أَوَلَمْ يَرَوْا إِلَى الطَّيْرِ فَوْقَهُمْ صَافَّاتٍ وَيَقْبِضْنَ ۚ مَا يُمْسِكُهُنَّ إِلَّا الرَّحْمَٰنُ ۚ إِنَّهُ بِكُلِّ شَيْءٍ بَصِيرٌ", juz: 29, page: 563 },
    { number: 5261, numberInSurah: 20, text: "أَمَّنْ هَٰذَا الَّذِي هُوَ جُندٌ لَّكُمْ يَنصُرُكُم مِّن دُونِ الرَّحْمَٰنِ ۚ إِنِ الْكَافِرُونَ إِلَّا فِي غُرُورٍ", juz: 29, page: 563 },
    { number: 5262, numberInSurah: 21, text: "أَمَّنْ هَٰذَا الَّذِي يَرْزُقُكُمْ إِنْ أَمْسَكَ رِزْقَهُ ۚ بَل لَّجُّوا فِي عُتُوٍّ وَنُفُورٍ", juz: 29, page: 563 },
    { number: 5263, numberInSurah: 22, text: "أَفَمَن يَمْشِي مُكِبًّا عَلَىٰ وَجْهِهِ أَهْدَىٰ أَمَّن يَمْشِي سَوِيًّا عَلَىٰ صِرَاطٍ مُّسْتَقِيمٍ", juz: 29, page: 563 },
    { number: 5264, numberInSurah: 23, text: "قُلْ هُوَ الَّذِي أَنشَأَكُمْ وَجَعَلَ لَكُمُ السَّمْعَ وَالْأَبْصَارَ وَالْأَفْئِدَةَ ۖ قَلِيلًا مَّا تَشْكُرُونَ", juz: 29, page: 563 },
    { number: 5265, numberInSurah: 24, text: "قُلْ هُوَ الَّذِي ذَرَأَكُمْ فِي الْأَرْضِ وَإِلَيْهِ تُحْشَرُونَ", juz: 29, page: 563 },
    { number: 5266, numberInSurah: 25, text: "وَيَقُولُونَ مَتَىٰ هَٰذَا الْوَعْدُ إِن كُنتُمْ صَادِقِينَ", juz: 29, page: 563 },
    { number: 5267, numberInSurah: 26, text: "قُلْ إِنَّمَا الْعِلْمُ عِندَ اللَّهِ وَإِنَّمَا أَنَا نَذِيرٌ مُّبِينٌ", juz: 29, page: 563 },
    { number: 5268, numberInSurah: 27, text: "فَلَمَّا رَأَوْهُ زُلْفَةً سِيئَتْ وُجُوهُ الَّذِينَ كَفَرُوا وَقِيلَ هَٰذَا الَّذِي كُنتُم بِهِ تَدَّعُونَ", juz: 29, page: 564 },
    { number: 5269, numberInSurah: 28, text: "قُلْ أَرَأَيْتُمْ إِنْ أَهْلَكَنِيَ اللَّهُ وَمَن مَّعِيَ أَوْ رَحِمَنَا فَمَن يُجِيرُ الْكَافِرِينَ مِنْ عَذَابٍ أَلِيمٍ", juz: 29, page: 564 },
    { number: 5270, numberInSurah: 29, text: "قُلْ هُوَ الرَّحْمَٰنُ آمَنَّا بِهِ وَعَلَيْهِ تَوَكَّلْنَا ۖ فَسَتَعْلَمُونَ مَنْ هُوَ فِي ضَلَالٍ مُّبِينٍ", juz: 29, page: 564 },
    { number: 5271, numberInSurah: 30, text: "قُلْ أَرَأَيْتُمْ إِنْ أَصْبَحَ مَاؤُكُمْ غَوْرًا فَمَن يَأْتِيكُم بِمَاءٍ مَّعِينٍ", juz: 29, page: 564 }
  ],
  // Surah Al-Kawthar (108)
  108: [
    { number: 6205, numberInSurah: 1, text: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", juz: 30, page: 602 },
    { number: 6206, numberInSurah: 2, text: "فَصَلِّ لِرَبِّكَ وَانْحَرْ", juz: 30, page: 602 },
    { number: 6207, numberInSurah: 3, text: "إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ", juz: 30, page: 602 }
  ],
  // Surah Al-Ikhlas (112)
  112: [
    { number: 6222, numberInSurah: 1, text: "قُلْ هُوَ اللَّهُ أَحَدٌ", juz: 30, page: 604 },
    { number: 6223, numberInSurah: 2, text: "اللَّهُ الصَّمَدُ", juz: 30, page: 604 },
    { number: 6224, numberInSurah: 3, text: "لَمْ يَلِدْ وَلَمْ يُولَدْ", juz: 30, page: 604 },
    { number: 6225, numberInSurah: 4, text: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", juz: 30, page: 604 }
  ],
  // Surah Al-Falaq (113)
  113: [
    { number: 6226, numberInSurah: 1, text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", juz: 30, page: 604 },
    { number: 6227, numberInSurah: 2, text: "مِن شَرِّ مَا خَلَقَ", juz: 30, page: 604 },
    { number: 6228, numberInSurah: 3, text: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", juz: 30, page: 604 },
    { number: 6229, numberInSurah: 4, text: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ", juz: 30, page: 604 },
    { number: 6230, numberInSurah: 5, text: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", juz: 30, page: 604 }
  ],
  // Surah An-Nas (114)
  114: [
    { number: 6231, numberInSurah: 1, text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", juz: 30, page: 604 },
    { number: 6232, numberInSurah: 2, text: "مَلِكِ النَّاسِ", juz: 30, page: 604 },
    { number: 6233, numberInSurah: 3, text: "إِلَٰهِ النَّاسِ", juz: 30, page: 604 },
    { number: 6234, numberInSurah: 4, text: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ", juz: 30, page: 604 },
    { number: 6235, numberInSurah: 5, text: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", juz: 30, page: 604 },
    { number: 6236, numberInSurah: 6, text: "مِنَ الْجِنَّةِ وَالنَّاسِ", juz: 30, page: 604 }
  ]
};

// IndexedDB database name and store for caching verified Quran text locally
const DB_NAME = 'khatmati_quran_cache_db';
const STORE_NAME = 'surahs_store';

function openQuranDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'number' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getCachedSurah(surahNumber: number): Promise<Ayah[] | null> {
  try {
    const db = await openQuranDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.get(surahNumber);
      req.onsuccess = () => {
        if (req.result && Array.isArray(req.result.ayahs)) {
          resolve(req.result.ayahs);
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

async function setCachedSurah(surahNumber: number, ayahs: Ayah[]): Promise<void> {
  try {
    const db = await openQuranDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put({ number: surahNumber, ayahs, cachedAt: Date.now() });
  } catch (err) {
    console.warn('Failed to cache surah in IndexedDB:', err);
  }
}

/**
 * Fetch verified Surah verses from pre-bundled data, IndexedDB cache,
 * or the official Al-Quran Cloud API (Uthmani edition).
 */
export async function getSurahDetail(surahNumber: number): Promise<SurahDetail> {
  const meta = ALL_SURAHS.find((s) => s.number === surahNumber);
  if (!meta) {
    throw new Error(`سورة رقم ${surahNumber} غير موجودة`);
  }

  // 1. Check local pre-bundled verified text first
  if (BUNDLED_SURAHS[surahNumber]) {
    return {
      ...meta,
      ayahs: BUNDLED_SURAHS[surahNumber],
    };
  }

  // 2. Check IndexedDB offline cache
  const cached = await getCachedSurah(surahNumber);
  if (cached && cached.length > 0) {
    return {
      ...meta,
      ayahs: cached,
    };
  }

  // 3. Fetch from official verified Al-Quran Cloud API
  try {
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`);
    if (!response.ok) {
      throw new Error(`خطأ في استرجاع السورة من الخادم (${response.status})`);
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

      // Cache into IndexedDB for full offline usage
      await setCachedSurah(surahNumber, parsedAyahs);

      return {
        ...meta,
        ayahs: parsedAyahs,
      };
    } else {
      throw new Error('صيغة بيانات المصحف غير متوقعة');
    }
  } catch (error: any) {
    // If user is offline and no cache exists:
    throw new Error(
      `تعذر تحميل سورة ${meta.name}. يرجى التحقق من الاتصال بالإنترنت لتحميل السورة وحفظها للاستخدام دون إنترنت.`
    );
  }
}

/**
 * Pre-cache a Surah for offline reading
 */
export async function preCacheSurah(surahNumber: number): Promise<boolean> {
  try {
    await getSurahDetail(surahNumber);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a Surah is available offline
 */
export async function isSurahOfflineAvailable(surahNumber: number): Promise<boolean> {
  if (BUNDLED_SURAHS[surahNumber]) return true;
  const cached = await getCachedSurah(surahNumber);
  return !!(cached && cached.length > 0);
}
