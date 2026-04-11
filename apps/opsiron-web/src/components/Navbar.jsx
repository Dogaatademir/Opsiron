import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

// İhtiyaca göre logo resmini veya sabit metinleri kullanabilirsiniz.
// Minimal tema gereği metin logo kullanımı tercih edilmiştir.

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const lastScrollY = useRef(0);
  const location = useLocation();

  // Menü öğelerini doğrudan bileşen içinde tutarak dışa bağımlılığı azalttık.
  const NAVIGATION = [
    { label: 'Hakkımızda', path: '/about' },
    { label: 'Seçkin İşler', path: '/work' },
    { label: 'Uzmanlıklar', path: '/services' },
    { label: 'İletişim', path: '/contact' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Sayfa en tepedeyken border'ı gizlemek için kontrol
      setIsScrolled(currentScrollY > 10);

      // Kaydırma yönü kontrolü (Aşağı kaydırınca gizle, yukarı kaydırınca göster)
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // %100 Opaklıkta, şeffaflaşmayan Navbar stilleri
  const getNavbarStyles = () => {
    // Mobil menü açıkken her zaman görünür, katı beyaz ve sabit
    if (isOpen) return 'translate-y-0 bg-[#FFFFFF] border-[#E4E4E7]';
    
    // Görünürlük ve konum kontrolü (Opaklık değişimi yok, sadece Y ekseninde hareket var)
    const visibilityClass = isVisible ? 'translate-y-0' : '-translate-y-full';
    const bgClass = isScrolled ? 'bg-[#F7F7F5] border-[#E4E4E7]' : 'bg-[#F7F7F5] border-transparent';
    
    return `${visibilityClass} ${bgClass}`;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] h-24 transition-transform duration-500 ease-in-out border-b 
      ${getNavbarStyles()}`}
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
        
        {/* LOGO (Tipografik ve Minimal) */}
        <Link to="/" className="flex items-center group" onClick={() => setIsOpen(false)}>
          <span className="text-xl tracking-[0.25em] uppercase font-normal text-[#0F0F10] group-hover:text-[#6B6B73] transition-colors duration-300">
            OPSIRON
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden lg:flex items-center gap-10">
          {NAVIGATION.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`text-[10px] uppercase tracking-[0.2em] transition-all duration-300 relative font-medium
                  ${isActive ? 'text-[#0F0F10]' : 'text-[#6B6B73] hover:text-[#0F0F10]'}`}
              >
                {item.label}
                {/* Aktif sayfa vurgusu: Renk yerine şık ve ince siyah çizgi */}
                {isActive && (
                  <span className="absolute -bottom-1.5 left-0 w-full h-[1px] bg-[#0F0F10]" />
                )}
              </Link>
            )
          })}
        </div>

        {/* MOBILE TOGGLE */}
        <button className="lg:hidden text-[#0F0F10] hover:text-[#6B6B73] transition-colors" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} strokeWidth={1} /> : <Menu size={24} strokeWidth={1} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <div className={`fixed inset-0 top-24 bg-[#FFFFFF] z-[90] p-8 flex flex-col gap-10 transition-transform duration-500 lg:hidden border-t border-[#E4E4E7]
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="flex flex-col gap-8 mt-4">
          {NAVIGATION.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                onClick={() => setIsOpen(false)}
                className={`text-3xl font-light uppercase tracking-widest transition-colors
                  ${isActive ? 'text-[#0F0F10] ml-2' : 'text-[#6B6B73] hover:text-[#0F0F10]'}`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
        
        <div className="mt-auto pb-12 border-t border-[#E4E4E7] pt-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#A1A1AA] mb-4">İletişim</p>
          <a href="mailto:info@opsiron.com" className="text-[14px] font-light text-[#0F0F10] hover:text-[#6B6B73] transition-colors">
            info@opsiron.com
          </a>
        </div>
      </div>
    </nav>
  );
}