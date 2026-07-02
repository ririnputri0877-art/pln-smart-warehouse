// ============================================================================
// PREMIUM PDF EXPORT - PLN Corporate Letterhead (REVISI VALIDATOR)
// ============================================================================

export const exportToPDF = (items: InventoryItem[], filename: string = 'laporan-pengembalian-barang'): void => {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ---- KOP SURAT / LETTERHEAD RESMI ----
  const drawHeader = () => {
    // Area Logo PLN (Kotak kuning dengan teks PLN)
    doc.setFillColor(255, 227, 0); // #FFE300
    doc.roundedRect(14, 8, 28, 28, 2, 2, 'F');
    doc.setFillColor(22, 60, 147); // #163C93
    doc.roundedRect(16, 10, 24, 24, 1.5, 1.5, 'F');
    doc.setFontSize(14);
    doc.setTextColor(255, 227, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('PLN', 28, 24, { align: 'center' });
    doc.setFontSize(7);
    doc.text('⚡', 28, 29, { align: 'center' });

    // Teks Kop Surat Instansi (Warna Hitam agar lebih formal)
    doc.setFontSize(15);
    doc.setTextColor(0, 0, 0); 
    doc.setFont('helvetica', 'bold');
    doc.text('PT PLN (PERSERO)', 48, 15);

    doc.setFontSize(12);
    doc.text('UNIT INDUK DISTRIBUSI SUMATERA BARAT', 48, 21);

    doc.setFontSize(11);
    doc.text('UP3 PADANG - ULP TABING', 48, 27);

    // Alamat
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.text('Alamat: Jl. Raya Tabing No. 1, Kel. Bungo Pasang, Kec. Koto Tangah, Kota Padang 25171', 48, 32);

    // Garis pembatas ganda resmi
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1.0);
    doc.line(14, 37, pageWidth - 14, 37); // Garis tebal
    doc.setLineWidth(0.3);
    doc.line(14, 38.5, pageWidth - 14, 38.5); // Garis tipis

    // Judul Laporan (Disesuaikan dengan judul TA)
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('LAPORAN PENDATAAN PENGEMBALIAN BARANG GUDANG', pageWidth / 2, 48, { align: 'center' });

    // Meta Data
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Tanggal Cetak: ${formatDateID(new Date())}`, 14, 54);
    doc.text(`Total Data: ${items.length} item`, pageWidth - 14, 54, { align: 'right' });
  };

  // ---- FOOTER & KOLOM PENGESAHAN MANAGER ----
  const drawFooter = (pageNumber: number, totalPages: number, isLastPage: boolean) => {
    // Nomor Halaman
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Halaman ${pageNumber} dari ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );

    if (isLastPage) {
      // Area Tanda Tangan hanya muncul di halaman terakhir
      const sigY = pageHeight - 48; 
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');

      // Tanda Tangan Kiri (Staff Gudang)
      doc.text('Dibuat Oleh,', 50, sigY + 5, { align: 'center' });
      doc.text('Staff Gudang', 50, sigY + 10, { align: 'center' });
      // Ruang Kosong + Nama / Garis Bawah
      doc.text('(........................................)', 50, sigY + 30, { align: 'center' });

      // Tanda Tangan Kanan (Manager ULP Tabing - Permintaan Validator)
      doc.text(`Padang, ${format(new Date(), 'd MMMM yyyy', { locale: id })}`, pageWidth - 50, sigY, { align: 'center' });
      doc.text('Mengetahui,', pageWidth - 50, sigY + 5, { align: 'center' });
      
      doc.setFont('helvetica', 'bold');
      doc.text('Manager ULP Tabing', pageWidth - 50, sigY + 10, { align: 'center' });
      
      // Ruang Kosong + Nama / Garis Bawah untuk Manager
      doc.setFont('helvetica', 'normal');
      doc.text('(........................................)', pageWidth - 50, sigY + 30, { align: 'center' });
      
    } else {
      // Garis footer bawah & teks sistem untuk halaman selain terakhir
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);
      
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text('Dicetak oleh Sistem Informasi Pendaatan Pengembalian Barang ULP Tabing', 14, pageHeight - 5);
    }
  };

  // Eksekusi fungsi gambar header di halaman pertama
  drawHeader();

  // Persiapan Data Tabel
  const tableData = items.map((item, index) => [
    index + 1,
    getItemName(item),
    item.jenisBarang === 'material_umum' ? (item as MaterialUmumItem).kategoriMaterial || '-' : JENIS_BARANG_LABELS[item.jenisBarang],
    getVolume(item),
    getSatuan(item),
    KONDISI_LABELS[item.kondisi] || '-',
    getStatusLabel(item.status),
    item.createdByName || '-',
    formatDateID(item.createdAt),
  ]);

  // Eksekusi Autotable
  autoTable(doc, {
    startY: 58, // Diturunkan sedikit agar tidak menabrak judul
    head: [[
      'No', 'Nama Material', 'Kategori', 'Jml', 'Sat', 'Kondisi', 'Status', 'Diinput Oleh', 'Tanggal',
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [22, 60, 147], // PLN Blue Tetap Dipertahankan
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [40, 40, 40],
      cellPadding: 2.5,
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], 
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { cellWidth: 50 }, 
      2: { cellWidth: 28 },
      3: { halign: 'center', cellWidth: 10 },
      4: { halign: 'center', cellWidth: 8 },
      5: { halign: 'center', cellWidth: 20 },
      6: { halign: 'center', cellWidth: 16 },
      7: { cellWidth: 28 },
      8: { cellWidth: 32 },
    },
    margin: { left: 14, right: 14, bottom: 55 }, // Menyediakan ruang cukup (55) untuk tanda tangan di halaman terakhir
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        // Continuation header jika tabel berlanjut ke halaman 2 dst
        doc.setFontSize(10);
        doc.setTextColor(22, 60, 147);
        doc.setFont('helvetica', 'bold');
        doc.text('PT PLN (PERSERO) UP3 PADANG - ULP TABING', 14, 12);
        doc.text('Laporan Pengembalian Barang (lanjutan)', 14, 18);
        doc.setDrawColor(22, 60, 147);
        doc.setLineWidth(0.5);
        doc.line(14, 20, pageWidth - 14, 20);
      }
    },
  });

  // Eksekusi fungsi Footer ke seluruh halaman
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(i, totalPages, i === totalPages);
  }

  // Save PDF
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  doc.save(`${filename}-${dateStr}.pdf`);
};