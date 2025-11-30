class APIManager {
  constructor() {
    this.apiKey = CONFIG.API_KEY;
    this.baseUrl = CONFIG.API_BASE_URL;
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  async makeRequest(url, options = {}) {
    const defaultOptions = {
      headers: {
        'Authorization': this.apiKey
      },
      ...options
    };

    return await retryWithBackoff(async () => {
      const response = await fetch(url, defaultOptions);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    });
  }

  async fetchWithCache(url, forceRefresh = false) {
    const cacheKey = url;

    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
        console.log('Cache hit:', url);
        return cached.data;
      } else {
        this.cache.delete(cacheKey);
      }
    }

    if (this.pendingRequests.has(cacheKey)) {
      console.log('Waiting for pending request:', url);
      return this.pendingRequests.get(cacheKey);
    }

    const requestPromise = this.makeRequest(url);
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const data = await requestPromise;

      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      if (this.cache.size > CONFIG.MAX_CACHE_SIZE) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }

      return data;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  async getCuratedPhotos(page = 1) {
    try {
      const url = `${this.baseUrl}/curated?page=${page}&per_page=${CONFIG.PER_PAGE}`;
      const data = await this.fetchWithCache(url);

      return {
        items: data.photos.map(photo => this.formatPhoto(photo)),
        hasMore: data.photos.length === CONFIG.PER_PAGE,
        total: data.total_results
      };
    } catch (error) {
      console.error('Curated photos error:', error);
      throw error;
    }
  }

  async searchPhotos(query, page = 1) {
    try {
      const url = `${this.baseUrl}/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${CONFIG.PER_PAGE}`;
      const data = await this.fetchWithCache(url);

      return {
        items: data.photos.map(photo => this.formatPhoto(photo)),
        hasMore: data.photos.length === CONFIG.PER_PAGE,
        total: data.total_results
      };
    } catch (error) {
      console.error('Search photos error:', error);
      throw error;
    }
  }

  async getPopularVideos(page = 1) {
    try {
      const url = `https://api.pexels.com/videos/popular?page=${page}&per_page=${CONFIG.PER_PAGE}`;
      const data = await this.fetchWithCache(url);

      return {
        items: data.videos.map(video => this.formatVideo(video)),
        hasMore: data.videos.length === CONFIG.PER_PAGE,
        total: data.total_results
      };
    } catch (error) {
      console.error('Popular videos error:', error);
      return {
        items: [],
        hasMore: false,
        total: 0
      };
    }
  }

  async searchVideos(query, page = 1) {
    try {
      const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${CONFIG.PER_PAGE}`;
      const data = await this.fetchWithCache(url);

      return {
        items: data.videos.map(video => this.formatVideo(video)),
        hasMore: data.videos.length === CONFIG.PER_PAGE,
        total: data.total_results
      };
    } catch (error) {
      console.error('Search videos error:', error);
      return {
        items: [],
        hasMore: false,
        total: 0
      };
    }
  }

  formatPhoto(photo) {
    return {
      id: `photo-${photo.id}`,
      type: 'photo',
      title: photo.alt || 'Untitled Photo',
      photographer: photo.photographer,
      photographer_url: photo.photographer_url,
      preview: photo.src.large2x || photo.src.large,
      thumbnail: photo.src.medium,
      original: photo.src.original,
      download_url: photo.src.original,
      width: photo.width,
      height: photo.height,
      avg_color: photo.avg_color,
      url: photo.url,
      timestamp: Date.now()
    };
  }

  formatVideo(video) {
    const videoFile = video.video_files.find(f => f.quality === 'hd') || video.video_files[0];

    return {
      id: `video-${video.id}`,
      type: 'video',
      title: video.user?.name ? `Video by ${video.user.name}` : 'Untitled Video',
      photographer: video.user?.name || 'Unknown',
      photographer_url: video.user?.url || video.url,
      preview: videoFile.link,
      thumbnail: video.image,
      original: videoFile.link,
      download_url: videoFile.link,
      width: video.width,
      height: video.height,
      duration: video.duration,
      url: video.url,
      timestamp: Date.now()
    };
  }

  clearCache() {
    this.cache.clear();
    console.log('Cache cleared');
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: CONFIG.MAX_CACHE_SIZE
    };
  }
}

const API = new APIManager();

if (typeof window !== 'undefined') {
  window.API = API;
}