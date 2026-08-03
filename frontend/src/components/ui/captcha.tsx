import React, { useEffect, useRef, useCallback } from 'react';
import { RotateCw } from 'lucide-react';

interface CaptchaProps {
  onCaptchaChange: (code: string) => void;
}

export const Captcha: React.FC<CaptchaProps> = ({ onCaptchaChange }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const generateCaptchaCode = (): string => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const drawCaptcha = useCallback((code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, '#f1f5f9');
    bgGradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Random noise lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = ['#cbd5e1', '#94a3b8', '#3b82f6', '#64748b'][i % 4];
      ctx.lineWidth = 1 + Math.random();
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.bezierCurveTo(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * canvas.width,
        Math.random() * canvas.height
      );
      ctx.stroke();
    }

    // Random dots
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(51, 65, 85, ${0.1 + Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        1 + Math.random() * 1.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Draw characters with slight rotation and distortion
    ctx.font = 'bold 22px Geist, sans-serif';
    ctx.textBaseline = 'middle';

    const charWidth = (canvas.width - 20) / code.length;
    for (let i = 0; i < code.length; i++) {
      ctx.save();
      const x = 12 + i * charWidth;
      const y = canvas.height / 2 + (Math.random() * 4 - 2);
      const angle = (Math.random() * 0.4 - 0.2); // Radians

      ctx.translate(x, y);
      ctx.rotate(angle);

      // Unique text color per char
      const colors = ['#1e40af', '#1d4ed8', '#0f766e', '#0369a1', '#334155'];
      ctx.fillStyle = colors[i % colors.length];

      ctx.fillText(code[i], 0, 0);
      ctx.restore();
    }
  }, []);

  const refreshCaptcha = useCallback(() => {
    const newCode = generateCaptchaCode();
    drawCaptcha(newCode);
    onCaptchaChange(newCode);
  }, [drawCaptcha, onCaptchaChange]);

  useEffect(() => {
    refreshCaptcha();
  }, [refreshCaptcha]);

  return (
    <div className="flex items-center gap-2">
      <div className="relative rounded-lg overflow-hidden border border-slate-300 shadow-xs bg-slate-100">
        <canvas
          ref={canvasRef}
          width={150}
          height={40}
          className="block cursor-pointer select-none"
          onClick={refreshCaptcha}
          title="Klik untuk memperbarui CAPTCHA"
        />
      </div>
      <button
        type="button"
        onClick={refreshCaptcha}
        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
        title="Refresh CAPTCHA"
      >
        <RotateCw className="w-4 h-4" />
      </button>
    </div>
  );
};
