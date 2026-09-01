import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}) => {
  const { t } = useLanguage();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      data-lenis-prevent
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in transition-all duration-300"
      style={{ overscrollBehavior: 'contain' }}
    >
      <div
        data-lenis-prevent
        className={`w-full ${maxWidth} rounded-3xl bg-surface border border-border shadow-2xl p-6 sm:p-7 relative max-h-[85vh] overflow-y-auto overscroll-contain animate-scale-in transition-all duration-300 custom-scrollbar`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{ overscrollBehavior: 'contain' }}
      >
        <div className="flex items-center justify-between pb-4 border-b border-border mb-5 sticky top-0 bg-surface/95 backdrop-blur-xs z-10 -mx-2 px-2">
          <h2 id="modal-title" className="text-base sm:text-lg font-bold font-display text-text-primary tracking-tight">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-secondary active:scale-95 transition-all"
            aria-label={t('btn_close')}
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
};
