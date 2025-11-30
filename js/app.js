class Application {
  constructor() {
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    console.log('Initializing Shady Media Gallery Pro...');

    try {
      storageManager.init();
      UI.init();
      galleryManager.init();
      lightboxManager.init();
      shortcutsManager.init();

      if (CONFIG.FEATURES.MOOD_SEARCH && typeof moodUI !== 'undefined') {
        try {
          moodUI.init();
          console.log('Mood Engine initialized');
        } catch (error) {
          console.warn('Mood Engine failed to initialize:', error);
        }
      }

      if (CONFIG.FEATURES.OFFLINE_MODE && typeof offlineManager !== 'undefined') {
        try {
          await offlineManager.init();
          offlineManager.setupNetworkDetection();
          console.log('Offline Manager initialized');
        } catch (error) {
          console.warn('Offline Manager failed to initialize:', error);
        }
      }

      this.setupEventListeners();
      this.setupSearchHandlers();
      this.setupTabHandlers();
      this.setupSettingsHandlers();
      this.setupFilterHandlers();

      await this.loadInitialContent();

      this.setupTrendingTags();

      this.registerServiceWorker();
      this.setupNetworkHandlers();
      this.setupScrollHandler();

      UI.hideLoading();

      this.initialized = true;
      console.log('Application initialized successfully');
      console.log('Current theme:', STATE.theme);
      console.log('Sounds enabled:', STATE.settings.soundsEnabled);

      UI.showToast('Welcome to Shady Media Gallery Pro!', 'success', 2000);

    } catch (error) {
      console.error('Initialization error:', error);
      UI.showError('Failed to initialize application');
      UI.hideLoading();
    }
  }

  setupEventListeners() {
    console.log('Setting up event listeners...');

    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        UI.toggleTheme();
        console.log('Theme button clicked');
      });
      console.log('Theme button handler attached');
    } else {
      console.warn('Theme button not found');
    }

    const soundBtn = document.getElementById('soundBtn');
    if (soundBtn) {
      soundBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        UI.toggleSounds();
        console.log('Sound button clicked');
      });
      console.log('Sound button handler attached');
    } else {
      console.warn('Sound button not found');
    }

    const viewModeBtn = document.getElementById('viewModeBtn');
    if (viewModeBtn) {
      viewModeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        UI.toggleViewMode();
        console.log('View mode button clicked');
      });
      console.log('View mode button handler attached');
    } else {
      console.warn('View mode button not found');
    }

    const eyeTrackingBtn = document.getElementById('eyeTrackingBtn');
    if (eyeTrackingBtn) {
      eyeTrackingBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof eyeTrackingManager !== 'undefined') {
          if (eyeTrackingManager.isActive) {
            eyeTrackingManager.stop();
          } else {
            eyeTrackingManager.start();
          }
          console.log('Eye tracking toggled');
        } else {
          UI.showToast('Eye tracking not available', 'warning');
          console.warn('Eye tracking manager not found');
        }
      });
      console.log('Eye tracking button handler attached');
    } else {
      console.warn('Eye tracking button not found');
    }

    const moodPlaylistsBtn = document.getElementById('moodPlaylistsBtn');
    if (moodPlaylistsBtn) {
      moodPlaylistsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof moodUI !== 'undefined' && typeof moodUI.showMoodPlaylists === 'function') {
          moodUI.showMoodPlaylists();
          console.log('Mood playlists opened');
        } else {
          UI.showToast('Mood playlists not available', 'warning');
          console.warn('Mood UI not found');
        }
      });
      console.log('Mood playlists button handler attached');
    } else {
      console.warn('Mood playlists button not found');
    }

    const bulkSelectBtn = document.getElementById('bulkSelectBtn');
    if (bulkSelectBtn) {
      bulkSelectBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        galleryManager.toggleBulkSelectMode();
        console.log('Bulk select toggled');
      });
      console.log('Bulk select button handler attached');
    } else {
      console.warn('Bulk select button not found');
    }

    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        UI.toggleSettings();
        console.log('Settings button clicked');
      });
      console.log('Settings button handler attached');
    } else {
      console.warn('Settings button not found');
    }

    const closeSettings = document.getElementById('closeSettings');
    if (closeSettings) {
      closeSettings.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        UI.toggleSettings();
      });
      console.log('Close settings handler attached');
    }

    const selectAllBtn = document.getElementById('selectAllBtn');
    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', () => {
        galleryManager.selectAll();
      });
    }

    const deselectAllBtn = document.getElementById('deselectAllBtn');
    if (deselectAllBtn) {
      deselectAllBtn.addEventListener('click', () => {
        galleryManager.deselectAll();
      });
    }

    const bulkDownloadBtn = document.getElementById('bulkDownloadBtn');
    if (bulkDownloadBtn) {
      bulkDownloadBtn.addEventListener('click', () => {
        galleryManager.bulkDownloadSelected();
      });
    }

    const exitBulkMode = document.getElementById('exitBulkMode');
    if (exitBulkMode) {
      exitBulkMode.addEventListener('click', () => {
        galleryManager.toggleBulkSelectMode();
      });
    }

    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
      scrollTopBtn.addEventListener('click', () => {
        UI.scrollToTop();
      });
    }

    const clearSearch = document.getElementById('clearSearch');
    if (clearSearch) {
      clearSearch.addEventListener('click', () => {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
          this.performSearch('trending');
        }
      });
    }

    console.log('All event listeners attached successfully');
  }

  setupSearchHandlers() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');

    if (!searchInput) {
      console.warn('Search input not found');
      return;
    }

    const debouncedSearch = debounce((query) => {
      this.performSearch(query);
    }, CONFIG.DEBOUNCE_DELAY);

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();

      if (clearBtn) {
        clearBtn.style.display = query ? 'block' : 'none';
      }

      if (query.length >= 2) {
        this.showAutocompleteSuggestions(query);
        debouncedSearch(query);
      } else if (query.length === 0) {
        this.hideAutocompleteSuggestions();
        debouncedSearch('trending');
      }
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim() || 'trending';
        this.hideAutocompleteSuggestions();
        this.performSearch(query);
      }
    });

    console.log('Search handlers attached');
  }

  showAutocompleteSuggestions(query) {
    const autocomplete = document.getElementById('autocomplete');
    if (!autocomplete) return;

    const suggestions = CONFIG.TRENDING_KEYWORDS.filter(keyword =>
      keyword.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);

    if (suggestions.length === 0) {
      this.hideAutocompleteSuggestions();
      return;
    }

    autocomplete.innerHTML = suggestions.map(suggestion => `
      <div class="autocomplete-item" data-value="${suggestion}">
        ${sanitizeHTML(suggestion)}
      </div>
    `).join('');

    autocomplete.classList.remove('hidden');

    autocomplete.querySelectorAll('.autocomplete-item').forEach(item => {
      item.addEventListener('click', () => {
        const value = item.dataset.value;
        document.getElementById('searchInput').value = value;
        this.hideAutocompleteSuggestions();
        this.performSearch(value);
      });
    });
  }

  hideAutocompleteSuggestions() {
    const autocomplete = document.getElementById('autocomplete');
    if (autocomplete) {
      autocomplete.classList.add('hidden');
    }
  }

  async performSearch(query) {
    if (!query) query = 'trending';

    console.log('Searching for:', query);

    STATE.currentQuery = query;
    STATE.currentPage = 1;
    STATE.hasMore = true;

    UI.showSkeleton();
    galleryManager.clear();

    try {
      let allItems = [];

      if (STATE.currentType === 'both') {
        const [photoResult, videoResult] = await Promise.all([
          galleryManager.fetchMedia(query, 'photo', STATE.currentPage),
          galleryManager.fetchMedia(query, 'video', STATE.currentPage)
        ]);

        if (photoResult && photoResult.items) {
          allItems = allItems.concat(photoResult.items);
        }
        if (videoResult && videoResult.items) {
          allItems = allItems.concat(videoResult.items);
        }

        allItems = shuffleArray(allItems);

      } else {
        const result = await galleryManager.fetchMedia(
          query,
          STATE.currentType,
          STATE.currentPage
        );

        if (result && result.items) {
          allItems = result.items;
        }
      }

      if (allItems.length > 0) {
        const items = query !== 'trending' ?
          galleryManager.applySorting(allItems, STATE.currentSort) :
          allItems;

        STATE.currentResults = items;
        galleryManager.renderItems(items);
        STATE.hasMore = allItems.length >= CONFIG.PER_PAGE;

        console.log('Search complete:', allItems.length, 'items');
      } else {
        galleryManager.gallery.innerHTML = '<p class="no-results">No results found. Try a different search.</p>';
        console.log('No results found');
      }
    } catch (error) {
      console.error('Search error:', error);
      UI.showError('Search failed. Please try again.');
      galleryManager.gallery.innerHTML = '<p class="no-results">An error occurred. Please try again.</p>';
    } finally {
      UI.hideSkeleton();
    }
  }

  setupTabHandlers() {
    const tabs = document.querySelectorAll('.tab-btn');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const tabName = tab.dataset.tab;
        STATE.activeTab = tabName;
        this.loadTab(tabName);

        console.log('Tab changed to:', tabName);
      });
    });

    console.log('Tab handlers attached');
  }

  async loadTab(tabName) {
    galleryManager.clear();
    UI.showSkeleton();

    try {
      let items = [];

      switch (tabName) {
        case 'all':
          await this.performSearch(STATE.currentQuery);
          return;

        case 'favorites':
          items = STATE.favorites;
          break;

        case 'history':
          items = STATE.historyLog;
          break;
      }

      if (items.length > 0) {
        const fromDate = document.getElementById('dateFrom')?.value;
        const toDate = document.getElementById('dateTo')?.value;

        let filteredItems = galleryManager.filterByDateRange(items, fromDate, toDate);
        filteredItems = galleryManager.applySorting(filteredItems, STATE.currentSort);

        galleryManager.renderItems(filteredItems);
      } else {
        const messages = {
          favorites: 'No favorites yet. Click the ❤️ button on any media to add it here.',
          history: 'No history yet. Start browsing to build your history.'
        };
        galleryManager.gallery.innerHTML = `<p class="no-results">${messages[tabName]}</p>`;
      }
    } catch (error) {
      console.error('Load tab error:', error);
      UI.showError('Failed to load content');
    } finally {
      UI.hideSkeleton();
    }
  }

  loadCurrentTab() {
    this.loadTab(STATE.activeTab);
  }

  setupSettingsHandlers() {
    const autoplayToggle = document.getElementById('autoplayToggle');
    const blurNsfwToggle = document.getElementById('blurNsfwToggle');
    const compactModeToggle = document.getElementById('compactModeToggle');
    const infiniteScrollToggle = document.getElementById('infiniteScrollToggle');
    const autoThemeToggle = document.getElementById('autoThemeToggle');
    const offlineCacheToggle = document.getElementById('offlineCacheToggle');

    if (autoplayToggle) {
      autoplayToggle.checked = STATE.settings.autoplay;
      autoplayToggle.addEventListener('change', (e) => {
        STATE.settings.autoplay = e.target.checked;
        storageManager.saveSettings();

        document.querySelectorAll('.lazy-video.loaded').forEach(video => {
          if (e.target.checked) {
            video.play().catch(err => console.log('Play prevented:', err));
          } else {
            video.pause();
          }
        });

        UI.showToast(`Autoplay ${e.target.checked ? 'enabled' : 'disabled'}`, 'success');
      });
    }

    if (blurNsfwToggle) {
      blurNsfwToggle.checked = STATE.settings.blurNsfw;
      blurNsfwToggle.addEventListener('change', (e) => {
        STATE.settings.blurNsfw = e.target.checked;
        storageManager.saveSettings();

        if (e.target.checked) {
          let detected = 0;

          document.querySelectorAll('.lazy-image.loaded').forEach(img => {
            setTimeout(() => {
              try {
                if (detectNSFW(img)) {
                  detected++;
                  img.classList.add('blur-nsfw');

                  const card = img.closest('.media-card');
                  if (card && !card.querySelector('.nsfw-badge')) {
                    const badge = document.createElement('div');
                    badge.className = 'nsfw-badge';
                    badge.innerHTML = '<i class="fas fa-eye-slash"></i> NSFW';
                    card.querySelector('.media-wrapper').appendChild(badge);
                  }
                }
              } catch (error) {
                console.error('NSFW detection error:', error);
              }
            }, 100);
          });

          setTimeout(() => {
            UI.showToast(`NSFW scan complete: ${detected} images blurred`, 'info', 3000);
          }, 500);

        } else {
          document.querySelectorAll('.blur-nsfw').forEach(img => {
            img.classList.remove('blur-nsfw');
          });
          document.querySelectorAll('.nsfw-badge').forEach(badge => {
            badge.remove();
          });
          UI.showToast('NSFW blur disabled', 'info');
        }
      });
    }

    if (compactModeToggle) {
      compactModeToggle.checked = STATE.settings.compactMode;
      if (STATE.settings.compactMode) {
        document.body.classList.add('compact-mode');
      }
      compactModeToggle.addEventListener('change', (e) => {
        STATE.settings.compactMode = e.target.checked;
        storageManager.saveSettings();
        document.body.classList.toggle('compact-mode', e.target.checked);
      });
    }

    const fontSizeSelect = document.getElementById('fontSizeSelect');
    if (fontSizeSelect) {
      fontSizeSelect.value = STATE.settings.fontSize || 'medium';
      fontSizeSelect.addEventListener('change', (e) => {
        UI.setFontSize(e.target.value);
      });
    }

    if (infiniteScrollToggle) {
      infiniteScrollToggle.checked = STATE.settings.infiniteScroll;
      infiniteScrollToggle.addEventListener('change', (e) => {
        STATE.settings.infiniteScroll = e.target.checked;
        storageManager.saveSettings();
      });
    }

    if (autoThemeToggle) {
      autoThemeToggle.checked = STATE.settings.autoTheme;
      autoThemeToggle.addEventListener('change', (e) => {
        STATE.settings.autoTheme = e.target.checked;
        storageManager.saveSettings();
        if (e.target.checked) {
          UI.initAutoTheme();
        }
      });
    }

    if (offlineCacheToggle) {
      offlineCacheToggle.checked = STATE.settings.offlineCache;
      offlineCacheToggle.addEventListener('change', (e) => {
        STATE.settings.offlineCache = e.target.checked;
        storageManager.saveSettings();
        if (!e.target.checked) {
          API.clearCache();
        }
      });
    }

    document.getElementById('resetFavorites')?.addEventListener('click', () => {
      if (confirm('Clear all favorites? This cannot be undone.')) {
        storageManager.clearFavorites();
        if (STATE.activeTab === 'favorites') {
          this.loadTab('favorites');
        }
      }
    });

    document.getElementById('resetHistory')?.addEventListener('click', () => {
      if (confirm('Clear all history? This cannot be undone.')) {
        storageManager.clearHistory();
        if (STATE.activeTab === 'history') {
          this.loadTab('history');
        }
      }
    });

    document.getElementById('exportData')?.addEventListener('click', () => {
      storageManager.exportData();
    });

    document.getElementById('importData')?.addEventListener('click', () => {
      storageManager.importData();
    });

    console.log('Settings handlers attached');
  }

  setupFilterHandlers() {
    console.log('Setting up filter handlers...');

    const typeFilter = document.getElementById('typeFilter');
    if (typeFilter) {
      typeFilter.value = STATE.currentType;
      typeFilter.addEventListener('change', (e) => {
        STATE.currentType = e.target.value;
        console.log('Type filter changed to:', e.target.value);
        this.performSearch(STATE.currentQuery);
      });
      console.log('Type filter handler attached');
    } else {
      console.warn('Type filter not found');
    }

    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
      sortFilter.value = STATE.currentSort;
      sortFilter.addEventListener('change', (e) => {
        STATE.currentSort = e.target.value;
        console.log('Sort filter changed to:', e.target.value);
        this.loadCurrentTab();
      });
      console.log('Sort filter handler attached');
    } else {
      console.warn('Sort filter not found');
    }

    const dateFrom = document.getElementById('dateFrom');
    if (dateFrom) {
      dateFrom.addEventListener('change', () => {
        console.log('Date from changed:', dateFrom.value);
        this.loadCurrentTab();
      });
      console.log('Date from handler attached');
    } else {
      console.warn('Date from not found');
    }

    const dateTo = document.getElementById('dateTo');
    if (dateTo) {
      dateTo.addEventListener('change', () => {
        console.log('Date to changed:', dateTo.value);
        this.loadCurrentTab();
      });
      console.log('Date to handler attached');
    } else {
      console.warn('Date to not found');
    }

    const clearDates = document.getElementById('clearDates');
    if (clearDates) {
      clearDates.addEventListener('click', () => {
        if (dateFrom) dateFrom.value = '';
        if (dateTo) dateTo.value = '';
        console.log('Dates cleared');
        this.loadCurrentTab();
      });
      console.log('Clear dates handler attached');
    } else {
      console.warn('Clear dates button not found');
    }

    console.log('All filter handlers attached successfully');
  }

  setupTrendingTags() {
    const container = document.getElementById('trendingTags');
    if (!container) {
      console.warn('Trending tags container not found');
      return;
    }

    const displayTags = CONFIG.TRENDING_KEYWORDS.slice(0, 10);

    container.innerHTML = displayTags.map(tag => `
      <button class="tag-btn" data-tag="${tag}">${sanitizeHTML(tag)}</button>
    `).join('');

    container.querySelectorAll('.tag-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.dataset.tag;
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
          searchInput.value = tag;
        }
        this.performSearch(tag);
        UI.scrollToTop();
        console.log('Trending tag clicked:', tag);
      });
    });

    console.log('Trending tags setup complete:', displayTags.join(', '));
  }

  setupScrollHandler() {
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (!scrollTopBtn) return;

    window.addEventListener('scroll', throttle(() => {
      if (window.pageYOffset > 300) {
        scrollTopBtn.classList.remove('hidden');
      } else {
        scrollTopBtn.classList.add('hidden');
      }
    }, 200));
  }

  async loadInitialContent() {
    await this.performSearch('trending');
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator && CONFIG.FEATURES.PWA) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('Service Worker registered:', registration.scope);
          })
          .catch(error => {
            console.log('Service Worker registration failed:', error);
          });
      });
    }
  }

  setupNetworkHandlers() {
    window.addEventListener('online', () => {
      UI.showToast('Back online!', 'success');

      if (typeof offlineManager !== 'undefined') {
        offlineManager.syncOfflineQueue();
      }
    });

    window.addEventListener('offline', () => {
      UI.showToast('You are offline. Cached content is still available.', 'warning', 5000);
    });
  }

  getStats() {
    return {
      initialized: this.initialized,
      gallery: {
        totalItems: galleryManager.displayedIds.size,
        favorites: STATE.favorites.length,
        history: STATE.historyLog.length
      },
      storage: storageManager.getStats(),
      cache: API.getCacheStats(),
      currentSearch: STATE.currentQuery,
      currentPage: STATE.currentPage,
      activeTab: STATE.activeTab,
      theme: STATE.theme,
      settings: STATE.settings,
      features: {
        moodEngine: typeof moodUI !== 'undefined',
        aiAnalyzer: typeof aiAnalyzer !== 'undefined',
        offlineManager: typeof offlineManager !== 'undefined',
        eyeTracking: typeof eyeTrackingManager !== 'undefined'
      }
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded');
  window.app = new Application();
  window.app.init();
});

if (typeof window !== 'undefined') {
  window.DEBUG = {
    getStats: () => window.app.getStats(),
    logShortcuts: () => shortcutsManager.logShortcuts(),
    clearStorage: () => storageManager.clearAllData(),
    clearCache: () => API.clearCache(),
    testEyeTracking: () => eyeTrackingManager?.start(),
    testAI: (imageUrl) => aiAnalyzer?.analyzeImage(imageUrl),
    testTheme: () => UI.toggleTheme(),
    testSound: () => UI.toggleSounds(),
    testViewMode: () => UI.toggleViewMode(),
    API: API,
    STATE: STATE,
    CONFIG: CONFIG
  };

  console.log('Debug utilities available:');
  console.log(' window.DEBUG.getStats() - Get stats');
  console.log(' window.DEBUG.testTheme() - Test theme toggle');
  console.log(' window.DEBUG.testSound() - Test sound toggle');
  console.log(' window.DEBUG.testViewMode() - Test view mode');
}