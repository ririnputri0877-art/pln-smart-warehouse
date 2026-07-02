import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { InventoryItem, JENIS_BARANG_LABELS, KONDISI_LABELS, TiangItem, KwhMeterItem, KabelItem, MaterialUmumItem } from '@/types';

// --- HELPER FUNCTIONS ---
const formatDateID = (date: Date): string => format(date, "d MMMM yyyy, HH:mm", { locale: id });

const getItemName = (item: InventoryItem): string => {
  switch (item.jenisBarang) {
    case 'tiang': return `Tiang ${(item as TiangItem).idTiang || ''}`;
    case 'kwh_meter': return `KWh Meter ${(item as KwhMeterItem).idMeter || ''}`;
    case 'kabel': return (item as KabelItem).description || 'Kabel';
    case 'material_umum': return (item as MaterialUmumItem).namaMaterial || 'Material';
    default: return '-';
  }
};

const getVolume = (item: InventoryItem): string => {
  if (item.jenisBarang === 'tiang') return String((item as TiangItem).volume || '-');
  if (item.jenisBarang === 'kabel') return String((item as KabelItem).length || '-');
  if (item.jenisBarang === 'material_umum') return String((item as MaterialUmumItem).jumlah || '-');
  if (item.jenisBarang === 'kwh_meter') return String((item as KwhMeterItem).jumlah || '-');
  return '-';
};

const getSatuan = (item: InventoryItem): string => {
  if (item.jenisBarang === 'material_umum') return (item as MaterialUmumItem).satuanMaterial || 'BH';
  if (item.jenisBarang === 'kabel') return 'M';
  return 'BH';
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = { pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak' };
  return labels[status] || status;
};

// --- FUNGSI EXPORT ---
export const exportToExcel = (items: InventoryItem[], filename: string = 'laporan'): void => {
  console.log("Fungsi Export Excel dipanggil");
};

export const exportSummaryToPDF = (items: InventoryItem[]): void => {
  console.log("Fungsi Summary belum diimplementasikan");
};

export const exportToPDF = (items: InventoryItem[], filename: string = 'laporan-pengembalian'): void => {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // 1. Logo (Pastikan file logo-pln.png ada di folder public proyekmu)
  try {
   // doc.addImage("/logo-pln.png", 'PNG', 15, 10, 20, 20);
  } catch (e) {
    console.warn("Logo tidak ditemukan, melanjutkan tanpa logo.");
  }

  // 2. Kop Surat (Rata Tengah)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('PT PLN (PERSERO)', pageWidth / 2, 15, { align: 'center' });
  doc.setFontSize(14);
  doc.text('UNIT INDUK DISTRIBUSI SUMATERA BARAT', pageWidth / 2, 21, { align: 'center' });
  doc.text('ULP TABING', pageWidth / 2, 27, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Alamat: Jl. Sapek Raya, Lubuk Buaya, Kec. Koto Tangah, Kota Padang, Sumatera Barat 25586', pageWidth / 2, 33, { align: 'center' });
  
  doc.setLineWidth(0.5);
  doc.line(14, 38, pageWidth - 14, 38);

  // 3. Judul & Teks Pengantar
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('LAPORAN PENDATAAN PENGEMBALIAN BARANG GUDANG', pageWidth / 2, 48, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const textPengantar = "Dengan ini dilaporkan data pengembalian material dari gudang ULP Tabing sebagaimana terlampir di bawah ini untuk dapat dipergunakan sebagaimana mestinya.";
  const lines = doc.splitTextToSize(textPengantar, pageWidth - 30);
  doc.text(lines, 15, 55);

  // 4. Tabel
  autoTable(doc, {
    startY: 65,
    head: [['No', 'Nama Material', 'Kategori', 'Jml', 'Sat', 'Kondisi', 'Status', 'Tanggal']],
    body: items.map((item, index) => [
      index + 1,
      getItemName(item),
      item.jenisBarang === 'material_umum' ? (item as MaterialUmumItem).kategoriMaterial || '-' : JENIS_BARANG_LABELS[item.jenisBarang],
      getVolume(item),
      getSatuan(item),
      KONDISI_LABELS[item.kondisi] || '-',
      getStatusLabel(item.status),
      formatDateID(item.createdAt),
    ]),
    theme: 'grid',
    styles: { lineColor: [0, 0, 0], textColor: [0, 0, 0], halign: 'center', fontSize: 9 },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.2, lineColor: [0,0,0] },
  });

  // 5. Tanda Tangan
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 150;
  doc.text('Padang, ' + format(new Date(), 'd MMMM yyyy', { locale: id }), pageWidth - 40, finalY, { align: 'center' });
  doc.text('Manager ULP Tabing,', pageWidth - 40, finalY + 7, { align: 'center' });
  doc.text('( ............................................. )', pageWidth - 40, finalY + 25, { align: 'center' });

  doc.save(`${filename}.pdf`);
};