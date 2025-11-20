import React, { useEffect } from 'react';
import { XIcon } from './IconComponents';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative bg-card text-card-foreground w-full max-w-2xl m-4 rounded-lg shadow-xl border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-4 border-b border-border rounded-t-lg">
          <h3 className="text-xl font-semibold" id="modal-title">
            {title}
          </h3>
          <button
            type="button"
            className="text-muted-foreground bg-transparent hover:bg-secondary rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            onClick={onClose}
            aria-label="Close modal"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;