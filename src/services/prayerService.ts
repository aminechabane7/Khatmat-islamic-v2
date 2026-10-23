import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan';
import { POPULAR_CITIES, CityInfo } from '../data/cities';
import { AppSettings, CalculationMethodType, PrayerTimeItem } from '../types';

export interface PrayerTimesResult {
  cityId: string;
  cityName: string;
  timezone: string;
  officialSourceNote?: string;
  items: PrayerTimeItem[]; // Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha
  nextPrayer: PrayerTimeItem | null;
  currentPrayer: PrayerTimeItem | null;
  timeUntilNext: { hours: number; minutes: number; seconds: number; totalSeconds: number };
  hijriDate: string;
  gregorianDate: string;
}

export function getCalculationParameters(method: CalculationMethodType, madhab: AppSettings['madhab']) {
  let params;
  switch (method) {
    case 'Morocco': {
      // Moroccan Ministry of Habous standard solar angles: Fajr 19°, Isha 17°
      params = CalculationMethod.MuslimWorldLeague();
      params.fajrAngle = 19;
      params.ishaAngle = 17;
      break;
    }
    case 'UmmAlQura':
      params = CalculationMethod.UmmAlQura();
      break;
    case 'Egyptian':
      params = CalculationMethod.Egyptian();
      break;
    case 'ISNA':
      params = CalculationMethod.NorthAmerica();
      break;
    case 'Dubai':
      params = CalculationMethod.Dubai();
      break;
    case 'Qatar':
      params = CalculationMethod.Qatar();
      break;
    case 'Kuwait':
      params = CalculationMethod.Kuwait();
      break;
    case 'MWL':
    default:
      params = CalculationMethod.MuslimWorldLeague();
      break;
  }

  if (madhab === 'hanafi') {
    params.madhab = Madhab.Hanafi;
  } else {
    params.madhab = Madhab.Shafi;
  }

  return params;
}

/**
 * Format a Date object in the specified timezone in 12-hour Arabic format.
 */
