class ShortcutsManager {
  constructor() {
    this.shortcuts = CONFIG.SHORTCUTS;
    this.helpPanelOpen = false;
  }

  init() {
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        if (e.key === this.shortcuts.SEARCH) {
          e.preventDefault();
          this.focusSearch();
        }
        return;
      }

      this.handleKeyPress(e);
    });

    console.log('Shortcuts Manager initialized');
    console.log('Press ? for keyboard shortcuts help');
  }

  handleKeyPress(e) {
    const key = e.key.toLowerCase();

    if (STATE.lightboxOpen) {
      switch (e.key) {
        case this.shortcuts.ARROW_LEFT:
          e.preventDefault();
          window.lightboxManager.previous();
          break;
        case this.shortcuts.ARROW_RIGHT:
          e.preventDefault();
          window.lightboxManager.next();
          break;
        case this.shortcuts.ESCAPE:
          e.preventDefault();
          window.lightboxManager.close();
          break;
        case this.shortcuts.SLIDESHOW:
          e.preventDefault();
          window.lightboxManager.toggleSlideshow();
          break;
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && key === 'z') {
      e.preventDefault();
      storageManager.undoLastAction();
      return;
    }

    switch (key) {
      case this.shortcuts.SEARCH:
        e.preventDefault();
        this.focusSearch();
        break;

      case this.shortcuts.THEME:
        e.preventDefault();
        UI.toggleTheme();
        break;

      case this.shortcuts.SOUNDS:
        e.preventDefault();
        UI.toggleSounds();
        break;

      case this.shortcuts.VIEW_MODE:
        e.preventDefault();
        UI.toggleViewMode();
        break;

      case this.shortcuts.FAVORITE:
        e.preventDefault();
        this.favoriteCurrent();
        break;

      case this.shortcuts.DOWNLOAD:
        e.preventDefault();
        this.downloadCurrent();
        break;

      case this.shortcuts.HELP:
        e.preventDefault();
        this.toggleHelpPanel();
        break;

      case this.shortcuts.SETTINGS:
        e.preventDefault();
        UI.toggleSettings();
        break;

      case this.shortcuts.SCROLL_TOP:
        e.preventDefault();
        UI.scrollToTop();
        break;

      case this.shortcuts.LIGHTBOX:
        e.preventDefault();
        this.openFirstItem();
        break;

      case this.shortcuts.ESCAPE:
        e.preventDefault();
        this.closeAll();
        break;
    }
  }

  focusSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  favoriteCurrent() {
    if (STATE.lightboxOpen && window.lightboxManager.items[STATE.lightboxIndex]) {
      window.lightboxManager.toggleFavorite();
    } else {
      const firstCard = document.querySelector('.media-card');
      if (firstCard && firstCard._itemData) {
        galleryManager.toggleFavorite(firstCard._itemData.id);
      }
    }
  }

  downloadCurrent() {
    if (STATE.lightboxOpen && window.lightboxManager.items[STATE.lightboxIndex]) {
      window.lightboxManager.download();
    } else {
      const firstCard = document.querySelector('.media-card');
      if (firstCard && firstCard._itemData) {
        galleryManager.downloadMedia(firstCard._itemData.id);
      }
    }
  }

  openFirstItem() {
    const firstCard = document.querySelector('.media-card');
    if (firstCard) {
      window.lightboxManager.open(0);
    }
  }

  closeAll() {
    if (STATE.lightboxOpen) {
      window.lightboxManager.close();
    }

    const settingsPanel = document.getElementById('settingsPanel');
    if (settingsPanel && !settingsPanel.classList.contains('hidden')) {
      UI.toggleSettings();
    }

    if (this.helpPanelOpen) {
      this.toggleHelpPanel();
    }

    const contextMenu = document.getElementById('contextMenu');
    if (contextMenu && !contextMenu.classList.contains('hidden')) {
      contextMenu.classList.add('hidden');
    }
  }

  toggleHelpPanel() {
    this.helpPanelOpen = !this.helpPanelOpen;

    if (this.helpPanelOpen) {
      this.showHelpPanel();
    } else {
      this.hideHelpPanel();
    }
  }

  showHelpPanel() {
    const existing = document.getElementById('helpPanel');
    if (existing) {
      existing.remove();
    }

    const panel = document.createElement('div');
    panel.id = 'helpPanel';
    panel.className = 'help-panel';
    panel.innerHTML = `
      <div class="help-content">
        <h2><i class="fas fa-keyboard"></i> Keyboard Shortcuts</h2>
        <button id="closeHelp" class="close-btn" aria-label="Close help">
          <i class="fas fa-times"></i>
        </button>
        
        <div class="shortcuts-grid">
          <div class="shortcut-group">
            <h3><i class="fas fa-directions"></i> Navigation</h3>
            <div class="shortcut-item">
              <kbd>/</kbd>
              <span>Focus search</span>
            </div>
            <div class="shortcut-item">
              <kbd>H</kbd>
              <span>Scroll to top</span>
            </div>
            <div class="shortcut-item">
              <kbd>←</kbd> <kbd>→</kbd>
              <span>Navigate in lightbox</span>
            </div>
          </div>
          
          <div class="shortcut-group">
            <h3><i class="fas fa-film"></i> Media Controls</h3>
            <div class="shortcut-item">
              <kbd>L</kbd>
              <span>Toggle lightbox</span>
            </div>
            <div class="shortcut-item">
              <kbd>Space</kbd>
              <span>Toggle slideshow</span>
            </div>
            <div class="shortcut-item">
              <kbd>F</kbd>
              <span>Favorite current</span>
            </div>
            <div class="shortcut-item">
              <kbd>D</kbd>
              <span>Download current</span>
            </div>
          </div>
          
          <div class="shortcut-group">
            <h3><i class="fas fa-palette"></i> Interface</h3>
            <div class="shortcut-item">
              <kbd>T</kbd>
              <span>Cycle theme</span>
            </div>
            <div class="shortcut-item">
              <kbd>S</kbd>
              <span>Toggle sounds</span>
            </div>
            <div class="shortcut-item">
              <kbd>V</kbd>
              <span>Toggle view (grid/list)</span>
            </div>
            <div class="shortcut-item">
              <kbd>G</kbd>
              <span>Open settings</span>
            </div>
            <div class="shortcut-item">
              <kbd>?</kbd>
              <span>Show this help</span>
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>Z</kbd>
              <span>Undo last delete</span>
            </div>
            <div class="shortcut-item">
              <kbd>Esc</kbd>
              <span>Close all panels</span>
            </div>
          </div>
        </div>
        
        <p class="help-footer">
          <i class="fas fa-lightbulb"></i> Tip: Hover over buttons to see their keyboard shortcuts
        </p>
      </div>
    `;

    document.body.appendChild(panel);

    document.getElementById('closeHelp')?.addEventListener('click', () => {
      this.toggleHelpPanel();
    });

    panel.addEventListener('click', (e) => {
      if (e.target === panel) {
        this.toggleHelpPanel();
      }
    });

    setTimeout(() => panel.classList.add('show'), 10);
  }

  hideHelpPanel() {
    const panel = document.getElementById('helpPanel');
    if (panel) {
      panel.classList.remove('show');
      setTimeout(() => panel.remove(), 300);
    }
  }

  getAllShortcuts() {
    return {
      '/': 'Focus search',
      'T': 'Cycle theme',
      'S': 'Toggle sounds',
      'V': 'Toggle view',
      'F': 'Favorite current',
      'D': 'Download current',
      'Space': 'Toggle slideshow',
      '?': 'Show help',
      'G': 'Settings',
      'H': 'Scroll top',
      'L': 'Toggle lightbox',
      'Ctrl+Z': 'Undo delete',
      'Esc': 'Close modals',
      '←/→': 'Navigate in lightbox'
    };
  }

  logShortcuts() {
    console.table(this.getAllShortcuts());
  }
}

const shortcutsManager = new ShortcutsManager();

if (typeof window !== 'undefined') {
  window.shortcutsManager = shortcutsManager;
}