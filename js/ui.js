class UIManager {
  constructor() {
    this.currentThemeIndex = 0;
    this.themes = CONFIG.THEMES;
  }

  init() {
    this.ensureLightThemeDefault();

    this.applyTheme(STATE.theme);
    this.updateThemeIcon();
    this.updateSoundIcon();
    this.updateViewModeIcon();
    this.setupClickOutsideHandler();

    if (STATE.settings.autoTheme) {
      this.initAutoTheme();
    }

    console.log('UI Manager initialized');
  }

  ensureLightThemeDefault() {
    const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);

    if (!savedTheme) {
      STATE.theme = 'light';
      localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, 'light');
      console.log('Theme set to light (default)');
    }
  }

  toggleTheme() {
    const currentIndex = this.themes.indexOf(STATE.theme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    const nextTheme = this.themes[nextIndex];

    STATE.theme = nextTheme;
    this.applyTheme(nextTheme);
    this.updateThemeIcon();

    localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, nextTheme);
    this.showToast(`Theme: ${nextTheme}`, 'success', 1500);
    this.playSound(800, 100);

    console.log('Theme changed to:', nextTheme);
  }

  applyTheme(theme) {
    document.body.className = '';

    if (theme === 'auto') {
      const hour = new Date().getHours();
      const autoTheme = (hour >= 18 || hour < 6) ? 'dark' : 'light';
      document.body.classList.add(`theme-${autoTheme}`);
    } else {
      document.body.classList.add(`theme-${theme}`);
    }
  }

  updateThemeIcon() {
    const btn = document.getElementById('themeBtn');
    if (!btn) return;

    const icons = {
      light: 'fa-sun',
      dark: 'fa-moon',
      sepia: 'fa-book',
      neon: 'fa-bolt',
      auto: 'fa-adjust'
    };

    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = `fas ${icons[STATE.theme] || 'fa-sun'}`;
    }
  }

  toggleSounds() {
    STATE.settings.soundsEnabled = !STATE.settings.soundsEnabled;
    this.updateSoundIcon();
    storageManager.saveSettings();

    this.showToast(
      `Sounds ${STATE.settings.soundsEnabled ? 'enabled' : 'disabled'}`,
      'success',
      1500
    );

    if (STATE.settings.soundsEnabled) {
      this.playSound(600, 100);
    }

    console.log('Sounds:', STATE.settings.soundsEnabled);
  }

  updateSoundIcon() {
    const btn = document.getElementById('soundBtn');
    if (!btn) return;

    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = STATE.settings.soundsEnabled ?
        'fas fa-volume-up' :
        'fas fa-volume-mute';
    }
  }

  toggleViewMode() {
    STATE.viewMode = STATE.viewMode === 'grid' ? 'list' : 'grid';

    const gallery = document.getElementById('gallery');
    if (gallery) {
      gallery.classList.toggle('list-view', STATE.viewMode === 'list');
    }

    this.updateViewModeIcon();
    this.showToast(`View: ${STATE.viewMode}`, 'success', 1500);
    this.playSound(700, 100);

    console.log('View mode:', STATE.viewMode);
  }

  updateViewModeIcon() {
    const btn = document.getElementById('viewModeBtn');
    if (!btn) return;

    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = STATE.viewMode === 'grid' ?
        'fas fa-th' :
        'fas fa-list';
    }
  }

  toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    if (!panel) return;

    const isHidden = panel.classList.contains('hidden');

    if (isHidden) {
      panel.classList.remove('hidden');
      this.updateStorageInfo();
      this.playSound(800, 100);
      console.log('Settings panel: opened');
    } else {
      panel.classList.add('hidden');
      this.playSound(600, 100);
      console.log('Settings panel: closed');
    }
  }

  setupClickOutsideHandler() {
    document.addEventListener('click', (e) => {
      const settingsPanel = document.getElementById('settingsPanel');
      const settingsBtn = document.getElementById('settingsBtn');

      if (settingsPanel &&
        !settingsPanel.classList.contains('hidden') &&
        !settingsPanel.contains(e.target) &&
        !settingsBtn.contains(e.target)) {
        settingsPanel.classList.add('hidden');
      }
    });
  }

  updateStorageInfo() {
    const info = document.getElementById('storageInfo');
    if (!info) return;

    const stats = storageManager.getStats();
    info.textContent = `Favorites: ${stats.favorites}, History: ${stats.history}`;
  }

  initAutoTheme() {
    const updateTheme = () => {
      if (STATE.settings.autoTheme) {
        const hour = new Date().getHours();
        const autoTheme = (hour >= 18 || hour < 6) ? 'dark' : 'light';
        STATE.theme = autoTheme;
        this.applyTheme(autoTheme);
        this.updateThemeIcon();
      }
    };

    updateTheme();
    setInterval(updateTheme, 60000);
  }

  setFontSize(size) {
    document.documentElement.style.fontSize = CONFIG.FONT_SIZES[size] || '16px';
    STATE.settings.fontSize = size;
    storageManager.saveSettings();
    this.showToast(`Font size: ${size}`, 'success', 1500);
  }

  showToast(message, type = 'info', duration = CONFIG.TOAST_DURATION) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };

    toast.innerHTML = `
      <i class="fas ${icons[type]}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  showError(message) {
    this.showToast(message, 'error', 5000);
  }

  playSound(frequency, duration) {
    if (!STATE.settings.soundsEnabled) return;

    try {
      const audioContext = new(window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.error('Sound error:', error);
    }
  }

  showSkeleton() {
    const loader = document.getElementById('skeletonLoader');
    if (loader) {
      loader.classList.remove('hidden');
    }
  }

  hideSkeleton() {
    const loader = document.getElementById('skeletonLoader');
    if (loader) {
      loader.classList.add('hidden');
    }
  }

  showLoading() {
    const screen = document.getElementById('loadingScreen');
    if (screen) {
      screen.style.display = 'flex';
      screen.style.opacity = '1';
    }
  }

  hideLoading() {
    const screen = document.getElementById('loadingScreen');
    const app = document.getElementById('app');

    console.log('Hiding loading screen...');

    if (screen) {
      screen.style.transition = 'opacity 0.5s ease';
      screen.style.opacity = '0';

      setTimeout(() => {
        screen.style.display = 'none';
        console.log('Loading screen hidden');
      }, 500);
    }

    if (app) {
      app.style.display = 'block';
      app.style.opacity = '0';

      app.offsetHeight;

      app.style.transition = 'opacity 0.5s ease';
      setTimeout(() => {
        app.style.opacity = '1';
        console.log('App container visible');
      }, 100);
    }
  }

  updateCounters() {
    const allCount = document.getElementById('allCount');
    const favCount = document.getElementById('favCount');
    const historyCount = document.getElementById('historyCount');

    if (allCount) {
      allCount.textContent = STATE.currentResults.length;
    }
    if (favCount) {
      favCount.textContent = STATE.favorites.length;
    }
    if (historyCount) {
      historyCount.textContent = STATE.historyLog.length;
    }
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  showDownloadProgress(progress) {
    const progressBar = document.getElementById('downloadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    if (progressBar && progressFill && progressText) {
      progressBar.classList.remove('hidden');
      progressFill.style.width = `${progress}%`;
      progressText.textContent = `${Math.round(progress)}%`;

      if (progress >= 100) {
        setTimeout(() => {
          progressBar.classList.add('hidden');
        }, 1000);
      }
    }
  }
}

const UI = new UIManager();

if (typeof window !== 'undefined') {
  window.UI = UI;
}