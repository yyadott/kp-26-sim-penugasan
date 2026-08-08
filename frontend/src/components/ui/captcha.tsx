import { useCallback, useEffect, useState } from 'react';
import { RotateCw } from 'lucide-react';
import { axiosInstance } from '@/api/axiosInstance';

interface CaptchaProps {
  onCaptchaChange: (captchaId: string) => void;
  onRefresh?: () => void;
}

type CaptchaResponse = { captchaId: string; image: string };

export const Captcha = ({ onCaptchaChange, onRefresh }: CaptchaProps) => {
  const [image, setImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const refreshCaptcha = useCallback(async () => {
    setIsLoading(true);
    onCaptchaChange('');
    onRefresh?.();
    try {
      const { data } = await axiosInstance.get<CaptchaResponse>('/auth/captcha');
      setImage(data.image);
      onCaptchaChange(data.captchaId);
    } catch {
      setImage('');
    } finally {
      setIsLoading(false);
    }
  }, [onCaptchaChange, onRefresh]);

  useEffect(() => { void refreshCaptcha(); }, [refreshCaptcha]);

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => void refreshCaptcha()} className="h-11 w-[155px] rounded-lg overflow-hidden border border-slate-300 shadow-xs bg-slate-100 cursor-pointer" title="Klik untuk memperbarui CAPTCHA">
        {isLoading ? <span className="text-xs text-slate-500">Memuat...</span> : image ? <img src={image} alt="Kode CAPTCHA" className="w-full h-full" /> : <span className="text-xs text-red-600">Gagal memuat</span>}
      </button>
      <button type="button" onClick={() => void refreshCaptcha()} disabled={isLoading} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors cursor-pointer disabled:opacity-50" title="Refresh CAPTCHA">
        <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};
