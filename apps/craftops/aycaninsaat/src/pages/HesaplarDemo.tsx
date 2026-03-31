import { useMemo, useState } from "react";
import { Download, Search, PieChart, TrendingUp, TrendingDown, Building2, User, FileText, X, AlertTriangle, Save, CheckCircle, Info, CreditCard } from 'lucide-react';
import { CustomSelect } from "../components/CustomSelect";
import { useData, type Islem } from "../context/DataContext";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- YARDIMCI FORMAT FONKSİYONLARI ---
const formatDateDisplay = (dateStr: string | null) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
};

const getTypeLabel = (tip: string, is_bitiminde: any) => {
  switch (tip) {
    case 'tahsilat': return "TAHSİLAT";
    case 'odeme': return "ÖDEME";
    case 'odenecek': return "ÖDENECEK";
    case 'alacak': return "ALACAK";
    case 'cek': return is_bitiminde === 1 ? "ÇEK (ÖDENDİ)" : "ÇEK (VADELİ)";
    default: return tip.toUpperCase();
  }
};

const toAmount = (val: any) =>
  parseFloat(String(val).replace(/\./g, "").replace(",", ".")) || 0;

const formatTR = (val: any) =>
  toAmount(val).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const DOVIZ_SEMBOL: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€", ALTIN: "gr" };

const ISLEM_TIP_OPTIONS = [
  { value: "tahsilat", label: "Tahsilat (+)" },
  { value: "odeme", label: "Ödeme (-)" },
  { value: "cek", label: "Çek Çıkışı (Vadeli)" },
  { value: "odenecek", label: "Ödenecek (Borç)" },
  { value: "alacak", label: "Alacak" },
];

const DOVIZ_OPTIONS = [
  { value: "TRY", label: "TL" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "ALTIN", label: "ALTIN" },
];

