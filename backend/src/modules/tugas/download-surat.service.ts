import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Packer,
  convertMillimetersToTwip,
} from 'docx';

// Data dummy surat tugas
const dummySuratTugas = [
  {
    id: 'st-001',
    nomorSurat: 'ST/084/RBI/VII/2026',
    perihal: 'Peninjauan dan instalasi perangkat gateway sensor presensi & CCTV terintegrasi.',
    pengaju: { nama: 'Taryadi', nip: '2350081041', jabatan: 'Super Admin' },
    pegawaiDitugaskan: [
      { nama: 'Taryadi', nip: '2350081041', jabatan: 'Super Admin', unitKerja: 'RBI' },
      { nama: 'Budi Santoso, S.T., M.Si.', nip: '198711042012021005', jabatan: 'Koordinator Pengawasan Lalu Lintas', unitKerja: 'Kepeg' },
      { nama: 'Siti Rahmawati, S.H.', nip: '199204152015032001', jabatan: 'Kasi Penertiban & Operasional', unitKerja: 'PM' },
    ],
    unitKerja: 'RBI',
    tanggalMulai: '2026-07-28',
    tanggalSelesai: '2026-07-30',
    lokasiPenugasan: 'Kota Cimahi',
    deskripsi: 'Peninjauan dan instalasi perangkat gateway sensor presensi & CCTV terintegrasi pada pos pantau wilayah utara.',
  },
  {
    id: 'st-002',
    nomorSurat: 'ST/092/ULP/VIII/2026',
    perihal: 'Koordinasi pelayanan publik dan pendampingan pengaduan masyarakat.',
    pengaju: { nama: 'Yudi', nip: '198503122010011002', jabatan: 'Front Office' },
    pegawaiDitugaskan: [
      { nama: 'Yudi', nip: '198503122010011002', jabatan: 'Front Office', unitKerja: 'Fastingkom' },
      { nama: 'Siti Rahmawati, S.H.', nip: '199204152015032001', jabatan: 'Kasi Penertiban & Operasional', unitKerja: 'PM' },
    ],
    unitKerja: 'Fastingkom',
    tanggalMulai: '2026-08-01',
    tanggalSelesai: '2026-08-03',
    lokasiPenugasan: 'Bandung Barat',
    deskripsi: 'Pendampingan operasional front office dan monitoring pelayanan publik.',
  },
  {
    id: 'st-003',
    nomorSurat: 'ST/105/DISHUB/IX/2026',
    perihal: 'Pengawasan lalu lintas dan evaluasi titik rawan kecelakaan.',
    pengaju: { nama: 'Taryadi', nip: '2350081041', jabatan: 'Super Admin' },
    pegawaiDitugaskan: [
      { nama: 'Taryadi', nip: '2350081041', jabatan: 'Super Admin', unitKerja: 'RBI' },
      { nama: 'Budi Santoso, S.T., M.Si.', nip: '198711042012021005', jabatan: 'Koordinator Pengawasan Lalu Lintas', unitKerja: 'Kepeg' },
    ],
    unitKerja: 'Kepeg',
    tanggalMulai: '2026-08-04',
    tanggalSelesai: '2026-08-05',
    lokasiPenugasan: 'Kota Bandung',
    deskripsi: 'Monitoring pelaksanaan rekayasa lalu lintas dan dokumentasi wilayah rawan.',
  },
  {
    id: 'st-210',
    nomorSurat: 'ST/210/RBI/IX/2026',
    perihal: 'Koordinasi teknis pengembangan platform layanan digital satu pintu.',
    pengaju: { nama: 'Taryadi', nip: '2350081041', jabatan: 'Super Admin' },
    pegawaiDitugaskan: [
      { nama: 'Taryadi', nip: '2350081041', jabatan: 'Super Admin', unitKerja: 'RBI' },
      { nama: 'Dewi Lestari, S.E., M.M.', nip: '199001012014022003', jabatan: 'Analis Perencanaan Protokol', unitKerja: 'RBI' },
    ],
    unitKerja: 'RBI',
    tanggalMulai: '2026-09-05',
    tanggalSelesai: '2026-09-06',
    lokasiPenugasan: 'Kota Bandung',
    deskripsi: 'Koordinasi teknis pengembangan platform layanan digital satu pintu.',
  },
  {
    id: 'st-215',
    nomorSurat: 'ST/215/RBI/IX/2026',
    perihal: 'Evaluasi kinerja triwulan dan audit sistem manajemen keamanan informasi.',
    pengaju: { nama: 'Dewi Lestari, S.E., M.M.', nip: '199001012014022003', jabatan: 'Analis Perencanaan Protokol' },
    pegawaiDitugaskan: [
      { nama: 'Dewi Lestari, S.E., M.M.', nip: '199001012014022003', jabatan: 'Analis Perencanaan Protokol', unitKerja: 'RBI' },
      { nama: 'Taryadi', nip: '2350081041', jabatan: 'Super Admin', unitKerja: 'RBI' },
    ],
    unitKerja: 'RBI',
    tanggalMulai: '2026-09-10',
    tanggalSelesai: '2026-09-12',
    lokasiPenugasan: 'Kota Bogor',
    deskripsi: 'Evaluasi kinerja triwulan dan audit sistem manajemen keamanan informasi.',
  },
];

