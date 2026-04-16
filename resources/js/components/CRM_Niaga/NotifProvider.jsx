import React, { useState, useCallback, useEffect, useRef, createContext, useContext } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X, Trash2, AlertOctagon } from 'lucide-react';

// ==========================================
// 1. KONFIGURASI TOAST (TAILWIND CLASSES)
// ==========================================
const TOAST_TYPES = {
  success: { Icon: CheckCircle,   iconColor: 'text-teal-500',  bg: 'bg-cyan-50',  border: 'border-teal-500' },
  error:   { Icon: XCircle,       iconColor: 'text-red-500',   bg: 'bg-red-50',   border: 'border-red-500' },
  warning: { Icon: AlertTriangle, iconColor: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-500' },
  info:    { Icon: Info,          iconColor: 'text-cyan-600',  bg: 'bg-cyan-50',  border: 'border-cyan-600' },
};

// ==========================================
// 2. KOMPONEN TOAST ITEM
// ==========================================
const ToastItem = ({ toast, onRemove }) => {
  const [visible, setVisible] = useState(false);
  const { Icon, iconColor, bg, border } = TOAST_TYPES[toast.type] || TOAST_TYPES.info;

  useEffect(() => {
    const inTimer = setTimeout(() => setVisible(true), 10);
    const outTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 350);
    }, toast.duration || 3500);

    return () => {
      clearTimeout(inTimer);
      clearTimeout(outTimer);
    };
  }, [toast.id, toast.duration, onRemove]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onRemove(toast.id), 350);
  };

  return (
    <div 
      className={`
        ${bg} border-[1.5px] ${border} 
        rounded-2xl p-3 flex items-start gap-2.5 min-w-[260px] max-w-[360px] pointer-events-auto
        shadow-lg shadow-${border.replace('border-', '')}/20
        transition-all duration-[350ms] ease-[cubic-bezier(.34,1.56,.64,1)]
        ${visible ? 'translate-x-0 opacity-100' : 'translate-x-[110%] opacity-0'}
      `}
    >
      <Icon className={`w-[18px] h-[18px] shrink-0 mt-[1px] ${iconColor}`} />
      
      <div className="flex-1">
        {toast.title && (
          <p className="m-0 font-bold text-[13px] text-slate-700">
            {toast.title}
          </p>
        )}
        <p className={`m-0 text-[12.5px] text-slate-600 ${toast.title ? 'mt-0.5' : ''}`}>
          {toast.message}
        </p>
      </div>

      <button
        onClick={handleClose}
        className="bg-transparent border-none p-0 text-slate-400 hover:text-slate-600 cursor-pointer shrink-0 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// ==========================================
// 3. KOMPONEN CONFIRM DIALOG
// ==========================================
const ConfirmDialog = ({ dialog, onResolve }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const close = (result) => {
    setVisible(false);
    setTimeout(() => onResolve(result), 250);
  };

  const isDanger = dialog.variant === 'danger';
  const iconBgClass = isDanger 
    ? 'bg-gradient-to-br from-red-500 to-red-700' 
    : 'bg-gradient-to-br from-cyan-500 to-blue-600';

  return (
    <div
      className={`
        fixed inset-0 z-[9999] flex items-center justify-center p-4 
        bg-cyan-900/15 backdrop-blur-[6px]
        transition-opacity duration-250 ease-out
        ${visible ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={(e) => {
        if (e.target === e.currentTarget) close(false);
      }}
    >
      <div 
        className={`
          bg-white rounded-[20px] border-2 border-slate-100 w-full max-w-[380px] overflow-hidden
          shadow-[0_20px_60px_rgba(0,100,120,0.15)]
          transition-transform duration-250 ease-[cubic-bezier(.34,1.56,.64,1)]
          ${visible ? 'scale-100 translate-y-0' : 'scale-[0.92] translate-y-4'}
        `}
      >
        
        {/* Header Modal */}
        <div className="p-5 pb-4 bg-slate-50/50 border-b-2 border-slate-100 flex items-start gap-3.5">
          <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${iconBgClass}`}>
            {isDanger
              ? <Trash2 className="w-[18px] h-[18px] text-white" />
              : <AlertOctagon className="w-[18px] h-[18px] text-white" />
            }
          </div>
          
          <div className="flex-1">
            <h3 className="m-0 text-[15px] font-bold text-slate-800">
              {dialog.title || 'Konfirmasi'}
            </h3>
            <p className="m-0 mt-1 text-[12.5px] text-slate-600 leading-relaxed">
              {dialog.message || 'Apakah kamu yakin?'}
            </p>
          </div>
          
          <button
            onClick={() => close(false)}
            className="bg-transparent border-none p-1 text-slate-400 hover:text-slate-600 cursor-pointer shrink-0 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Footer Modal / Action Buttons */}
        <div className="px-5 py-3.5 flex justify-end gap-2 bg-slate-50/80">
          <button
            onClick={() => close(false)}
            className="px-4.5 py-2 rounded-lg text-[12.5px] font-semibold bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
          >
            {dialog.cancelLabel || 'Batal'}
          </button>
          
          <button
            onClick={() => close(true)}
            className={`
              px-4.5 py-2 rounded-lg text-[12.5px] font-bold text-white border-none cursor-pointer 
              transition-opacity hover:opacity-85 ${iconBgClass}
            `}
          >
            {dialog.confirmLabel || 'Ya, Lanjutkan'}
          </button>
        </div>

      </div>
    </div>
  );
};

// ==========================================
// 4. CONTEXT & PROVIDER
// ==========================================
const NotifContext = createContext(null);
let _toastId = 0;

export const NotifProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [dialogs, setDialogs] = useState([]);
  const resolvedIds = useRef(new Set());

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((type, message, options = {}) => {
    const id = ++_toastId;
    setToasts(prev => [...prev, { id, type, message, ...options }]);
  }, []);

  const notify = {
    success: (msg, opts) => toast('success', msg, opts),
    error:   (msg, opts) => toast('error',   msg, opts),
    warning: (msg, opts) => toast('warning', msg, opts),
    info:    (msg, opts) => toast('info',    msg, opts),
  };

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      const id = ++_toastId;
      setDialogs(prev => [...prev, { id, ...options, resolve }]);
    });
  }, []);

  const resolveDialog = useCallback((id, result) => {
    if (resolvedIds.current.has(id)) return;
    resolvedIds.current.add(id);
    
    setDialogs(prev => {
      const dialog = prev.find(d => d.id === id);
      if (dialog) dialog.resolve(result);
      return prev.filter(d => d.id !== id);
    });
  }, []);

  return (
    <NotifContext.Provider value={{ notify, confirm }}>
      {children}
      
      {/* Container Toast */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2.5 z-[9998] pointer-events-none items-end">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
      
      {/* Container Dialog */}
      {dialogs.map(d => (
        <ConfirmDialog 
          key={d.id} 
          dialog={d} 
          onResolve={(result) => resolveDialog(d.id, result)} 
        />
      ))}
    </NotifContext.Provider>
  );
};

// ==========================================
// 5. CUSTOM HOOK
// ==========================================
export const useNotif = () => {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error('useNotif harus dipakai di dalam <NotifProvider>');
  return ctx;
};