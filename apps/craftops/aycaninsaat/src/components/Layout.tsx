import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ArrowRightLeft, 
  Menu, 
  X, 
  Settings,
  PieChart,
  Scale,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface SidebarItemProps {
  to: string;
  icon: any;
  label: string;
  onClick?: () => void;
}

const SidebarItem = ({ to, icon: Icon, label, onClick }: SidebarItemProps) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-4 transition-all duration-200 group ${
        isActive
          ? 'bg-neutral-900 text-white'
          : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
      }`
    }
  >
    <Icon size={20} className="shrink-0" strokeWidth={1.5} />
    <span className="font-light text-sm tracking-wide uppercase">{label}</span>
  </NavLink>
);

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSantiyelerOpen, setIsSantiyelerOpen] = useState(false);
  
  const location = useLocation();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const { projeler } = useData();

  // Şantiye detay sayfasındayken menüyü otomatik aç
  useEffect(() => {
    if (location.pathname.startsWith('/santiye/')) {
      setIsSantiyelerOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [location.pathname]);

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="fixed inset-0 flex bg-neutral-50 font-sans overflow-hidden">
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          onClick={closeSidebar}
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* SIDEBAR */}
      <aside 
        className={`
          fixed md:relative z-50 h-full w-64 bg-white border-r border-neutral-200 flex flex-col transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-8 border-b border-neutral-200 flex justify-between items-start shrink-0">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight leading-none">
              Aycan<br/>İnşaat
            </h1>
          </div>
          <button onClick={closeSidebar} className="md:hidden p-1 text-neutral-400 hover:bg-neutral-100">
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          
          {/* DURUM BÖLÜMÜ */}
          <div className="space-y-1">
            <h3 className="px-4 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">ÖZET</h3>
            <SidebarItem to="/" icon={LayoutDashboard} label="GENEL BAKIŞ" onClick={closeSidebar} />
            <SidebarItem to="/borc-alacak" icon={Scale} label="BORÇ & ALACAK" onClick={closeSidebar} />
          </div>

          {/* KAYITLAR BÖLÜMÜ */}
          <div className="space-y-1">
            <h3 className="px-4 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">FİNANS VE YÖNETİM</h3>
            <SidebarItem to="/islemler" icon={ArrowRightLeft} label="İŞLEMLER" onClick={closeSidebar} />
            <SidebarItem to="/hesaplar" icon={PieChart} label="HESAPLAR" onClick={closeSidebar} />
            <SidebarItem to="/kisiler" icon={Users} label="KİŞİLER" onClick={closeSidebar} />
          </div>

          {/* ŞANTİYELER BÖLÜMÜ */}
          <div className="space-y-1">
            <h3 className="px-4 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">ŞANTİYELER</h3>
            <div>
              <button
                onClick={() => setIsSantiyelerOpen(!isSantiyelerOpen)}
                className="w-full flex items-center justify-between gap-3 px-4 py-4 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <Building2 size={20} className="shrink-0" strokeWidth={1.5} />
                  <span className="font-light text-sm tracking-wide uppercase">Şantiyeler</span>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-neutral-400 transition-transform duration-200 ${isSantiyelerOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isSantiyelerOpen && (
                <div className="ml-4 pl-4 border-l border-neutral-100 space-y-0.5 py-1 mt-1">
                  {projeler.length === 0 ? (
                    <p className="text-xs text-neutral-400 px-4 py-2">Şantiye yok.</p>
                  ) : (
                    projeler.map((proje) => {
                      const isActive = location.pathname === `/santiye/${proje.id}`;
                      return (
                        <NavLink
                          key={proje.id}
                          to={`/santiye/${proje.id}`}
                          onClick={closeSidebar}
                          className={`flex items-center gap-2 px-3 py-2.5 text-sm transition-colors ${
                            isActive
                              ? 'bg-neutral-900 text-white'
                              : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-white' : 'bg-neutral-300'}`}></div>
                          <span className="font-light truncate">{proje.ad}</span>
                        </NavLink>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-neutral-200 shrink-0">
          <SidebarItem to="/settings" icon={Settings} label="AYARLAR" onClick={closeSidebar} />
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col h-full relative min-w-0">
        
        <header className="md:hidden bg-white border-b border-neutral-200 p-4 flex items-start justify-between shrink-0 z-30 relative">
          <div className="flex items-start gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-neutral-600 hover:bg-neutral-100 transition-colors mt-1">
              <Menu size={24} strokeWidth={1.5} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-neutral-900 tracking-tight leading-none">
                Aycan<br/>İnşaat
              </h1>
            </div>
          </div>
        </header>

        <main 
          ref={mainContentRef}
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 relative scroll-smooth"
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}