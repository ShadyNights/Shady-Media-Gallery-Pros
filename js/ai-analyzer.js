class AIAnalyzer {
  constructor() {
    this.apiKey = CONFIG.GEMINI_API_KEY;
    this.model = CONFIG.AI.MODEL || 'gemini-1.5-flash';
    this.apiUrl = `https://generativelanguage.googleapis.com/v1/models/${this.model}:generateContent`;
    this.cache = new Map();
    this.maxCacheSize = 50;
    this.isAnalyzing = false;
    this.analysisQueue = [];
  }

  async analyzeImage(imageUrl) {
    try {
      if (this.cache.has(imageUrl)) {
        return this.cache.get(imageUrl);
      }

      if (this.isAnalyzing) {
        return new Promise((resolve) => {
          this.analysisQueue.push({
            imageUrl,
            resolve
          });
        });
      }

      this.isAnalyzing = true;

      const base64Image = await this.fetchImageAsBase64(imageUrl);

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
                text: "Generate a beautiful, poetic caption for this image. Make it emotional, inspiring, and shareable. Keep it to 1-2 sentences only. Focus on the mood and feeling of the image."
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 100,
            topP: 0.95
          },
          safetySettings: [{
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_NONE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const caption = data.candidates[0]?.content?.parts[0]?.text || 'A beautiful moment captured in time.';

      const result = {
        caption: caption.trim().replace(/^["']|["']$/g, ''),
        timestamp: Date.now()
      };

      this.cache.set(imageUrl, result);

      if (this.cache.size > this.maxCacheSize) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }

      this.isAnalyzing = false;

      this.processQueue();

      return result;

    } catch (error) {
      console.error('AI Analysis error:', error);

      this.isAnalyzing = false;

      const fallback = {
        caption: this.generateFallbackCaption(),
        error: error.message,
        timestamp: Date.now()
      };

      this.cache.set(imageUrl, fallback);

      return fallback;
    }
  }

  async processQueue() {
    if (this.analysisQueue.length > 0) {
      const {
        imageUrl,
        resolve
      } = this.analysisQueue.shift();
      const result = await this.analyzeImage(imageUrl);
      resolve(result);
    }
  }

  generateFallbackCaption() {
    const captions = [
      'A beautiful moment captured in time.',
      'Every picture tells a story worth sharing.',
      'Moments like these are meant to be remembered.',
      'Life is a collection of beautiful moments.',
      'Capturing the essence of life, one frame at a time.',
      'Sometimes the smallest moments leave the biggest impressions.',
      'This is what memories are made of.',
      'Beauty found in unexpected places.',
      'A glimpse into something extraordinary.',
      'Where words fail, images speak.'
    ];

    return captions[Math.floor(Math.random() * captions.length)];
  }

  async fetchImageAsBase64(imageUrl) {
    try {
      const response = await fetch(imageUrl, {
        mode: 'cors',
        credentials: 'omit',
        cache: 'force-cache'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      const blob = await response.blob();

      if (blob.size > 4 * 1024 * 1024) {
        const compressedBlob = await this.compressImage(blob);
        return this.blobToBase64(compressedBlob);
      }

      return this.blobToBase64(blob);

    } catch (error) {
      console.error('Image fetch error:', error);
      throw error;
    }
  }

  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async compressImage(blob) {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((compressedBlob) => {
          resolve(compressedBlob);
        }, 'image/jpeg', 0.8);
      };

      img.src = URL.createObjectURL(blob);
    });
  }

  clearCache() {
    this.cache.clear();
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      entries: Array.from(this.cache.keys()).length
    };
  }

  isConfigured() {
    return !!this.apiKey && this.apiKey !== 'YOUR_GEMINI_API_KEY_HERE';
  }
}

const aiAnalyzer = new AIAnalyzer();

if (typeof window !== 'undefined') {
  window.aiAnalyzer = aiAnalyzer;
}
