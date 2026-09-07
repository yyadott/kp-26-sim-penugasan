import mammoth from 'mammoth';

export interface ScannedSuratData {
  nomorSurat: string;
  namaPegawai: string;
  lokasi: string;
}

export const extractDocxContent = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          throw new Error('Failed to read file as ArrayBuffer');
        }
        
        // mammoth.convertToHtml takes an array buffer
        const result = await mammoth.convertToHtml({ arrayBuffer });
        resolve(result.value); // The generated HTML
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};

export const extractSuratData = async (file: File): Promise<ScannedSuratData> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = result.value.replace(/\r/g, '').replace(/[ \t]+/g, ' ');
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);

  const valueAfterLabel = (label: string) => {
    const line = lines.find((item) => new RegExp(`^${label}\\b`, 'i').test(item));
    return line?.replace(new RegExp(`^${label}\\s*:?\\s*`, 'i'), '').trim() || '';
  };

  const nomorSurat = valueAfterLabel('Nomor');
  const namaPegawai = valueAfterLabel('nama');
  const locationMatch = text.match(/diselenggarakan pada tanggal\\s+[^\\n]+?\\s+di\\s+(.+?)(?:\\.\\s*Tugas ini diberikan|\\.\\s*Seluruh biaya|\\n|$)/i);

  return {
    nomorSurat,
    namaPegawai,
    lokasi: locationMatch?.[1]?.trim().replace(/[. ]+$/, '') || '',
  };
};
