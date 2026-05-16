import { X } from 'lucide-react';

export default function Modal({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-surface-900/40 backdrop-blur-sm fade-in" onClick={onClose}>
      <div className="card rounded-2xl p-6 w-full max-w-lg slide-up max-h-[90vh] overflow-y-auto bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-surface-900">{title}</h2>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-900 transition-colors">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
