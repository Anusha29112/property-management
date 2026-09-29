import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast-item ${toast.type}`}>
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} color="#10b981" />
          ) : (
            <AlertCircle size={18} color="#f43f5e" />
          )}
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc', flex: 1 }}>
            {toast.message}
          </span>
          <button
            onClick={() => onDismiss(toast.id)}
            style={{ color: '#94a3b8', padding: '0.2rem', display: 'flex' }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
