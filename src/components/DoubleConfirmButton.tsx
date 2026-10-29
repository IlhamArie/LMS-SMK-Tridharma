import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DoubleConfirmButtonProps {
  onConfirm: () => void;
  itemName?: string;
  className?: string;
  size?: 'sm' | 'md';
  title?: string;
}

export const DoubleConfirmButton: React.FC<DoubleConfirmButtonProps> = ({
  onConfirm,
  itemName = 'data ini',
  className = '',
  size = 'sm',
  title = 'Hapus',
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [timeLeft, setTimeLeft] = useState(4);

  useEffect(() => {
    let timer: number | undefined;
    let countdown: number | undefined;

    if (isConfirming) {
      setTimeLeft(4);
      countdown = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      timer = window.setTimeout(() => {
        setIsConfirming(false);
      }, 4000);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (countdown) clearInterval(countdown);
    };
  }, [isConfirming]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isConfirming) {
      setIsConfirming(true);
    } else {
      setIsConfirming(false);
      onConfirm();
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirming(false);
  };

  if (isConfirming) {
    return (
      <div className="inline-flex items-center gap-1.5 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={handleClick}
          className={`inline-flex items-center gap-1 font-semibold rounded-lg text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all active:scale-95 ${
            size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
          } ${className}`}
          title={`Klik sekali lagi untuk menghapus ${itemName}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
          <span>Yakin Hapus? ({timeLeft}s)</span>
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="text-xs text-slate-500 hover:text-slate-700 px-1.5 py-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
          title="Batal"
        >
          Batal
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ${
        size === 'sm' ? 'p-1.5 text-xs' : 'px-2.5 py-1.5 text-sm'
      } ${className}`}
      title={title}
    >
      <Trash2 className="w-4 h-4" />
      {size === 'md' && <span>Hapus</span>}
    </button>
  );
};
