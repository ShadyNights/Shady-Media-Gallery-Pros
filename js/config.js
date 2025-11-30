const CONFIG = {
  API_KEY: 'YOUR API KEYS',
  GEMINI_API_KEY: 'YOUR API KEYS',

  API_BASE_URL: 'https://api.pexels.com/v1',
  VIDEO_BASE_URL: 'https://api.pexels.com/videos',

  PER_PAGE: 20,
  MAX_PAGES: 50,

  CACHE_DURATION: 1800000,
  MAX_CACHE_SIZE: 50,

  DEBOUNCE_DELAY: 800,
  THROTTLE_RATE: 300,
  TOAST_DURATION: 3000,
  ANIMATION_DURATION: 300,
  SLIDESHOW_INTERVAL: 3000,

  THEMES: ['light', 'dark', 'sepia', 'neon'],
  DEFAULT_THEME: 'light',

  FONT_SIZES: {
    small: '14px',
    medium: '16px',
    large: '18px',
    xlarge: '20px'
  },

  STORAGE_KEYS: {
    THEME: 'shady_gallery_theme',
    FAVORITES: 'shady_gallery_favorites',
    HISTORY: 'shady_gallery_history',
    SETTINGS: 'shady_gallery_settings',
    CACHE: 'shady_gallery_cache',
    CUSTOM_PLAYLISTS: 'shady_gallery_playlists',
    AI_CACHE: 'shady_gallery_ai_cache'
  },

  MAX_FAVORITES: 50,
  MAX_HISTORY: 100,

  TRENDING_KEYWORDS: [
    'Nature', 'Animals', 'Mountains', 'Ocean', 'Music',
    'Business', 'Travel', 'City', 'Sunset', 'Food',
    'Technology', 'Architecture', 'People', 'Fashion', 'Art',
    'Sports', 'Fitness', 'Coffee', 'Books', 'Cars',
    'Flowers', 'Abstract', 'Minimalist', 'Vintage', 'Modern'
  ],

  MOOD_SETTINGS: {
    ENABLE_AI_CAPTIONS: true,
    ENABLE_AUTO_TAGGING: true,
    MIN_MOOD_LENGTH: 2,
    MAX_MOOD_SUGGESTIONS: 5,
    CAPTION_MAX_LENGTH: 200,
    AI_BATCH_SIZE: 10,
    AI_RATE_LIMIT: 1000
  },

  FEATURES: {
    MOOD_SEARCH: true,
    AI_INTEGRATION: true,
    MOOD_PLAYLISTS: true,
    AUTO_CAPTIONS: true,
    AUTO_TAGGING: true,
    OFFLINE_MODE: true,
    EYE_TRACKING: true,
    PWA: true,
    BULK_OPERATIONS: true,
    KEYBOARD_SHORTCUTS: true,
    NSFW_DETECTION: true,
    VIDEO_AUTOPLAY: true
  },

  PERFORMANCE: {
    LAZY_LOAD: true,
    IMAGE_COMPRESSION: true,
    INTERSECTION_THRESHOLD: 0.01,
    VIDEO_PRELOAD: 'metadata',
    INFINITE_SCROLL_MARGIN: '300px',

    DEBOUNCE_SEARCH: 800,
    THROTTLE_SCROLL: 300,
    MAX_CONCURRENT_REQUESTS: 3,
    ENABLE_REQUEST_CANCELLATION: true,
    CACHE_IMAGES_LOCALLY: true,
    PREFETCH_NEXT_PAGE: false
  },

  AI: {
    PROVIDER: 'gemini',
    MODEL: 'gemini-1.5-flash',
    MAX_RETRIES: 2,
    TIMEOUT: 8000,
    FALLBACK_ON_ERROR: true,
    CAPTION_ONLY: true
  },

  SHORTCUTS: {
    SEARCH: '/',
    THEME: 't',
    SOUNDS: 's',
    VIEW_MODE: 'v',
    FAVORITE: 'f',
    DOWNLOAD: 'd',
    SLIDESHOW: ' ',
    HELP: '?',
    SETTINGS: 'g',
    SCROLL_TOP: 'h',
    LIGHTBOX: 'l',
    EYE_TRACKING: 'e',
    ESCAPE: 'Escape',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight'
  }
};

const STATE = {
  currentQuery: 'trending',
  currentType: 'photo',
  currentPage: 1,
  currentSort: 'relevant',
  hasMore: true,
  isFetching: false,

  theme: localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || CONFIG.DEFAULT_THEME,
  activeTab: 'all',
  viewMode: 'grid',

  favorites: [],
  historyLog: [],
  currentResults: [],

  settings: {
    autoplay: true,
    soundsEnabled: true,
    blurNsfw: false,
    compactMode: false,
    infiniteScroll: true,
    autoTheme: false,
    offlineCache: true,
    fontSize: 'medium',
    moodSearchEnabled: true,
    aiCaptionsEnabled: true,
    autoTaggingEnabled: true
  },

  lightboxOpen: false,
  lightboxIndex: 0,
  slideshowActive: false,
  slideshowTimer: null,

  bulkSelectMode: false,
  selectedItems: new Set(),

  undoStack: [],
  maxUndoStack: 10,

  lastAction: null
};

const DEFAULT_SETTINGS = {
  theme: CONFIG.DEFAULT_THEME,
  autoplay: true,
  blurNsfw: false,
  compactMode: false,
  fontSize: 'medium',
  infiniteScroll: true,
  autoTheme: false,
  offlineCache: true,
  soundsEnabled: true,
  moodSearchEnabled: true,
  aiCaptionsEnabled: true,
  autoTaggingEnabled: true
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CONFIG,
    STATE,
    DEFAULT_SETTINGS
  };
}

if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
  window.STATE = STATE;
  window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;

}
