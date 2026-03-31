import { X } from "lucide-react";
import { type Daire, type SantiyeBelge } from "../../context/DataContext";

// ─────────────────────────────────────────
// YARDIMCI FONKSİYONLAR VE AYARLAR
// ─────────────────────────────────────────
export const formatCurrency = (n: number | null | undefined) =>
  n ? new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) : "0 ₺";

export const formatDate = (d: string | null) =>
  d ? d.split("-").reverse().join(".") : "-";

export const formatBytes = (b: number | null) => {
  if (!b) return "-";
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(1) + " MB";
};

export const DURUM_CONFIG: Record<Daire["durum"], { label: string; color: string; bg: string; dot: string }> = {
  musait:      { label: "Müsait",      color: "text-green-700",  bg: "bg-green-50 border-green-200",   dot: "bg-green-500" },
  rezerve:     { label: "Rezerve",     color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", dot: "bg-yellow-500" },
  satildi:     { label: "Satıldı",     color: "text-red-700",    bg: "bg-red-50 border-red-200",       dot: "bg-red-500" },
  arsa_sahibi: { label: "Arsa Sahibi", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", dot: "bg-purple-500" },
};

export const KATEGORI_CONFIG: Record<SantiyeBelge["kategori"], { label: string; color: string }> = {
  sozlesme: { label: "Sözleşme", color: "bg-blue-100 text-blue-700" },
  proje:    { label: "Proje",    color: "bg-indigo-100 text-indigo-700" },
  ruhsat:   { label: "Ruhsat",   color: "bg-orange-100 text-orange-700" },
  teknik:   { label: "Teknik",   color: "bg-neutral-100 text-neutral-700" },
  diger:    { label: "Diğer",    color: "bg-neutral-100 text-neutral-500" },
};

export const SOZLESME_TURU: Record<string, string> = {
  kat_karsiligi: "Kat Karşılığı Sözleşmesi",
  taseron: "Taşeron Sözleşmesi",
  satis: "Satış Sözleşmesi",
  diger: "Diğer Sözleşme",
};

export const INITIAL_DAIRE: Omit<Daire, "id" | "created_at"> = {
  proje_id: "",
  blok: "",
  daire_no: "",
  kat: null,
  metrekare: null,
  tip: "",
  durum: "musait",
  fiyat: null,
  arsa_sahibi_payi: false,
  notlar: "",
  alici_id: null,
};

// ─────────────────────────────────────────
// BİLEŞENLER (MODAL & INPUT)
// ─────────────────────────────────────────
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg shadow-2xl border border-neutral-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
          <h3 className="text-sm font-bold text-neutral-900 tracking-wider uppercase">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-bold text-neutral-400 tracking-wider uppercase mb-1.5">{children}</label>;
}

export function TextInput({ value, onChange, placeholder, type = "text", disabled = false }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full h-11 px-3 border border-neutral-200 text-sm outline-none transition-all font-light ${disabled ? "bg-neutral-100 text-neutral-400 cursor-not-allowed" : "bg-neutral-50 text-neutral-900 focus:border-neutral-900 focus:bg-white"}`}
    />
  );
}