import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InventoryItem, JENIS_BARANG_LABELS, KONDISI_LABELS, TiangItem, KwhMeterItem, KabelItem, MaterialUmumItem } from '@/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// --- HELPER FUNCTIONS (Wajib ada agar tidak error) ---
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

// --- REVISED EXPORT TO PDF ---
export const exportToPDF = (items: InventoryItem[], filename: string = 'laporan-pengembalian'): void => {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PT PLN (PERSERO)', pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text('UNIT INDUK DISTRIBUSI SUMATERA BARAT', pageWidth / 2, 26, { align: 'center' });
  doc.text('ULP TABING', pageWidth / 2, 32, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Alamat: Jl. Sapek Raya, Lubuk Buaya, Kec. Koto Tangah, Kota Padang, Sumatera Barat 25586', pageWidth / 2, 38, { align: 'center' });
  doc.setLineWidth(0.5);
  doc.line(14, 42, pageWidth - 14, 42);

  // Judul Laporan
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN PENDATAAN PENGEMBALIAN BARANG GUDANG', pageWidth / 2, 50, { align: 'center' });

  // Tabel
  autoTable(doc, {
    startY: 55,
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
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
  });

  doc.save(`${filename}.pdf`);
};