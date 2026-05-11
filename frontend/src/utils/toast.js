// Lightweight toast utility (no external library needed)
const DEFAULT_DURATION = 3000;

const createToastContainer = () => {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 99999;
      display: flex; flex-direction: column; gap: 8px;
    `;
    document.body.appendChild(container);
  }
  return container;
};

export const showToast = (message, type = 'info', duration = DEFAULT_DURATION) => {
  const container = createToastContainer();
  const toastEl = document.createElement('div');

  const colors = {
    success: { bg: '#10b981', icon: '✅' },
    error:   { bg: '#ef4444', icon: '❌' },
    info:    { bg: '#6366f1', icon: 'ℹ️' },
    warning: { bg: '#f59e0b', icon: '⚠️' },
  };

  const { bg, icon } = colors[type] || colors.info;

  toastEl.style.cssText = `
    background: ${bg}; color: white; padding: 12px 20px; border-radius: 10px;
    display: flex; align-items: center; gap: 10px; font-size: 14px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3); min-width: 250px;
    animation: slideIn 0.3s ease; font-family: 'Be Vietnam Pro', sans-serif;
  `;
  const iconEl = document.createElement('span');
  iconEl.textContent = icon;
  const messageEl = document.createElement('span');
  messageEl.textContent = message;
  toastEl.append(iconEl, messageEl);

  // Add slide-in keyframe once
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100px); opacity: 0; } }
    `;
    document.head.appendChild(style);
  }

  container.appendChild(toastEl);

  setTimeout(() => {
    toastEl.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toastEl.remove(), 300);
  }, duration);
};

// Convenience object (backward compatible)
export const toast = {
  success: (msg, dur) => showToast(msg, 'success', dur),
  error:   (msg, dur) => showToast(msg, 'error', dur),
  info:    (msg, dur) => showToast(msg, 'info', dur),
  warning: (msg, dur) => showToast(msg, 'warning', dur),
};
