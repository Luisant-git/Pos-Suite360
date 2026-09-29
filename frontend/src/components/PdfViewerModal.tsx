import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
}

const PdfViewerModal = ({ isOpen, onClose, pdfUrl, title }: PdfViewerModalProps) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70">
      <div className="bg-white w-[90%] max-w-[1000px] h-[90vh] flex flex-col rounded-lg shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center bg-[#1E293B] text-white p-3">
          <h2 className="font-bold text-sm">{title}</h2>
          <button type="button" onClick={onClose} className="hover:text-red-400 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 bg-gray-100">
          <iframe src={pdfUrl} className="w-full h-full border-none" title="PDF Viewer" />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PdfViewerModal;