export function formatTime12(date: Date, timezone: string = 'Asia/Riyadh'): string {
  try {
    return new Intl.DateTimeFormat('ar-SA-u-nu-latn', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
}

/**
 * Format a Date object in the specified timezone in 24-hour format.
 */
export function formatTime24(date: Date, timezone: string = 'Asia/Riyadh'): string {
  try {
    return new Intl.DateTimeFormat('ar-SA-u-nu-latn', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
}

/**
 * Formats Hijri date according to the Umm Al-Qura calendar in the target city timezone.
 */
export function getHijriDate(date: Date = new Date(), timezone: string = 'Asia/Riyadh'): string {
  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      timeZone: timezone,
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return formatter.format(date);
  } catch {
    try {
      return new Intl.DateTimeFormat('ar-SA', {
        timeZone: timezone,
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
    } catch {
      return date.toLocaleDateString('ar-SA');
    }
  }
}

/**
 * Formats Gregorian date in the target city timezone.
 */
export function getGregorianDate(date: Date = new Date(), timezone: string = 'Asia/Riyadh'): string {
  try {
    return new Intl.DateTimeFormat('ar-SA', {
      timeZone: timezone,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return date.toLocaleDateString('ar-SA');
  }
}

/**
 * Resolves active city information from settings or coordinates.
 */
export function resolveCityInfo(settings: AppSettings): {
  cityId: string;
  cityName: string;
  lat: number;
  lng: number;
  timezone: string;
  officialSourceNote?: string;
} {
  if (settings.customCoordinates) {
    return {
      cityId: 'custom',
      cityName: settings.customCoordinates.name || 'موقعي الحالي (GPS)',
      lat: settings.customCoordinates.lat,
      lng: settings.customCoordinates.lng,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Riyadh',
      officialSourceNote: 'مواقيت محسوبة فلكياً وفق إحداثيات الـ GPS المحددة',
    };
  }

  const city = POPULAR_CITIES.find((c) => c.id === settings.selectedCityId) || POPULAR_CITIES[0];
  return {
    cityId: city.id,
    cityName: `${city.name} - ${city.country}`,
    lat: city.lat,
    lng: city.lng,
    timezone: city.timezone,
    officialSourceNote: city.officialSourceNote,
  };
}

/**
 * Calculate accurate prayer times using adhan.js.
 * Handles the 5 obligatory prayers without treating sunrise as obligatory.
 * Handles midnight and post-Isha transitions correctly.
 * Formats all outputs using the target city's timezone.
 */
export function calculatePrayerTimes(settings: AppSettings, currentDate: Date = new Date()): PrayerTimesResult {
  const cityInfo = resolveCityInfo(settings);
  const coordinates = new Coordinates(cityInfo.lat, cityInfo.lng);
  const params = getCalculationParameters(settings.calculationMethod, settings.madhab);

  // Compute today's prayer times
  const prayerTimesToday = new PrayerTimes(coordinates, currentDate, params);

  // Compute tomorrow's prayer times (for after Isha)
  const tomorrow = new Date(currentDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const prayerTimesTomorrow = new PrayerTimes(coordinates, tomorrow, params);

  // Compute yesterday's prayer times (for between midnight and today's Fajr)
  const yesterday = new Date(currentDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const prayerTimesYesterday = new PrayerTimes(coordinates, yesterday, params);

  const rawPrayers = [
    {
      key: 'fajr',
      name: 'Fajr',
      arabicName: 'الفجر',
      dateObj: prayerTimesToday.fajr,
      iconName: 'Sunrise',
      isObligatory: true,
    },
    {
      key: 'sunrise',
      name: 'Sunrise',
      arabicName: 'الشروق',
      dateObj: prayerTimesToday.sunrise,
      iconName: 'Sun',
      isObligatory: false, // Sunrise is an astronomical transition, NOT an obligatory prayer
    },
    {
      key: 'dhuhr',
      name: 'Dhuhr',
      arabicName: 'الظهر',
      dateObj: prayerTimesToday.dhuhr,
      iconName: 'SunMedium',
      isObligatory: true,
    },
    {
      key: 'asr',
      name: 'Asr',
      arabicName: 'العصر',
      dateObj: prayerTimesToday.asr,
      iconName: 'CloudSun',
      isObligatory: true,
    },
    {
      key: 'maghrib',
      name: 'Maghrib',
      arabicName: 'المغرب',
      dateObj: prayerTimesToday.maghrib,
      iconName: 'Sunset',
      isObligatory: true,
    },
    {
      key: 'isha',
      name: 'Isha',
      arabicName: 'العشاء',
      dateObj: prayerTimesToday.isha,
      iconName: 'Moon',
      isObligatory: true,
    },
  ];

  const nowMs = currentDate.getTime();

  // Find the next obligatory prayer
  // Obligatory prayers in order today: Fajr, Dhuhr, Asr, Maghrib, Isha
  const obligatoryToday = rawPrayers.filter((p) => p.isObligatory);

  let nextObligatoryItem: typeof rawPrayers[0] | null = null;
  let targetDateObj: Date = prayerTimesTomorrow.fajr;
  let currentObligatoryItem: typeof rawPrayers[0] | null = null;

  if (nowMs < prayerTimesToday.fajr.getTime()) {
    // Before today's Fajr (midnight to Fajr):
    // Next prayer is today's Fajr!
    nextObligatoryItem = obligatoryToday[0]; // Fajr
    targetDateObj = prayerTimesToday.fajr;
    currentObligatoryItem = {
      key: 'isha_yesterday',
      name: 'Isha',
      arabicName: 'العشاء (أمس)',
      dateObj: prayerTimesYesterday.isha,
      iconName: 'Moon',
      isObligatory: true,
    };
  } else if (nowMs >= prayerTimesToday.isha.getTime()) {
    // After today's Isha:
    // Next prayer is tomorrow's Fajr!
    targetDateObj = prayerTimesTomorrow.fajr;
    nextObligatoryItem = {
      key: 'fajr_tomorrow',
      name: 'Fajr',
      arabicName: 'الفجر (غداً)',
      dateObj: prayerTimesTomorrow.fajr,
      iconName: 'Sunrise',
      isObligatory: true,
    };
    currentObligatoryItem = obligatoryToday[obligatoryToday.length - 1]; // Isha
  } else {
    // Daytime between Fajr and Isha:
    for (let i = 0; i < obligatoryToday.length; i++) {
      const p = obligatoryToday[i];
      if (nowMs >= p.dateObj.getTime()) {
        currentObligatoryItem = p;
      } else if (!nextObligatoryItem) {
        nextObligatoryItem = p;
        targetDateObj = p.dateObj;
      }
    }
  }

  // Calculate precise countdown
  const diffMs = Math.max(0, targetDateObj.getTime() - nowMs);
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Build items formatted in the target city's timezone
  const items: PrayerTimeItem[] = rawPrayers.map((p) => {
    const isNext = nextObligatoryItem?.name === p.name && (p.isObligatory || nextObligatoryItem.name === 'Sunrise');
    const isCurrent = currentObligatoryItem?.name === p.name;
    return {
      name: p.name,
      arabicName: p.arabicName,
      time: formatTime12(p.dateObj, cityInfo.timezone),
      dateObj: p.dateObj,
      isNext,
      isCurrent,
      iconName: p.iconName,
      isObligatory: p.isObligatory,
    };
  });

  const nextPrayerResult: PrayerTimeItem = {
    name: nextObligatoryItem ? nextObligatoryItem.name : 'Fajr',
    arabicName: nextObligatoryItem ? nextObligatoryItem.arabicName : 'الفجر',
    time: formatTime12(targetDateObj, cityInfo.timezone),
    dateObj: targetDateObj,
    isNext: true,
    isCurrent: false,
    iconName: nextObligatoryItem ? nextObligatoryItem.iconName : 'Sunrise',
    isObligatory: true,
  };

  const currentPrayerResult: PrayerTimeItem | null = currentObligatoryItem
    ? {
        name: currentObligatoryItem.name,
        arabicName: currentObligatoryItem.arabicName,
        time: formatTime12(currentObligatoryItem.dateObj, cityInfo.timezone),
        dateObj: currentObligatoryItem.dateObj,
        isNext: false,
        isCurrent: true,
        iconName: currentObligatoryItem.iconName,
        isObligatory: currentObligatoryItem.isObligatory,
      }
    : null;

  return {
    cityId: cityInfo.cityId,
    cityName: cityInfo.cityName,
    timezone: cityInfo.timezone,
    officialSourceNote: cityInfo.officialSourceNote,
    items,
    nextPrayer: nextPrayerResult,
    currentPrayer: currentPrayerResult,
    timeUntilNext: { hours, minutes, seconds, totalSeconds },
    hijriDate: getHijriDate(currentDate, cityInfo.timezone),
    gregorianDate: getGregorianDate(currentDate, cityInfo.timezone),
  };
}
