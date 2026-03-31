// src/context/DataContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// --- SUPABASE AYARLARI ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON as string;
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnon);

// --- TİPLER ---
export interface Proje {
  id: string;
  ad: string;
}

export interface Kisi {
  id: string;
  ad: string;
  rol?: string | null;
  telefon?: string | null;
  notu?: string | null;
  created_at?: string;
}

export interface Islem {
  id: string;
  tarih: string | null;
  tutar: number;
  tutar_raw: number | null;
  tip: "tahsilat" | "odeme" | "odenecek" | "alacak" | "cek";
  is_bitiminde: number | null;
  kisi_id: string | null;
  proje_id: string | null;
  aciklama: string | null;
  doviz: "TRY" | "USD" | "EUR" | "ALTIN" | null;
  created_at?: string;
  kullanici_email?: string | null;
}

export interface KisiProje {
  kisi_id: string;
  proje_id: string;
  created_at?: string;
}

// --- YENİ TİPLER ---

export interface Daire {
  id: string;
  proje_id: string;
  blok: string | null;
  daire_no: string;
  kat: number | null;
  metrekare: number | null;
  tip: string | null;
  durum: "musait" | "rezerve" | "satildi" | "arsa_sahibi";
  fiyat: number | null;
  arsa_sahibi_payi: boolean;
  notlar: string | null;
  created_at?: string;
  alici_id?: string | null;
}

export interface Sozlesme {
  id: string;
  proje_id: string;
  kisi_id: string | null;
  baslik: string;
  sozlesme_tarihi: string | null;
  sozlesme_turu: "kat_karsiligi" | "satis" | "diger" | null;
  toplam_daire_adedi: number | null;
  arsa_sahibi_daire_adedi: number | null;
  notlar: string | null;
  created_at?: string;
}

export interface SantiyeBelge {
  id: string;
  proje_id: string;
  sozlesme_id: string | null;
  kategori: "sozlesme" | "proje" | "ruhsat" | "teknik" | "diger";
  baslik: string;
  dosya_url: string | null;
  dosya_adi: string | null;
  dosya_boyutu: number | null;
  yukleyen_email: string | null;
  created_at?: string;
}

export interface SozlesmeDaire {
  sozlesme_id: string;
  daire_id: string;
}

// --- CONTEXT TİPİ ---
interface DataContextType {
  kisiler: Kisi[];
  islemler: Islem[];
  projeler: Proje[];
  kisiProjeler: KisiProje[];
  daireler: Daire[];
  sozlesmeler: Sozlesme[];
  belgeler: SantiyeBelge[];
  sozlesmeDaireler: SozlesmeDaire[];
  loading: boolean;

  // YEDEK & LOG
  restoreData: (data: any) => Promise<void>;
  rollbackLog: (log: any) => Promise<void>;

  // KİŞİLER
  addKisi: (kisi: Kisi) => Promise<void>;
  removeKisi: (id: string) => Promise<void>;
  updateKisi: (id: string, data: Partial<Kisi>) => Promise<void>;
  updateKisiProjeler: (kisi_id: string, proje_ids: string[]) => Promise<void>;

  // İŞLEMLER
  addIslem: (islem: Islem) => Promise<void>;
  updateIslem: (islem: Islem) => Promise<void>;
  removeIslem: (id: string) => Promise<void>;

  // PROJELER
  addProje: (ad: string) => Promise<void>;
  updateProje: (id: string, ad: string) => Promise<void>;
  removeProje: (id: string) => Promise<void>;

  // DAİRELER
  addDaire: (daire: Omit<Daire, "id" | "created_at">) => Promise<void>;
  addDairelerToplu: (daireler: Omit<Daire, "id" | "created_at">[]) => Promise<void>;
  updateDaire: (id: string, data: Partial<Daire>) => Promise<void>;
  removeDaire: (id: string) => Promise<void>;

  // SÖZLEŞMELER
  addSozlesme: (sozlesme: Omit<Sozlesme, "id" | "created_at">) => Promise<void>;
  updateSozlesme: (id: string, data: Partial<Sozlesme>) => Promise<void>;
  removeSozlesme: (id: string) => Promise<void>;
  updateSozlesmeDaireler: (sozlesme_id: string, daire_ids: string[]) => Promise<void>;

