class MoodEngine {
  constructor() {
    this.moodDatabase = this.initializeMoodDatabase();
    this.storyTemplates = this.initializeStoryTemplates();
    this.currentMood = null;
  }

  initializeMoodDatabase() {
    return {
      'sad': {
        keywords: ['rain', 'dark', 'lonely', 'moody', 'blue tones', 'crying', 'melancholy', 'tears', 'grey sky', 'empty room'],
        colors: ['grey', 'blue', 'dark'],
        vibes: '😢 Melancholic',
        emoji: '😢',
        description: 'Deep, emotional, introspective moments'
      },
      'happy': {
        keywords: ['sunshine', 'smile', 'bright', 'colorful', 'joy', 'laughter', 'celebration', 'flowers', 'rainbow', 'party'],
        colors: ['yellow', 'orange', 'bright'],
        vibes: '😊 Joyful',
        emoji: '😊',
        description: 'Pure happiness and positive energy'
      },
      'motivation': {
        keywords: ['success', 'sports', 'sunrise', 'mountains', 'achievement', 'workout', 'climbing', 'victory', 'hustle', 'fitness'],
        colors: ['orange', 'red', 'gold'],
        vibes: '💪 Inspirational',
        emoji: '💪',
        description: 'Push your limits, chase your dreams'
      },
      'romantic': {
        keywords: ['couple', 'sunset', 'soft light', 'love', 'roses', 'hearts', 'date', 'wedding', 'kiss', 'valentine'],
        colors: ['pink', 'red', 'soft'],
        vibes: '❤️ Romantic',
        emoji: '❤️',
        description: 'Love, connection, and tender moments'
      },
      'alone': {
        keywords: ['empty street', 'solitude', 'night walk', 'single person', 'silence', 'isolation', 'thinking', 'solo travel', 'meditation', 'wilderness'],
        colors: ['dark', 'muted', 'cold'],
        vibes: '🚶 Solitary',
        emoji: '🚶',
        description: 'Peaceful solitude and self-reflection'
      },
      'chill': {
        keywords: ['night lights', 'coffee', 'lofi', 'cozy', 'relax', 'bedroom', 'reading', 'candles', 'blanket', 'tea'],
        colors: ['warm', 'soft', 'dim'],
        vibes: '☕ Relaxed',
        emoji: '☕',
        description: 'Calm, cozy, and comfortable vibes'
      },
      'dark aesthetic': {
        keywords: ['cyberpunk', 'neon', 'street', 'night', 'urban', 'grunge', 'goth', 'shadows', 'underground', 'edgy'],
        colors: ['black', 'neon', 'purple'],
        vibes: '🌃 Dark Aesthetic',
        emoji: '🌃',
        description: 'Edgy, mysterious, urban nightlife'
      },
      'luxury': {
        keywords: ['gold', 'rich', 'supercar', 'mansion', 'yacht', 'champagne', 'expensive', 'elegant', 'diamond', 'penthouse'],
        colors: ['gold', 'silver', 'white'],
        vibes: '💎 Luxurious',
        emoji: '💎',
        description: 'Opulence, elegance, and sophistication'
      },
      'vintage': {
        keywords: ['retro', 'old film', 'sepia', '70s', 'classic car', 'vinyl', 'antique', 'nostalgia', 'film camera', 'faded'],
        colors: ['sepia', 'brown', 'faded'],
        vibes: '📼 Vintage',
        emoji: '📼',
        description: 'Nostalgic, timeless, classic beauty'
      },
      'minimalist': {
        keywords: ['simple', 'clean', 'white', 'minimal', 'modern', 'empty space', 'geometric', 'zen', 'monochrome', 'architecture'],
        colors: ['white', 'grey', 'black'],
        vibes: '⚪ Minimal',
        emoji: '⚪',
        description: 'Less is more, clean and simple'
      },
      'cyberpunk': {
        keywords: ['neon', 'futuristic', 'tokyo', 'robot', 'sci-fi', 'hologram', 'tech', 'blade runner', 'dystopia', 'cybernetic'],
        colors: ['neon', 'cyan', 'purple'],
        vibes: '🤖 Cyberpunk',
        emoji: '🤖',
        description: 'High-tech, low-life future'
      },
      'nature': {
        keywords: ['forest', 'mountains', 'lake', 'wildlife', 'trees', 'waterfall', 'hiking', 'landscape', 'sunset', 'valley'],
        colors: ['green', 'blue', 'earth'],
        vibes: '🌲 Natural',
        emoji: '🌲',
        description: 'Pure nature, wilderness, outdoors'
      },
      'ocean': {
        keywords: ['sea', 'waves', 'beach', 'surfing', 'boat', 'underwater', 'coast', 'island', 'ocean blue', 'seascape'],
        colors: ['blue', 'turquoise', 'white'],
        vibes: '🌊 Oceanic',
        emoji: '🌊',
        description: 'Vast, powerful, calming waters'
      },
      'travel': {
        keywords: ['adventure', 'passport', 'airplane', 'backpack', 'landmarks', 'exploring', 'world map', 'tourism', 'wanderlust', 'journey'],
        colors: ['colorful', 'diverse', 'bright'],
        vibes: '✈️ Adventure',
        emoji: '✈️',
        description: 'Explore the world, discover new places'
      },
      'city': {
        keywords: ['urban', 'skyline', 'buildings', 'traffic', 'street', 'downtown', 'skyscraper', 'metro', 'busy', 'modern city'],
        colors: ['grey', 'steel', 'glass'],
        vibes: '🏙️ Urban',
        emoji: '🏙️',
        description: 'Fast-paced city life and architecture'
      },
      'sunrise': {
        keywords: ['dawn', 'morning', 'golden hour', 'early', 'first light', 'horizon', 'new day', 'waking up', 'soft light', 'peaceful morning'],
        colors: ['orange', 'pink', 'gold'],
        vibes: '🌅 Dawn',
        emoji: '🌅',
        description: 'New beginnings, fresh starts'
      },
      'sunset': {
        keywords: ['dusk', 'evening', 'golden hour', 'twilight', 'orange sky', 'silhouette', 'end of day', 'warm light', 'horizon', 'peaceful'],
        colors: ['orange', 'purple', 'pink'],
        vibes: '🌇 Dusk',
        emoji: '🌇',
        description: 'Beautiful endings, tranquil evenings'
      },
      'night': {
        keywords: ['stars', 'moon', 'dark', 'midnight', 'night sky', 'city lights', 'nocturnal', 'darkness', 'nightlife', 'late night'],
        colors: ['black', 'dark blue', 'purple'],
        vibes: '🌙 Nocturnal',
        emoji: '🌙',
        description: 'Mystery, calm, and night adventures'
      },
      'rainy': {
        keywords: ['rain', 'wet', 'umbrella', 'puddles', 'storm', 'drops', 'grey clouds', 'rainy day', 'window rain', 'cozy rain'],
        colors: ['grey', 'blue', 'dark'],
        vibes: '🌧️ Rainy',
        emoji: '🌧️',
        description: 'Cozy, introspective rainy moments'
      },
      'fitness': {
        keywords: ['gym', 'workout', 'running', 'yoga', 'strong', 'athlete', 'sports', 'exercise', 'healthy', 'training'],
        colors: ['red', 'black', 'dynamic'],
        vibes: '🏋️ Fitness',
        emoji: '🏋️',
        description: 'Health, strength, dedication'
      },
      'food': {
        keywords: ['delicious', 'cooking', 'restaurant', 'gourmet', 'fresh', 'dessert', 'coffee', 'breakfast', 'dinner', 'culinary'],
        colors: ['warm', 'appetizing', 'rich'],
        vibes: '🍽️ Culinary',
        emoji: '🍽️',
        description: 'Delicious food and dining experiences'
      },
      'study': {
        keywords: ['books', 'desk', 'library', 'learning', 'notebook', 'focus', 'reading', 'student', 'education', 'workspace'],
        colors: ['neutral', 'organized', 'calm'],
        vibes: '📚 Study',
        emoji: '📚',
        description: 'Focus, learning, productivity'
      },
      'party': {
        keywords: ['celebration', 'dancing', 'club', 'lights', 'music', 'crowd', 'dj', 'festival', 'nightclub', 'fun'],
        colors: ['bright', 'neon', 'colorful'],
        vibes: '🎉 Party',
        emoji: '🎉',
        description: 'Celebration, energy, nightlife'
      },
      'autumn': {
        keywords: ['fall', 'leaves', 'orange', 'cozy', 'sweater', 'pumpkin', 'harvest', 'forest autumn', 'warm colors', 'seasonal'],
        colors: ['orange', 'brown', 'gold'],
        vibes: '🍂 Autumn',
        emoji: '🍂',
        description: 'Cozy fall vibes and warm colors'
      },
      'winter': {
        keywords: ['snow', 'cold', 'ice', 'christmas', 'cozy', 'fire', 'snowflake', 'frozen', 'winter forest', 'cabin'],
        colors: ['white', 'blue', 'silver'],
        vibes: '❄️ Winter',
        emoji: '❄️',
        description: 'Cold beauty and cozy warmth'
      },
      'spring': {
        keywords: ['flowers', 'bloom', 'fresh', 'cherry blossom', 'garden', 'colorful', 'nature revival', 'green', 'butterfly', 'new life'],
        colors: ['pink', 'green', 'pastel'],
        vibes: '🌸 Spring',
        emoji: '🌸',
        description: 'Renewal, growth, fresh beginnings'
      },
      'summer': {
        keywords: ['beach', 'sun', 'hot', 'tropical', 'vacation', 'swimming', 'ice cream', 'sunshine', 'palm trees', 'paradise'],
        colors: ['yellow', 'blue', 'bright'],
        vibes: '☀️ Summer',
        emoji: '☀️',
        description: 'Warm, bright, carefree days'
      },
      'anime': {
        keywords: ['anime style', 'manga', 'japanese', 'colorful hair', 'cartoon', 'sakura', 'kawaii', 'tokyo tower', 'anime aesthetic', 'neon japan'],
        colors: ['vibrant', 'pastel', 'neon'],
        vibes: '🎌 Anime',
        emoji: '🎌',
        description: 'Japanese anime aesthetic and culture'
      },
      'space': {
        keywords: ['galaxy', 'stars', 'nebula', 'planets', 'cosmos', 'astronaut', 'universe', 'milky way', 'telescope', 'astronomy'],
        colors: ['dark', 'purple', 'cosmic'],
        vibes: '🌌 Cosmic',
        emoji: '🌌',
        description: 'Infinite universe and celestial beauty'
      },
      'mystery': {
        keywords: ['fog', 'shadow', 'unknown', 'silhouette', 'dark forest', 'abandoned', 'eerie', 'suspense', 'enigma', 'twilight zone'],
        colors: ['dark', 'misty', 'grey'],
        vibes: '🕵️ Mysterious',
        emoji: '🕵️',
        description: 'Enigmatic, intriguing, unknown'
      },
      'spiritual': {
        keywords: ['meditation', 'zen', 'buddha', 'temple', 'peace', 'yoga', 'mindfulness', 'chakra', 'enlightenment', 'sacred'],
        colors: ['purple', 'gold', 'white'],
        vibes: '🧘 Spiritual',
        emoji: '🧘',
        description: 'Inner peace, mindfulness, awakening'
      }
    };
  }

