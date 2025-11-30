function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await wait(Math.pow(2, i) * 1000);
    }
  }
}

function sanitizeHTML(str) {
  if (!str) return '';
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

function isInViewport(el) {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function smoothScrollTo(target) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

function generateId(length = 12) {
  return Math.random().toString(36).substring(2, length + 2);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function formatDuration(seconds) {
  if (!seconds || seconds === 0 || isNaN(seconds)) return '0:00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function getStorageItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Storage get error:', error);
    return defaultValue;
  }
}

function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Storage set error:', error);
    return false;
  }
}

function removeStorageItem(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Storage remove error:', error);
    return false;
  }
}

function clearAllStorage() {
  try {
    if (typeof CONFIG !== 'undefined' && CONFIG.STORAGE_KEYS) {
      Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } else {
      localStorage.clear();
    }
    return true;
  } catch (error) {
    console.error('Storage clear error:', error);
    return false;
  }
}

async function downloadFile(url, filename, onProgress = null) {
  try {
    const response = await fetch(url);
    const reader = response.body.getReader();
    const contentLength = +response.headers.get('Content-Length');

    let receivedLength = 0;
    const chunks = [];

    while (true) {
      const {
        done,
        value
      } = await reader.read();
      if (done) break;

      chunks.push(value);
      receivedLength += value.length;

      if (onProgress && contentLength) {
        const progress = (receivedLength / contentLength) * 100;
        onProgress(progress);
      }
    }

    const blob = new Blob(chunks);
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);

    return true;
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}

async function compressImage(imageUrl, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            reject(new Error('Compression failed'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Image load failed'));
    img.src = imageUrl;
  });
}

function detectNSFW(img) {
  try {
    if (!img || !img.complete || !img.naturalWidth || !img.naturalHeight) {
      return false;
    }

    if (img.naturalWidth < 50 || img.naturalHeight < 50) {
      return false;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', {
      willReadFrequently: true
    });

    const maxSize = 300;
    const scale = Math.min(maxSize / img.naturalWidth, maxSize / img.naturalHeight, 1);
    canvas.width = Math.floor(img.naturalWidth * scale);
    canvas.height = Math.floor(img.naturalHeight * scale);

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    let imageData;
    try {
      imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } catch (e) {
      if (e.name === 'SecurityError') {
        return false;
      }
      throw e;
    }

    const data = imageData.data;
    let skinPixels = 0;
    let totalSampled = 0;
    const sampleRate = 3;

    for (let i = 0; i < data.length; i += 4 * sampleRate) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a < 128) continue;
      totalSampled++;

      const isSkin1 = (
        r > 95 && g > 40 && b > 20 &&
        r > g && r > b &&
        Math.abs(r - g) > 15 &&
        a > 15
      );

      const isSkin2 = (
        r > 220 && g > 210 && b > 170 &&
        Math.abs(r - g) < 15
      );

      const isSkin3 = (
        r > 60 && r < 220 &&
        g > 40 && g < 200 &&
        b > 20 && b < 170 &&
        r > g && g > b &&
        (r - g) > 10
      );

      const y = 0.299 * r + 0.587 * g + 0.114 * b;
      const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
      const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

      const isSkin4 = (
        y > 80 &&
        cb >= 85 && cb <= 135 &&
        cr >= 135 && cr <= 180
      );

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const delta = max - min;

      let h = 0;
      if (delta !== 0) {
        if (max === r) {
          h = 60 * (((g - b) / delta) % 6);
        } else if (max === g) {
          h = 60 * (((b - r) / delta) + 2);
        } else {
          h = 60 * (((r - g) / delta) + 4);
        }
      }
      if (h < 0) h += 360;

      const s = max === 0 ? 0 : delta / max;
      const v = max / 255;

      const isSkin5 = (
        h >= 0 && h <= 50 &&
        s >= 0.23 && s <= 0.68 &&
        v >= 0.35 && v <= 1.0
      );

      if (isSkin1 || isSkin2 || isSkin3 || isSkin4 || isSkin5) {
        skinPixels++;
      }
    }

    const skinPercentage = totalSampled > 0 ? (skinPixels / totalSampled) * 100 : 0;
    const isNSFW = skinPercentage > 30;

    if (isNSFW) {
      console.log(`NSFW DETECTED: ${skinPercentage.toFixed(1)}% skin tone`);
    }

    return isNSFW;

  } catch (error) {
    console.error('NSFW detection error:', error);
    return false;
  }
}

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textarea);
      return result;
    }
  } catch (error) {
    console.error('Clipboard error:', error);
    return false;
  }
}

