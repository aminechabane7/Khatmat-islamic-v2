import React, { useEffect, useState } from 'react';
import {
  Clock,
  MapPin,
  Compass,
  Sunrise,
  Sun,
  SunMedium,
  CloudSun,
  Sunset,
  Moon,
  ChevronLeft,
  Settings2,
  Navigation,
  Check,
  AlertCircle,
} from 'lucide-react';
import { POPULAR_CITIES } from '../data/cities';
import { useAppStore } from '../context/AppContext';
import { calculatePrayerTimes, PrayerTimesResult } from '../services/prayerService';

export const PrayersPage: React.FC = () => {
  const { settings, updateSettings, triggerHaptic } = useAppStore();

  const [prayerData, setPrayerData] = useState<PrayerTimesResult>(() =>
    calculatePrayerTimes(settings, new Date())
  );
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Live timer for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setPrayerData(calculatePrayerTimes(settings, new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, [settings]);

  // Request browser geolocation
  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoError('المتصفح لا يدعم تحديد الموقع الجغرافي');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);
    triggerHaptic(20);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        updateSettings({
          customCoordinates: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            name: 'موقعي الحالي (GPS)',
          },
        });
        triggerHaptic([30, 40]);
      },
      (err) => {
        setGeoLoading(false);
        setGeoError('تعذر تحديد موقعك. يرجى السماح بصلاحية الموقع أو اختيار مدينتك من القائمة.');
      },
      { timeout: 10000 }
    );
  };

  const getPrayerIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sunrise':
        return <Sunrise className="w-5 h-5 text-amber-500" />;
      case 'Sun':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'SunMedium':
        return <SunMedium className="w-5 h-5 text-amber-600" />;
      case 'CloudSun':
        return <CloudSun className="w-5 h-5 text-orange-500" />;
      case 'Sunset':
        return <Sunset className="w-5 h-5 text-rose-500" />;
      case 'Moon':
      default:
        return <Moon className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Hero Next Prayer Countdown Card */}
      <div className="bg-gradient-to-br from-[#123D32] via-[#16483c] to-[#0a251e] text-[#F7F4EB] rounded-3xl p-6 shadow-xl border border-[#D5B779]/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#D5B779]/20 text-[#D5B779]">
              مواقيت الصلاة الدقيقة
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-sans text-white">
              الصلاة القادمة: {prayerData.nextPrayer?.arabicName}
            </h1>
            <p className="text-xs text-[#EDE6D4]/80 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#D5B779]" />
              <span>{prayerData.cityName}</span>
            </p>
          </div>

          {/* Countdown Clock Display */}
          <div className="bg-black/25 backdrop-blur-xs p-4 rounded-2xl border border-[#D5B779]/30 text-center sm:text-left">
            <span className="text-[11px] text-[#EDE6D4]/80 block mb-1">
              الوقت المتبقي للأذان
            </span>
            <div className="flex items-baseline justify-center sm:justify-start gap-1.5 font-mono text-2xl sm:text-3xl font-bold text-[#D5B779]" dir="ltr">
              <span>{String(prayerData.timeUntilNext.hours).padStart(2, '0')}</span>
              <span className="animate-pulse">:</span>
              <span>{String(prayerData.timeUntilNext.minutes).padStart(2, '0')}</span>
              <span className="animate-pulse">:</span>
              <span className="text-lg opacity-80">
                {String(prayerData.timeUntilNext.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* City & Geolocation Selector */}
      <div className="bg-white dark:bg-[#132E27] rounded-3xl p-5 shadow-sm border border-[#E8E2D2] dark:border-[#1E443A] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-bold text-slate-700 dark:text-[#F7F4EB] flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#D5B779]" />
            <span>اختر المدينة لحساب المواقيت فلكياً:</span>
          </label>

          {/* Geolocation Button */}
          <button
            onClick={handleUseGeolocation}
            disabled={geoLoading}
            className="flex items-center justify-center gap-1.5 bg-[#123D32]/10 dark:bg-[#D5B779]/15 hover:bg-[#123D32]/20 text-[#123D32] dark:text-[#D5B779] px-3 py-1.5 rounded-xl text-xs font-bold transition disabled:opacity-50"
          >
            <Navigation className={`w-3.5 h-3.5 ${geoLoading ? 'animate-spin' : ''}`} />
            <span>{geoLoading ? 'جاري تحديد موقعك...' : 'تحديد موقعي عبر GPS'}</span>
          </button>
        </div>

        {geoError && (
          <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-xl border border-red-200 dark:border-red-800">
            {geoError}
          </p>
        )}

        <select
          value={settings.customCoordinates ? 'custom' : settings.selectedCityId}
          onChange={(e) => {
            const val = e.target.value;
            triggerHaptic(20);
            if (val !== 'custom') {
              updateSettings({
                selectedCityId: val,
                customCoordinates: undefined,
              });
            }
          }}
          className="w-full p-2.5 rounded-2xl bg-[#F7F4EB] dark:bg-[#0C1E19] border border-[#E8E2D2] dark:border-[#1E443A] text-xs font-semibold text-slate-800 dark:text-[#F7F4EB] focus:outline-hidden focus:ring-2 focus:ring-[#D5B779]"
        >
          {settings.customCoordinates && (
            <option value="custom">📍 موقعي الحالي عبر GPS</option>
          )}
          {POPULAR_CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} - {c.country}
            </option>
          ))}
        </select>
      </div>

      {/* Prayer Times Full Day List */}
      <div className="bg-white dark:bg-[#132E27] rounded-3xl p-5 shadow-sm border border-[#E8E2D2] dark:border-[#1E443A] space-y-2.5">
        <h2 className="text-sm font-bold text-slate-800 dark:text-[#F7F4EB] mb-3">
          صلوات اليوم الكاملة
        </h2>

        <div className="space-y-2">
          {prayerData.items.map((item) => {
            return (
              <div
                key={item.name}
                className={`flex items-center justify-between p-3.5 rounded-2xl transition-all border ${
                  item.isNext
                    ? 'bg-[#D5B779]/15 border-[#D5B779] shadow-xs'
                    : item.isCurrent
                    ? 'bg-[#123D32]/5 dark:bg-[#0C1E19] border-[#123D32]/30 dark:border-[#1E443A]'
                    : 'bg-[#F7F4EB]/50 dark:bg-[#0C1E19]/40 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white dark:bg-[#132E27] shadow-xs">
                    {getPrayerIcon(item.iconName)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-[#F7F4EB]">
                      {item.arabicName}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      {item.isNext
                        ? 'الصلاة القادمة'
                        : item.isCurrent
                        ? 'الصلاة الحالية'
                        : ''}
                    </p>
                  </div>
                </div>

                <div className="text-left">
                  <span className="font-bold font-mono text-base text-slate-900 dark:text-[#F7F4EB]">
                    {item.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calculation Method Preferences Card */}
      <div className="bg-white dark:bg-[#132E27] rounded-3xl p-5 shadow-sm border border-[#E8E2D2] dark:border-[#1E443A] space-y-4">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-[#D5B779]" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-[#F7F4EB]">
            طريقة الحساب والمذهب الفقهي
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Method selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              طريقة الحساب الفلكية:
            </label>
            <select
              value={settings.calculationMethod}
              onChange={(e) => {
                triggerHaptic(20);
                updateSettings({ calculationMethod: e.target.value as any });
              }}
              className="w-full p-2.5 rounded-xl bg-[#F7F4EB] dark:bg-[#0C1E19] border border-[#E8E2D2] dark:border-[#1E443A] text-xs font-medium text-slate-800 dark:text-[#F7F4EB]"
            >
              <option value="UmmAlQura">أم القرى (مكة المكرمة)</option>
              <option value="Egyptian">الهيئة العامة المصرية للمساحة</option>
              <option value="MWL">رابطة العالم الإسلامي</option>
              <option value="ISNA">الجمعية الإسلامية لأمريكا الشمالية (ISNA)</option>
              <option value="Dubai">دائرة الشؤون الإسلامية بدبي</option>
              <option value="Qatar">وزارة الأوقاف والشؤون الإسلامية بقطر</option>
              <option value="Kuwait">وزارة الأوقاف والشؤون الإسلامية بالكويت</option>
            </select>
          </div>

          {/* Madhab selector for Asr */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              حساب صلاة العصر (المذهب):
            </label>
            <select
              value={settings.madhab}
              onChange={(e) => {
                triggerHaptic(20);
                updateSettings({ madhab: e.target.value as any });
              }}
              className="w-full p-2.5 rounded-xl bg-[#F7F4EB] dark:bg-[#0C1E19] border border-[#E8E2D2] dark:border-[#1E443A] text-xs font-medium text-slate-800 dark:text-[#F7F4EB]"
            >
              <option value="shafi">الشافعي والجمهور (الظل مثله)</option>
              <option value="hanafi">الحنفي (الظل مثليه)</option>
            </select>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 leading-relaxed">
          * تم التحقق من صحة الحسابات الفلكية عبر مكتبة adhan المعتمدة دولياً، وفق خطوط الطول والعرض وزاوية انخفاض الشمس بدقة دون أي مواعيد مصطنعة.
        </p>
      </div>
    </div>
  );
};
