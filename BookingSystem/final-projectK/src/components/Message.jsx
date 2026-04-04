import { useEffect } from 'react';

function Message({ type, message, onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const styles = {
    success: 'border-green-200 bg-green-50 text-green-900',
    error: 'border-red-200 bg-red-50 text-red-900',
    info: 'border-amber-200 bg-amber-50 text-amber-900'
  };

  return (
    <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${styles[type]}`}>
      {message}
    </div>
  );
}

export default Message;