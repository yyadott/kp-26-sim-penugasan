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
  VerticalAlign,
  PageOrientation,
  convertMillimetersToTwip,
  ImageRun,
  PageBreak,
} from 'docx';
import { saveAs } from 'file-saver';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface PegawaiSuratData {
  nama: string;
  nip: string;
  pangkat: string;  // e.g. "Pembina Utama Muda, IV/c"
  jabatan: string;
}

export interface SuratTugasData {
  nomorSurat: string;
  uraianKegiatan: string;
  pegawaiList: PegawaiSuratData[];
  tanggalMulai: string;   // display-ready string, e.g. "2 Juli 2026"
  tanggalSelesai: string;
  lokasi: string;          // Kota/Kabupaten, Provinsi
  lokasiSpesifik: string;  // e.g. "SMKN 1 Bandung"
  deskripsi: string;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const FONT = 'Times New Roman';
const FONT_SIZE = 24; // half-points → 12pt

const cellBorders = {
  top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
} as const;

function textRun(text: string, opts?: { bold?: boolean; italic?: boolean; size?: number }): TextRun {
  return new TextRun({
    text,
    font: FONT,
    size: opts?.size ?? FONT_SIZE,
    bold: opts?.bold ?? false,
    italics: opts?.italic ?? false,
  });
}

function emptyParagraph(): Paragraph {
  return new Paragraph({ children: [textRun('')] });
}

function formatTanggal(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

// ─────────────────────────────────────────────
// Shared paragraphs (header, body, footer)
// ─────────────────────────────────────────────
function headerParagraphs(nomorSurat: string, kopBuffer: ArrayBuffer | null): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  if (kopBuffer) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new ImageRun({
            data: kopBuffer,
            transformation: {
              width: 585,  // ~15.5cm width (A4 with margins)
              height: 80,  // adjust proportionally
            },
            type: 'png'
          }),
        ],
      })
    );
  }

  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 0 },
      children: [textRun('SURAT TUGAS', { bold: true, size: 28 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [textRun(`Nomor ${nomorSurat}`, { size: FONT_SIZE })],
    }),
    emptyParagraph()
  );

  return paragraphs;
}

function openingParagraph(): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 120 },
    children: [
      textRun(
        'Kepala Balai Besar Pengembangan Penjaminan Mutu Pendidikan Vokasi Bidang Mesin dan Teknik Industri (BBPPMPV BMTI) menugasi',
      ),
    ],
  });
}

function biayaParagraph(): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 200, after: 120 },
    children: [
      textRun(
        'Seluruh biaya perjalanan dinas yang berkaitan dengan kegiatan tersebut dibebankan pada DIPA BBPPMPV BMTI Tahun Anggaran sesuai dengan ketentuan yang berlaku.',
      ),
    ],
  });
}

function penutupParagraph(): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 200 },
    children: [
      textRun(
        'Surat tugas ini dibuat untuk dilaksanakan dengan penuh tanggung jawab dan yang bersangkutan diharapkan membuat laporan.',
      ),
    ],
  });
}

function signatureParagraphs(): Paragraph[] {
  return [
    emptyParagraph(),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 0 },
      children: [textRun('Kepala,')],
    }),
    emptyParagraph(),
    emptyParagraph(),
    emptyParagraph(),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 0 },
      children: [textRun('Baharudin', { bold: true })],
    }),
  ];
}

