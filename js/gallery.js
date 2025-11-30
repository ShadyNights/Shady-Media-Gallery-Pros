class GalleryManager {
  constructor() {
    this.gallery = document.getElementById('gallery');
    this.skeletonLoader = document.getElementById('skeletonLoader');
    this.loadingSentinel = document.getElementById('infiniteScrollTrigger');
    this.displayedIds = new Set();
    this.observer = null;
    this.bulkActionBar = document.getElementById('bulkActionsBar');
  }

  init() {
    this.setupIntersectionObserver();
    this.setupLazyLoading();

    if (CONFIG.FEATURES.BULK_OPERATIONS) {
      this.setupBulkActions();
    }

    console.log('Gallery Manager initialized');
    console.log('Autoplay:', STATE.settings.autoplay);
    console.log('NSFW blur:', STATE.settings.blurNsfw);
    console.log('AI Analyzer:', CONFIG.FEATURES.AI_INTEGRATION);
  }

  setupIntersectionObserver() {
    if (!this.loadingSentinel) return;

    const options = {
      root: null,
      rootMargin: CONFIG.PERFORMANCE.INFINITE_SCROLL_MARGIN,
      threshold: CONFIG.PERFORMANCE.INTERSECTION_THRESHOLD
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && STATE.settings.infiniteScroll && !STATE.isFetching && STATE.hasMore) {
          console.log('Infinite scroll triggered');
          this.loadMore();
        }
      });
    }, options);

    this.observer.observe(this.loadingSentinel);
  }

  async loadMore() {
    if (STATE.isFetching || !STATE.hasMore) return;

    STATE.isFetching = true;
    STATE.currentPage++;

    try {
      const result = await this.fetchMedia(
        STATE.currentQuery,
        STATE.currentType,
        STATE.currentPage
      );

      if (result && result.items && result.items.length > 0) {
        STATE.currentResults = [...STATE.currentResults, ...result.items];
        this.renderItems(result.items, true);
        STATE.hasMore = result.hasMore;
      } else {
        STATE.hasMore = false;
      }
    } catch (error) {
      console.error('Load more error:', error);
      UI.showError('Failed to load more items');
    } finally {
      STATE.isFetching = false;
    }
  }

  async fetchMedia(query, type, page) {
    try {
      let result;

      if (type === 'photo') {
        result = query === 'trending' ?
          await API.getCuratedPhotos(page) :
          await API.searchPhotos(query, page);
      } else if (type === 'video') {
        result = query === 'trending' ?
          await API.getPopularVideos(page) :
          await API.searchVideos(query, page);
      } else if (type === 'both') {
        const [photoResult, videoResult] = await Promise.all([
          query === 'trending' ?
          API.getCuratedPhotos(page) :
          API.searchPhotos(query, page),
          query === 'trending' ?
          API.getPopularVideos(page) :
          API.searchVideos(query, page)
        ]);

        const items = [
          ...(photoResult?.items || []),
          ...(videoResult?.items || [])
        ];

        result = {
          items: shuffleArray(items),
          hasMore: (photoResult?.hasMore || videoResult?.hasMore),
          total: (photoResult?.total || 0) + (videoResult?.total || 0)
        };
      }

      return result;
    } catch (error) {
      console.error('Fetch media error:', error);
      throw error;
    }
  }

  renderItems(items, append = false) {
    if (!append) {
      this.clear();
    }

    const fragment = document.createDocumentFragment();

    items.forEach(item => {
      if (this.displayedIds.has(item.id)) return;

      const card = this.createMediaCard(item);
      fragment.appendChild(card);
      this.displayedIds.add(item.id);
    });

    this.gallery.appendChild(fragment);

    this.setupLazyLoading();

    UI.updateCounters();
  }

  createMediaCard(item) {
    const card = document.createElement('div');
    card.className = 'media-card';
    card.dataset.id = item.id;
    card.dataset.type = item.type;

    if (STATE.bulkSelectMode) {
      card.classList.add('bulk-mode');
      if (STATE.selectedItems.has(item.id)) {
        card.classList.add('selected');
      }
    }

    const isVideo = item.type === 'video';
    const isFavorite = STATE.favorites.some(fav => fav.id === item.id);

    card.innerHTML = `
      <div class="media-wrapper">
        ${isVideo ? this.createVideoHTML(item) : this.createImageHTML(item)}
        ${isVideo ? `<div class="video-duration">${formatDuration(item.duration)}</div>` : ''}
        ${STATE.bulkSelectMode ? '<div class="bulk-checkbox"><i class="fas fa-check"></i></div>' : ''}
      </div>
      <div class="media-info">
        <h3 class="media-title">${sanitizeHTML(item.title)}</h3>
        <p class="media-photographer">
          <i class="fas fa-user"></i>
          <a href="${item.photographer_url}" target="_blank" rel="noopener">
            ${sanitizeHTML(item.photographer)}
          </a>
        </p>
        <div class="media-actions">
          <button class="action-btn favorite-btn ${isFavorite ? 'active' : ''}" 
                  data-id="${item.id}" 
                  title="Add to favorites">
            <i class="fas fa-heart"></i>
          </button>
          <button class="action-btn download-btn" 
                  data-id="${item.id}" 
                  title="Download">
            <i class="fas fa-download"></i>
          </button>
          <button class="action-btn share-btn" 
                  data-id="${item.id}" 
                  title="Share">
            <i class="fas fa-share-alt"></i>
          </button>
          ${CONFIG.FEATURES.AI_INTEGRATION ? `
            <button class="action-btn ai-btn" 
                    data-id="${item.id}" 
                    title="Generate Caption">
              <i class="fas fa-brain"></i>
            </button>
          ` : ''}
        </div>
      </div>
    `;

    this.attachCardListeners(card, item);

    return card;
  }

  createImageHTML(item) {
    return `
      <img 
        class="lazy-image" 
        data-src="${item.preview}" 
        data-full="${item.original}"
        alt="${sanitizeHTML(item.title)}"
        style="background-color: ${item.avg_color || '#f0f0f0'}"
      />
    `;
  }

  createVideoHTML(item) {
    return `
      <video 
        class="lazy-video" 
        data-src="${item.preview}"
        poster="${item.thumbnail}"
        ${STATE.settings.autoplay ? 'autoplay' : ''} 
        loop 
        muted 
        playsinline
        preload="${CONFIG.PERFORMANCE.VIDEO_PRELOAD}"
      ></video>
    `;
  }

  attachCardListeners(card, item) {
    const wrapper = card.querySelector('.media-wrapper');
    const favoriteBtn = card.querySelector('.favorite-btn');
    const downloadBtn = card.querySelector('.download-btn');
    const shareBtn = card.querySelector('.share-btn');
    const aiBtn = card.querySelector('.ai-btn');

    if (STATE.bulkSelectMode) {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('.media-actions')) {
          this.toggleItemSelection(item.id, card);
        }
      });
    } else {
      wrapper.addEventListener('click', () => {
        const index = STATE.currentResults.findIndex(r => r.id === item.id);
        lightboxManager.open(index);
      });
    }

    if (favoriteBtn) {
      favoriteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleFavorite(item, favoriteBtn);
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.downloadMedia(item);
      });
    }

    if (shareBtn) {
      shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.shareMedia(item);
      });
    }

    if (aiBtn) {
      aiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.analyzeImageWithAI(item);
      });
    }
  }

  setupLazyLoading() {
    const lazyImages = document.querySelectorAll('.lazy-image:not(.loaded)');
    const lazyVideos = document.querySelectorAll('.lazy-video:not(.loaded)');

    const observerOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.01
    };

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;

          const fullImg = new Image();
          fullImg.onload = () => {
            img.src = img.dataset.src;
            img.classList.add('loaded');
            img.style.opacity = '0';

            setTimeout(() => {
              img.style.transition = 'opacity 0.3s';
              img.style.opacity = '1';
            }, 50);

            if (STATE.settings.blurNsfw && detectNSFW(img)) {
              img.classList.add('blur-nsfw');
              const card = img.closest('.media-card');
              if (card && !card.querySelector('.nsfw-badge')) {
                const badge = document.createElement('div');
                badge.className = 'nsfw-badge';
                badge.innerHTML = '<i class="fas fa-eye-slash"></i> NSFW';
                card.querySelector('.media-wrapper').appendChild(badge);
              }
            }
          };

          fullImg.src = img.dataset.src;
          observer.unobserve(img);
        }
      });
    }, observerOptions);

    lazyImages.forEach(img => imageObserver.observe(img));

    const videoObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const video = entry.target;
          video.src = video.dataset.src;
          video.classList.add('loaded');

          if (STATE.settings.autoplay) {
            video.play().catch(err => console.log('Autoplay prevented:', err));
          }

          observer.unobserve(video);
        }
      });
    }, observerOptions);

    lazyVideos.forEach(video => videoObserver.observe(video));
  }

  async analyzeImageWithAI(item) {
    try {
      if (!aiAnalyzer || !aiAnalyzer.isConfigured()) {
        UI.showToast('AI Analyzer not configured. Please add your Gemini API key.', 'warning', 5000);
        return;
      }

      UI.showToast('Generating caption...', 'info', 2000);

      const imageUrl = item.preview || item.thumbnail;
      const result = await aiAnalyzer.analyzeImage(imageUrl);

      const dialog = document.createElement('div');
      dialog.className = 'confirm-dialog-overlay';
      dialog.innerHTML = `
        <div class="confirm-dialog ai-result-dialog">
          <button class="dialog-close-btn" id="closeAIDialogX" aria-label="Close">
            <i class="fas fa-times"></i>
          </button>
          <h3><i class="fas fa-brain"></i> AI Generated Caption</h3>
          <div class="ai-result-content">
            <img src="${imageUrl}" alt="Analyzed image" class="ai-preview-image">
            <div class="ai-description">${sanitizeHTML(result.caption)}</div>
            ${result.error ? `<div class="ai-error"><i class="fas fa-exclamation-triangle"></i> Using fallback caption</div>` : ''}
          </div>
          <div class="confirm-dialog-buttons">
            <button class="btn-secondary" id="copyCaption">
              <i class="fas fa-copy"></i> Copy Caption
            </button>
            <button class="btn-primary" id="closeAIDialog">
              <i class="fas fa-check"></i> Done
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(dialog);

      setTimeout(() => dialog.classList.add('show'), 10);

      const closeDialog = () => {
        dialog.classList.remove('show');
        setTimeout(() => dialog.remove(), 300);
      };

      document.getElementById('closeAIDialog').addEventListener('click', closeDialog);
      document.getElementById('closeAIDialogX').addEventListener('click', closeDialog);

      document.getElementById('copyCaption').addEventListener('click', async () => {
        await copyToClipboard(result.caption);
        UI.showToast('Caption copied to clipboard!', 'success', 2000);
        UI.playSound(900, 100);
      });

      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
          closeDialog();
        }
      });

      const escapeHandler = (e) => {
        if (e.key === 'Escape') {
          closeDialog();
          document.removeEventListener('keydown', escapeHandler);
        }
      };
      document.addEventListener('keydown', escapeHandler);

    } catch (error) {
      console.error('AI analysis error:', error);
      UI.showToast('Failed to generate caption', 'error');
    }
  }

  toggleFavorite(item, btn) {
    const index = STATE.favorites.findIndex(fav => fav.id === item.id);

    if (index > -1) {
      STATE.favorites.splice(index, 1);
      btn.classList.remove('active');
      UI.showToast('Removed from favorites', 'info', 2000);
    } else {
      if (STATE.favorites.length >= CONFIG.MAX_FAVORITES) {
        UI.showToast(`Maximum ${CONFIG.MAX_FAVORITES} favorites reached`, 'warning');
        return;
      }

      STATE.favorites.push({
        ...item,
        timestamp: Date.now()
      });

      btn.classList.add('active');
      UI.showToast('Added to favorites', 'success', 2000);
    }

    storageManager.saveFavorites();
    UI.updateCounters();
    UI.playSound(800, 100);
  }

  async downloadMedia(item) {
    try {
      const downloadUrl = item.download_url || item.original || item.preview;
      const filename = `${item.photographer}_${item.id}.${item.type === 'video' ? 'mp4' : 'jpg'}`;

      UI.showToast('Starting download...', 'info', 2000);

      const response = await fetch(downloadUrl, {
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

      UI.showToast('Download started!', 'success');
      UI.playSound(1000, 100);

      console.log('Download initiated:', filename);

    } catch (error) {
      console.error('Download error:', error);
      UI.showToast('Download failed. Try right-click > Save Image', 'error', 5000);
    }
  }

  async shareMedia(item) {
    const shareData = {
      title: item.title,
      text: `Check out this ${item.type} by ${item.photographer}`,
      url: item.url
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        UI.showToast('Shared successfully', 'success');
      } else {
        await copyToClipboard(item.url);
        UI.showToast('Link copied to clipboard', 'success');
      }
      UI.playSound(900, 100);
    } catch (error) {
      console.error('Share error:', error);
    }
  }

  applySorting(items, sortType) {
    const sorted = [...items];

    switch (sortType) {
      case 'latest':
        return sorted.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      case 'popular':
        return sorted.sort((a, b) => (b.width * b.height) - (a.width * a.height));
      case 'relevant':
      default:
        return sorted;
    }
  }

  filterByDateRange(items, fromDate, toDate) {
    if (!fromDate && !toDate) return items;

    return items.filter(item => {
      const itemDate = new Date(item.timestamp || Date.now());
      const from = fromDate ? new Date(fromDate) : new Date(0);
      const to = toDate ? new Date(toDate) : new Date();

      return itemDate >= from && itemDate <= to;
    });
  }

  setupBulkActions() {
    const selectAllBtn = document.getElementById('selectAllBtn');
    const deselectAllBtn = document.getElementById('deselectAllBtn');
    const bulkDownloadBtn = document.getElementById('bulkDownloadBtn');

    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', () => this.selectAll());
    }

    if (deselectAllBtn) {
      deselectAllBtn.addEventListener('click', () => this.deselectAll());
    }

    if (bulkDownloadBtn) {
      bulkDownloadBtn.addEventListener('click', () => this.bulkDownloadSelected());
    }
  }

  toggleBulkSelectMode() {
    STATE.bulkSelectMode = !STATE.bulkSelectMode;

    if (STATE.bulkSelectMode) {
      this.bulkActionBar.classList.remove('hidden');
      document.querySelectorAll('.media-card').forEach(card => {
        card.classList.add('bulk-mode');
      });
    } else {
      this.bulkActionBar.classList.add('hidden');
      this.deselectAll();
      document.querySelectorAll('.media-card').forEach(card => {
        card.classList.remove('bulk-mode', 'selected');
      });
    }

    UI.playSound(700, 100);
  }

  toggleItemSelection(itemId, card) {
    if (STATE.selectedItems.has(itemId)) {
      STATE.selectedItems.delete(itemId);
      card.classList.remove('selected');
    } else {
      STATE.selectedItems.add(itemId);
      card.classList.add('selected');
    }

    this.updateBulkCount();
  }

  selectAll() {
    STATE.currentResults.forEach(item => {
      STATE.selectedItems.add(item.id);
    });

    document.querySelectorAll('.media-card').forEach(card => {
      card.classList.add('selected');
    });

    this.updateBulkCount();
    UI.showToast('All items selected', 'success', 2000);
  }

  deselectAll() {
    STATE.selectedItems.clear();

    document.querySelectorAll('.media-card').forEach(card => {
      card.classList.remove('selected');
    });

    this.updateBulkCount();
  }

  updateBulkCount() {
    const countElement = document.getElementById('selectedCount');
    if (countElement) {
      countElement.textContent = STATE.selectedItems.size;
    }
  }

  async bulkDownloadSelected() {
    const selected = Array.from(STATE.selectedItems);

    if (selected.length === 0) {
      UI.showToast('No items selected', 'warning');
      return;
    }

    const confirmed = await showConfirmDialog(
      `Download ${selected.length} items?\n\nThis may take a while.`,
      'Bulk Download'
    );

    if (!confirmed) {
      console.log('Bulk download cancelled by user');
      return;
    }

    UI.showToast(`Downloading ${selected.length} items...`, 'info', 3000);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < selected.length; i++) {
      try {
        const itemId = selected[i];
        const item = STATE.currentResults.find(r => r.id === itemId);

        if (item) {
          await this.downloadMedia(item);
          successCount++;

          const progress = ((i + 1) / selected.length) * 100;
          UI.showDownloadProgress(progress);

          await new Promise(resolve => setTimeout(resolve, 800));
        }
      } catch (error) {
        console.error('Bulk download error:', error);
        failCount++;
      }
    }

    UI.showToast(
      `Download complete! Success: ${successCount}, Failed: ${failCount}`,
      failCount > 0 ? 'warning' : 'success',
      5000
    );

    this.toggleBulkSelectMode();
  }

  clear() {
    this.gallery.innerHTML = '';
    this.displayedIds.clear();
  }
}

const galleryManager = new GalleryManager();

if (typeof window !== 'undefined') {
  window.galleryManager = galleryManager;
}