import { useState, useRef, useMemo } from "react";
import { FileText, ScrollText, Upload, Download, Trash2, Tag } from "lucide-react";
import { useData, type SantiyeBelge } from "../../context/DataContext";
import { CustomSelect } from "../../components/CustomSelect";
import { formatBytes, formatDate, KATEGORI_CONFIG, SOZLESME_TURU, Modal, FieldLabel, TextInput } from "./santiye-ortak";

export default function BelgelerSekmesi({ projeId }: { projeId: string }) {
  const { belgeler, addBelge, removeBelge, uploadBelgeDosyasi } = useData();
  const projeBelgeler = belgeler.filter((b) => b.proje_id === projeId);

  const [kategoriFilter, setKategoriFilter] = useState<string>("hepsi");
  const [modal, setModal] = useState(false);
  const [silOnay, setSilOnay] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [belgeForm, setBelgeForm] = useState({
    baslik: "",
    kategori: "diger" as SantiyeBelge["kategori"],
    sozlesme_turu: "" as string, 
    dosya: null as File | null,
  });

  const filtrelenmis = kategoriFilter === "hepsi" ? projeBelgeler : projeBelgeler.filter((b) => b.kategori === kategoriFilter);

  const kategoriler = useMemo(() => {
    const counts: Record<string, number> = { hepsi: projeBelgeler.length };
    projeBelgeler.forEach((b) => { counts[b.kategori] = (counts[b.kategori] || 0) + 1; });
    return counts;
  }, [projeBelgeler]);

  const handleDosyaSec = (file: File) => {
    setBelgeForm((prev) => ({ ...prev, dosya: file, baslik: prev.baslik || file.name.replace(/\.[^/.]+$/, "") }));
  };

  const yukle = async () => {
    if (!belgeForm.baslik.trim()) return alert("Başlık zorunludur.");
    setUploading(true);
    try {
      let dosyaUrl = null, dosyaAdi = null, dosyaBoyutu = null;
      if (belgeForm.dosya) {
        dosyaUrl = await uploadBelgeDosyasi(belgeForm.dosya, projeId);
        dosyaAdi = belgeForm.dosya.name;
        dosyaBoyutu = belgeForm.dosya.size;
      }
      const { supabase } = await import("../../context/DataContext");
      const { data: { user } } = await supabase.auth.getUser();
      await addBelge({
        proje_id: projeId,
        sozlesme_id: null,
        kategori: belgeForm.kategori,
        // @ts-ignore
        sozlesme_turu: belgeForm.kategori === 'sozlesme' ? (belgeForm.sozlesme_turu || null) : null,
        baslik: belgeForm.baslik,
        dosya_url: dosyaUrl,
        dosya_adi: dosyaAdi,
        dosya_boyutu: dosyaBoyutu,
        yukleyen_email: user?.email || null,
      });
      setModal(false);
      setBelgeForm({ baslik: "", kategori: "diger", sozlesme_turu: "", dosya: null });
    } catch (e: any) { alert("Hata: " + e.message); }
    finally { setUploading(false); }
  };

  const sil = async (id: string) => {
    try { await removeBelge(id); setSilOnay(null); }
    catch (e: any) { alert("Hata: " + e.message); }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {["hepsi", "sozlesme", "proje", "ruhsat", "teknik", "diger"].map((k) => (
            <button key={k} onClick={() => setKategoriFilter(k)} className={`px-3 py-1.5 text-xs font-bold tracking-wider border transition-colors ${kategoriFilter === k ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400"}`}>
              {k === "hepsi" ? "TÜMÜ" : KATEGORI_CONFIG[k as SantiyeBelge["kategori"]].label.toUpperCase()} ({kategoriler[k] || 0})
            </button>
          ))}
        </div>
        <button onClick={() => setModal(true)} className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-xs font-bold tracking-wider hover:bg-neutral-800 transition-colors">
          <Upload size={14} /> BELGE / SÖZLEŞME YÜKLE
        </button>
      </div>

      {filtrelenmis.length === 0 ? (
        <div className="bg-white border border-neutral-200 p-16 text-center">
          <FileText size={32} className="text-neutral-200 mx-auto mb-3" />
          <p className="text-neutral-400 text-sm">Bu kategoride kayıt yok.</p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 divide-y divide-neutral-50">
          {filtrelenmis.map((b) => {
            const kat = KATEGORI_CONFIG[b.kategori];
            return (
              <div key={b.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-neutral-50 transition-colors group">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center shrink-0">
                    {b.kategori === 'sozlesme' ? <ScrollText size={18} className="text-blue-500" /> : <FileText size={18} className="text-neutral-500" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-neutral-900 truncate">{b.baslik}</div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wider ${kat.color}`}>{kat.label}</span>
                      
                      {/* @ts-ignore */}
                      {b.kategori === 'sozlesme' && b.sozlesme_turu && (
                        /* @ts-ignore */
                        <span className="text-xs text-neutral-500 font-medium border-l pl-3">{SOZLESME_TURU[b.sozlesme_turu]}</span>
                      )}

                      <span className="text-xs text-neutral-400 border-l pl-3">{formatDate(b.created_at?.slice(0, 10) ?? null)}</span>
                      {b.dosya_adi && <span className="text-xs text-neutral-400 truncate max-w-[120px]">{b.dosya_adi}</span>}
                      {b.dosya_boyutu && <span className="text-xs text-neutral-400">{formatBytes(b.dosya_boyutu)}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {b.dosya_url && (
                    <a href={b.dosya_url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition-colors">
                      <Download size={15} />
                    </a>
                  )}
                  <button onClick={() => setSilOnay(b.id)} className="p-2 hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <Modal title="Belge veya Sözleşme Yükle" onClose={() => setModal(false)}>
          <div className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleDosyaSec(f); }}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${dragOver ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 hover:border-neutral-400"}`}
            >
              <Upload size={24} className="mx-auto mb-2 text-neutral-400" />
              {belgeForm.dosya ? (
                <div>
                  <p className="text-sm font-medium text-neutral-900">{belgeForm.dosya.name}</p>
                  <p className="text-xs text-neutral-400 mt-1">{formatBytes(belgeForm.dosya.size)}</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-neutral-600">Dosyayı sürükleyin veya tıklayın</p>
                  <p className="text-xs text-neutral-400 mt-1">PDF, JPG, PNG, DWG vb.</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleDosyaSec(f); }} />
            <div>
              <FieldLabel>Başlık *</FieldLabel>
              <TextInput value={belgeForm.baslik} onChange={(v) => setBelgeForm({ ...belgeForm, baslik: v })} placeholder="Belge başlığı..." />
            </div>
            <div>
              <CustomSelect label="KATEGORİ" value={belgeForm.kategori} onChange={(v) => setBelgeForm({ ...belgeForm, kategori: v as SantiyeBelge["kategori"] })} options={Object.entries(KATEGORI_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))} icon={Tag} />
            </div>
            
            {belgeForm.kategori === "sozlesme" && (
              <div>
                <CustomSelect 
                  label="SÖZLEŞME TÜRÜ" 
                  value={belgeForm.sozlesme_turu} 
                  onChange={(v) => setBelgeForm({ ...belgeForm, sozlesme_turu: v })} 
                  options={[
                    { value: "", label: "— Seçiniz —" },
                    { value: "kat_karsiligi", label: "Kat Karşılığı Sözleşmesi" },
                    { value: "taseron", label: "Taşeron Sözleşmesi" },
                    { value: "satis", label: "Satış Sözleşmesi" },
                    { value: "diger", label: "Diğer" }
                  ]} 
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(false)} className="flex-1 h-11 border border-neutral-200 text-neutral-600 text-sm hover:bg-neutral-50 transition-colors">İptal</button>
              <button onClick={yukle} disabled={uploading} className="flex-1 h-11 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-60">
                {uploading ? "Yükleniyor..." : "Yükle"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {silOnay && (
        <Modal title="Belgeyi Sil" onClose={() => setSilOnay(null)}>
          <div className="space-y-4">
            <p className="text-sm text-neutral-600">Bu belgeyi kalıcı olarak silmek istediğinizden emin misiniz?</p>
            <div className="flex gap-3">
              <button onClick={() => setSilOnay(null)} className="flex-1 h-11 border border-neutral-200 text-neutral-600 text-sm hover:bg-neutral-50">İptal</button>
              <button onClick={() => sil(silOnay)} className="flex-1 h-11 bg-red-600 text-white text-sm font-medium hover:bg-red-700">Sil</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}