// ─────────────────────────────────────────────
// Template 1: Surat Tugas Per Orangan
// ─────────────────────────────────────────────
function generateSuratPerorangan(data: SuratTugasData, kopBuffer: ArrayBuffer | null): Document {
  const p = data.pegawaiList[0];
  const tanggalMulaiFormatted = formatTanggal(data.tanggalMulai);
  const lokasiText = [data.lokasiSpesifik, data.lokasi].filter(Boolean).join(', ');

  const bodyParagraphs: Paragraph[] = [
    new Paragraph({
      spacing: { after: 40 },
      children: [
        textRun('nama', { bold: false }),
        textRun('\t\t\t\t: '),
        textRun(p.nama, { bold: false }),
      ],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [
        textRun('NIP'),
        textRun('\t\t\t\t: '),
        textRun(p.nip),
      ],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [
        textRun('pangkat dan golongan'),
        textRun('\t: '),
        textRun(p.pangkat || '-'),
      ],
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [
        textRun('jabatan'),
        textRun('\t\t\t: '),
        textRun(p.jabatan),
      ],
    }),
  ];

  const perihalParagraph = new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 120 },
    children: [
      textRun(`sebagai ${data.deskripsi || data.uraianKegiatan}. Kegiatan akan diselenggarakan pada tanggal ${tanggalMulaiFormatted} di ${lokasiText}.`),
    ],
  });

  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.PORTRAIT,
              width: convertMillimetersToTwip(210),
              height: convertMillimetersToTwip(297),
            },
            margin: {
              top: convertMillimetersToTwip(25),
              right: convertMillimetersToTwip(25),
              bottom: convertMillimetersToTwip(25),
              left: convertMillimetersToTwip(30),
            },
          },
        },
        children: [
          ...headerParagraphs(data.nomorSurat, kopBuffer),
          openingParagraph(),
          emptyParagraph(),
          ...bodyParagraphs,
          emptyParagraph(),
          perihalParagraph,
          biayaParagraph(),
          penutupParagraph(),
          ...signatureParagraphs(),
        ],
      },
    ],
  });
}

