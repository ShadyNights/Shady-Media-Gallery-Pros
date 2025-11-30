class OfflineManager {
  constructor() {
    this.db = null;
    this.DB_NAME = 'ShadyGalleryDB';
    this.DB_VERSION = 1;
    this.isOnline = navigator.onLine;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('favorites')) {
          db.createObjectStore('favorites', {
            keyPath: 'id'
          });
        }
        if (!db.objectStoreNames.contains('history')) {
          db.createObjectStore('history', {
            keyPath: 'id'
          });
        }
        if (!db.objectStoreNames.contains('searches')) {
          db.createObjectStore('searches', {
            keyPath: 'query'
          });
        }
        if (!db.objectStoreNames.contains('offlineQueue')) {
          db.createObjectStore('offlineQueue', {
            keyPath: 'id',
            autoIncrement: true
          });
        }
      };
    });
  }

  async save(storeName, data) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName, key) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, key) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async syncOfflineQueue() {
    if (!this.isOnline) return;

    const queue = await this.getAll('offlineQueue');
    console.log(`Syncing ${queue.length} offline actions...`);

    for (const item of queue) {
      try {
        await this.executeQueuedAction(item);
        await this.delete('offlineQueue', item.id);
      } catch (error) {
        console.error('Sync error:', error);
      }
    }

    UI.showToast('Offline changes synced!', 'success');
  }

  async executeQueuedAction(item) {
    switch (item.type) {
      case 'favorite':
        await storageManager.addToFavorites(item.data);
        break;
      case 'unfavorite':
        await storageManager.removeFromFavorites(item.data.id);
        break;
    }
  }

  async queueAction(type, data) {
    await this.save('offlineQueue', {
      type,
      data,
      timestamp: Date.now()
    });
  }

  setupNetworkDetection() {
    window.addEventListener('online', async () => {
      this.isOnline = true;
      console.log('Back online');
      UI.showToast('Back online! Syncing changes...', 'success');
      await this.syncOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Offline mode');
      UI.showToast('You are offline. Changes will sync when reconnected.', 'warning', 5000);
    });
  }

  async saveSearchOffline(query, results) {
    await this.save('searches', {
      query,
      results,
      timestamp: Date.now()
    });
  }

  async getOfflineSearch(query) {
    return await this.get('searches', query);
  }

  async startOfflineSlideshow() {
    const favorites = await this.getAll('favorites');
    const history = await this.getAll('history');
    const allImages = [...favorites, ...history];

    if (allImages.length === 0) {
      UI.showToast('No offline images available', 'warning');
      return;
    }

    let currentIndex = 0;

    const showNext = () => {
      if (currentIndex >= allImages.length) {
        currentIndex = 0;
      }

      const image = allImages[currentIndex];
      if (window.lightboxManager) {
        window.lightboxManager.showOfflineImage(image);
      }

      currentIndex++;
    };

    showNext();
    const interval = setInterval(showNext, 5000);

    this.slideshowInterval = interval;
  }

  stopOfflineSlideshow() {
    if (this.slideshowInterval) {
      clearInterval(this.slideshowInterval);
      this.slideshowInterval = null;
    }
  }
}

const offlineManager = new OfflineManager();

if (typeof window !== 'undefined') {
  window.offlineManager = offlineManager;
}