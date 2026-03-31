// src/App.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layout ve Provider
import Layout from './components/Layout'; 
import { DataProvider, supabase } from './context/DataContext';

// Sayfa Bileşenleri
import OverviewPage from './pages/OverviewPage';
import HesaplarDemo from './pages/HesaplarDemo';
import KisilerDemo from './pages/KisilerDemo';
import IslemlerDemo from './pages/IslemlerDemo';
import BorcAlacakPage from './pages/BorcAlacakPage'; 
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import SantiyeDetayPage from './pages/Santiyedetaypage';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <BrowserRouter basename="/craftops/aycaninsaat">
      <DataProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/borc-alacak" element={<BorcAlacakPage />} />
            <Route path="/hesaplar" element={<HesaplarDemo />} />
            <Route path="/kisiler" element={<KisilerDemo />} />
            <Route path="/islemler" element={<IslemlerDemo />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/santiye/:projeId" element={<SantiyeDetayPage />} />
          </Route>
        </Routes>
      </DataProvider>
    </BrowserRouter>
  );
}