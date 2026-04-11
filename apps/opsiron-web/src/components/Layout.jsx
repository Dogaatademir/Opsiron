import React, { useEffect, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import SEO from "./common/SEO";
import Loading from "./common/Loading";

export default function Layout() {
  const location = useLocation();

  // Analytics Page View Tracking
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Page View Tracked: ${location.pathname}`);
    }
  }, [location]);

  // Global olarak yeni premium stüdyo teması (aydınlık ve rafine) uygulandı
  return (
    <div className="bg-[#F7F7F5] text-[#0F0F10] min-h-screen flex flex-col font-sans selection:bg-[#0F0F10] selection:text-white">
      {/* 1. Global SEO Fallback */}
      <SEO />

      {/* 2. Navigation */}
      <Navbar />

      {/* 3. Main Content Area */}
      {/* Sayfaların en üstten (hero sections) başlaması için paddingTop kullanılmıyor */}
      <main 
        id="main-content" 
        role="main" 
        className="flex-grow relative"
      >
        <Suspense fallback={
          <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F7F7F5] gap-4">
            {/* Loading componenti yeni minimalist temaya uyarlandı */}
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#A1A1AA] animate-pulse">
              Yükleniyor...
            </div>
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>

      {/* 4. Footer */}
      <Footer />
    </div>
  );
}