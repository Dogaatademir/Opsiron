import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Home, FileText, BarChart2, AlertCircle } from "lucide-react";
import { useData } from "../context/DataContext";

// Ayırdığımız bileşenleri içeri alıyoruz
import GenelBakisSekmesi from "./SantiyeDetay/GenelBakisSekmesi";
import DairelerSekmesi from "./SantiyeDetay/DairelerSekmesi";
import BelgelerSekmesi from "./SantiyeDetay/BelgelerSekmesi";

const SEKMELER = [
  { id: "genel",     label: "Genel Bakış", icon: BarChart2  },
  { id: "daireler", label: "Daireler",    icon: Home       },
  { id: "belgeler", label: "Belgeler",    icon: FileText   },
];

export default function SantiyeDetayPage() {
  const { projeId } = useParams<{ projeId: string }>();
  const navigate = useNavigate();
  const { projeler, daireler, belgeler, loading } = useData();
  const [aktifSekme, setAktifSekme] = useState("genel");

  const proje = projeler.find((p) => p.id === projeId);

  const ozet = useMemo(() => ({
    daire: daireler.filter((d) => d.proje_id === projeId).length,
    belge: belgeler.filter((b) => b.proje_id === projeId).length,
  }), [daireler, belgeler, projeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!proje) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle size={32} className="text-neutral-300" />
        <p className="text-neutral-500">Şantiye bulunamadı.</p>
        <button onClick={() => navigate(-1)} className="text-sm text-neutral-600 hover:text-neutral-900 underline">Geri dön</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* HEADER */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-bold text-neutral-400 tracking-wider uppercase hover:text-neutral-900 transition-colors mb-4">
            <ArrowLeft size={14} /> Geri
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center shrink-0">
                <Building2 size={22} className="text-white" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-2xl font-light tracking-tight text-neutral-900">{proje.ad}</h1>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-neutral-400">{ozet.daire} daire</span>
                  <span className="text-xs text-neutral-400">{ozet.belge} belge (Sözleşmeler dahil)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sekmeler */}
          <div className="flex mt-6 border-b border-neutral-100 -mb-px overflow-x-auto">
            {SEKMELER.map((sekme) => (
              <button
                key={sekme.id}
                onClick={() => setAktifSekme(sekme.id)}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold tracking-wider uppercase border-b-2 whitespace-nowrap transition-colors ${
                  aktifSekme === sekme.id
                    ? "border-neutral-900 text-neutral-900"
                    : "border-transparent text-neutral-400 hover:text-neutral-700"
                }`}
              >
                <sekme.icon size={14} />
                {sekme.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* İÇERİK */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {projeId && (
          <>
            {aktifSekme === "genel"    && <GenelBakisSekmesi  projeId={projeId} />}
            {aktifSekme === "daireler" && <DairelerSekmesi    projeId={projeId} />}
            {aktifSekme === "belgeler" && <BelgelerSekmesi    projeId={projeId} />}
          </>
        )}
      </div>
    </div>
  );
}