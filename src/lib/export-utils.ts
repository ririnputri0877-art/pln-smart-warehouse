export const exportToPDF = (items: InventoryItem[], filename: string = 'laporan-pengembalian'): void => {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  const drawHeader = () => {
    // 1. Logo (Pastikan file ada di public/logo-pln.png)
   

    // 2. Teks Kop Surat (Rata Tengah)
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    
    doc.setFontSize(14);
    doc.text('PT PLN (PERSERO)', pageWidth / 2, 35, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('UNIT INDUK DISTRIBUSI SUMATERA BARAT', pageWidth / 2, 41, { align: 'center' });
    doc.text('ULP TABING', pageWidth / 2, 47, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Alamat: Jl. Sapek Raya, Lubuk Buaya, Kec. Koto Tangah, Kota Padang, Sumatera Barat 25586', pageWidth / 2, 53, { align: 'center' });

    // Garis Tebal Kop
    doc.setLineWidth(0.5);
    doc.line(14, 57, pageWidth - 14, 57);
    doc.setLineWidth(0.1);
    doc.line(14, 58, pageWidth - 14, 58);
  };

  drawHeader();

  // 3. Tabel Hitam Putih & Rata Tengah
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
    theme: 'plain', // Menghilangkan background warna
    styles: {
      lineColor: [0, 0, 0], // Garis hitam
      lineWidth: 0.1,
      textColor: [0, 0, 0],
      halign: 'center', // Semua isi tabel rata tengah
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      border: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 10 },  // No
      3: { cellWidth: 15 },  // Jml
      4: { cellWidth: 15 },  // Sat
    },
  });

  doc.save(`${filename}.pdf`);
};