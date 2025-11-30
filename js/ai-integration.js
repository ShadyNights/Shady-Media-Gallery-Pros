class AIIntegration {
  constructor() {
    this.geminiApiKey = CONFIG.GEMINI_API_KEY || '';
    this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    this.cache = new Map();
    this.requestQueue = [];
    this.isProcessing = false;
  }

  async analyzeImage(imageUrl, imageTitle = '') {
    const cacheKey = `ai_${imageUrl}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const analysis = await this.requestGeminiAnalysis(imageUrl, imageTitle);
      this.cache.set(cacheKey, analysis);
      return analysis;
    } catch (error) {
      console.error('AI analysis error:', error);
      return this.generateFallbackAnalysis(imageTitle);
    }
  }

  async requestGeminiAnalysis(imageUrl, imageTitle) {
    const prompt = `Analyze this image and provide:
1. 10 relevant keywords/tags (comma-separated)
2. A beautiful, poetic caption (1-2 sentences)
3. Detected mood (one word: sad, happy, calm, energetic, romantic, dark, etc.)
4. Main colors (comma-separated)
5. Scene type (portrait, landscape, cityscape, nature, abstract, etc.)

Image context: ${imageTitle}

Format your response as JSON:
{
  "tags": ["tag1", "tag2", ...],
  "caption": "Your poetic caption here",
  "mood": "detected_mood",
  "colors": ["color1", "color2", ...],
  "sceneType": "scene_type",
  "objects": ["object1", "object2", ...]
}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };

    const response = await fetch(`${this.apiEndpoint}?key=${this.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;

    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return this.formatAnalysis(analysis);
    }

    throw new Error('Invalid response format');
  }

  formatAnalysis(rawAnalysis) {
    return {
      tags: rawAnalysis.tags || [],
      caption: rawAnalysis.caption || '',
      mood: rawAnalysis.mood || 'neutral',
      colors: rawAnalysis.colors || [],
      sceneType: rawAnalysis.sceneType || 'general',
      objects: rawAnalysis.objects || [],
      timestamp: Date.now()
    };
  }

  generateFallbackAnalysis(imageTitle) {
    const words = imageTitle.toLowerCase().split(' ');
    const tags = words.filter(w => w.length > 3).slice(0, 10);

    return {
      tags: tags.length > 0 ? tags : ['photo', 'image', 'visual', 'creative', 'art'],
      caption: `A captivating visual moment. ${imageTitle}`,
      mood: 'neutral',
      colors: ['natural'],
      sceneType: 'general',
      objects: [],
      timestamp: Date.now()
    };
  }

  async batchAnalyze(images, onProgress = null) {
    const results = [];
    const total = images.length;

    for (let i = 0; i < total; i++) {
      const image = images[i];

      try {
        const analysis = await this.analyzeImage(image.preview, image.title);
        results.push({
          id: image.id,
          ...analysis
        });

        if (onProgress) {
          onProgress(((i + 1) / total) * 100);
        }

        if (i < total - 1) {
          await wait(1000);
        }
      } catch (error) {
        console.error(`Failed to analyze image ${image.id}:`, error);
        results.push({
          id: image.id,
          ...this.generateFallbackAnalysis(image.title)
        });
      }
    }

    return results;
  }

  async generateEnhancedCaption(mood, imageContext = '') {
    const prompt = `Create a beautiful, poetic caption for a ${mood} mood image.
Context: ${imageContext}
Make it emotional, deep, and shareable (1-2 sentences).`;

    try {
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      };

      const response = await fetch(`${this.apiEndpoint}?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Gemini API error');
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
      console.error('Caption generation error:', error);
      return moodEngine.generateStory(mood);
    }
  }

  async suggestMoodFromImage(imageUrl, imageTitle) {
    try {
      const analysis = await this.analyzeImage(imageUrl, imageTitle);
      const detectedMood = analysis.mood.toLowerCase();

      const allMoods = moodEngine.getAllMoods();
      const exactMatch = allMoods.find(m => m === detectedMood);

      if (exactMatch) {
        return [exactMatch];
      }

      const related = allMoods.filter(m =>
        analysis.tags.some(tag =>
          moodEngine.getMoodData(m)?.keywords.includes(tag)
        )
      );

      return related.slice(0, 3);
    } catch (error) {
      console.error('Mood suggestion error:', error);
      return [];
    }
  }

  async generatePhotoStory(images) {
    if (images.length === 0) return '';

    const imageTitles = images.map(img => img.title).join(', ');
    const prompt = `Create a short, beautiful story (3-4 sentences) that connects these images:
${imageTitles}

Make it emotional, poetic, and engaging.`;

    try {
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      };

      const response = await fetch(`${this.apiEndpoint}?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Gemini API error');
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
      console.error('Story generation error:', error);
      return 'A collection of moments captured in time, each telling its own unique story.';
    }
  }

  async enhanceSearchQuery(userQuery) {
    const prompt = `User wants to search for: "${userQuery}"
Suggest 3 better, more specific search keywords that would find great photos/videos.
Return only the keywords, comma-separated.`;

    try {
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      };

      const response = await fetch(`${this.apiEndpoint}?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Gemini API error');
      }

      const data = await response.json();
      const enhancedKeywords = data.candidates[0].content.parts[0].text.trim();
      return enhancedKeywords.split(',').map(k => k.trim()).join(' ');
    } catch (error) {
      console.error('Query enhancement error:', error);
      return userQuery;
    }
  }

  clearCache() {
    this.cache.clear();
    console.log('AI cache cleared');
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

const aiIntegration = new AIIntegration();

if (typeof window !== 'undefined') {
  window.aiIntegration = aiIntegration;
}
