import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, CheckCircle2, HeartHandshake, Clock } from 'lucide-react';
import { useAppStore } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { triggerHaptic } = useAppStore();

  const navItems = [
    { to: '/', label: 'الرئيسية', icon: Home, exact: true },
    { to: '/quran', label: 'القرآن', icon: BookOpen },
    { to: '/khatma', label: 'الختمة', icon: CheckCircle2 },
    { to: '/adhkar', label: 'الأذكار', icon: HeartHandshake },
    { to: '/prayers', label: 'المواقيت', icon: Clock },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#132E27]/95 backdrop-blur-md border-t border-[#E8E2D2] dark:border-[#1E443A] shadow-lg pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={() => triggerHaptic(15)}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full py-1 text-xs font-semibold transition-all duration-200 select-none ${
                  isActive
                    ? 'text-[#123D32] dark:text-[#D5B779] scale-105'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#D5B779]" />
                    )}
                  </div>
                  <span className="mt-1 text-[11px] leading-tight font-medium">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
