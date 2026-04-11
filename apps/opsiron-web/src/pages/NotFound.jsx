import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';

export default function NotFound() {
  return (
    <div className="w-full relative bg-[#F7F7F5] text-[#0F0F10] font-sans selection:bg-[#0F0F10] selection:text-white min-h-screen flex flex-col justify-center overflow-hidden">
      
      <SEO 
        title="404 - Sayfa Bulunamadı | Opsiron" 
        description="Aradığınız sayfa bulunamadı. Opsiron ana sayfasına dönerek projelere göz atabilirsiniz." 
      />

      {/* Mimari Grid Arka Plan */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.35]" 
        style={{ 
          backgroundImage: "linear-gradient(#E4E4E7 1px, transparent 1px), linear-gradient(90deg, #E4E4E7 1px, transparent 1px)", 
          backgroundSize: "6rem 6rem",
          backgroundPosition: "center center"
        }} 
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col items-center text-center">
        
        {/* Üst Etiket & Dekoratif Çizgiler */}
        <div className="relative flex items-center justify-center text-[10px] uppercase tracking-[0.3em] text-[#6B6B73] font-medium mb-8">
          <div className="absolute -left-8 top-1/2 w-6 h-[1px] bg-[#A1A1AA]"></div>
          <div className="absolute -right-8 top-1/2 w-6 h-[1px] bg-[#A1A1AA]"></div>
          Hata 404
        </div>

        {/* Dev 404 Tipografisi */}
        <h1 className="text-[120px] md:text-[180px] lg:text-[240px] font-bold uppercase leading-[0.8] tracking-tighter text-[#0F0F10] mb-8 select-none">
          404
        </h1>

        {/* Mesaj */}
        <h2 className="text-xl md:text-3xl font-light uppercase tracking-[0.05em] text-[#0F0F10] mb-6">
          SAYFA BULUNAMADI.
        </h2>
        
        <p className="text-[14px] md:text-[15px] text-[#6B6B73] font-light max-w-md mx-auto leading-relaxed mb-12">
          Ulaşmaya çalıştığınız dijital alan taşınmış, silinmiş veya hiç var olmamış olabilir. Kendi kimliğinizi yansıtacak yeni dijital deneyimleri keşfetmek için ana sayfaya dönebilirsiniz.
        </p>

        {/* Aksiyon Butonu */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link 
            to="/"
            className="inline-flex h-14 items-center justify-center bg-[#0F0F10] px-12 text-[11px] uppercase tracking-[0.2em] font-medium text-white transition-all duration-300 hover:bg-[#27272A] shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]"
          >
            Ana Sayfaya Dön
          </Link>
        </div>

      </div>
    </div>
  );
}