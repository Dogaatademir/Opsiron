import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Box, 
  Layers, 
  Factory, 
  Package, 
  Settings, 
  Menu, 
  X,
  Truck,
  ClipboardList,
  Info // Bilgi ikonu (opsiyonel)
} from 'lucide-react';

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
  const [showHint, setShowHint] = useState(true); // İpucu kutusunun görünürlüğü

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-neutral-50 font-sans overflow-hidden">
      
      {/* --- MOBILE OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-20 md:hidden transition-opacity"
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside 
        className={`
          fixed md:relative z-30 h-full w-64 bg-white border-r border-neutral-200 flex flex-col transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* --- SIDEBAR HEADER & BRANDING --- */}
        <div className="p-8 border-b border-neutral-200 flex justify-between items-start">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight leading-none">
                DEMO
            </h1>
            <p className="text-xs text-neutral-400 mt-2 font-light tracking-wider">STOK MODÜLÜ</p>
            
            <div className="mt-4 pt-3 border-t border-neutral-100 w-full">
               <p className="text-[9px] text-neutral-400 font-medium tracking-wide">
                 Powered by <span className="text-neutral-600 font-bold">CraftOps</span>
               </p>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="md:hidden p-1 text-neutral-400 hover:bg-neutral-100"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* --- NAVIGATION --- */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          
          <SidebarItem to="/" icon={LayoutDashboard} label="GENEL BAKIŞ" onClick={closeSidebar} />
          
          {/* BÖLÜM 1: ENVANTER */}
          <div className="pt-6 pb-3">
            <p className="px-4 text-[10px] font-medium text-neutral-400 uppercase tracking-[0.15em]">Envanter Yönetimi</p>
          </div>
          <SidebarItem to="/materials" icon={Box} label="Hammadde" onClick={closeSidebar} />
          <SidebarItem to="/finished-goods" icon={Package} label="Hazır Ürünler" onClick={closeSidebar} />
        
          {/* BÖLÜM 2: ÜRETİM */}
          <div className="pt-6 pb-3">
            <p className="px-4 text-[10px] font-medium text-neutral-400 uppercase tracking-[0.15em]">Operasyon</p>
          </div>
          <SidebarItem to="/semi-finished" icon={Layers} label="Yarı Mamül" onClick={closeSidebar} />
          <SidebarItem to="/production" icon={Factory} label="Üretim & Montaj" onClick={closeSidebar} />
          
        </nav>

        {/* --- BOTTOM: SETTINGS & HINT --- */}
        <div className="p-4 border-t border-neutral-200 relative">
          
          {/* YENİ EKLENEN İPUCU KUTUSU */}
          {showHint && (
            <div className="absolute bottom-full left-4 right-4 mb-3 z-50 animate-bounce-slight">
               <div className="bg-blue-600 text-white p-4 rounded-lg shadow-xl relative">
                  {/* Aşağı Gösteren Ok */}
                  <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-blue-600 rotate-45"></div>
                  
                  {/* Kapatma Butonu */}
                  <button 
                    onClick={(e) => { e.preventDefault(); setShowHint(false); }}
                    className="absolute top-2 right-2 text-blue-200 hover:text-white transition-colors"
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>

                  {/* Metin */}
                  <div className="pr-4">
                    <p className="text-xs font-medium leading-relaxed">
                      Ayarlar sayfasından verileri sıfırlayıp kendi verileriniz ile deneyebilirsiniz.
                    </p>
                  </div>
               </div>
            </div>
          )}

          <SidebarItem to="/settings" icon={Settings} label="Ayarlar" onClick={closeSidebar} />
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* --- MOBILE HEADER --- */}
        <header className="md:hidden bg-white border-b border-neutral-200 p-4 flex items-start justify-between shrink-0 z-10">
          <div className="flex items-start gap-3">
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="p-2 -ml-2 text-neutral-600 hover:bg-neutral-100 transition-colors mt-1"
             >
               <Menu size={24} strokeWidth={1.5} />
             </button>
             
             <div className="flex flex-col">
                <span className="font-bold text-neutral-900 tracking-wide text-lg leading-none">
                 DEMO
                </span>
                <span className="text-[10px] text-neutral-400 font-light tracking-wider mt-1">
                  STOK MODÜLÜ
                </span>
                <div className="mt-1.5 pt-1.5 border-t border-neutral-100">
                  <span className="text-[8px] text-neutral-400 font-medium tracking-wide">
                    Powered by <span className="text-neutral-600 font-bold">CraftOps</span>
                  </span>
                </div>
             </div>
          </div>
        </header>

        {/* Content Scroll Area */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}