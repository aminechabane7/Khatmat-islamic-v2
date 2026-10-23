import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { HomePage } from './pages/HomePage';
import { QuranPage } from './pages/QuranPage';
import { KhatmaPage } from './pages/KhatmaPage';
import { AdhkarPage } from './pages/AdhkarPage';
import { PrayersPage } from './pages/PrayersPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#F7F4EB] dark:bg-[#0C1E19] text-slate-800 dark:text-[#F1EFEA] font-sans antialiased transition-colors duration-200 flex flex-col">
          {/* Top Header */}
          <Navbar />

          {/* Network Offline Toast */}
          <OfflineIndicator />

          {/* Main Content Area */}
          <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-4 pb-24">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/quran" element={<QuranPage />} />
              <Route path="/khatma" element={<KhatmaPage />} />
              <Route path="/adhkar" element={<AdhkarPage />} />
              <Route path="/prayers" element={<PrayersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Mobile-first Fixed Bottom Bar */}
          <BottomNav />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