export default function HesaplarDemo() {
  const { kisiler, islemler, projeler, kisiProjeler, updateIslem, removeIslem } = useData();
  
  const [seciliKisi, setSeciliKisi] = useState("");
  const [seciliProje, setSeciliProje] = useState("all");
  const [query, setQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const [editForm, setEditForm] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [infoModal, setInfoModal] = useState<Islem | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const kisiOptions = useMemo(
    () => kisiler
      .map(k => ({ value: k.id, label: k.ad }))
      .sort((a, b) => a.label.localeCompare(b.label, "tr")), 
    [kisiler]
  );

  const projeOptions = useMemo(() => {
    return [
      { value: "all", label: "TÜM ŞANTİYELER" },
      ...projeler.map((p) => ({ value: p.id, label: p.ad }))
    ];
  }, [projeler]);

  const editKisiOptions = useMemo(() => {
    if (!editForm?.proje_id) return [];
    const linkedKisiIds = kisiProjeler
      .filter(kp => kp.proje_id === editForm.proje_id)
      .map(kp => kp.kisi_id);

    return kisiler
      .filter(k => linkedKisiIds.includes(k.id))
      .map(k => ({ value: k.id, label: k.ad }))
      .sort((a, b) => a.label.localeCompare(b.label, "tr"));
  }, [kisiler, kisiProjeler, editForm?.proje_id]);

  const personTransactions = useMemo(() => {
    if (!seciliKisi) return [];
    let filtered = islemler.filter(h => h.kisi_id === seciliKisi);
    if (seciliProje !== "all") {
        filtered = filtered.filter(h => h.proje_id === seciliProje);
    }
    filtered.sort((a, b) => {
      if (!a.tarih) return 1;
      if (!b.tarih) return -1;
      return new Date(b.tarih).getTime() - new Date(a.tarih).getTime(); 
    });
    return filtered;
  }, [islemler, seciliKisi, seciliProje]);

  const filteredRows = useMemo(() => {
    const qText = query.trim().toLocaleLowerCase("tr");
    if (!qText) return personTransactions;
    return personTransactions.filter(r => {
      const projeAdi = projeler.find(p => p.id === r.proje_id)?.ad || "";
      return (
        (r.aciklama || "").toLocaleLowerCase("tr").includes(qText) ||
        (r.tarih || "").includes(qText) ||
        r.tip.includes(qText) ||
        projeAdi.toLocaleLowerCase("tr").includes(qText)
      );
    });
  }, [personTransactions, query, projeler]);

  // ÇOKLU DÖVİZ İÇİN CARİ HESAPLAMA MANTIĞI
  const cariOzet = useMemo(() => {
    const ozet: Record<string, { tahsilat: number, odeme: number, odenecek: number, alacak: number, net: number }> = {};
    
    filteredRows.forEach(h => {
      const dvz = h.doviz || "TRY";
      if (!ozet[dvz]) ozet[dvz] = { tahsilat: 0, odeme: 0, odenecek: 0, alacak: 0, net: 0 };
      
      const miktar = Number(h.tutar_raw ? h.tutar_raw : h.tutar);

      if (h.tip === "tahsilat") ozet[dvz].tahsilat += miktar;
      else if (h.tip === "odeme" || h.tip === "cek") ozet[dvz].odeme += miktar;
      else if (h.tip === "odenecek") ozet[dvz].odenecek += miktar;
      else if (h.tip === "alacak") ozet[dvz].alacak += miktar;
    });

    Object.keys(ozet).forEach(dvz => {
      ozet[dvz].net = (ozet[dvz].alacak - ozet[dvz].tahsilat) - (ozet[dvz].odenecek - ozet[dvz].odeme);
    });

    return ozet;
  }, [filteredRows]);

  // TÜM İŞLEMLERİN TL BAZLI DETAYLI GENEL TOPLAMI
  const genelToplamTL = useMemo(() => {
    let tahsilat = 0, odeme = 0, odenecek = 0, alacak = 0;
    
    filteredRows.forEach(h => {
      const miktarTL = Number(h.tutar || 0); // Veritabanındaki TL karşılığı

      if (h.tip === "tahsilat") tahsilat += miktarTL;
      else if (h.tip === "odeme" || h.tip === "cek") odeme += miktarTL;
      else if (h.tip === "odenecek") odenecek += miktarTL;
      else if (h.tip === "alacak") alacak += miktarTL;
    });

    const net = (alacak - tahsilat) - (odenecek - odeme);

    return { tahsilat, odeme, odenecek, alacak, net };
  }, [filteredRows]);

  const startEdit = (r: Islem) => {
    setEditForm({
      ...r,
      tarih: r.tarih || "",
      tutar: formatTR(r.tutar_raw ? r.tutar_raw : r.tutar),
      is_bitiminde: r.is_bitiminde === 1,
      proje_id: r.proje_id || "" 
    });
  };

  const saveEdit = async () => {
    try {
      if (!editForm) return;
      if (!editForm.kisi_id || !editForm.tip || !editForm.tutar) return alert("Eksik bilgi");
      if (!editForm.proje_id) return alert("Lütfen şantiye seçiniz.");

      const amountRaw = toAmount(editForm.tutar);
      let amountTL = amountRaw;

      // Eğer dövizliyse ve hesaplarda düzenleme yapılıyorsa, orijinal kuru bulup kullanıyoruz.
      if (editForm.doviz !== "TRY") {
        const originalIslem = islemler.find((i) => i.id === editForm.id);
        if (originalIslem && originalIslem.tutar_raw && originalIslem.tutar_raw > 0) {
          const originalKur = Number(originalIslem.tutar) / Number(originalIslem.tutar_raw);
          amountTL = amountRaw * originalKur;
        }
      }

      const updatedRow: Islem = {
        id: editForm.id,
        tarih: editForm.is_bitiminde && editForm.tip !== 'cek' ? null : editForm.tarih,
        tutar: amountTL,
        tutar_raw: amountRaw,
        tip: editForm.tip,
        is_bitiminde: editForm.is_bitiminde ? 1 : 0, 
        kisi_id: editForm.kisi_id,
        proje_id: editForm.proje_id, 
        aciklama: editForm.aciklama,
        doviz: editForm.doviz,
      };

      await updateIslem(updatedRow);
      setEditForm(null);

      setSuccessMessage("Kayıt başarıyla güncellendi.");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (error) {
      console.error("Güncelleme hatası:", error);
      alert("Güncelleme sırasında hata oluştu.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await removeIslem(deleteId);
      setDeleteId(null);
      setSuccessMessage("İşlem başarıyla silindi.");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Silme hatası:", error);
      alert("Silme işlemi başarısız.");
    }
  };

  // --- PDF OLUŞTURMA FONKSİYONU ---
  const handleExportPDF = async () => {
    if (!seciliKisi) return;
    setIsExporting(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      const kisiAdi = kisiler.find(k => k.id === seciliKisi)?.ad || "Bilinmeyen Kisi";
      const projeAdi = seciliProje === "all" ? "Genel (Tüm Şantiyeler)" : (projeler.find(p => p.id === seciliProje)?.ad || "");
      
      const bugun = new Date();
      const tarihStr = bugun.toLocaleDateString("tr-TR");

      const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
      const fontResponse = await fetch(fontUrl);
      if (!fontResponse.ok) throw new Error("Font yüklenemedi");
      const fontBuffer = await fontResponse.arrayBuffer();
      const fontBase64 = arrayBufferToBase64(fontBuffer);
      
      doc.addFileToVFS("Roboto-Regular.ttf", fontBase64);
      doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
      doc.setFont("Roboto"); 

      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0); 
      doc.text("AYCAN İNŞAAT", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50); 
      doc.text("CARİ HESAP EKSTRESİ", 14, 26);

      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      const dateText = `Rapor Tarihi: ${tarihStr}`;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, pageWidth - 14 - dateWidth, 20); 

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      doc.line(14, 32, pageWidth - 14, 32);

      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text("SAYIN:", 14, 42);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(kisiAdi.toUpperCase(), 14, 48);
      
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Şantiye: ${projeAdi}`, 14, 54);

      // PDF TABLO: Dövizleri ana değer olarak yazar
      const tableBody = filteredRows.map(r => {
        const rawVal = r.tutar_raw ? Number(r.tutar_raw) : Number(r.tutar);
        const dvz = r.doviz || "TRY";
        let tutarMetni = `${rawVal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ${DOVIZ_SEMBOL[dvz] || dvz}`;
        
        if (dvz !== "TRY") {
            tutarMetni += `\n(${Number(r.tutar).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL)`;
        }

        return [
          r.is_bitiminde && r.tip !== 'cek' ? "İş Bitimi" : formatDateDisplay(r.tarih),
          projeler.find(p => p.id === r.proje_id)?.ad || "—",
          getTypeLabel(r.tip, r.is_bitiminde),
          r.aciklama || "—",
          tutarMetni
        ];
      });

      autoTable(doc, {
        startY: 62,
        head: [['TARİH', 'ŞANTİYE', 'İŞLEM TİPİ', 'AÇIKLAMA', 'TUTAR']],
        body: tableBody,
        theme: 'plain', 
        styles: {
          font: "Roboto",
          fontSize: 8,
          cellPadding: 3,
          textColor: [0, 0, 0],
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0], 
          fontStyle: 'normal', 
          lineWidth: 0.1,
          lineColor: [150, 150, 150]
        },
        columnStyles: {
          0: { cellWidth: 25 }, 
          1: { cellWidth: 35 }, 
          2: { cellWidth: 30 }, 
          4: { halign: 'right', cellWidth: 35 } 
        },
        margin: { left: 14, right: 14 },
      });

      // @ts-ignore
      let finalY = doc.lastAutoTable.finalY + 15;
      
      const mevcutDovizler = Object.keys(cariOzet).filter(dvz => 
         cariOzet[dvz].tahsilat !== 0 || cariOzet[dvz].odeme !== 0 || 
         cariOzet[dvz].odenecek !== 0 || cariOzet[dvz].alacak !== 0 || cariOzet[dvz].net !== 0
      );

      // Eger alan kalmadıysa yeni sayfaya geç
      if (finalY + (mevcutDovizler.length * 40) > pageHeight) {
        doc.addPage();
        finalY = 20;
      }

      const margin = 14;
      const totalWidth = pageWidth - (margin * 2);

      // PDF İÇİNDE DÖVİZLİ ÖZET KARTLARI
      mevcutDovizler.forEach((dvz, index) => {
         const deg = cariOzet[dvz];
         const lineY = finalY + (index * 42);

         doc.setFontSize(10);
         doc.setTextColor(0, 0, 0);
         doc.text(`${dvz} HESAP ÖZETİ`, margin, lineY);
         
         const boxWidth = (totalWidth - 12) / 4;
         const drawMiniCard = (x: number, y: number, label: string, value: number) => {
            doc.setDrawColor(200, 200, 200);
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(x, y, boxWidth, 16, 1, 1, 'FD');
            doc.setFontSize(7);
            doc.setTextColor(100, 100, 100);
            doc.text(label, x + 3, y + 6);
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0); 
            doc.text(`${value.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ${DOVIZ_SEMBOL[dvz] || dvz}`, x + 3, y + 13);
         };

         drawMiniCard(margin, lineY + 4, "TAHSİLAT", deg.tahsilat);
         drawMiniCard(margin + boxWidth + 4, lineY + 4, "ÖDEME (+ ÇEK)", deg.odeme);
         drawMiniCard(margin + (boxWidth + 4) * 2, lineY + 4, "PLN. ÖDENECEK", deg.odenecek);
         drawMiniCard(margin + (boxWidth + 4) * 3, lineY + 4, "PLN. ALACAK", deg.alacak);

         doc.setFillColor(deg.net >= 0 ? 240 : 255, deg.net >= 0 ? 255 : 240, deg.net >= 0 ? 240 : 240); 
         doc.setDrawColor(200, 200, 200);
         doc.roundedRect(margin, lineY + 22, totalWidth, 14, 1, 1, 'FD');
         doc.setFontSize(8);
         doc.setTextColor(80, 80, 80);
         doc.text(`NET BAKİYE (${deg.net >= 0 ? 'Biz Alacaklıyız' : 'Biz Borçluyuz'})`, margin + 4, lineY + 30);
         doc.setFontSize(11);
         doc.setTextColor(deg.net >= 0 ? 0 : 200, deg.net >= 0 ? 100 : 0, 0); 
         const netStr = deg.net.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + ` ${DOVIZ_SEMBOL[dvz] || dvz}`;
         doc.text(netStr, pageWidth - margin - 4 - doc.getTextWidth(netStr), lineY + 30);
      });

      const safeKisiAdi = kisiAdi.replace(/ğ/g, 'g').replace(/Ğ/g, 'G').replace(/ü/g, 'u').replace(/Ü/g, 'U').replace(/ş/g, 's').replace(/Ş/g, 'S').replace(/ı/g, 'i').replace(/İ/g, 'I').replace(/ö/g, 'o').replace(/Ö/g, 'O').replace(/ç/g, 'c').replace(/Ç/g, 'C').replace(/ /g, '_');
      const fileName = `Aycan_Insaat_${safeKisiAdi}_Ekstre.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error("PDF hatası:", error);
      alert("PDF oluşturulamadı.");
    } finally {
      setIsExporting(false);
    }
  };

  function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  const mevcutDovizler = Object.keys(cariOzet).filter(dvz => 
    cariOzet[dvz].tahsilat !== 0 || cariOzet[dvz].odeme !== 0 || 
    cariOzet[dvz].odenecek !== 0 || cariOzet[dvz].alacak !== 0 || cariOzet[dvz].net !== 0
  );

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 relative">
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-light tracking-tight text-neutral-900">HESAPLAR</h1>
              <p className="text-neutral-500 mt-1 font-light">Cari Hesap Ekstreleri & Raporlar</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center">
              <PieChart className="text-white" size={28} strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* FİLTRE & SEÇİM */}
        <div className="bg-white p-8 border border-neutral-200 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-3">
              <CustomSelect
                label="KİŞİ / KURUM SEÇİMİ"
                value={seciliKisi}
                onChange={(val) => setSeciliKisi(val)}
                options={kisiOptions}
                placeholder="Seçiniz..."
                icon={User}
              />
            </div>
            
            <div className="md:col-span-3">
              <CustomSelect
                label="ŞANTİYE FİLTRESİ"
                value={seciliProje}
                onChange={(val) => setSeciliProje(val)}
                options={projeOptions}
                placeholder="Şantiye Seçiniz..."
                icon={Building2}
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-medium text-neutral-500 mb-3 tracking-wider">İŞLEM ARA</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full h-14 pl-12 pr-4 bg-white border border-neutral-300 text-neutral-900 outline-none focus:border-neutral-900 font-light placeholder:text-neutral-300 transition-colors"
                  placeholder="Açıklama veya tutar..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={!seciliKisi}
                />
                <Search className="absolute left-4 top-4 text-neutral-400" size={20} />
              </div>
            </div>

            <div className="md:col-span-2">
              <button
                onClick={handleExportPDF}
                disabled={!seciliKisi || isExporting}
                className="w-full h-14 flex items-center justify-center gap-2 bg-neutral-900 text-white font-light tracking-widest hover:bg-neutral-800 transition-colors disabled:bg-neutral-200 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <span className="animate-pulse">HAZIRLANIYOR...</span>
                ) : (
                  <>
                    <Download size={18} /> DIŞARI AKTAR
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* TABLO */}
        <div className="bg-white border border-neutral-200 shadow-sm">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left min-w-[1000px] lg:min-w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-medium text-neutral-500 tracking-wider whitespace-nowrap">TARİH</th>
                  <th className="px-6 py-4 text-xs font-medium text-neutral-500 tracking-wider whitespace-nowrap">ŞANTİYE</th>
                  <th className="px-6 py-4 text-xs font-medium text-neutral-500 tracking-wider whitespace-nowrap">İŞLEM TİPİ</th>
                  <th className="px-6 py-4 text-xs font-medium text-neutral-500 tracking-wider text-right whitespace-nowrap">TUTAR</th>
                  <th className="px-6 py-4 text-xs font-medium text-neutral-500 tracking-wider whitespace-nowrap">AÇIKLAMA</th>
                  <th className="px-6 py-4 text-center w-32 text-xs font-medium text-neutral-500 tracking-wider whitespace-nowrap">İŞLEM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredRows.map((r, i) => {
                   const rawVal = r.tutar_raw ? Number(r.tutar_raw) : Number(r.tutar);
                   const dvz = r.doviz || "TRY";
                   
                   return (
                  <tr key={i} className="hover:bg-neutral-50 group transition-colors">
                    <td className="px-6 py-5 font-light text-neutral-600 whitespace-nowrap">
                       {r.is_bitiminde && r.tip !== 'cek' ? "—" : formatDateDisplay(r.tarih)}
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                         {projeler.find(p => p.id === r.proje_id)?.ad || "GENEL"}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-neutral-200 bg-white text-neutral-600 text-[11px] font-medium uppercase tracking-wide">
                        {getTypeLabel(r.tip, r.is_bitiminde)}
                      </span>
                    </td>
                    {/* DÖVİZLİ GÖSTERİM (Tablo) */}
                    <td className="px-6 py-5 text-right font-mono text-neutral-900 whitespace-nowrap">
                      <div className="font-medium text-[15px]">
                        {rawVal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} {DOVIZ_SEMBOL[dvz] || dvz}
                      </div>
                      {dvz !== "TRY" && (
                        <div className="text-[10px] text-neutral-400 mt-0.5">
                          ({Number(r.tutar).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺)
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 font-light text-neutral-500 min-w-[180px]">
                      {r.aciklama || "—"}
                    </td>
                    <td className="px-6 py-5 text-center whitespace-nowrap">
                       <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setInfoModal(r)} title="Kayıt Bilgisi" className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-400 hover:text-blue-600 hover:border-blue-600 transition-colors">
                              <Info size={14} />
                          </button>
                          <button onClick={() => startEdit(r)} title="Düzenle" className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-400 hover:text-neutral-900 hover:border-neutral-900 transition-colors">
                              <FileText size={14} />
                          </button>
                          <button onClick={() => setDeleteId(r.id)} title="Sil" className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-400 hover:text-red-600 hover:border-red-600 transition-colors">
                              <X size={14} />
                          </button>
                       </div>
                    </td>
                  </tr>
                )})}
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-neutral-400 font-light italic">
                      {seciliKisi
                        ? "Bu şantiyede kişiye ait kayıt bulunamadı."
                        : "Lütfen yukarıdan bir kişi seçiniz."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* EKRAN ALTI ÖZET: Çoklu Döviz Destekli */}
          {seciliKisi && (
            <div className="bg-neutral-50 border-t border-neutral-200 p-6 flex flex-col gap-6">
              {mevcutDovizler.length === 0 && (
                <div className="text-sm text-neutral-500 font-light text-center py-4">
                  Bu kişinin henüz bir finansal özeti oluşmadı.
                </div>
              )}
              {mevcutDovizler.map(dvz => {
                const deg = cariOzet[dvz];
                return (
                  <div key={dvz} className="bg-white border border-neutral-200 p-5 grid grid-cols-2 lg:grid-cols-6 gap-6 items-center shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-neutral-900"></div>
                    <div className="col-span-2 lg:col-span-1 border-b lg:border-b-0 lg:border-r border-neutral-100 pb-4 lg:pb-0 lg:pr-4">
                       <span className="block text-2xl font-bold text-neutral-900">{dvz}</span>
                       <span className="text-xs text-neutral-400 tracking-widest font-light">HESAP ÖZETİ</span>
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-400 mb-1 tracking-wider uppercase font-bold">TAHSİLAT</div>
                      <div className="text-lg font-light text-green-600 truncate" title={deg.tahsilat.toString()}>
                        {deg.tahsilat.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} {DOVIZ_SEMBOL[dvz] || dvz}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-400 mb-1 tracking-wider uppercase font-bold">ÖDEME (+ ÇEK)</div>
                      <div className="text-lg font-light text-red-600 truncate" title={deg.odeme.toString()}>
                        {deg.odeme.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} {DOVIZ_SEMBOL[dvz] || dvz}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-400 mb-1 tracking-wider uppercase font-bold">PLN. ÖDENECEK</div>
                      <div className="text-lg font-light text-neutral-600 truncate" title={deg.odenecek.toString()}>
                        {deg.odenecek.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} {DOVIZ_SEMBOL[dvz] || dvz}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-400 mb-1 tracking-wider uppercase font-bold">PLN. ALACAK</div>
                      <div className="text-lg font-light text-neutral-600 truncate" title={deg.alacak.toString()}>
                        {deg.alacak.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} {DOVIZ_SEMBOL[dvz] || dvz}
                      </div>
                    </div>
                    <div className={`p-4 border ${deg.net >= 0 ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {deg.net >= 0 ? <TrendingUp size={14} className="text-green-500" /> : <TrendingDown size={14} className="text-red-500" />}
                        <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">NET BAKİYE</span>
                      </div>
                      <div className={`text-xl font-medium truncate ${deg.net >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {deg.net.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} {DOVIZ_SEMBOL[dvz] || dvz}
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-1">
                         {deg.net >= 0 ? "Biz Alacaklıyız" : "Biz Borçluyuz"}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* YENİ EKLENEN KISIM: DETAYLI GENEL TOPLAM (Sadece birden fazla döviz varsa görünür) */}
              {mevcutDovizler.length > 1 && (
                <div className="mt-2 bg-neutral-900 border border-neutral-800 p-5 grid grid-cols-2 lg:grid-cols-6 gap-6 items-center shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <div className="col-span-2 lg:col-span-1 border-b lg:border-b-0 lg:border-r border-neutral-700 pb-4 lg:pb-0 lg:pr-4">
                     <span className="block text-xl font-bold text-white tracking-wide">GENEL TOPLAM</span>
                     <span className="text-[10px] text-neutral-400 tracking-widest font-light mt-1 block">TÜM DÖVİZLERİN TL KARŞILIĞI</span>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-500 mb-1 tracking-wider uppercase font-bold">TAHSİLAT</div>
                    <div className="text-lg font-light text-green-400 truncate" title={genelToplamTL.tahsilat.toString()}>
                      {genelToplamTL.tahsilat.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-500 mb-1 tracking-wider uppercase font-bold">ÖDEME (+ ÇEK)</div>
                    <div className="text-lg font-light text-red-400 truncate" title={genelToplamTL.odeme.toString()}>
                      {genelToplamTL.odeme.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-500 mb-1 tracking-wider uppercase font-bold">PLN. ÖDENECEK</div>
                    <div className="text-lg font-light text-neutral-300 truncate" title={genelToplamTL.odenecek.toString()}>
                      {genelToplamTL.odenecek.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-500 mb-1 tracking-wider uppercase font-bold">PLN. ALACAK</div>
                    <div className="text-lg font-light text-neutral-300 truncate" title={genelToplamTL.alacak.toString()}>
                      {genelToplamTL.alacak.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                    </div>
                  </div>
                  <div className={`p-4 border ${genelToplamTL.net >= 0 ? "border-green-900/50 bg-green-900/20" : "border-red-900/50 bg-red-900/20"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {genelToplamTL.net >= 0 ? <TrendingUp size={14} className="text-green-400" /> : <TrendingDown size={14} className="text-red-400" />}
                      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">NET BAKİYE</span>
                    </div>
                    <div className={`text-xl font-medium truncate ${genelToplamTL.net >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {genelToplamTL.net.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-1">
                       {genelToplamTL.net >= 0 ? "Biz Alacaklıyız" : "Biz Borçluyuz"}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* DÜZENLEME MODALI */}
      {editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white border border-neutral-200 shadow-2xl w-full max-w-5xl overflow-hidden max-h-[90vh] overflow-y-auto">
             <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center"><FileText className="text-white" size={20} /></div>
                     <div><h2 className="text-xl font-light text-neutral-900 tracking-tight">KAYIT DÜZENLE</h2></div>
                 </div>
                 <button onClick={() => setEditForm(null)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-200 text-neutral-500 transition-colors"><X size={20} /></button>
             </div>
             <div className="p-8">
               <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                 
                 <div className="md:col-span-12 w-full">
                    <CustomSelect 
                      label="ŞANTİYE" 
                      value={editForm.proje_id} 
                      onChange={(val) => setEditForm({...editForm, proje_id: val, kisi_id: ""})} 
                      options={projeOptions.filter(p => p.value !== "all")} 
                      placeholder="Seç" 
                      icon={Building2} 
                    />
                 </div>

                 <div className="md:col-span-4 w-full">
                    <label className="block text-xs font-medium text-neutral-500 mb-3 tracking-wider">TARİH</label>
                    <input type="date" className="w-full h-14 px-4 bg-white border border-neutral-300 outline-none appearance-none text-neutral-900 font-light" value={editForm.tarih} onChange={(e) => setEditForm({...editForm, tarih: e.target.value})} disabled={editForm.is_bitiminde && editForm.tip !== 'cek'} />
                 </div>
                 
                 <div className="md:col-span-4 w-full">
                    <CustomSelect label="İŞLEM TİPİ" value={editForm.tip} onChange={(val) => setEditForm({...editForm, tip: val})} options={ISLEM_TIP_OPTIONS} placeholder="Seç" icon={CreditCard}/>
                 </div>

                 <div className="md:col-span-4 w-full">
                   <CustomSelect 
                     label="KİŞİ" 
                     value={editForm.kisi_id} 
                     onChange={(val) => setEditForm({...editForm, kisi_id: val})} 
                     options={editKisiOptions} 
                     placeholder={editForm.proje_id ? "Seç" : "Önce Şantiye Seçin"} 
                     icon={User} 
                   />
                 </div>

                 <div className="md:col-span-6 flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-neutral-500 mb-3 tracking-wider">TUTAR (Döviz Cinsinden)</label>
                      <input className="w-full h-14 px-4 border border-neutral-300 outline-none font-light" value={editForm.tutar} onChange={(e) => setEditForm({...editForm, tutar: e.target.value})} onBlur={() => setEditForm({...editForm, tutar: formatTR(editForm.tutar)})} />
                    </div>
                    <div className="w-32">
                        <CustomSelect label="DÖVİZ" value={editForm.doviz} onChange={(val) => setEditForm({...editForm, doviz: val})} options={DOVIZ_OPTIONS} placeholder="Seç" />
                    </div>
                 </div>

                 <div className="md:col-span-6">
                    <label className="block text-xs font-medium text-neutral-500 mb-3 tracking-wider">AÇIKLAMA</label>
                    <input className="w-full h-14 px-4 border border-neutral-300 outline-none font-light" value={editForm.aciklama} onChange={(e) => setEditForm({...editForm, aciklama: e.target.value})} />
                 </div>

               </div>
             </div>
             <div className="p-6 border-t border-neutral-100 bg-neutral-50 flex gap-4 justify-end">
                <button onClick={() => setEditForm(null)} className="px-8 py-3 bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-100 transition-colors">İPTAL</button>
                <button onClick={saveEdit} className="px-8 py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors flex items-center gap-2"><Save size={16} /> KAYDET</button>
             </div>
           </div>
        </div>
      )}

      {/* SİLME MODALI */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white border border-neutral-200 shadow-2xl w-full max-w-md p-0 overflow-hidden">
             <div className="bg-neutral-50 p-6 border-b border-neutral-100 text-center">
                <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4"><AlertTriangle className="text-red-600" size={24} /></div>
                <h3 className="text-lg font-light text-neutral-900 tracking-tight">EMİN MİSİNİZ?</h3>
                <h2 className="text-lg font-light text-neutral-400 tracking-tight">Bu işlem geri alınamaz.</h2>
             </div>
             <div className="flex p-4 gap-4">
               <button onClick={() => setDeleteId(null)} className="flex-1 py-3 bg-white border border-neutral-300 transition-colors hover:bg-neutral-50">VAZGEÇ</button>
               <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white hover:bg-red-700 transition-colors">SİL</button>
             </div>
           </div>
        </div>
      )}

      {/* KAYIT BİLGİSİ (INFO) MODALI */}
      {infoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white border border-neutral-200 shadow-2xl w-full max-w-md p-0 overflow-hidden relative">
             <button onClick={() => setInfoModal(null)} className="absolute top-4 right-4 text-blue-500 hover:text-blue-900 transition-colors"><X size={20} /></button>
             <div className="bg-blue-50 p-6 border-b border-blue-100 text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Info className="text-blue-600" size={24} />
                </div>
                <h3 className="text-lg font-light text-neutral-900 tracking-tight">KAYIT BİLGİSİ</h3>
             </div>
             <div className="p-6 space-y-4">
               <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                  <span className="text-xs font-bold text-neutral-400 tracking-wider">OLUŞTURULMA ZAMANI</span>
                  <span className="text-sm font-medium text-neutral-800">
                    {infoModal.created_at ? new Date(infoModal.created_at).toLocaleString('tr-TR') : 'Bilinmiyor'}
                  </span>
               </div>
               <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                  <span className="text-xs font-bold text-neutral-400 tracking-wider">İŞLEM YAPAN</span>
                  <span className="text-sm font-medium text-neutral-800">
                    {/* @ts-ignore */}
                    {infoModal.kullanici_email || 'Sistem / Anonim'}
                  </span>
               </div>
               <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                  <span className="text-xs font-bold text-neutral-400 tracking-wider">KAYIT ID</span>
                  <span className="text-xs font-mono text-neutral-500">{infoModal.id.substring(0, 13)}...</span>
               </div>
             </div>
             <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-end">
               <button onClick={() => setInfoModal(null)} className="px-6 py-2 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors text-sm font-light tracking-wide">KAPAT</button>
             </div>
           </div>
        </div>
      )}

      {/* DİNAMİK BİLDİRİM (TOAST) */}
      {showSuccess && (
        <div className="fixed bottom-6 right-6 z-[60] bg-neutral-900 text-white px-6 py-4 rounded shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
             <CheckCircle className="text-green-400" size={20} />
          </div>
          <div>
            <h4 className="text-sm font-medium tracking-wide">BAŞARILI</h4>
            <p className="text-xs text-neutral-400 font-light">{successMessage}</p>
          </div>
          <button onClick={() => setShowSuccess(false)} className="ml-2 text-neutral-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}