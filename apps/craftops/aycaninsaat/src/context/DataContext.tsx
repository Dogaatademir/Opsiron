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
}

interface DataContextType {
  kisiler: Kisi[];
  islemler: Islem[];
  projeler: Proje[];
  loading: boolean;
  
  // YEDEK YÜKLEME FONKSİYONU (DB YAZAR)
  restoreData: (data: any) => Promise<void>;
  
  // --- CRUD METHODLARI ---
  addKisi: (kisi: Kisi) => Promise<void>;
  removeKisi: (id: string) => Promise<void>;
  
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

      setProjeler(projelerData || []);
      setKisiler(kisilerData || []);
      setIslemler(islemlerData || []);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    } finally {
      setLoading(false);
    }
  }

  // --- YEDEK YÜKLEME (RESTORE) ---
  const restoreData = async (backup: any) => {
    setLoading(true);
    try {
      // 1. Önce PROJELER (Foreign Key Bağımlılığı için en üstte olmalı)
      if (backup.projeler && backup.projeler.length > 0) {
        // created_at gibi sistem alanlarını temizleyip upsert yapıyoruz
        const cleanProjeler = backup.projeler.map(({ created_at, ...rest }: any) => rest);
        const { error: pError } = await supabase.from("projeler").upsert(cleanProjeler);
        if (pError) throw pError;
      }

      // 2. Sonra KİŞİLER
      if (backup.kisiler && backup.kisiler.length > 0) {
        const cleanKisiler = backup.kisiler.map(({ created_at, ...rest }: any) => rest);
        const { error: kError } = await supabase.from("kisiler").upsert(cleanKisiler);
        if (kError) throw kError;
      }

      // 3. En Son İŞLEMLER (Çünkü Proje ve Kişi ID'lerine bağlı)
      if (backup.islemler && backup.islemler.length > 0) {
        const cleanIslemler = backup.islemler.map(({ created_at, ...rest }: any) => rest);
        const { error: iError } = await supabase.from("islemler").upsert(cleanIslemler);
        if (iError) throw iError;
      }

      // 4. Verileri tekrar çekerek arayüzü güncelle
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
    const { error } = await supabase.from("kisiler").delete().eq("id", id);
    if (error) throw error;
    setKisiler((prev) => prev.filter((k) => k.id !== id));
  };

  // --- İŞLEMLER CRUD ---
  const addIslem = async (islem: Islem) => {
    const { created_at, ...islemData } = islem;
    const { error } = await supabase.from("islemler").insert(islemData);
    if (error) throw error;
    setIslemler((prev) => [islem, ...prev]);
  };

  const updateIslem = async (islem: Islem) => {
    const { created_at, ...islemData } = islem;
    const { error } = await supabase.from("islemler").update(islemData).eq("id", islem.id);
    if (error) throw error;
    setIslemler((prev) => prev.map((i) => (i.id === islem.id ? islem : i)));
  };

  const removeIslem = async (id: string) => {
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
    const { error } = await supabase.from("projeler").update({ ad }).eq("id", id);
    if (error) throw error;
    setProjeler((prev) => prev.map(p => p.id === id ? { ...p, ad } : p));
  };

  const removeProje = async (id: string) => {
    const hasTransactions = islemler.some(i => i.proje_id === id);
    if (hasTransactions) {
      throw new Error("Bu şantiyeye ait finansal kayıtlar var. Önce kayıtları silmelisiniz.");
    }

    const { error } = await supabase.from("projeler").delete().eq("id", id);
    if (error) throw error;
    setProjeler((prev) => prev.filter(p => p.id !== id));
  };

  return (
    <DataContext.Provider
      value={{ 
        kisiler, islemler, projeler, loading,
        restoreData, // Yeni fonksiyon
        addKisi, removeKisi, 
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