function showConfirmDialog(message, title = 'Confirm') {
  return new Promise((resolve) => {
    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog-overlay';
    dialog.innerHTML = `
      <div class="confirm-dialog">
        <h3>${sanitizeHTML(title)}</h3>
        <p>${sanitizeHTML(message)}</p>
        <div class="confirm-dialog-buttons">
          <button class="btn-secondary" id="confirmCancel">
            <i class="fas fa-times"></i> Cancel
          </button>
          <button class="btn-primary" id="confirmOk">
            <i class="fas fa-check"></i> OK
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    setTimeout(() => dialog.classList.add('show'), 10);

    const cleanup = () => {
      dialog.classList.remove('show');
      setTimeout(() => dialog.remove(), 300);
    };

    document.getElementById('confirmOk').addEventListener('click', () => {
      cleanup();
      resolve(true);
    });

    document.getElementById('confirmCancel').addEventListener('click', () => {
      cleanup();
      resolve(false);
    });

    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        cleanup();
        resolve(false);
      }
    });

    document.addEventListener('keydown', function escapeHandler(e) {
      if (e.key === 'Escape') {
        cleanup();
        resolve(false);
        document.removeEventListener('keydown', escapeHandler);
      }
    });
  });
}

function shouldEnableAutoDarkMode() {
  const hour = new Date().getHours();
  return hour >= 18 || hour < 6;
}

function getSystemThemePreference() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

function isValidDateRange(fromDate, toDate) {
  if (!fromDate || !toDate) return true;
  return new Date(fromDate) <= new Date(toDate);
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function removeDuplicates(array, key = 'id') {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browser = 'Unknown';

  if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
  else if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
  else if (ua.indexOf('Safari') > -1) browser = 'Safari';
  else if (ua.indexOf('Edge') > -1) browser = 'Edge';
  else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) browser = 'Opera';

  return {
    browser,
    mobile: /Mobile|Android|iPhone|iPad|iPod/i.test(ua),
    online: navigator.onLine,
    platform: navigator.platform,
    language: navigator.language
  };
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

function getColorPalette(img, numColors = 5) {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const scaledSize = 100;
    canvas.width = scaledSize;
    canvas.height = scaledSize;

    ctx.drawImage(img, 0, 0, scaledSize, scaledSize);

    const imageData = ctx.getImageData(0, 0, scaledSize, scaledSize);
    const data = imageData.data;

    const colors = [];

    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      colors.push(`rgb(${r}, ${g}, ${b})`);
    }

    return colors.slice(0, numColors);

  } catch (error) {
    console.error('Color palette error:', error);
    return [];
  }
}

if (typeof window !== 'undefined') {
  window.utils = {
    debounce,
    throttle,
    wait,
    retryWithBackoff,
    sanitizeHTML,
    formatDate,
    formatDuration,
    truncateText,
    getStorageItem,
    setStorageItem,
    removeStorageItem,
    clearAllStorage,
    downloadFile,
    compressImage,
    detectNSFW,
    copyToClipboard,
    showConfirmDialog,
    shouldEnableAutoDarkMode,
    getSystemThemePreference,
    isValidUrl,
    isValidDateRange,
    shuffleArray,
    removeDuplicates,
    formatFileSize,
    getBrowserInfo,
    scrollToTop,
    isInViewport,
    smoothScrollTo,
    generateId,
    getColorPalette
  };

  window.formatDuration = formatDuration;
  window.sanitizeHTML = sanitizeHTML;
  window.shuffleArray = shuffleArray;
  window.copyToClipboard = copyToClipboard;
  window.detectNSFW = detectNSFW;
  window.showConfirmDialog = showConfirmDialog;
  window.wait = wait;
  window.debounce = debounce;
  window.throttle = throttle;
  window.retryWithBackoff = retryWithBackoff;
}

console.log('Utils loaded');