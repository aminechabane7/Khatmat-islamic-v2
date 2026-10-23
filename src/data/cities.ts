export interface CityInfo {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
  defaultMethod: 'MWL' | 'UmmAlQura' | 'Egyptian' | 'ISNA' | 'Dubai' | 'Qatar' | 'Kuwait';
}

export const POPULAR_CITIES: CityInfo[] = [
  { id: 'makkah', name: 'مكة المكرمة', country: 'السعودية', lat: 21.4225, lng: 39.8262, timezone: 'Asia/Riyadh', defaultMethod: 'UmmAlQura' },
  { id: 'madinah', name: 'المدينة المنورة', country: 'السعودية', lat: 24.4672, lng: 39.6111, timezone: 'Asia/Riyadh', defaultMethod: 'UmmAlQura' },
  { id: 'riyadh', name: 'الرياض', country: 'السعودية', lat: 24.7136, lng: 46.6753, timezone: 'Asia/Riyadh', defaultMethod: 'UmmAlQura' },
  { id: 'cairo', name: 'القاهرة', country: 'مصر', lat: 30.0444, lng: 31.2357, timezone: 'Africa/Cairo', defaultMethod: 'Egyptian' },
  { id: 'jerusalem', name: 'القدس الشريف', country: 'فلسطين', lat: 31.7683, lng: 35.2137, timezone: 'Asia/Jerusalem', defaultMethod: 'MWL' },
  { id: 'dubai', name: 'دبي', country: 'الإمارات', lat: 25.2048, lng: 55.2708, timezone: 'Asia/Dubai', defaultMethod: 'Dubai' },
  { id: 'doha', name: 'الدوحة', country: 'قطر', lat: 25.2854, lng: 51.5310, timezone: 'Asia/Qatar', defaultMethod: 'Qatar' },
  { id: 'kuwait', name: 'مدينة الكويت', country: 'الكويت', lat: 29.3759, lng: 47.9774, timezone: 'Asia/Kuwait', defaultMethod: 'Kuwait' },
  { id: 'amman', name: 'عمّان', country: 'الأردن', lat: 31.9454, lng: 35.9284, timezone: 'Asia/Amman', defaultMethod: 'MWL' },
  { id: 'beirut', name: 'بيروت', country: 'لبنان', lat: 33.8938, lng: 35.5018, timezone: 'Asia/Beirut', defaultMethod: 'MWL' },
  { id: 'baghdad', name: 'بغداد', country: 'العراق', lat: 33.3152, lng: 44.3661, timezone: 'Asia/Baghdad', defaultMethod: 'MWL' },
  { id: 'damascus', name: 'دمشق', country: 'سوريا', lat: 33.5138, lng: 36.2765, timezone: 'Asia/Damascus', defaultMethod: 'MWL' },
  { id: 'algiers', name: 'الجزائر العاصمة', country: 'الجزائر', lat: 36.7538, lng: 3.0588, timezone: 'Africa/Algiers', defaultMethod: 'MWL' },
  { id: 'rabat', name: 'الرباط', country: 'المغرب', lat: 34.0209, lng: -6.8416, timezone: 'Africa/Casablanca', defaultMethod: 'MWL' },
  { id: 'tunis', name: 'تونس', country: 'تونس', lat: 36.8065, lng: 10.1815, timezone: 'Africa/Tunis', defaultMethod: 'MWL' },
  { id: 'tripoli', name: 'طرابلس', country: 'ليبيا', lat: 32.8872, lng: 13.1913, timezone: 'Africa/Tripoli', defaultMethod: 'MWL' },
  { id: 'istanbul', name: 'إسطنبول', country: 'تركيا', lat: 41.0082, lng: 28.9784, timezone: 'Europe/Istanbul', defaultMethod: 'MWL' },
  { id: 'jakarta', name: 'جاكرتا', country: 'إندونيسيا', lat: -6.2088, lng: 106.8456, timezone: 'Asia/Jakarta', defaultMethod: 'MWL' },
  { id: 'kuala_lumpur', name: 'كوالالمبور', country: 'ماليزيا', lat: 3.1390, lng: 101.6869, timezone: 'Asia/Kuala_Lumpur', defaultMethod: 'MWL' },
  { id: 'london', name: 'لندن', country: 'المملكة المتحدة', lat: 51.5074, lng: -0.1278, timezone: 'Europe/London', defaultMethod: 'MWL' },
  { id: 'paris', name: 'باريس', country: 'فرنسا', lat: 48.8566, lng: 2.3522, timezone: 'Europe/Paris', defaultMethod: 'MWL' },
  { id: 'new_york', name: 'نيويورك', country: 'الولايات المتحدة', lat: 40.7128, lng: -74.0060, timezone: 'America/New_York', defaultMethod: 'ISNA' }
];
