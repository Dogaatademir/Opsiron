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

// YENİ: Şantiye - Kişi İlişki Tipi
export interface KisiProje {
  kisi_id: string;
  proje_id: string;
  created_at?: string;
}

interface DataContextType {
  kisiler: Kisi[];
  islemler: Islem[];
  projeler: Proje[];
  kisiProjeler: KisiProje[]; // YENİ
  loading: boolean;
  
  // YEDEK YÜKLEME VE LOG İŞLEMLERİ
  restoreData: (data: any) => Promise<void>;
  rollbackLog: (log: any) => Promise<void>;
  
  // --- CRUD METHODLARI ---
  addKisi: (kisi: Kisi) => Promise<void>;
  removeKisi: (id: string) => Promise<void>;
  updateKisi: (id: string, data: Partial<Kisi>) => Promise<void>; // YENİ EKLENDİ
  
  // YENİ: Kişi - Şantiye İlişkilerini Güncelleme
  updateKisiProjeler: (kisi_id: string, proje_ids: string[]) => Promise<void>;
  
  addIslem: (islem: Islem) => Promise<void>;
  updateIslem: (islem: Islem) => Promise<void>;
  removeIslem: (id: string) => Promise<void>;

  addProje: (ad: string) => Promise<void>;
  updateProje: (id: string, ad: string) => Promise<void>;
  removeProje: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [kisiler, setKisiler] = useState<Kisi[]>([]);
  const [islemler, setIslemler] = useState<Islem[]>([]);
  const [projeler, setProjeler] = useState<Proje[]>([]);
  const [kisiProjeler, setKisiProjeler] = useState<KisiProje[]>([]); // YENİ STATE
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: projelerData } = await supabase.from("projeler").select("*").order("ad", { ascending: true });
      const { data: kisilerData } = await supabase.from("kisiler").select("*").order("ad", { ascending: true });
      const { data: islemlerData } = await supabase.from("islemler").select("*").order("created_at", { ascending: false }).order("tarih", { ascending: false, nullsFirst: false });
      const { data: kisiProjelerData } = await supabase.from("kisi_projeler").select("*"); // YENİ VERİ ÇEKİMİ

      setProjeler(projelerData || []);
      setKisiler(kisilerData || []);
      setIslemler(islemlerData || []);
      setKisiProjeler(kisiProjelerData || []);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    } finally {
      setLoading(false);
    }
  }

  // --- YARDIMCI LOG FONKSİYONU ---
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
        kullanici_email: user.email
      });
    } catch (error) {
      console.error("Log kaydı oluşturulurken hata:", error);
    }
  };

  // --- LOG GERİ ALMA (ROLLBACK) ---
  const rollbackLog = async (log: any) => {
    setLoading(true);
    try {
      const { tablo_adi, islem_tipi, eski_veri, kayit_id } = log;
      const cleanData = { ...eski_veri };

      if (islem_tipi === 'SILME') {
        const { error } = await supabase.from(tablo_adi).insert(cleanData);
        if (error) throw error;
      } else if (islem_tipi === 'GUNCELLEME') {
        const { error } = await supabase.from(tablo_adi).update(cleanData).eq('id', kayit_id);
        if (error) throw error;
      }

      await fetchData();
      alert("İşlem başarıyla geri alındı!");
      
    } catch (error: any) {
      console.error("Geri alma hatası:", error);
      alert("Bu işlem geri alınamadı. (Kayıt zaten var olabilir veya bir şantiyeye/kişiye bağlı olabilir): " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- YEDEK YÜKLEME (RESTORE) ---
  const restoreData = async (backup: any) => {
    setLoading(true);
    try {
      if (backup.projeler && backup.projeler.length > 0) {
        const cleanProjeler = backup.projeler.map(({ created_at, ...rest }: any) => rest);
        const { error: pError } = await supabase.from("projeler").upsert(cleanProjeler);
        if (pError) throw pError;
      }

      if (backup.kisiler && backup.kisiler.length > 0) {
        const cleanKisiler = backup.kisiler.map(({ created_at, ...rest }: any) => rest);
        const { error: kError } = await supabase.from("kisiler").upsert(cleanKisiler);
        if (kError) throw kError;
      }

      if (backup.islemler && backup.islemler.length > 0) {
        const cleanIslemler = backup.islemler.map(({ created_at, ...rest }: any) => rest);
        const { error: iError } = await supabase.from("islemler").upsert(cleanIslemler);
        if (iError) throw iError;
      }

      // YENİ: İlişkileri de yedekten dön
      if (backup.kisi_projeler && backup.kisi_projeler.length > 0) {
         const cleanKisiProjeler = backup.kisi_projeler.map(({ created_at, ...rest }: any) => rest);
         const { error: kpError } = await supabase.from("kisi_projeler").upsert(cleanKisiProjeler);
         if (kpError) throw kpError;
      }

      await fetchData();
      alert("Veriler başarıyla veritabanına geri yüklendi!");

    } catch (error: any) {
      console.error("Geri yükleme hatası:", error);
      alert("Geri yükleme sırasında hata oluştu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- KİŞİLER CRUD ---
  const addKisi = async (kisi: Kisi) => {
    const { created_at, ...kisiData } = kisi; 
    const { error } = await supabase.from("kisiler").insert(kisiData);
    if (error) throw error;
    setKisiler((prev) => [kisi, ...prev]);
  };

  const removeKisi = async (id: string) => {
    const eskiKisi = kisiler.find(k => k.id === id);
    if (eskiKisi) {
      await logIslem("SILME", "kisiler", id, eskiKisi);
    }

    const { error } = await supabase.from("kisiler").delete().eq("id", id);
    if (error) throw error;
    
    // Local state'den kişiyi ve bağlı olduğu şantiye ilişkilerini temizle
    setKisiler((prev) => prev.filter((k) => k.id !== id));
    setKisiProjeler((prev) => prev.filter((kp) => kp.kisi_id !== id));
  };

  // YENİ EKLENEN UPDATE KİŞİ FONKSİYONU
  const updateKisi = async (id: string, kisiData: Partial<Kisi>) => {
    const eskiKisi = kisiler.find(k => k.id === id);
    if (eskiKisi) {
      await logIslem("GUNCELLEME", "kisiler", id, eskiKisi, { ...eskiKisi, ...kisiData });
    }

    const { error } = await supabase.from("kisiler").update(kisiData).eq("id", id);
    if (error) throw error;
    
    setKisiler((prev) => prev.map((k) => (k.id === id ? { ...k, ...kisiData } : k)));
  };

  // KİŞİ - ŞANTİYE İLİŞKİLERİNİ GÜNCELLEME
  const updateKisiProjeler = async (kisi_id: string, proje_ids: string[]) => {
    // 1. Önce bu kişiye ait eski bağları sil
    const { error: deleteError } = await supabase
      .from("kisi_projeler")
      .delete()
      .eq("kisi_id", kisi_id);
      
    if (deleteError) throw deleteError;

    // 2. Eğer yeni seçilen şantiyeler varsa onları ekle
    if (proje_ids.length > 0) {
      const inserts = proje_ids.map(pid => ({ kisi_id, proje_id: pid }));
      const { error: insertError } = await supabase
        .from("kisi_projeler")
        .insert(inserts);
        
      if (insertError) throw insertError;
    }

    // 3. Local state'i güncelle (Sayfa yenilemeden arayüze yansıması için)
    setKisiProjeler(prev => {
      const filtered = prev.filter(kp => kp.kisi_id !== kisi_id);
      const newLinks = proje_ids.map(pid => ({ kisi_id, proje_id: pid }));
      return [...filtered, ...newLinks];
    });
  };

  // --- İŞLEMLER CRUD ---
  const addIslem = async (islem: Islem) => {
    const { data: { user } } = await supabase.auth.getUser();
    const userEmail = user?.email || "Sistem";

    const { created_at, ...islemData } = islem;
    const insertData = { ...islemData, kullanici_email: userEmail };

    const { data: insertedData, error } = await supabase
      .from("islemler")
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    setIslemler((prev) => [insertedData, ...prev]);
  };

  const updateIslem = async (islem: Islem) => {
    const eskiIslem = islemler.find(i => i.id === islem.id);
    if (eskiIslem) {
      await logIslem("GUNCELLEME", "islemler", islem.id, eskiIslem, islem);
    }

    const { created_at, ...islemData } = islem;
    const { error } = await supabase.from("islemler").update(islemData).eq("id", islem.id);
    if (error) throw error;
    setIslemler((prev) => prev.map((i) => (i.id === islem.id ? islem : i)));
  };

  const removeIslem = async (id: string) => {
    const eskiIslem = islemler.find(i => i.id === id);
    if (eskiIslem) {
      await logIslem("SILME", "islemler", id, eskiIslem);
    }

    const { error } = await supabase.from("islemler").delete().eq("id", id);
    if (error) throw error;
    setIslemler((prev) => prev.filter((i) => i.id !== id));
  };

  // --- PROJELER CRUD ---
  const addProje = async (ad: string) => {
    const newProje = { id: crypto.randomUUID(), ad };
    const { error } = await supabase.from("projeler").insert({ id: newProje.id, ad: newProje.ad });
    if (error) throw error;
    setProjeler((prev) => [...prev, newProje]);
  };

  const updateProje = async (id: string, ad: string) => {
    const eskiProje = projeler.find(p => p.id === id);
    if (eskiProje) {
      await logIslem("GUNCELLEME", "projeler", id, eskiProje, { id, ad });
    }

    const { error } = await supabase.from("projeler").update({ ad }).eq("id", id);
    if (error) throw error;
    setProjeler((prev) => prev.map(p => p.id === id ? { ...p, ad } : p));
  };

  const removeProje = async (id: string) => {
    const hasTransactions = islemler.some(i => i.proje_id === id);
    if (hasTransactions) {
      throw new Error("Bu şantiyeye ait finansal kayıtlar var. Önce kayıtları silmelisiniz.");
    }

    const eskiProje = projeler.find(p => p.id === id);
    if (eskiProje) {
      await logIslem("SILME", "projeler", id, eskiProje);
    }

    const { error } = await supabase.from("projeler").delete().eq("id", id);
    if (error) throw error;
    
    // Local state'den şantiyeyi ve bağlı olduğu ilişkileri temizle
    setProjeler((prev) => prev.filter(p => p.id !== id));
    setKisiProjeler((prev) => prev.filter((kp) => kp.proje_id !== id));
  };

  return (
    <DataContext.Provider
      value={{ 
        kisiler, islemler, projeler, kisiProjeler, loading,
        restoreData, rollbackLog,
        addKisi, removeKisi, updateKisi, updateKisiProjeler, // updateKisi BURAYA DA EKLENDİ
        addIslem, updateIslem, removeIslem,
        addProje, updateProje, removeProje
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