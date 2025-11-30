class EyeTrackingManager {
  constructor() {
    this.isActive = false;
    this.isInitialized = false;
    this.cameraStream = null;
    this.gazeCircle = null;
    this.stats = {
      leftLooks: 0,
      rightLooks: 0,
      upLooks: 0,
      downLooks: 0,
      totalActions: 0
    };
  }

  isAvailable() {
    return typeof webgazer !== 'undefined';
  }

  async requestCameraPermission() {
    try {
      console.log('📹 Requesting camera permission...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      
      this.cameraStream = stream;
      console.log('✅ Camera permission granted');
      return true;
      
    } catch (error) {
      console.error('❌ Camera permission denied:', error);
      UI.showToast('Camera access denied', 'error', 3000);
      return false;
    }
  }

  async init() {
    if (this.isInitialized) {
      return true;
    }
    
    if (!this.isAvailable()) {
      UI.showToast('Eye tracking not available', 'error');
      return false;
    }
    
    try {
      console.log('👁️ Initializing WebGazer...');
      
      const hasCamera = await this.requestCameraPermission();
      if (!hasCamera) {
        return false;
      }
      
      await webgazer
        .setRegression('ridge')
        .setTracker('TFFacemesh')
        .showPredictionPoints(false)
        .saveDataAcrossSessions(true)
        .begin();
      
      webgazer.pause();
      
      this.isInitialized = true;
      console.log('✅ WebGazer initialized');
      return true;
      
    } catch (error) {
      console.error('❌ WebGazer initialization error:', error);
      this.cleanup();
      return false;
    }
  }

  async start() {
    console.log('👁️ Starting eye tracking...');
    
    if (this.isActive) {
      console.log('⚠️ Already active, stopping first');
      this.stop();
      return;
    }
    
    if (!this.isInitialized) {
      const success = await this.init();
      if (!success) {
        return;
      }
    }
    
    try {
      this.isActive = true;
      
      UI.showToast('👁️ Starting eye tracking...', 'info', 2000);
      
      await webgazer.resume();
      await this.waitForVideoReady();
      
      this.createGazeIndicator();
      this.setupSimpleGazeListener();
      
      const eyeBtn = document.getElementById('eyeTrackingBtn');
      if (eyeBtn) {
        eyeBtn.classList.add('active');
        eyeBtn.style.background = 'var(--success)';
        eyeBtn.style.color = 'white';
      }
      
      UI.showToast('✅ Eye tracking active! Look far left/right', 'success', 3000);
      console.log('✅ Eye tracking started');
      
    } catch (error) {
      console.error('❌ Eye tracking start error:', error);
      this.stop();
    }
  }

  createGazeIndicator() {
    if (this.gazeCircle) {
      this.gazeCircle.remove();
    }
    
    this.gazeCircle = document.createElement('div');
    this.gazeCircle.id = 'gazeIndicator';
    this.gazeCircle.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(102, 126, 234, 0.7);
      border: 2px solid white;
      pointer-events: none;
      z-index: 9999;
      display: none;
      box-shadow: 0 0 15px rgba(102, 126, 234, 0.8);
    `;
    
    document.body.appendChild(this.gazeCircle);
  }

  async waitForVideoReady() {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 20;
      
      const checkVideo = setInterval(() => {
        const video = document.querySelector('#webgazerVideoFeed');
        
        if (video && video.readyState >= 2) {
          clearInterval(checkVideo);
          console.log('✅ Video stream ready');
          resolve();
        }
        
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(checkVideo);
          reject(new Error('Video stream timeout'));
        }
      }, 250);
    });
  }

  setupSimpleGazeListener() {
    if (!webgazer) return;
    
    let lastActionTime = 0;
    const cooldown = 2000;
    
    webgazer.setGazeListener((data, timestamp) => {
      if (!this.isActive || !data) return;
      
      if (this.gazeCircle) {
        this.gazeCircle.style.display = 'block';
        this.gazeCircle.style.left = `${data.x - 10}px`;
        this.gazeCircle.style.top = `${data.y - 10}px`;
      }
      
      const now = Date.now();
      if (now - lastActionTime < cooldown) {
        return;
      }
      
      const x = data.x / window.innerWidth;
      const y = data.y / window.innerHeight;
      
      if (x < 0.1 && y > 0.4 && y < 0.6) {
        this.handleAction('left');
        lastActionTime = now;
      } else if (x > 0.9 && y > 0.4 && y < 0.6) {
        this.handleAction('right');
        lastActionTime = now;
      }
    });
  }

  handleAction(direction) {
    console.log(`👁️ Action: ${direction}`);
    this.stats[`${direction}Looks`]++;
    this.stats.totalActions++;
    
    UI.showToast(`👁️ ${direction.toUpperCase()}`, 'info', 1000);
    
    if (direction === 'left') {
      if (STATE.lightboxOpen && lightboxManager) {
        lightboxManager.prev();
      } else {
        window.scrollBy({ left: -300, behavior: 'smooth' });
      }
    } else if (direction === 'right') {
      if (STATE.lightboxOpen && lightboxManager) {
        lightboxManager.next();
      } else {
        window.scrollBy({ left: 300, behavior: 'smooth' });
      }
    }
  }

  stop() {
    if (!this.isActive) {
      return;
    }
    
    console.log('🛑 Stopping eye tracking and releasing camera...');
    
    this.isActive = false;
    
    if (this.gazeCircle) {
      this.gazeCircle.remove();
      this.gazeCircle = null;
    }
    
    if (webgazer && this.isInitialized) {
      try {
        webgazer.pause();
        
        const video = document.querySelector('#webgazerVideoFeed');
        if (video && video.srcObject) {
          const tracks = video.srcObject.getTracks();
          tracks.forEach(track => {
            track.stop();
            console.log('🎥 Camera track stopped:', track.label);
          });
          video.srcObject = null;
        }
        
        const container = document.querySelector('#webgazerVideoContainer');
        if (container) {
          container.style.display = 'none';
        }
        
      } catch (error) {
        console.error('Error stopping webgazer:', error);
      }
    }
    
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => {
        track.stop();
        console.log('🎥 Our camera track stopped:', track.label);
      });
      this.cameraStream = null;
    }
    
    const eyeBtn = document.getElementById('eyeTrackingBtn');
    if (eyeBtn) {
      eyeBtn.classList.remove('active');
      eyeBtn.style.background = '';
      eyeBtn.style.color = '';
    }
    
    console.log('✅ Eye tracking stopped, camera released');
    console.log('📊 Stats:', this.stats);
    
    UI.showToast('✅ Camera turned off', 'success', 2000);
  }

  cleanup() {
    console.log('🧹 Complete cleanup...');
    
    this.stop();
    
    if (webgazer && this.isInitialized) {
      try {
        webgazer.end();
        console.log('🛑 WebGazer ended');
      } catch (error) {
        console.error('Error ending webgazer:', error);
      }
    }
    
    const webgazerElements = document.querySelectorAll('[id^="webgazer"]');
    webgazerElements.forEach(el => el.remove());
    
    this.isInitialized = false;
    console.log('✅ Complete cleanup done');
  }

  getStats() {
    return this.stats;
  }
}

const eyeTrackingManager = new EyeTrackingManager();

window.addEventListener('beforeunload', () => {
  eyeTrackingManager.cleanup();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && eyeTrackingManager.isActive) {
    console.log('⚠️ Tab hidden, stopping eye tracking');
    eyeTrackingManager.stop();
  }
});

if (typeof window !== 'undefined') {
  window.eyeTrackingManager = eyeTrackingManager;
}

console.log('✅ Eye tracking manager loaded');