  initializeStoryTemplates() {
    return {
      'sad': [
        "A quiet moment where even the rain seems to understand.",
        "Sometimes the heaviest clouds reflect what's inside.",
        "In the silence, emotions speak louder than words.",
        "When sadness visits, let it teach you its lessons."
      ],
      'happy': [
        "Pure joy captured in a single frame.",
        "This is what happiness looks like.",
        "Let the sunshine in, both outside and within.",
        "Some moments are meant to be celebrated forever."
      ],
      'motivation': [
        "The only limit is the one you set yourself.",
        "Success begins at the edge of your comfort zone.",
        "Every champion was once a contender who refused to give up.",
        "This is your sign to keep pushing forward."
      ],
      'romantic': [
        "Love isn't found, it's felt.",
        "Two hearts beating as one.",
        "In your eyes, I found my home.",
        "This is what forever feels like."
      ],
      'alone': [
        "A quiet night where even the streets seem to sleep.",
        "Just you, the cold air, and thoughts that echo louder.",
        "Solitude is where you find yourself.",
        "Sometimes being alone is the most peaceful choice."
      ],
      'chill': [
        "Slow down, breathe, and enjoy this moment.",
        "Cozy vibes and peaceful nights.",
        "Sometimes all you need is a warm drink and good vibes.",
        "This is your reminder to relax."
      ],
      'dark aesthetic': [
        "In the shadows, beauty takes a different form.",
        "Neon lights reflecting off wet streets.",
        "The city never sleeps, and neither does its mystery.",
        "Darkness isn't empty; it's full of possibilities."
      ],
      'luxury': [
        "Excellence is not a skill, it's an attitude.",
        "Living life in the finest details.",
        "Luxury is a state of mind.",
        "This is what success looks like."
      ],
      'nature': [
        "Where the wild things grow free.",
        "Nature doesn't hurry, yet everything is accomplished.",
        "In every walk with nature, one receives far more than sought.",
        "This is where peace lives."
      ],
      'night': [
        "The stars shine brightest in the darkest nights.",
        "Night reveals what daylight hides.",
        "In the quiet of the night, dreams come alive.",
        "When the sun sets, a different world awakens."
      ],
      'travel': [
        "Adventure is out there, waiting for you.",
        "Collect moments, not things.",
        "The world is a book, and those who don't travel read only one page.",
        "This is where your story begins."
      ],
      'default': [
        "Every image tells a story worth discovering.",
        "Captured moments that last forever.",
        "Beauty exists in every frame.",
        "This is a moment frozen in time."
      ]
    };
  }

