import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan';
import { POPULAR_CITIES } from '../data/cities';
import { AppSettings, PrayerTimeItem } from '../types';

export interface PrayerTimesResult {
  cityName: string;
  items: PrayerTimeItem[];
  nextPrayer: PrayerTimeItem | null;
  currentPrayer: PrayerTimeItem | null;
  timeUntilNext: { hours: number; minutes: number; seconds: number; totalSeconds: number };
  hijriDate: string;
  gregorianDate: string;
}

export function getCalculationParameters(method: AppSettings['calculationMethod'], madhab: AppSettings['madhab']) {
  let params;
  switch (method) {
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

export function formatTime24(date: Date): string {
  return date.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatTime12(date: Date): string {
  return date.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function getHijriDate(date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return formatter.format(date);
  } catch {
    // Fallback if islamic-umalqura is not supported in environment
    return new Intl.DateTimeFormat('ar-SA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }
}

export function getGregorianDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('ar-SA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function calculatePrayerTimes(settings: AppSettings, currentDate: Date = new Date()): PrayerTimesResult {
  let lat = 21.4225;
  let lng = 39.8262;
  let cityName = 'مكة المكرمة';

  if (settings.customCoordinates) {
    lat = settings.customCoordinates.lat;
    lng = settings.customCoordinates.lng;
    cityName = settings.customCoordinates.name || 'موقعي الحالي';
  } else {
    const city = POPULAR_CITIES.find((c) => c.id === settings.selectedCityId) || POPULAR_CITIES[0];
    lat = city.lat;
    lng = city.lng;
    cityName = `${city.name} (${city.country})`;
  }

  const coordinates = new Coordinates(lat, lng);
  const params = getCalculationParameters(settings.calculationMethod, settings.madhab);
  const prayerTimesToday = new PrayerTimes(coordinates, currentDate, params);

  // Tomorrow times for calculation when current time is after Isha
  const tomorrow = new Date(currentDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const prayerTimesTomorrow = new PrayerTimes(coordinates, tomorrow, params);

  const rawPrayers = [
    { key: 'fajr', name: 'Fajr', arabicName: 'الفجر', dateObj: prayerTimesToday.fajr, iconName: 'Sunrise' },
    { key: 'sunrise', name: 'Sunrise', arabicName: 'الشروق', dateObj: prayerTimesToday.sunrise, iconName: 'Sun' },
    { key: 'dhuhr', name: 'Dhuhr', arabicName: 'الظهر', dateObj: prayerTimesToday.dhuhr, iconName: 'SunMedium' },
    { key: 'asr', name: 'Asr', arabicName: 'العصر', dateObj: prayerTimesToday.asr, iconName: 'CloudSun' },
    { key: 'maghrib', name: 'Maghrib', arabicName: 'المغرب', dateObj: prayerTimesToday.maghrib, iconName: 'Sunset' },
    { key: 'isha', name: 'Isha', arabicName: 'العشاء', dateObj: prayerTimesToday.isha, iconName: 'Moon' },
  ];

  const nowMs = currentDate.getTime();
  let nextPrayerItem: PrayerTimeItem | null = null;
  let currentPrayerItem: PrayerTimeItem | null = null;
  let nextDateObj: Date = prayerTimesTomorrow.fajr;

  // Determine current & next prayer
  for (let i = 0; i < rawPrayers.length; i++) {
    const p = rawPrayers[i];
    if (nowMs >= p.dateObj.getTime()) {
      currentPrayerItem = {
        name: p.name,
        arabicName: p.arabicName,
        time: formatTime12(p.dateObj),
        dateObj: p.dateObj,
        isNext: false,
        isCurrent: true,
        iconName: p.iconName,
      };
    } else if (!nextPrayerItem) {
      nextPrayerItem = {
        name: p.name,
        arabicName: p.arabicName,
        time: formatTime12(p.dateObj),
        dateObj: p.dateObj,
        isNext: true,
        isCurrent: false,
        iconName: p.iconName,
      };
      nextDateObj = p.dateObj;
    }
  }

  // If passed Isha, next prayer is Tomorrow Fajr
  if (!nextPrayerItem) {
    nextDateObj = prayerTimesTomorrow.fajr;
    nextPrayerItem = {
      name: 'Fajr',
      arabicName: 'الفجر (غداً)',
      time: formatTime12(prayerTimesTomorrow.fajr),
      dateObj: prayerTimesTomorrow.fajr,
      isNext: true,
      isCurrent: false,
      iconName: 'Sunrise',
    };
  }

  const diffMs = Math.max(0, nextDateObj.getTime() - nowMs);
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const items: PrayerTimeItem[] = rawPrayers.map((p) => {
    const isNext = nextPrayerItem?.name === p.name && nextPrayerItem.arabicName.startsWith(p.arabicName);
    const isCurrent = currentPrayerItem?.name === p.name;
    return {
      name: p.name,
      arabicName: p.arabicName,
      time: formatTime12(p.dateObj),
      dateObj: p.dateObj,
      isNext,
      isCurrent,
      iconName: p.iconName,
    };
  });

  return {
    cityName,
    items,
    nextPrayer: nextPrayerItem,
    currentPrayer: currentPrayerItem,
    timeUntilNext: { hours, minutes, seconds, totalSeconds },
    hijriDate: getHijriDate(currentDate),
    gregorianDate: getGregorianDate(currentDate),
  };
}
