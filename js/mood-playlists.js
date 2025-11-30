class MoodPlaylists {
  constructor() {
    this.playlists = this.initializePlaylists();
  }

  initializePlaylists() {
    return [{
        id: 'study-vibes',
        name: 'Study Vibes',
        icon: '📚',
        description: 'Perfect backgrounds for focus and productivity',
        moods: ['study', 'chill', 'minimalist', 'nature', 'calm'],
        color: '#4CAF50'
      },
      {
        id: 'aesthetic-wallpapers',
        name: 'Aesthetic Wallpapers',
        icon: '🎨',
        description: 'Stunning visuals for your desktop and phone',
        moods: ['dark aesthetic', 'cyberpunk', 'minimalist', 'vintage', 'neon'],
        color: '#9C27B0'
      },
      {
        id: 'cinematic-scenes',
        name: 'Cinematic Scenes',
        icon: '🎬',
        description: 'Movie-quality shots and dramatic moments',
        moods: ['sunset', 'city', 'night', 'dramatic', 'mystery'],
        color: '#FF5722'
      },
      {
        id: 'travel-dreams',
        name: 'Travel Dreams',
        icon: '✈️',
        description: 'Wanderlust-inducing destinations',
        moods: ['travel', 'adventure', 'ocean', 'mountains', 'exotic'],
        color: '#2196F3'
      },
      {
        id: 'night-city-mood',
        name: 'Night City',
        icon: '🌃',
        description: 'Urban nightlife and neon lights',
        moods: ['night', 'city', 'cyberpunk', 'dark aesthetic', 'urban'],
        color: '#1A237E'
      },
      {
        id: 'nature-escape',
        name: 'Nature Escape',
        icon: '🌲',
        description: 'Peaceful natural landscapes',
        moods: ['nature', 'forest', 'mountains', 'waterfall', 'wilderness'],
        color: '#43A047'
      },
      {
        id: 'emotional-journey',
        name: 'Emotional Journey',
        icon: '💭',
        description: 'Deep feelings and introspective moments',
        moods: ['sad', 'alone', 'melancholic', 'thoughtful', 'deep'],
        color: '#607D8B'
      },
      {
        id: 'energy-boost',
        name: 'Energy Boost',
        icon: '⚡',
        description: 'High-energy motivational visuals',
        moods: ['motivation', 'fitness', 'sports', 'power', 'dynamic'],
        color: '#F44336'
      },
      {
        id: 'romantic-moments',
        name: 'Romantic Moments',
        icon: '❤️',
        description: 'Love and tender connections',
        moods: ['romantic', 'sunset', 'couple', 'soft', 'dreamy'],
        color: '#E91E63'
      },
      {
        id: 'luxury-lifestyle',
        name: 'Luxury Lifestyle',
        icon: '💎',
        description: 'Opulent and sophisticated imagery',
        moods: ['luxury', 'elegant', 'rich', 'gold', 'sophisticated'],
        color: '#FFD700'
      },
      {
        id: 'seasonal-vibes',
        name: 'Seasonal Vibes',
        icon: '🍂',
        description: 'Celebrate every season',
        moods: ['autumn', 'winter', 'spring', 'summer', 'seasonal'],
        color: '#FF9800'
      },
      {
        id: 'spiritual-zen',
        name: 'Spiritual & Zen',
        icon: '🧘',
        description: 'Peace, meditation, and mindfulness',
        moods: ['spiritual', 'zen', 'peaceful', 'meditation', 'calm'],
        color: '#7E57C2'
      },
      {
        id: 'space-cosmos',
        name: 'Space & Cosmos',
        icon: '🌌',
        description: 'Infinite universe and celestial wonders',
        moods: ['space', 'galaxy', 'stars', 'cosmic', 'astronomy'],
        color: '#311B92'
      },
      {
        id: 'food-heaven',
        name: 'Food Heaven',
        icon: '🍽️',
        description: 'Delicious culinary photography',
        moods: ['food', 'cooking', 'dessert', 'gourmet', 'delicious'],
        color: '#FF6F00'
      },
      {
        id: 'party-nightlife',
        name: 'Party & Nightlife',
        icon: '🎉',
        description: 'Celebration and high-energy events',
        moods: ['party', 'celebration', 'club', 'festival', 'fun'],
        color: '#FF4081'
      },
      {
        id: 'rainy-cozy',
        name: 'Rainy & Cozy',
        icon: '🌧️',
        description: 'Cozy indoor moments and rainy days',
        moods: ['rainy', 'cozy', 'chill', 'indoor', 'comfort'],
        color: '#546E7A'
      },
      {
        id: 'anime-world',
        name: 'Anime World',
        icon: '🎌',
        description: 'Japanese anime aesthetic',
        moods: ['anime', 'manga', 'kawaii', 'japan', 'colorful'],
        color: '#FF1744'
      },
      {
        id: 'mystery-thriller',
        name: 'Mystery & Thriller',
        icon: '🕵️',
        description: 'Dark, mysterious, and intriguing',
        moods: ['mystery', 'dark', 'suspense', 'enigma', 'noir'],
        color: '#212121'
      },
      {
        id: 'ocean-waves',
        name: 'Ocean Waves',
        icon: '🌊',
        description: 'Endless ocean and coastal beauty',
        moods: ['ocean', 'beach', 'waves', 'surfing', 'coastal'],
        color: '#0277BD'
      },
      {
        id: 'golden-hour',
        name: 'Golden Hour',
        icon: '🌅',
        description: 'Perfect sunrise and sunset moments',
        moods: ['sunrise', 'sunset', 'golden hour', 'warm', 'glow'],
        color: '#FF6F00'
      }
    ];
  }

  getAllPlaylists() {
    return this.playlists;
  }

  getPlaylist(id) {
    return this.playlists.find(p => p.id === id);
  }

  getPlaylistsByMood(mood) {
    return this.playlists.filter(p => p.moods.includes(mood));
  }

  createCustomPlaylist(name, moods, icon = '🎵') {
    const customPlaylist = {
      id: `custom-${Date.now()}`,
      name,
      icon,
      description: 'Custom playlist',
      moods,
      color: '#00BCD4',
      isCustom: true
    };

    this.playlists.push(customPlaylist);
    this.saveCustomPlaylists();
    return customPlaylist;
  }

  deleteCustomPlaylist(id) {
    const index = this.playlists.findIndex(p => p.id === id && p.isCustom);
    if (index !== -1) {
      this.playlists.splice(index, 1);
      this.saveCustomPlaylists();
      return true;
    }
    return false;
  }

  saveCustomPlaylists() {
    const customPlaylists = this.playlists.filter(p => p.isCustom);
    setStorageItem('custom_playlists', customPlaylists);
  }

  loadCustomPlaylists() {
    const saved = getStorageItem('custom_playlists', []);
    saved.forEach(playlist => {
      if (!this.playlists.find(p => p.id === playlist.id)) {
        this.playlists.push(playlist);
      }
    });
  }

  getRandomPlaylist() {
    return this.playlists[Math.floor(Math.random() * this.playlists.length)];
  }

  searchPlaylists(query) {
    const q = query.toLowerCase();
    return this.playlists.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.moods.some(m => m.includes(q))
    );
  }
}

const moodPlaylists = new MoodPlaylists();

if (typeof window !== 'undefined') {
  window.moodPlaylists = moodPlaylists;
  moodPlaylists.loadCustomPlaylists();
}