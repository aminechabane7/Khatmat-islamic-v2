import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sun,
  Moon,
  HeartHandshake,
  Bed,
  CheckCircle,
  RotateCcw,
  Sparkles,
  Info,
  Volume2,
  Check,
} from 'lucide-react';
import { ALL_ADHKAR, TASBIH_PRESETS } from '../data/adhkar';
import { AdhkarCategory, DhikrItem } from '../types';
import { useAppStore } from '../context/AppContext';

export const AdhkarPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { adhkarProgress, decrementDhikr, resetAdhkarSection, triggerHaptic } = useAppStore();

  const activeTab = (searchParams.get('tab') as AdhkarCategory | 'tasbih') || 'morning';

  // Digital Tasbih state
  const [tasbihPresetIndex, setTasbihPresetIndex] = useState(0);
  const [tasbihCount, setTasbihCount] = useState(0);
  const currentPreset = TASBIH_PRESETS[tasbihPresetIndex];

  const handleTabChange = (tab: string) => {
    triggerHaptic(15);
    setSearchParams({ tab });
  };

  const handleDhikrTap = (dhikr: DhikrItem) => {
    decrementDhikr(dhikr.id, dhikr.count);
  };

  const handleResetCurrentSection = (items: DhikrItem[]) => {
    triggerHaptic(30);
    resetAdhkarSection(items.map((i) => i.id));
  };

  // Filter adhkar for current tab
  const currentAdhkar = ALL_ADHKAR.filter((d) => d.category === activeTab);

  // Digital Tasbih tap
  const handleTasbihTap = () => {
    const next = tasbihCount + 1;
    setTasbihCount(next);

    if (next % currentPreset.target === 0) {
      // Milestone reached!
      triggerHaptic([40, 50, 60]);
    } else {
      triggerHaptic(20);
    }
  };

  const handleResetTasbih = () => {
    triggerHaptic(30);
    setTasbihCount(0);
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Category Pills Navigation */}
      <div className="bg-white dark:bg-[#132E27] rounded-3xl p-2 shadow-sm border border-[#E8E2D2] dark:border-[#1E443A] flex gap-1.5 overflow-x-auto scrollbar-none text-xs font-bold">
        {[
          { key: 'morning', label: 'أذكار الصباح', icon: Sun },
          { key: 'evening', label: 'أذكار المساء', icon: Moon },
          { key: 'after_prayer', label: 'بعد الصلاة', icon: HeartHandshake },
          { key: 'sleep', label: 'أذكار النوم', icon: Bed },
          { key: 'tasbih', label: 'المسبحة', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#123D32] text-[#F7F4EB] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#0C1E19]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* View: Standard Adhkar Lists */}
      {activeTab !== 'tasbih' && (
        <div className="space-y-3">
          {/* Section Control Header */}
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-[#F7F4EB]">
                {activeTab === 'morning' && 'أذكار الصباح المباركة'}
                {activeTab === 'evening' && 'أذكار المساء والسكينة'}
                {activeTab === 'after_prayer' && 'الأذكار المأثورة دبر الصلوات المكتوبة'}
                {activeTab === 'sleep' && 'أذكار وآداب النوم'}
              </h2>
              <p className="text-[11px] text-slate-400">
                انقر على بطاقة الذكر لاحتساب التكرار
              </p>
            </div>

            <button
              onClick={() => handleResetCurrentSection(currentAdhkar)}
              className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 p-2 rounded-xl"
              title="إعادة تعيين عدادات هذا القسم"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة البدء</span>
            </button>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {currentAdhkar.map((dhikr) => {
              const remaining =
                adhkarProgress.counts[dhikr.id] !== undefined
                  ? adhkarProgress.counts[dhikr.id]
                  : dhikr.count;
              const isCompleted = remaining === 0;

              return (
                <div
                  key={dhikr.id}
                  onClick={() => handleDhikrTap(dhikr)}
                  className={`cursor-pointer rounded-3xl p-5 border transition-all duration-200 select-none ${
                    isCompleted
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 opacity-80'
                      : 'bg-white dark:bg-[#132E27] border-[#E8E2D2] dark:border-[#1E443A] shadow-sm hover:border-[#D5B779] active:scale-[0.99]'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Dhikr Arabic Text */}
                    <p className="font-quran text-slate-900 dark:text-[#F7F4EB] text-lg sm:text-xl leading-relaxed text-justify">
                      {dhikr.text}
                    </p>

                    {/* Reward & Reference */}
                    <div className="text-xs space-y-1 pt-2 border-t border-slate-100 dark:border-[#1E443A]">
                      {dhikr.reward && (
                        <p className="text-[#123D32] dark:text-[#D5B779] font-medium flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 shrink-0" />
                          <span>{dhikr.reward}</span>
                        </p>
                      )}
                      <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-400">
                        <span>
                          المصدر: {dhikr.reference} {dhikr.hadithNumber && `(${dhikr.hadithNumber})`}
                        </span>
                        {dhikr.verificationStatus === 'verified' ? (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                            حديث ثابت وموثق ✓
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                            بانتظار المراجعة
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Counter Button Bar */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-semibold text-slate-400">
                        التكرار المطلوب: {dhikr.count} مرات
                      </span>

                      <div
                        className={`px-4 py-1.5 rounded-full text-xs font-bold font-mono flex items-center gap-1.5 shadow-xs transition-transform ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#123D32] text-[#D5B779]'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>مكتمل</span>
                          </>
                        ) : (
                          <span>متبقي {remaining}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View: Digital Tasbih (المسبحة الإلكترونية) */}
      {activeTab === 'tasbih' && (
        <div className="space-y-4">
          {/* Preset Selector */}
          <div className="bg-white dark:bg-[#132E27] rounded-3xl p-4 shadow-sm border border-[#E8E2D2] dark:border-[#1E443A] space-y-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
              اختر صيغة الذكر المستحب:
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {TASBIH_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    triggerHaptic(20);
                    setTasbihPresetIndex(idx);
                    setTasbihCount(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    tasbihPresetIndex === idx
                      ? 'bg-[#123D32] text-[#D5B779] shadow-xs'
                      : 'bg-slate-100 dark:bg-[#0C1E19] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Large Circular Tasbih */}
          <div className="bg-white dark:bg-[#132E27] rounded-3xl p-8 shadow-sm border border-[#E8E2D2] dark:border-[#1E443A] text-center space-y-6">
            <div className="space-y-1">
              <h3 className="font-quran text-2xl text-[#123D32] dark:text-[#D5B779] font-bold">
                {currentPreset.label}
              </h3>
              <p className="text-xs text-slate-400">
                الهدف: {currentPreset.target} تسبيحة • الدورة الحالية: {Math.floor(tasbihCount / currentPreset.target) + 1}
              </p>
            </div>

            {/* Giant Tappable Circular Counter Button */}
            <div className="flex justify-center">
              <button
                onClick={handleTasbihTap}
                className="w-56 h-56 rounded-full bg-gradient-to-br from-[#123D32] via-[#16483c] to-[#0a251e] text-[#F7F4EB] shadow-2xl border-4 border-[#D5B779] flex flex-col items-center justify-center p-6 active:scale-95 transition-all select-none hover:shadow-emerald-950/40 relative group"
              >
                <span className="text-xs text-[#D5B779] uppercase tracking-wider mb-1 font-semibold">
                  اضغط للتسبيح
                </span>
                <span className="text-6xl font-extrabold font-mono text-[#D5B779] group-active:scale-110 transition-transform">
                  {tasbihCount % currentPreset.target}
                </span>
                <span className="text-[11px] text-[#EDE6D4]/80 mt-2">
                  إجمالي التسبيحات: {tasbihCount}
                </span>
              </button>
            </div>

            {/* Reset & Vibration Note */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={handleResetTasbih}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#0C1E19] text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>تصفير العداد</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
