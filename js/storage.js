class StorageManager {
  constructor() {
    this.storageAvailable = this.checkStorageAvailability();
  }

  checkStorageAvailability() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      console.warn('localStorage not available:', error);
      return false;
    }
  }

  saveSettings() {
    if (!this.storageAvailable) return false;

    try {
      setStorageItem(CONFIG.STORAGE_KEYS.SETTINGS, STATE.settings);
      return true;
    } catch (error) {
      console.error('Save settings error:', error);
      return false;
    }
  }

  loadSettings() {
    if (!this.storageAvailable) return;

    try {
      const settings = getStorageItem(CONFIG.STORAGE_KEYS.SETTINGS);
      if (settings) {
        STATE.settings = { ...STATE.settings,
          ...settings
        };
        console.log('Settings loaded');
      }
    } catch (error) {
      console.error('Load settings error:', error);
    }
  }

  saveFavorites() {
    if (!this.storageAvailable) return false;

    try {
      const favoritesToSave = STATE.favorites.slice(0, CONFIG.MAX_FAVORITES);
      setStorageItem(CONFIG.STORAGE_KEYS.FAVORITES, favoritesToSave);
      return true;
    } catch (error) {
      console.error('Save favorites error:', error);
      UI.showError('Failed to save favorites. Storage may be full.');
      return false;
    }
  }

  loadFavorites() {
    if (!this.storageAvailable) return;

    try {
      const favorites = getStorageItem(CONFIG.STORAGE_KEYS.FAVORITES, []);
      STATE.favorites = favorites;
      console.log(`Loaded ${favorites.length} favorites`);
    } catch (error) {
      console.error('Load favorites error:', error);
      STATE.favorites = [];
    }
  }

  addToFavorites(item) {
    if (!item || !item.id) return false;

    if (STATE.favorites.some(fav => fav.id === item.id)) {
      return false;
    }

    if (STATE.favorites.length >= CONFIG.MAX_FAVORITES) {
      UI.showToast(`Maximum ${CONFIG.MAX_FAVORITES} favorites reached`, 'warning');
      return false;
    }

    STATE.favorites.unshift(item);
    this.saveFavorites();
    UI.updateCounters();

    return true;
  }

  removeFromFavorites(itemId) {
    const initialLength = STATE.favorites.length;
    STATE.favorites = STATE.favorites.filter(fav => fav.id !== itemId);

    if (STATE.favorites.length < initialLength) {
      this.saveFavorites();
      UI.updateCounters();
      return true;
    }

    return false;
  }

  isFavorited(itemId) {
    return STATE.favorites.some(fav => fav.id === itemId);
  }

  clearFavorites() {
    STATE.favorites = [];
    this.saveFavorites();
    UI.updateCounters();
    UI.showToast('All favorites cleared', 'success');
  }

  deleteFromFavorites(itemId) {
    const item = STATE.favorites.find(fav => fav.id === itemId);
    if (!item) return false;

    this.addToUndoStack({
      action: 'deleteFavorite',
      item: item,
      timestamp: Date.now()
    });

    this.removeFromFavorites(itemId);
    UI.showToast('Removed from favorites. Press Ctrl+Z to undo.', 'success', 3000);
    return true;
  }

  saveHistory() {
    if (!this.storageAvailable) return false;

    try {
      const historyToSave = STATE.historyLog.slice(0, CONFIG.MAX_HISTORY);
      setStorageItem(CONFIG.STORAGE_KEYS.HISTORY, historyToSave);
      return true;
    } catch (error) {
      console.error('Save history error:', error);
      return false;
    }
  }

  loadHistory() {
    if (!this.storageAvailable) return;

    try {
      const history = getStorageItem(CONFIG.STORAGE_KEYS.HISTORY, []);
      STATE.historyLog = history;
      console.log(`Loaded ${history.length} history items`);
    } catch (error) {
      console.error('Load history error:', error);
      STATE.historyLog = [];
    }
  }

  addToHistory(item) {
    if (!item || !item.id) return false;

    STATE.historyLog = STATE.historyLog.filter(h => h.id !== item.id);

    STATE.historyLog.unshift({
      ...item,
      viewedAt: new Date().toISOString()
    });

    if (STATE.historyLog.length > CONFIG.MAX_HISTORY) {
      STATE.historyLog = STATE.historyLog.slice(0, CONFIG.MAX_HISTORY);
    }

    this.saveHistory();
    UI.updateCounters();

    return true;
  }

  clearHistory() {
    STATE.historyLog = [];
    this.saveHistory();
    UI.updateCounters();
    UI.showToast('History cleared', 'success');
  }

  deleteFromHistory(itemId) {
    const item = STATE.historyLog.find(h => h.id === itemId);
    if (!item) return false;

    this.addToUndoStack({
      action: 'deleteHistory',
      item: item,
      timestamp: Date.now()
    });

    STATE.historyLog = STATE.historyLog.filter(h => h.id !== itemId);
    this.saveHistory();
    UI.updateCounters();
    UI.showToast('Removed from history. Press Ctrl+Z to undo.', 'success', 3000);
    return true;
  }

  addToUndoStack(action) {
    STATE.undoStack.push(action);

    if (STATE.undoStack.length > STATE.maxUndoStack) {
      STATE.undoStack.shift();
    }
  }

  undoLastAction() {
    if (STATE.undoStack.length === 0) {
      UI.showToast('Nothing to undo', 'info', 1500);
      return false;
    }

    const lastAction = STATE.undoStack.pop();

    switch (lastAction.action) {
      case 'deleteFavorite':
        STATE.favorites.unshift(lastAction.item);
        this.saveFavorites();
        UI.showToast('Undo: Restored to favorites', 'success');
        break;

      case 'deleteHistory':
        STATE.historyLog.unshift(lastAction.item);
        this.saveHistory();
        UI.showToast('Undo: Restored to history', 'success');
        break;
    }

    UI.updateCounters();

    if (window.app) {
      window.app.loadCurrentTab();
    }

    return true;
  }

  exportData() {
    try {
      const data = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        settings: STATE.settings,
        favorites: STATE.favorites,
        history: STATE.historyLog,
        theme: STATE.theme
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shady-gallery-backup-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      UI.showToast('Data exported successfully', 'success');
      return true;
    } catch (error) {
      console.error('Export error:', error);
      UI.showError('Failed to export data');
      return false;
    }
  }

  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
      try {
        const file = e.target.files[0];
        if (!file) return;

        const text = await file.text();
        const data = JSON.parse(text);

        if (!data.version || !data.favorites || !data.history) {
          throw new Error('Invalid backup file');
        }

        if (data.settings) {
          STATE.settings = { ...STATE.settings,
            ...data.settings
          };
          this.saveSettings();
        }

        if (data.favorites) {
          STATE.favorites = data.favorites.slice(0, CONFIG.MAX_FAVORITES);
          this.saveFavorites();
        }

        if (data.history) {
          STATE.historyLog = data.history.slice(0, CONFIG.MAX_HISTORY);
          this.saveHistory();
        }

        if (data.theme) {
          UI.setTheme(data.theme);
        }

        UI.updateCounters();
        UI.showToast('Data imported successfully', 'success');

        if (window.app) {
          window.app.loadCurrentTab();
        }
      } catch (error) {
        console.error('Import error:', error);
        UI.showError('Failed to import data. Invalid file format.');
      }
    };

    input.click();
  }

  clearAllData() {
    if (!confirm('Clear all data? This cannot be undone.')) {
      return false;
    }

    STATE.favorites = [];
    STATE.historyLog = [];
    STATE.settings = {
      autoplay: true,
      soundsEnabled: true,
      blurNsfw: false,
      compactMode: false,
      infiniteScroll: true,
      autoTheme: false,
      offlineCache: true,
      fontSize: 'medium'
    };

    clearAllStorage();
    API.clearCache();

    UI.showToast('All data cleared', 'success');
    UI.updateCounters();

    return true;
  }

  getStats() {
    if (!this.storageAvailable) {
      return {
        available: false
      };
    }

    let total = 0;
    let used = 0;

    try {
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const size = localStorage[key].length + key.length;
          total += size;

          if (Object.values(CONFIG.STORAGE_KEYS).includes(key)) {
            used += size;
          }
        }
      }

      return {
        available: true,
        total: total,
        used: used,
        usedFormatted: (used / 1024).toFixed(2) + ' KB',
        totalFormatted: (total / 1024).toFixed(2) + ' KB',
        percent: ((used / (5 * 1024 * 1024)) * 100).toFixed(2) + '%'
      };
    } catch (error) {
      return {
        available: true,
        error: error.message
      };
    }
  }

  init() {
    this.loadSettings();
    this.loadFavorites();
    this.loadHistory();

    console.log('Storage Manager initialized');
  }
}

const storageManager = new StorageManager();

if (typeof window !== 'undefined') {
  window.storageManager = storageManager;
}