@Injectable()
export class DownloadSuratService {
  findSuratById(id: string) {
    return dummySuratTugas.find((s) => s.id === id);
  }

  formatTanggal(dateStr: string): string {
    const bulan = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    const d = new Date(dateStr);
    return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
  }

  async generateWord(id: string): Promise<Buffer> {
    const surat = this.findSuratById(id);
    if (!surat) {
      throw new NotFoundException(`Surat Tugas dengan ID ${id} tidak ditemukan.`);
    }

    const noBorder = {
      top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    };

    const thinBorder = {
      top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    };

    const pegawaiHeaderRow = new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'No', bold: true, size: 20, font: 'Times New Roman' })], alignment: AlignmentType.CENTER })],
          width: { size: 600, type: WidthType.DXA },
          borders: thinBorder,
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Nama', bold: true, size: 20, font: 'Times New Roman' })], alignment: AlignmentType.CENTER })],
          width: { size: 3500, type: WidthType.DXA },
          borders: thinBorder,
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'NIP', bold: true, size: 20, font: 'Times New Roman' })], alignment: AlignmentType.CENTER })],
          width: { size: 2500, type: WidthType.DXA },
          borders: thinBorder,
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Jabatan', bold: true, size: 20, font: 'Times New Roman' })], alignment: AlignmentType.CENTER })],
          width: { size: 3000, type: WidthType.DXA },
          borders: thinBorder,
        }),
      ],
    });

    const pegawaiRows = surat.pegawaiDitugaskan.map(
      (p, idx) =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: String(idx + 1), size: 20, font: 'Times New Roman' })], alignment: AlignmentType.CENTER })],
              borders: thinBorder,
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: p.nama, size: 20, font: 'Times New Roman' })] })],
              borders: thinBorder,
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: p.nip, size: 20, font: 'Times New Roman' })] })],
              borders: thinBorder,
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: p.jabatan, size: 20, font: 'Times New Roman' })] })],
              borders: thinBorder,
            }),
          ],
        }),
    );

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: {
                width: convertMillimetersToTwip(210),
                height: convertMillimetersToTwip(297),
              },
              margin: {
                top: convertMillimetersToTwip(25),
                bottom: convertMillimetersToTwip(25),
                left: convertMillimetersToTwip(30),
                right: convertMillimetersToTwip(25),
              },
            },
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 0 },
              children: [new TextRun({ text: 'PEMERINTAH KOTA CIMAHI', bold: true, size: 28, font: 'Times New Roman' })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 0 },
              children: [new TextRun({ text: 'DINAS KOMUNIKASI DAN INFORMATIKA', bold: true, size: 24, font: 'Times New Roman' })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 0 },
              children: [new TextRun({ text: `Unit Kerja: ${surat.unitKerja}`, size: 20, font: 'Times New Roman' })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
              children: [new TextRun({ text: 'Jl. Rd. Demang Hardjakusumah No. 1 Kota Cimahi 40525', size: 18, font: 'Times New Roman', italics: true })],
            }),
            new Paragraph({
              spacing: { after: 200 },
              border: { bottom: { style: BorderStyle.DOUBLE, size: 3, space: 1, color: '000000' } },
              children: [],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 0 },
              children: [new TextRun({ text: 'SURAT TUGAS', bold: true, size: 28, font: 'Times New Roman', underline: {} })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 },
              children: [new TextRun({ text: `Nomor: ${surat.nomorSurat}`, size: 22, font: 'Times New Roman' })],
            }),
            new Paragraph({
              spacing: { after: 100 },
              children: [new TextRun({ text: 'Yang bertanda tangan di bawah ini:', size: 22, font: 'Times New Roman' })],
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Nama', size: 22, font: 'Times New Roman' })] })], width: { size: 2000, type: WidthType.DXA }, borders: noBorder }), new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `: ${surat.pengaju.nama}`, size: 22, font: 'Times New Roman' })] })], borders: noBorder })] }),
                new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'NIP', size: 22, font: 'Times New Roman' })] })], borders: noBorder }), new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `: ${surat.pengaju.nip}`, size: 22, font: 'Times New Roman' })] })], borders: noBorder })] }),
                new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Jabatan', size: 22, font: 'Times New Roman' })] })], borders: noBorder }), new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `: ${surat.pengaju.jabatan}`, size: 22, font: 'Times New Roman' })] })], borders: noBorder })] }),
              ],
            }),
            new Paragraph({
              spacing: { before: 200, after: 100 },
              children: [new TextRun({ text: 'Dengan ini menugaskan kepada:', size: 22, font: 'Times New Roman' })],
            }),
            new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [pegawaiHeaderRow, ...pegawaiRows] }),
            new Paragraph({
              spacing: { before: 200, after: 100 },
              children: [new TextRun({ text: 'Untuk melaksanakan tugas sebagai berikut:', size: 22, font: 'Times New Roman' })],
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Perihal', size: 22, font: 'Times New Roman' })] })], width: { size: 2000, type: WidthType.DXA }, borders: noBorder }), new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `: ${surat.perihal}`, size: 22, font: 'Times New Roman' })] })], borders: noBorder })] }),
                new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Tanggal', size: 22, font: 'Times New Roman' })] })], borders: noBorder }), new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `: ${this.formatTanggal(surat.tanggalMulai)} s/d ${this.formatTanggal(surat.tanggalSelesai)}`, size: 22, font: 'Times New Roman' })] })], borders: noBorder })] }),
                new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Lokasi', size: 22, font: 'Times New Roman' })] })], borders: noBorder }), new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `: ${surat.lokasiPenugasan}`, size: 22, font: 'Times New Roman' })] })], borders: noBorder })] }),
                new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Keterangan', size: 22, font: 'Times New Roman' })] })], borders: noBorder }), new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `: ${surat.deskripsi}`, size: 22, font: 'Times New Roman' })] })], borders: noBorder })] }),
              ],
            }),
            new Paragraph({
              spacing: { before: 200, after: 400 },
              children: [new TextRun({ text: 'Demikian surat tugas ini dibuat untuk dapat dilaksanakan dengan penuh tanggung jawab.', size: 22, font: 'Times New Roman' })],
            }),
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              spacing: { after: 0 },
              children: [new TextRun({ text: `Cimahi, ${this.formatTanggal(new Date().toISOString().split('T')[0])}`, size: 22, font: 'Times New Roman' })],
            }),
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              spacing: { after: 0 },
              children: [new TextRun({ text: 'Kepala Dinas', size: 22, font: 'Times New Roman', bold: true })],
            }),
            new Paragraph({ spacing: { before: 1200, after: 0 }, children: [] }),
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: '( ________________________________ )', size: 22, font: 'Times New Roman' })],
            }),
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: 'NIP. ................................', size: 20, font: 'Times New Roman' })],
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    return buffer as Buffer;
  }
}
