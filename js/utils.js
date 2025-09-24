export function showToast(message, type = 'info', timeout = 3000) {
    const toastContainer = document.getElementById("toastContainer");
    if (!toastContainer) return;
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = message;
    toastContainer.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      setTimeout(() => t.remove(), 300);
    }, timeout);
  }
  
  export function formatTimestamp(ts) {
    if (!ts) return '—';
    return ts.toDate ? ts.toDate().toLocaleString() : new Date(ts).toLocaleString();
  }
  
  export function isToday(timestamp) {
    if (!timestamp) return false;
    const today = new Date();
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }
  