  moodToQuery(moodInput) {
    const mood = moodInput.toLowerCase().trim();
    const moodData = this.moodDatabase[mood];

    if (!moodData) {
      for (const [key, data] of Object.entries(this.moodDatabase)) {
        if (mood.includes(key) || key.includes(mood)) {
          this.currentMood = key;
          return this.pickRandomKeywords(data.keywords, 3);
        }
      }
      this.currentMood = null;
      return mood;
    }

    this.currentMood = mood;
    return this.pickRandomKeywords(moodData.keywords, 3);
  }

  pickRandomKeywords(keywords, count = 3) {
    const shuffled = keywords.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).join(' ');
  }

  generateStory(mood = null) {
    const targetMood = mood || this.currentMood;
    const templates = this.storyTemplates[targetMood] || this.storyTemplates.default;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  getMoodData(mood) {
    return this.moodDatabase[mood.toLowerCase()] || null;
  }

  getAllMoods() {
    return Object.keys(this.moodDatabase);
  }

  getMoodSuggestions(input) {
    const query = input.toLowerCase();
    return this.getAllMoods()
      .filter(mood =>
        mood.includes(query) ||
        this.moodDatabase[mood].description.toLowerCase().includes(query)
      )
      .map(mood => ({
        name: mood,
        emoji: this.moodDatabase[mood].emoji,
        description: this.moodDatabase[mood].description
      }));
  }

  getRandomMood() {
    const moods = this.getAllMoods();
    return moods[Math.floor(Math.random() * moods.length)];
  }
}

const moodEngine = new MoodEngine();

if (typeof window !== 'undefined') {
  window.moodEngine = moodEngine;
}