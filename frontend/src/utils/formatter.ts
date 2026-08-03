// Format tanggal Indonesia (contoh: 27 Juli 2026)
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// Mengubah warna badge berdasarkan status tugas
export const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case 'SELESAI':
      return 'bg-green-100 text-green-800';
    case 'PROSES':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-red-100 text-red-800';
  }
};