// ─────────────────────────────────────────────
// Template 2: Surat Tugas Rombongan
// ─────────────────────────────────────────────
function generateSuratRombongan(data: SuratTugasData, kopBuffer: ArrayBuffer | null): Document {
  const tanggalMulaiFormatted = formatTanggal(data.tanggalMulai);
  const tanggalSelesaiFormatted = formatTanggal(data.tanggalSelesai);
  const lokasiText = [data.lokasiSpesifik, data.lokasi].filter(Boolean).join(', ');

  // Build table header
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        borders: cellBorders,
        width: { size: 600, type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [textRun('NO', { bold: true })],
          }),
        ],
      }),
      new TableCell({
        borders: cellBorders,
        width: { size: 5000, type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [textRun('NAMA, NIP, Pangkat, dan Golongan', { bold: true })],
          }),
        ],
      }),
      new TableCell({
        borders: cellBorders,
        width: { size: 3400, type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [textRun('Jabatan', { bold: true })],
          }),
        ],
      }),
    ],
  });

  // Build data rows
  const dataRows = data.pegawaiList.map((p, idx) => {
    return new TableRow({
      children: [
        new TableCell({
          borders: cellBorders,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [textRun(`${idx + 1}.`)],
            }),
          ],
        }),
        new TableCell({
          borders: cellBorders,
          verticalAlign: VerticalAlign.TOP,
          children: [
            new Paragraph({
              children: [textRun(p.nama, { bold: false })],
            }),
            new Paragraph({
              children: [textRun(`NIP ${p.nip}`, { size: 22 })],
            }),
            new Paragraph({
              children: [textRun(p.pangkat || '-', { size: 22 })],
            }),
          ],
        }),
        new TableCell({
          borders: cellBorders,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              children: [textRun(p.jabatan)],
            }),
          ],
        }),
      ],
    });
  });

  const pegawaiTable = new Table({
    width: { size: 9000, type: WidthType.DXA },
    rows: [headerRow, ...dataRows],
  });

  const perihalParagraph = new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 200, after: 120 },
    children: [
      textRun(
        `sebagai ${data.deskripsi || data.uraianKegiatan}. Kegiatan akan dilaksanakan periode tanggal ${tanggalMulaiFormatted} s.d ${tanggalSelesaiFormatted} di ${lokasiText}.`,
      ),
    ],
  });

  // ─────────────────────────────────────────────
  // Lampiran Table
  // ─────────────────────────────────────────────
  const lampiranHeaderRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        borders: cellBorders,
        width: { size: 600, type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [textRun('No', { bold: true })] })],
      }),
      new TableCell({
        borders: cellBorders,
        width: { size: 3000, type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [textRun('Nama Petugas', { bold: true })] })],
      }),
      new TableCell({
        borders: cellBorders,
        width: { size: 2500, type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [textRun('Tempat', { bold: true })] })],
      }),
      new TableCell({
        borders: cellBorders,
        width: { size: 1500, type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [textRun('Kab/ Kota', { bold: true })] })],
      }),
      new TableCell({
        borders: cellBorders,
        width: { size: 1200, type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [textRun('Tanggal Mulai', { bold: true })] })],
      }),
      new TableCell({
        borders: cellBorders,
        width: { size: 1200, type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [textRun('Tanggal Selesai', { bold: true })] })],
      }),
    ],
  });

  const lampiranDataRows = data.pegawaiList.map((p, idx) => {
    return new TableRow({
      children: [
        new TableCell({
          borders: cellBorders,
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [textRun(`${idx + 1}.`)] })],
        }),
        new TableCell({
          borders: cellBorders,
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ children: [textRun(p.nama)] })],
        }),
        new TableCell({
          borders: cellBorders,
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ children: [textRun(data.lokasiSpesifik || '-')] })],
        }),
        new TableCell({
          borders: cellBorders,
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ children: [textRun(data.lokasi || '-')] })],
        }),
        new TableCell({
          borders: cellBorders,
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ children: [textRun(tanggalMulaiFormatted)] })],
        }),
        new TableCell({
          borders: cellBorders,
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ children: [textRun(tanggalSelesaiFormatted)] })],
        }),
      ],
    });
  });

  const lampiranTable = new Table({
    width: { size: 10000, type: WidthType.DXA },
    rows: [lampiranHeaderRow, ...lampiranDataRows],
  });

  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.PORTRAIT,
              width: convertMillimetersToTwip(210),
              height: convertMillimetersToTwip(297),
            },
            margin: {
              top: convertMillimetersToTwip(25),
              right: convertMillimetersToTwip(25),
              bottom: convertMillimetersToTwip(25),
              left: convertMillimetersToTwip(30),
            },
          },
        },
        children: [
          ...headerParagraphs(data.nomorSurat, kopBuffer),
          openingParagraph(),
          emptyParagraph(),
          pegawaiTable,
          emptyParagraph(),
          perihalParagraph,
          biayaParagraph(),
          penutupParagraph(),
          ...signatureParagraphs(),
          new Paragraph({
            children: [new PageBreak()],
          }),
          new Paragraph({
            children: [textRun('Lampiran Surat', { bold: true })],
          }),
          new Paragraph({
            children: [textRun(`Nomor\t: ${data.nomorSurat}`)],
          }),
          new Paragraph({
            children: [textRun(`Tanggal\t: ${tanggalMulaiFormatted}`)],
          }),
          emptyParagraph(),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [textRun((data.deskripsi || data.uraianKegiatan || 'DAFTAR PETUGAS').toUpperCase(), { bold: true })],
          }),
          emptyParagraph(),
          lampiranTable,
          emptyParagraph(),
          ...signatureParagraphs(),
        ],
      },
    ],
  });
}

// ─────────────────────────────────────────────
// Public API: auto-detect & download
// ─────────────────────────────────────────────

/**
 * Generate dan download Surat Tugas sebagai file .docx.
 * Otomatis memilih template perorangan (1 pegawai) atau rombongan (>1 pegawai).
 */
export async function generateSuratTugas(data: SuratTugasData): Promise<void> {
  let kopBuffer: ArrayBuffer | null = null;
  try {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const response = await fetch(`${baseUrl}kop-surat.png`);
    if (response.ok) {
      const blob = await response.blob();
      kopBuffer = await blob.arrayBuffer();
    }
  } catch (error) {
    console.error('Failed to load kop surat image:', error);
  }

  const isPerorangan = data.pegawaiList.length <= 1;
  const doc = isPerorangan
    ? generateSuratPerorangan(data, kopBuffer)
    : generateSuratRombongan(data, kopBuffer);

  const blob = await Packer.toBlob(doc);

  const fileName = isPerorangan
    ? `Surat_Tugas_${data.pegawaiList[0]?.nama?.replace(/\s+/g, '_') || 'Pegawai'}.docx`
    : `Surat_Tugas_Rombongan_${data.pegawaiList.length}_Orang.docx`;

  saveAs(blob, fileName);
}
