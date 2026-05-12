// Lightweight toast utility (no external library needed)
const DEFAULT_DURATION = 3000;

const createToastContainer = () => {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed; top: 22px; right: 22px; z-index: 99999;
      display: flex; flex-direction: column; gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }
  return container;
};

const icons = {
  success: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  error: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  info: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  warning: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
};

export const showToast = (message, type = 'info', duration = DEFAULT_DURATION) => {
  const container = createToastContainer();
  const toastEl = document.createElement('div');

  const colors = {
    success: { accent: '#0f766e', bg: '#ecfdf5', border: '#a7f3d0' },
    error:   { accent: '#e11d48', bg: '#fff1f2', border: '#fecdd3' },
    info:    { accent: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    warning: { accent: '#b45309', bg: '#fff7ed', border: '#fed7aa' },
  };

  const tone = colors[type] || colors.info;

  toastEl.style.cssText = `
    position: relative; overflow: hidden; pointer-events: auto;
    background: ${tone.bg}; color: #132033; padding: 13px 16px;
    border-radius: 8px; border: 1px solid ${tone.border};
    display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700;
    box-shadow: 0 18px 42px rgba(27,55,100,0.14); min-width: 280px; max-width: min(420px, calc(100vw - 44px));
    animation: digidocToastIn 0.28s cubic-bezier(.2,.8,.2,1);
    font-family: 'Plus Jakarta Sans', 'Be Vietnam Pro', system-ui, sans-serif;
  `;
  const iconEl = document.createElement('span');
  iconEl.innerHTML = icons[type] || icons.info;
  iconEl.style.cssText = `
    width: 28px; height: 28px; border-radius: 8px;
    display: inline-flex; align-items: center; justify-content: center;
    color: ${tone.accent}; background: #ffffff; border: 1px solid ${tone.border};
    flex-shrink: 0;
  `;
  const messageEl = document.createElement('span');
  messageEl.textContent = message;
  messageEl.style.cssText = 'line-height: 1.45;';
  const progressEl = document.createElement('span');
  progressEl.style.cssText = `
    position: absolute; left: 0; bottom: 0; height: 3px; width: 100%;
    background: ${tone.accent}; transform-origin: left center;
    animation: digidocToastProgress ${duration}ms linear forwards;
  `;
  toastEl.append(iconEl, messageEl, progressEl);

  // Add slide-in keyframe once
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes digidocToastIn { from { transform: translateX(28px) translateY(-6px); opacity: 0; } to { transform: translateX(0) translateY(0); opacity: 1; } }
      @keyframes digidocToastOut { from { transform: translateX(0) translateY(0); opacity: 1; } to { transform: translateX(28px) translateY(-6px); opacity: 0; } }
      @keyframes digidocToastProgress { from { transform: scaleX(1); } to { transform: scaleX(0); } }
    `;
    document.head.appendChild(style);
  }

  container.appendChild(toastEl);

  setTimeout(() => {
    toastEl.style.animation = 'digidocToastOut 0.22s ease forwards';
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
