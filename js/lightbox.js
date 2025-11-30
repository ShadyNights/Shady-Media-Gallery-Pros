class LightboxManager {
  constructor() {
    this.lightbox = document.getElementById('lightbox');
    this.mediaContainer = document.getElementById('mediaContainer');
    this.currentIndex = 0;
    this.items = [];
    this.slideshowTimer = null;
  }

  open(index = 0) {
    this.items = this.getCurrentItems();
    if (this.items.length === 0) return;

    this.currentIndex = index;
    STATE.lightboxOpen = true;
    STATE.lightboxIndex = index;

    this.lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    this.render();
    this.trapFocus();

    storageManager.addToHistory(this.items[this.currentIndex]);
  }

  close() {
    STATE.lightboxOpen = false;
    this.lightbox.classList.add('hidden');
    document.body.style.overflow = '';

    this.stopSlideshow();

    const card = document.querySelector(`[data-index="${this.currentIndex}"]`);
    if (card) card.focus();
  }

  getCurrentItems() {
    const gallery = document.getElementById('gallery');
    const cards = Array.from(gallery.querySelectorAll('.media-card'));
    return cards.map(card => card._itemData).filter(Boolean);
  }

  render() {
    if (!this.items[this.currentIndex]) return;

    const item = this.items[this.currentIndex];

    this.mediaContainer.innerHTML = '';

    let mediaElement;
    if (item.type === 'video') {
      mediaElement = document.createElement('video');
      mediaElement.src = item.full || item.preview;
      mediaElement.controls = true;
      mediaElement.autoplay = true;
      mediaElement.style.maxWidth = '100%';
      mediaElement.style.maxHeight = '100%';
    } else {
      mediaElement = document.createElement('img');
      mediaElement.src = item.full || item.preview;
      mediaElement.alt = item.title;
      mediaElement.style.maxWidth = '100%';
      mediaElement.style.maxHeight = '100%';
    }

    this.mediaContainer.appendChild(mediaElement);

    document.getElementById('mediaTitle').textContent = item.title;
    document.getElementById('mediaDescription').textContent =
      `${item.photographer} • ${item.width}×${item.height}`;

    const isFavorited = storageManager.isFavorited(item.id);
    const favBtn = document.getElementById('toggleFavBtn');
    if (favBtn) {
      const icon = favBtn.querySelector('.icon i');
      if (icon) {
        icon.className = isFavorited ? 'fas fa-heart' : 'far fa-heart';
      }
      favBtn.querySelector('.label').textContent = isFavorited ? 'Unfavorite' : 'Favorite';
    }
  }

  previous() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.render();
      storageManager.addToHistory(this.items[this.currentIndex]);
    } else {
      this.currentIndex = this.items.length - 1;
      this.render();
    }
  }

  next() {
    if (this.currentIndex < this.items.length - 1) {
      this.currentIndex++;
      this.render();
      storageManager.addToHistory(this.items[this.currentIndex]);
    } else {
      this.currentIndex = 0;
      this.render();
    }
  }

  toggleFavorite() {
    const item = this.items[this.currentIndex];
    if (!item) return;

    const isFavorited = storageManager.isFavorited(item.id);

    if (isFavorited) {
      storageManager.removeFromFavorites(item.id);
      UI.showToast('Removed from favorites', 'success');
    } else {
      if (storageManager.addToFavorites(item)) {
        UI.showToast('Added to favorites', 'success');
      }
    }

    const favBtn = document.getElementById('toggleFavBtn');
    if (favBtn) {
      const newState = storageManager.isFavorited(item.id);
      const icon = favBtn.querySelector('.icon i');
      if (icon) {
        icon.className = newState ? 'fas fa-heart' : 'far fa-heart';
      }
      favBtn.querySelector('.label').textContent = newState ? 'Unfavorite' : 'Favorite';
    }

    galleryManager.toggleFavorite(item.id);
  }

  async download() {
    const item = this.items[this.currentIndex];
    if (!item) return;

    await galleryManager.downloadMedia(item.id);
  }

  async share() {
    const item = this.items[this.currentIndex];
    if (!item) return;

    await galleryManager.shareMedia(item);
  }

  requestFullscreen() {
    const elem = this.lightbox;

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  }

  toggleSlideshow() {
    if (STATE.slideshowActive) {
      this.stopSlideshow();
    } else {
      this.startSlideshow();
    }
  }

  startSlideshow() {
    STATE.slideshowActive = true;

    const btn = document.getElementById('slideshowBtn');
    if (btn) {
      const icon = btn.querySelector('.icon i');
      if (icon) {
        icon.className = 'fas fa-pause';
      }
      btn.querySelector('.label').textContent = 'Pause';
    }

    this.slideshowTimer = setInterval(() => {
      this.next();
    }, CONFIG.SLIDESHOW_INTERVAL);

    UI.showToast('Slideshow started', 'info', 1500);
  }

  stopSlideshow() {
    STATE.slideshowActive = false;

    if (this.slideshowTimer) {
      clearInterval(this.slideshowTimer);
      this.slideshowTimer = null;
    }

    const btn = document.getElementById('slideshowBtn');
    if (btn) {
      const icon = btn.querySelector('.icon i');
      if (icon) {
        icon.className = 'fas fa-play';
      }
      btn.querySelector('.label').textContent = 'Slideshow';
    }
  }

  trapFocus() {
    const focusableElements = this.lightbox.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement.focus();

    this.lightbox.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    });
  }

  init() {
    const closeBtn = document.getElementById('closeLightbox');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    const prevBtn = document.getElementById('prevMedia');
    const nextBtn = document.getElementById('nextMedia');

    if (prevBtn) prevBtn.addEventListener('click', () => this.previous());
    if (nextBtn) nextBtn.addEventListener('click', () => this.next());

    document.getElementById('toggleFavBtn')?.addEventListener('click', () => this.toggleFavorite());
    document.getElementById('downloadBtn')?.addEventListener('click', () => this.download());
    document.getElementById('shareBtn')?.addEventListener('click', () => this.share());
    document.getElementById('fullscreenBtn')?.addEventListener('click', () => this.requestFullscreen());
    document.getElementById('slideshowBtn')?.addEventListener('click', () => this.toggleSlideshow());

    const backdrop = this.lightbox.querySelector('.lightbox-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => this.close());
    }

    console.log('Lightbox Manager initialized');
  }
}

const lightboxManager = new LightboxManager();

if (typeof window !== 'undefined') {
  window.lightboxManager = lightboxManager;
}