  // BELGELER
  addBelge: (belge: Omit<SantiyeBelge, "id" | "created_at">) => Promise<void>;
  removeBelge: (id: string) => Promise<void>;
  uploadBelgeDosyasi: (file: File, projeId: string) => Promise<string>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [kisiler, setKisiler] = useState<Kisi[]>([]);
  const [islemler, setIslemler] = useState<Islem[]>([]);
  const [projeler, setProjeler] = useState<Proje[]>([]);
  const [kisiProjeler, setKisiProjeler] = useState<KisiProje[]>([]);
  const [daireler, setDaireler] = useState<Daire[]>([]);
  const [sozlesmeler, setSozlesmeler] = useState<Sozlesme[]>([]);
  const [belgeler, setBelgeler] = useState<SantiyeBelge[]>([]);
  const [sozlesmeDaireler, setSozlesmeDaireler] = useState<SozlesmeDaire[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [
        { data: projelerData },
        { data: kisilerData },
        { data: islemlerData },
        { data: kisiProjelerData },
        { data: dairelerData },
        { data: sozlesmelerData },
        { data: belgelerData },
        { data: sozlesmeDairelerData },
      ] = await Promise.all([
        supabase.from("projeler").select("*").order("ad", { ascending: true }),
        supabase.from("kisiler").select("*").order("ad", { ascending: true }),
        supabase.from("islemler").select("*").order("created_at", { ascending: false }).order("tarih", { ascending: false, nullsFirst: false }),
        supabase.from("kisi_projeler").select("*"),
        supabase.from("daireler").select("*").order("blok", { ascending: true }).order("daire_no", { ascending: true }),
        supabase.from("sozlesmeler").select("*").order("created_at", { ascending: false }),
        supabase.from("santiye_belgeler").select("*").order("created_at", { ascending: false }),
        supabase.from("sozlesme_daireler").select("*"),
      ]);

      setProjeler(projelerData || []);
      setKisiler(kisilerData || []);
      setIslemler(islemlerData || []);
      setKisiProjeler(kisiProjelerData || []);
      setDaireler(dairelerData || []);
      setSozlesmeler(sozlesmelerData || []);
      setBelgeler(belgelerData || []);
      setSozlesmeDaireler(sozlesmeDairelerData || []);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    } finally {
      setLoading(false);
    }
  }

  // --- LOG FONKSİYONU ---
  const logIslem = async (islemTipi: string, tabloAdi: string, kayitId: string, eskiVeri: any, yeniVeri: any = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("sistem_loglari").insert({
        islem_tipi: islemTipi,
        tablo_adi: tabloAdi,
        kayit_id: kayitId,
        eski_veri: eskiVeri,
        yeni_veri: yeniVeri,
        kullanici_id: user.id,
        kullanici_email: user.email,
      });
    } catch (error) {
      console.error("Log kaydı oluşturulurken hata:", error);
    }
  };

  // --- ROLLBACK ---
  const rollbackLog = async (log: any) => {
    setLoading(true);
    try {
      const { tablo_adi, islem_tipi, eski_veri, kayit_id } = log;
      const cleanData = { ...eski_veri };
      if (islem_tipi === "SILME") {
        const { error } = await supabase.from(tablo_adi).insert(cleanData);
        if (error) throw error;
      } else if (islem_tipi === "GUNCELLEME") {
        const { error } = await supabase.from(tablo_adi).update(cleanData).eq("id", kayit_id);
        if (error) throw error;
      }
      await fetchData();
      alert("İşlem başarıyla geri alındı!");
    } catch (error: any) {
      console.error("Geri alma hatası:", error);
      alert("Bu işlem geri alınamadı: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- RESTORE ---
  const restoreData = async (backup: any) => {
    setLoading(true);
    try {
      if (backup.projeler?.length > 0) {
        const clean = backup.projeler.map(({ created_at, ...r }: any) => r);
        const { error } = await supabase.from("projeler").upsert(clean);
        if (error) throw error;
      }
      if (backup.kisiler?.length > 0) {
        const clean = backup.kisiler.map(({ created_at, ...r }: any) => r);
        const { error } = await supabase.from("kisiler").upsert(clean);
        if (error) throw error;
      }
      if (backup.islemler?.length > 0) {
        const clean = backup.islemler.map(({ created_at, ...r }: any) => r);
        const { error } = await supabase.from("islemler").upsert(clean);
        if (error) throw error;
      }
      if (backup.kisi_projeler?.length > 0) {
        const clean = backup.kisi_projeler.map(({ created_at, ...r }: any) => r);
        const { error } = await supabase.from("kisi_projeler").upsert(clean);
        if (error) throw error;
      }
      if (backup.daireler?.length > 0) {
        const clean = backup.daireler.map(({ created_at, ...r }: any) => r);
        const { error } = await supabase.from("daireler").upsert(clean);
        if (error) throw error;
      }
      if (backup.sozlesmeler?.length > 0) {
        const clean = backup.sozlesmeler.map(({ created_at, ...r }: any) => r);
        const { error } = await supabase.from("sozlesmeler").upsert(clean);
        if (error) throw error;
      }
      if (backup.belgeler?.length > 0) {
        const clean = backup.belgeler.map(({ created_at, ...r }: any) => r);
        const { error } = await supabase.from("santiye_belgeler").upsert(clean);
        if (error) throw error;
      }
      await fetchData();
      alert("Veriler başarıyla geri yüklendi!");
    } catch (error: any) {
      console.error("Geri yükleme hatası:", error);
      alert("Geri yükleme sırasında hata oluştu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // KİŞİLER CRUD
  // =====================
  const addKisi = async (kisi: Kisi) => {
    const { created_at, ...kisiData } = kisi;
    const { error } = await supabase.from("kisiler").insert(kisiData);
    if (error) throw error;
    setKisiler((prev) => [kisi, ...prev]);
  };

  const removeKisi = async (id: string) => {
    const eskiKisi = kisiler.find((k) => k.id === id);
    if (eskiKisi) await logIslem("SILME", "kisiler", id, eskiKisi);
    const { error } = await supabase.from("kisiler").delete().eq("id", id);
    if (error) throw error;
    setKisiler((prev) => prev.filter((k) => k.id !== id));
    setKisiProjeler((prev) => prev.filter((kp) => kp.kisi_id !== id));
  };

  const updateKisi = async (id: string, kisiData: Partial<Kisi>) => {
    const eskiKisi = kisiler.find((k) => k.id === id);
    if (eskiKisi) await logIslem("GUNCELLEME", "kisiler", id, eskiKisi, { ...eskiKisi, ...kisiData });
    const { error } = await supabase.from("kisiler").update(kisiData).eq("id", id);
    if (error) throw error;
    setKisiler((prev) => prev.map((k) => (k.id === id ? { ...k, ...kisiData } : k)));
  };

  const updateKisiProjeler = async (kisi_id: string, proje_ids: string[]) => {
    const { error: deleteError } = await supabase.from("kisi_projeler").delete().eq("kisi_id", kisi_id);
    if (deleteError) throw deleteError;
    if (proje_ids.length > 0) {
      const inserts = proje_ids.map((pid) => ({ kisi_id, proje_id: pid }));
      const { error: insertError } = await supabase.from("kisi_projeler").insert(inserts);
      if (insertError) throw insertError;
    }
    setKisiProjeler((prev) => {
      const filtered = prev.filter((kp) => kp.kisi_id !== kisi_id);
      const newLinks = proje_ids.map((pid) => ({ kisi_id, proje_id: pid }));
      return [...filtered, ...newLinks];
    });
  };

  // =====================
  // İŞLEMLER CRUD
  // =====================
  const addIslem = async (islem: Islem) => {
    const { data: { user } } = await supabase.auth.getUser();
    const userEmail = user?.email || "Sistem";
    const { created_at, ...islemData } = islem;
    const insertData = { ...islemData, kullanici_email: userEmail };
    const { data: insertedData, error } = await supabase.from("islemler").insert(insertData).select().single();
    if (error) throw error;
    setIslemler((prev) => [insertedData, ...prev]);
  };

  const updateIslem = async (islem: Islem) => {
    const eskiIslem = islemler.find((i) => i.id === islem.id);
    if (eskiIslem) await logIslem("GUNCELLEME", "islemler", islem.id, eskiIslem, islem);
    const { created_at, ...islemData } = islem;
    const { error } = await supabase.from("islemler").update(islemData).eq("id", islem.id);
    if (error) throw error;
    setIslemler((prev) => prev.map((i) => (i.id === islem.id ? islem : i)));
  };

  const removeIslem = async (id: string) => {
    const eskiIslem = islemler.find((i) => i.id === id);
    if (eskiIslem) await logIslem("SILME", "islemler", id, eskiIslem);
    const { error } = await supabase.from("islemler").delete().eq("id", id);
    if (error) throw error;
    setIslemler((prev) => prev.filter((i) => i.id !== id));
  };

  // =====================
  // PROJELER CRUD
  // =====================
  const addProje = async (ad: string) => {
    const newProje = { id: crypto.randomUUID(), ad };
    const { error } = await supabase.from("projeler").insert(newProje);
    if (error) throw error;
    setProjeler((prev) => [...prev, newProje]);
  };

  const updateProje = async (id: string, ad: string) => {
    const eskiProje = projeler.find((p) => p.id === id);
    if (eskiProje) await logIslem("GUNCELLEME", "projeler", id, eskiProje, { id, ad });
    const { error } = await supabase.from("projeler").update({ ad }).eq("id", id);
    if (error) throw error;
    setProjeler((prev) => prev.map((p) => (p.id === id ? { ...p, ad } : p)));
  };

  const removeProje = async (id: string) => {
    const hasTransactions = islemler.some((i) => i.proje_id === id);
    if (hasTransactions) throw new Error("Bu şantiyeye ait finansal kayıtlar var. Önce kayıtları silmelisiniz.");
    const eskiProje = projeler.find((p) => p.id === id);
    if (eskiProje) await logIslem("SILME", "projeler", id, eskiProje);
    const { error } = await supabase.from("projeler").delete().eq("id", id);
    if (error) throw error;
    setProjeler((prev) => prev.filter((p) => p.id !== id));
    setKisiProjeler((prev) => prev.filter((kp) => kp.proje_id !== id));
  };

  // =====================
  // DAİRELER CRUD
  // =====================
  const addDaire = async (daire: Omit<Daire, "id" | "created_at">) => {
    const newDaire = { ...daire, id: crypto.randomUUID() };
    const { error } = await supabase.from("daireler").insert(newDaire);
    if (error) throw error;
    setDaireler((prev) => [...prev, newDaire as Daire]);
  };

  const addDairelerToplu = async (yeniDaireler: Omit<Daire, "id" | "created_at">[]) => {
    const inserts = yeniDaireler.map((d) => ({ ...d, id: crypto.randomUUID() }));
    const { error } = await supabase.from("daireler").insert(inserts);
    if (error) throw error;
    setDaireler((prev) => [...prev, ...(inserts as Daire[])]);
  };

  const updateDaire = async (id: string, data: Partial<Daire>) => {
    const eskiDaire = daireler.find((d) => d.id === id);
    if (eskiDaire) await logIslem("GUNCELLEME", "daireler", id, eskiDaire, { ...eskiDaire, ...data });
    const { error } = await supabase.from("daireler").update(data).eq("id", id);
    if (error) throw error;
    setDaireler((prev) => prev.map((d) => (d.id === id ? { ...d, ...data } : d)));
  };

  const removeDaire = async (id: string) => {
    const eskiDaire = daireler.find((d) => d.id === id);
    if (eskiDaire) await logIslem("SILME", "daireler", id, eskiDaire);
    const { error } = await supabase.from("daireler").delete().eq("id", id);
    if (error) throw error;
    setDaireler((prev) => prev.filter((d) => d.id !== id));
    setSozlesmeDaireler((prev) => prev.filter((sd) => sd.daire_id !== id));
  };

  // =====================
  // SÖZLEŞMELER CRUD
  // =====================
  const addSozlesme = async (sozlesme: Omit<Sozlesme, "id" | "created_at">) => {
    const newSozlesme = { ...sozlesme, id: crypto.randomUUID() };
    const { error } = await supabase.from("sozlesmeler").insert(newSozlesme);
    if (error) throw error;
    setSozlesmeler((prev) => [newSozlesme as Sozlesme, ...prev]);
  };

  const updateSozlesme = async (id: string, data: Partial<Sozlesme>) => {
    const eskiSozlesme = sozlesmeler.find((s) => s.id === id);
    if (eskiSozlesme) await logIslem("GUNCELLEME", "sozlesmeler", id, eskiSozlesme, { ...eskiSozlesme, ...data });
    const { error } = await supabase.from("sozlesmeler").update(data).eq("id", id);
    if (error) throw error;
    setSozlesmeler((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  };

  const removeSozlesme = async (id: string) => {
    const eskiSozlesme = sozlesmeler.find((s) => s.id === id);
    if (eskiSozlesme) await logIslem("SILME", "sozlesmeler", id, eskiSozlesme);
    const { error } = await supabase.from("sozlesmeler").delete().eq("id", id);
    if (error) throw error;
    setSozlesmeler((prev) => prev.filter((s) => s.id !== id));
    setSozlesmeDaireler((prev) => prev.filter((sd) => sd.sozlesme_id !== id));
  };

  const updateSozlesmeDaireler = async (sozlesme_id: string, daire_ids: string[]) => {
    const { error: deleteError } = await supabase.from("sozlesme_daireler").delete().eq("sozlesme_id", sozlesme_id);
    if (deleteError) throw deleteError;
    if (daire_ids.length > 0) {
      const inserts = daire_ids.map((did) => ({ sozlesme_id, daire_id: did }));
      const { error: insertError } = await supabase.from("sozlesme_daireler").insert(inserts);
      if (insertError) throw insertError;
    }
    setSozlesmeDaireler((prev) => {
      const filtered = prev.filter((sd) => sd.sozlesme_id !== sozlesme_id);
      const newLinks = daire_ids.map((did) => ({ sozlesme_id, daire_id: did }));
      return [...filtered, ...newLinks];
    });
  };

  // =====================
  // BELGELER CRUD
  // =====================
  const addBelge = async (belge: Omit<SantiyeBelge, "id" | "created_at">) => {
    const newBelge = { ...belge, id: crypto.randomUUID() };
    const { error } = await supabase.from("santiye_belgeler").insert(newBelge);
    if (error) throw error;
    setBelgeler((prev) => [newBelge as SantiyeBelge, ...prev]);
  };

  const removeBelge = async (id: string) => {
    const belge = belgeler.find((b) => b.id === id);
    // Eğer Storage'da dosya varsa önce onu sil
    if (belge?.dosya_url) {
      const path = belge.dosya_url.split("/santiye-belgeler/")[1];
      if (path) {
        await supabase.storage.from("santiye-belgeler").remove([decodeURIComponent(path)]);
      }
    }
    const { error } = await supabase.from("santiye_belgeler").delete().eq("id", id);
    if (error) throw error;
    setBelgeler((prev) => prev.filter((b) => b.id !== id));
  };

  const uploadBelgeDosyasi = async (file: File, projeId: string): Promise<string> => {
    const { } = await supabase.auth.getUser();
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${projeId}/${timestamp}_${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("santiye-belgeler")
      .upload(path, file, { upsert: false });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("santiye-belgeler").getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <DataContext.Provider
      value={{
        kisiler, islemler, projeler, kisiProjeler,
        daireler, sozlesmeler, belgeler, sozlesmeDaireler,
        loading,
        restoreData, rollbackLog,
        addKisi, removeKisi, updateKisi, updateKisiProjeler,
        addIslem, updateIslem, removeIslem,
        addProje, updateProje, removeProje,
        addDaire, addDairelerToplu, updateDaire, removeDaire,
        addSozlesme, updateSozlesme, removeSozlesme, updateSozlesmeDaireler,
        addBelge, removeBelge, uploadBelgeDosyasi,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
}