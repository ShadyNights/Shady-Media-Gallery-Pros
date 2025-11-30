class MoodUI {
  constructor() {
    this.currentMoodCard = null;
    this.moodGridVisible = false;
  }

  init() {
    this.injectMoodUI();
    this.setupMoodSearch();
    this.setupMoodGrid();
    this.setupMoodPlaylists();
    console.log('Mood UI initialized');
  }

  injectMoodUI() {
    const searchSection = document.querySelector('.search-section');
    if (!searchSection) return;

    const searchContainer = searchSection.querySelector('.search-container');
    if (searchContainer) {
      const moodToggle = document.createElement('button');
      moodToggle.id = 'moodSearchToggle';
      moodToggle.className = 'mood-toggle-btn';
      moodToggle.innerHTML = '<i class="fas fa-smile"></i> Search by Mood';
      moodToggle.title = 'Switch to mood-based search';
      searchContainer.appendChild(moodToggle);

      moodToggle.addEventListener('click', () => this.toggleMoodSearch());
    }

    const moodGrid = document.createElement('div');
    moodGrid.id = 'moodGrid';
    moodGrid.className = 'mood-grid hidden';
    searchSection.appendChild(moodGrid);

    const moodCard = document.createElement('div');
    moodCard.id = 'moodCard';
    moodCard.className = 'mood-card hidden';
    document.querySelector('.app-container').appendChild(moodCard);

    const captionDisplay = document.createElement('div');
    captionDisplay.id = 'aiCaptionDisplay';
    captionDisplay.className = 'ai-caption-display hidden';
    document.querySelector('.app-container').appendChild(captionDisplay);
  }

  setupMoodSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const originalPlaceholder = searchInput.placeholder;
    let isMoodMode = false;

    const toggleBtn = document.getElementById('moodSearchToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        isMoodMode = !isMoodMode;

        if (isMoodMode) {
          searchInput.placeholder = '🎭 Search by mood... (sad, happy, chill, dark aesthetic, etc.)';
          toggleBtn.innerHTML = '<i class="fas fa-search"></i> Normal Search';
          this.showMoodSuggestions();
        } else {
          searchInput.placeholder = originalPlaceholder;
          toggleBtn.innerHTML = '<i class="fas fa-smile"></i> Search by Mood';
          this.hideMoodSuggestions();
        }
      });
    }

    searchInput.addEventListener('input', debounce((e) => {
      const query = e.target.value.trim();

      if (isMoodMode && query.length >= 2) {
        this.showMoodAutoComplete(query);
      }
    }, 300));

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && isMoodMode) {
        e.preventDefault();
        const query = searchInput.value.trim();
        this.performMoodSearch(query);
      }
    });
  }

  toggleMoodSearch() {
    this.moodGridVisible = !this.moodGridVisible;
    const grid = document.getElementById('moodGrid');

    if (this.moodGridVisible) {
      grid.classList.remove('hidden');
      this.renderMoodGrid();
    } else {
      grid.classList.add('hidden');
    }
  }

  setupMoodGrid() {
    console.log('Mood grid ready');
  }

  renderMoodGrid() {
    const grid = document.getElementById('moodGrid');
    if (!grid) return;

    if (typeof moodEngine === 'undefined') {
      console.warn('Mood engine not loaded');
      return;
    }

    const moods = moodEngine.getAllMoods();

    grid.innerHTML = `
      <h3 class="mood-grid-title">
        <i class="fas fa-palette"></i> Choose Your Mood
      </h3>
      <div class="mood-grid-items">
        ${moods.map(mood => {
          const data = moodEngine.getMoodData(mood);
          return `
            <button class="mood-chip" data-mood="${mood}" title="${data.description}">
              <span class="mood-emoji">${data.emoji}</span>
              <span class="mood-name">${mood}</span>
            </button>
          `;
        }).join('')}
      </div>
      <div class="mood-grid-footer">
        <button id="randomMoodBtn" class="btn-secondary">
          <i class="fas fa-random"></i> Feeling Lucky
        </button>
      </div>
    `;

    grid.querySelectorAll('.mood-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const mood = chip.dataset.mood;
        this.performMoodSearch(mood);
      });
    });

    document.getElementById('randomMoodBtn')?.addEventListener('click', () => {
      const randomMood = moodEngine.getRandomMood();
      this.performMoodSearch(randomMood);
    });
  }

  showMoodAutoComplete(query) {
    if (typeof moodEngine === 'undefined') return;

    const suggestions = moodEngine.getMoodSuggestions(query);
    const autocomplete = document.getElementById('autocomplete');

    if (!autocomplete || suggestions.length === 0) return;

    autocomplete.innerHTML = suggestions.map(mood => `
      <div class="autocomplete-item mood-suggestion" data-mood="${mood.name}">
        <span class="mood-emoji">${mood.emoji}</span>
        <div class="mood-details">
          <strong>${mood.name}</strong>
          <small>${mood.description}</small>
        </div>
      </div>
    `).join('');

    autocomplete.classList.remove('hidden');

    autocomplete.querySelectorAll('.mood-suggestion').forEach(item => {
      item.addEventListener('click', () => {
        const mood = item.dataset.mood;
        this.performMoodSearch(mood);
        autocomplete.classList.add('hidden');
      });
    });
  }

  hideMoodSuggestions() {
    const autocomplete = document.getElementById('autocomplete');
    if (autocomplete) {
      autocomplete.classList.add('hidden');
    }
  }

  showMoodSuggestions() {
    // Can be implemented later
  }

  async performMoodSearch(moodInput) {
    if (typeof moodEngine === 'undefined') {
      console.warn('Mood engine not available');
      return;
    }

    const searchQuery = moodEngine.moodToQuery(moodInput);
    const moodData = moodEngine.getMoodData(moodInput);

    console.log(`Mood Search: ${moodInput} → "${searchQuery}"`);

    this.showMoodCard(moodInput, moodData);

    this.generateMoodCaption(moodInput);

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = moodInput;
    }

    if (window.app) {
      STATE.currentQuery = searchQuery;
      await window.app.performSearch(searchQuery);
    }

    this.addMoodBadgeToResults(moodInput, moodData);

    UI.showToast(`Searching for ${moodData?.vibes || moodInput} vibes...`, 'info', 2000);
  }

  showMoodCard(mood, data) {
    const card = document.getElementById('moodCard');
    if (!card || !data) return;

    card.innerHTML = `
      <div class="mood-card-content">
        <button class="mood-card-close" onclick="document.getElementById('moodCard').classList.add('hidden')">
          <i class="fas fa-times"></i>
        </button>
        <div class="mood-card-header">
          <span class="mood-card-emoji">${data.emoji}</span>
          <div class="mood-card-info">
            <h3>${mood}</h3>
            <p>${data.vibes}</p>
          </div>
        </div>
        <p class="mood-card-description">${data.description}</p>
        <div class="mood-card-tags">
          ${data.keywords.slice(0, 5).map(keyword => `
            <span class="mood-tag">${keyword}</span>
          `).join('')}
        </div>
        <div class="mood-card-colors">
          <strong>Colors:</strong>
          ${data.colors.map(color => `
            <span class="mood-color-chip" style="background: ${color}"></span>
          `).join('')}
        </div>
      </div>
    `;

    card.classList.remove('hidden');
    setTimeout(() => card.classList.add('show'), 10);
  }

  async generateMoodCaption(mood) {
    const captionDisplay = document.getElementById('aiCaptionDisplay');
    if (!captionDisplay || typeof moodEngine === 'undefined') return;

    captionDisplay.innerHTML = `
      <div class="ai-caption-loading">
        <i class="fas fa-sparkles"></i> Generating mood story...
      </div>
    `;
    captionDisplay.classList.remove('hidden');

    try {
      let caption;
      if (CONFIG.GEMINI_API_KEY && typeof aiIntegration !== 'undefined') {
        caption = await aiIntegration.generateEnhancedCaption(mood);
      } else {
        caption = moodEngine.generateStory(mood);
      }

      captionDisplay.innerHTML = `
        <div class="ai-caption-content">
          <div class="ai-caption-icon">
            <i class="fas fa-quote-left"></i>
          </div>
          <p class="ai-caption-text">${sanitizeHTML(caption)}</p>
          <div class="ai-caption-actions">
            <button class="btn-icon" onclick="navigator.clipboard.writeText('${caption.replace(/'/g, "\\'")}'); UI.showToast('Copied!', 'success', 1000)">
              <i class="fas fa-copy"></i>
            </button>
            <button class="btn-icon" onclick="navigator.share({text: '${caption.replace(/'/g, "\\'")}'})" title="Share">
              <i class="fas fa-share-alt"></i>
            </button>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Caption generation error:', error);
      captionDisplay.classList.add('hidden');
    }
  }

  addMoodBadgeToResults(mood, data) {
    setTimeout(() => {
      const gallery = document.getElementById('gallery');
      if (!gallery || !data) return;

      const badge = document.createElement('div');
      badge.className = 'mood-results-badge';
      badge.innerHTML = `
        <span class="mood-badge-emoji">${data.emoji}</span>
        <span class="mood-badge-text">
          Showing <strong>${mood}</strong> vibes
        </span>
      `;

      gallery.insertBefore(badge, gallery.firstChild);
    }, 500);
  }

  setupMoodPlaylists() {
    const playlistBtn = document.getElementById('moodPlaylistsBtn');
    if (!playlistBtn) return;

    console.log('Mood playlists button ready');
  }

  showMoodPlaylists() {
    if (typeof moodPlaylists === 'undefined') {
      UI.showToast('Mood playlists not available', 'warning');
      return;
    }

    const playlists = moodPlaylists.getAllPlaylists();

    const modal = document.createElement('div');
    modal.className = 'mood-playlists-modal';
    modal.innerHTML = `
      <div class="mood-playlists-backdrop"></div>
      <div class="mood-playlists-content">
        <div class="mood-playlists-header">
          <h2><i class="fas fa-list-ul"></i> Mood Playlists</h2>
          <button class="mood-playlists-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="mood-playlists-grid">
          ${playlists.map(playlist => `
            <div class="mood-playlist-card" data-playlist="${playlist.id}">
              <div class="mood-playlist-icon">${playlist.icon}</div>
              <h3>${playlist.name}</h3>
              <p>${playlist.description}</p>
              <span class="mood-playlist-count">${playlist.moods.length} moods</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => modal.classList.add('show'), 10);

    modal.querySelector('.mood-playlists-close').addEventListener('click', () => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    });

    modal.querySelector('.mood-playlists-backdrop').addEventListener('click', () => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    });

    modal.querySelectorAll('.mood-playlist-card').forEach(card => {
      card.addEventListener('click', () => {
        const playlistId = card.dataset.playlist;
        this.playMoodPlaylist(playlistId);
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
      });
    });
  }

  async playMoodPlaylist(playlistId) {
    if (typeof moodPlaylists === 'undefined') return;

    const playlist = moodPlaylists.getPlaylist(playlistId);
    if (!playlist) return;

    UI.showToast(`Playing: ${playlist.name}`, 'info', 2000);

    const randomMood = playlist.moods[Math.floor(Math.random() * playlist.moods.length)];
    this.performMoodSearch(randomMood);
  }
}

const moodUI = new MoodUI();

if (typeof window !== 'undefined') {
  window.moodUI = moodUI;
}