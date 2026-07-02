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
  
  // 1. Logo PLN
  const LOGO_PLN_BASE64 = "data:image/png;base64,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";
  
  doc.addImage(LOGO_PLN_BASE64, 'PNG', 15, 10, 20, 20);

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

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('LAPORAN PENDATAAN PENGEMBALIAN BARANG GUDANG', pageWidth / 2, 48, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const textPengantar = "Dengan ini dilaporkan data pengembalian material dari gudang ULP Tabing sebagaimana terlampir di bawah ini untuk dapat dipergunakan sebagaimana mestinya.";
  const lines = doc.splitTextToSize(textPengantar, pageWidth - 30);
  doc.text(lines, 15, 55);

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

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.text('Padang, ' + format(new Date(), 'd MMMM yyyy', { locale: id }), pageWidth - 40, finalY, { align: 'center' });
  doc.text('Manager ULP Tabing,', pageWidth - 40, finalY + 7, { align: 'center' });
  doc.text('( ............................................. )', pageWidth - 40, finalY + 25, { align: 'center' });

  doc.save(`${filename}.pdf`);
};