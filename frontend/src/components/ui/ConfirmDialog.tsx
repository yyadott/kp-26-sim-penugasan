import { AlertTriangle, Info } from 'lucide-react';

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  type = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  const getConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
          bgIcon: 'bg-red-100',
          btnBg: 'bg-red-600 hover:bg-red-700',
          btnText: 'text-white',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-amber-600" />,
          bgIcon: 'bg-amber-100',
          btnBg: 'bg-amber-500 hover:bg-amber-600',
          btnText: 'text-white',
        };
      case 'success':
        return {
          icon: <Info className="h-6 w-6 text-emerald-600" />,
          bgIcon: 'bg-emerald-100',
          btnBg: 'bg-emerald-600 hover:bg-emerald-700',
          btnText: 'text-white',
        };
      case 'info':
      default:
        return {
          icon: <Info className="h-6 w-6 text-blue-600" />,
          bgIcon: 'bg-blue-100',
          btnBg: 'bg-blue-600 hover:bg-blue-700',
          btnText: 'text-white',
        };
    }
  };

  const config = getConfig();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 sm:p-6 pb-4">
          <div className="flex items-start gap-4">
            <div className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-full ${config.bgIcon}`}>
              {config.icon}
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-lg font-bold text-slate-900 leading-none mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-4 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors shadow-sm ${config.btnBg} ${config.btnText}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
