import { useMemo, useState } from "react";
import { Download, Search, PieChart, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { CustomSelect } from "../components/CustomSelect";
import { useData } from "../context/DataContext";
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

export default function HesaplarDemo() {
  // Projeler verisini de çektik
  const { kisiler, islemler, projeler } = useData();
  
  const [seciliKisi, setSeciliKisi] = useState("");
  const [query, setQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // --- KİŞİ LİSTESİ ---
  const kisiOptions = useMemo(
    () => kisiler
      .map(k => ({ value: k.id, label: k.ad }))
      .sort((a, b) => a.label.localeCompare(b.label, "tr")), 
    [kisiler]
  );

  const personTransactions = useMemo(() => {
    if (!seciliKisi) return [];
    return islemler.filter(h => h.kisi_id === seciliKisi);
  }, [islemler, seciliKisi]);

  const filteredRows = useMemo(() => {
    const qText = query.trim().toLocaleLowerCase("tr");
    if (!qText) return personTransactions;
    
    return personTransactions.filter(r => {
      // Proje ismini de aramaya dahil et
      const projeAdi = projeler.find(p => p.id === r.proje_id)?.ad || "";
      
      return (
        (r.aciklama || "").toLocaleLowerCase("tr").includes(qText) ||
        (r.tarih || "").includes(qText) ||
        r.tip.includes(qText) ||
        projeAdi.toLocaleLowerCase("tr").includes(qText)
      );
    });
  }, [personTransactions, query, projeler]);

  // Toplamları Hesapla
  const toplam = useMemo(() => {
    const odeme = filteredRows
      .filter(h => h.tip === "odeme" || h.tip === "cek")
      .reduce((s, h) => s + Number(h.tutar || 0), 0);

    const tahsilat = filteredRows
      .filter(h => h.tip === "tahsilat")
      .reduce((s, h) => s + Number(h.tutar || 0), 0);
      
    const odenecek = filteredRows
      .filter(h => h.tip === "odenecek")
      .reduce((s, h) => s + Number(h.tutar || 0), 0);
      
    const alacak = filteredRows
      .filter(h => h.tip === "alacak")
      .reduce((s, h) => s + Number(h.tutar || 0), 0);

    const net = (alacak - tahsilat) - (odenecek - odeme);

    return { tahsilat, odeme, odenecek, alacak, net };
  }, [filteredRows]);

  // --- PDF OLUŞTURMA FONKSİYONU ---
  const handleExportPDF = async () => {
    if (!seciliKisi) return;
    setIsExporting(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      const kisiAdi = kisiler.find(k => k.id === seciliKisi)?.ad || "Bilinmeyen Kisi";
      const bugun = new Date();
      const tarihStr = bugun.toLocaleDateString("tr-TR");

      // 1. Türkçe Font Yükleme (Roboto)
      const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
      const fontResponse = await fetch(fontUrl);
      if (!fontResponse.ok) throw new Error("Font yüklenemedi");
      const fontBuffer = await fontResponse.arrayBuffer();
      const fontBase64 = arrayBufferToBase64(fontBuffer);
      
      doc.addFileToVFS("Roboto-Regular.ttf", fontBase64);
      doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
      doc.setFont("Roboto"); 

      // --- TASARIM BAŞLANGICI ---
      
      // 2. Üst Bilgi (Header)
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0); 
      doc.text("AYCAN İNŞAAT", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50); 
      doc.text("CARİ HESAP EKSTRESİ", 14, 26);

      // Sağ üst tarih
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      const dateText = `Rapor Tarihi: ${tarihStr}`;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, pageWidth - 14 - dateWidth, 20); 

      // Ayırıcı çizgi
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      doc.line(14, 32, pageWidth - 14, 32);

      // 3. Müşteri Bilgisi
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text("SAYIN:", 14, 42);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(kisiAdi.toUpperCase(), 14, 48);

      // 4. Tablo Hazırlığı
      const tableBody = filteredRows.map(r => [
        r.is_bitiminde && r.tip !== 'cek' ? "İş Bitimi" : formatDateDisplay(r.tarih),
        projeler.find(p => p.id === r.proje_id)?.ad || "—", // Şantiye Bilgisi
        getTypeLabel(r.tip, r.is_bitiminde),
        r.aciklama || "—",
        r.tutar?.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " TL"
      ]);

      autoTable(doc, {
        startY: 55,
        head: [['TARİH', 'ŞANTİYE', 'İŞLEM TİPİ', 'AÇIKLAMA', 'TUTAR']], // Başlık Eklendi
        body: tableBody,
        theme: 'plain', 
        styles: {
          font: "Roboto",
          fontSize: 8, // Fontu bir tık küçülttüm sığması için
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
          1: { cellWidth: 35 }, // Şantiye genişliği
          2: { cellWidth: 30 }, 
          4: { halign: 'right', cellWidth: 35 } // Tutar
        },
        margin: { left: 14, right: 14 },
      });

      // 5. Alt Toplamlar
      // @ts-ignore
      let finalY = doc.lastAutoTable.finalY + 15;
      
      if (finalY + 50 > pageHeight) {
        doc.addPage();
        finalY = 20;
      }

      const margin = 14;
      const totalWidth = pageWidth - (margin * 2);
      const gap = 4;
      const boxWidth = (totalWidth - (gap * 3)) / 4;
      const boxHeight = 22;

      const drawCard = (x: number, y: number, label: string, value: number) => {
        doc.setDrawColor(180, 180, 180);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(x, y, boxWidth, boxHeight, 1, 1, 'FD');

        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text(label, x + 4, y + 8);

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0); 
        const valStr = value.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " TL";
        doc.text(valStr, x + 4, y + 17);
      };

      drawCard(margin, finalY, "TAHSİLAT", toplam.tahsilat);
      drawCard(margin + boxWidth + gap, finalY, "ÖDEME (+ ÇEK)", toplam.odeme);
      drawCard(margin + (boxWidth + gap) * 2, finalY, "PLN. ÖDENECEK", toplam.odenecek);
      drawCard(margin + (boxWidth + gap) * 3, finalY, "PLN. ALACAK", toplam.alacak);

      // Net Bakiye Kutusu
      const netY = finalY + boxHeight + 6;
      const netHeight = 28;
      
      doc.setFillColor(250, 250, 250); 
      doc.setDrawColor(0, 0, 0); 
      doc.roundedRect(margin, netY, totalWidth, netHeight, 1, 1, 'FD');

      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text("GENEL NET BAKİYE", margin + 6, netY + 10);

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0); 
      const netStr = toplam.net.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " TL";
      doc.text(netStr, margin + 6, netY + 22);

      // 6. Dosyayı Kaydet
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

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* HEADER */}
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
        <div className="bg-white p-8 border border-neutral-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-4">
              <CustomSelect
                label="KİŞİ / KURUM SEÇİMİ"
                value={seciliKisi}
                onChange={(val) => setSeciliKisi(val)}
                options={kisiOptions}
                placeholder="Seçiniz..."
                icon={Filter}
              />
            </div>

            <div className="md:col-span-6">
              <label className="block text-xs font-medium text-neutral-500 mb-3 tracking-wider">İŞLEM ARA</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full h-14 pl-12 pr-4 bg-white border border-neutral-300 text-neutral-900 outline-none focus:border-neutral-900 font-light placeholder:text-neutral-300 transition-colors"
                  placeholder="Açıklama, şantiye veya tutar..."
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

        {/* TABLO (ÖNİZLEME) */}
        <div className="bg-white border border-neutral-200">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-medium text-neutral-500 tracking-wider whitespace-nowrap">TARİH</th>
                  <th className="px-6 py-4 text-xs font-medium text-neutral-500 tracking-wider whitespace-nowrap">ŞANTİYE</th>
                  <th className="px-6 py-4 text-xs font-medium text-neutral-500 tracking-wider whitespace-nowrap">İŞLEM TİPİ</th>
                  <th className="px-6 py-4 text-xs font-medium text-neutral-500 tracking-wider text-right whitespace-nowrap">TUTAR (TL)</th>
                  <th className="px-6 py-4 text-xs font-medium text-neutral-500 tracking-wider whitespace-nowrap">AÇIKLAMA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredRows.map((r, i) => (
                  <tr key={i} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 font-light text-neutral-600 whitespace-nowrap">
                       {r.is_bitiminde && r.tip !== 'cek' ? "—" : formatDateDisplay(r.tarih)}
                    </td>
                    {/* YENİ SÜTUN: ŞANTİYE */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                         {projeler.find(p => p.id === r.proje_id)?.ad || "GENEL"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-neutral-200 bg-white text-neutral-600 text-xs font-medium uppercase tracking-wide">
                        {getTypeLabel(r.tip, r.is_bitiminde)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-neutral-900 whitespace-nowrap">
                      {r.tutar?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                      {r.doviz !== "TRY" && <span className="text-xs text-neutral-400 ml-1">({r.doviz})</span>}
                    </td>
                    <td
                      className="px-6 py-4 font-light text-neutral-500 truncate max-w-xs"
                      title={r.aciklama || ""}
                    >
                      {r.aciklama || "—"}
                    </td>
                  </tr>
                ))}
                {filteredRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={5} // Colspan 5'e çıkarıldı
                      className="p-12 text-center text-neutral-400 font-light italic"
                    >
                      {seciliKisi
                        ? "Kayıt bulunamadı."
                        : "Lütfen yukarıdan bir kişi seçiniz."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* EKRAN ALTI ÖZET (SADECE EKRANDA GÖRÜNÜR) */}
          {seciliKisi && (
            <div className="bg-neutral-50 border-t border-neutral-200 p-6 grid grid-cols-2 lg:grid-cols-5 gap-6">
              <div>
                <div className="text-xs text-neutral-400 mb-1 tracking-wider uppercase">TAHSİLAT</div>
                <div className="text-lg font-light text-green-600">
                  {toplam.tahsilat.toLocaleString("tr-TR")} ₺
                </div>
              </div>
              <div>
                <div className="text-xs text-neutral-400 mb-1 tracking-wider uppercase">ÖDEME (+ ÇEK)</div>
                <div className="text-lg font-light text-red-600">
                  {toplam.odeme.toLocaleString("tr-TR")} ₺
                </div>
              </div>
              <div>
                <div className="text-xs text-neutral-400 mb-1 tracking-wider uppercase">
                  PLN. ÖDENECEK
                </div>
                <div className="text-lg font-light text-neutral-600">
                  {toplam.odenecek.toLocaleString("tr-TR")} ₺
                </div>
              </div>
              <div>
                <div className="text-xs text-neutral-400 mb-1 tracking-wider uppercase">
                  PLN. ALACAK
                </div>
                <div className="text-lg font-light text-neutral-600">
                  {toplam.alacak.toLocaleString("tr-TR")} ₺
                </div>
              </div>
              <div className="col-span-2 lg:col-span-1 bg-white p-4 border border-neutral-200">
                <div className="flex items-center gap-2 mb-2">
                  {toplam.net >= 0 ? (
                    <TrendingUp size={16} className="text-green-500" />
                  ) : (
                    <TrendingDown size={16} className="text-red-500" />
                  )}
                  <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
                    NET BAKİYE
                  </span>
                </div>
                <div
                  className={`text-2xl font-light ${
                    toplam.net >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {toplam.net.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  ₺
                </div>
                <div className="text-[10px] text-neutral-400 mt-1">
                   {toplam.net >= 0 ? "Biz Alacaklıyız" : "Biz Borçluyuz"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}