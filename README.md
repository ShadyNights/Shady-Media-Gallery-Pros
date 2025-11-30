# 📸 Shady Media Gallery Pro

> **AI-Powered Photo & Video Gallery with Offline-First Architecture**
> A production-ready, feature-rich Progressive Web App built entirely with vanilla JavaScript. Search by mood, get Gemini-powered captions, navigate with your eyes, and access everything offline—no frameworks, no bloat, just pure performance.

<div align="center">

[![version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()
[🚀 Live Demo](#) · [📖 Documentation](#) · [🐛 Report Bug](#) · [✨ Request Feature](#)

</div>

---

## Table of Contents

* [What is this?](#what-is-this)
* [Why this project?](#why-this-project)
* [Core Features](#core-features)
* [Tech Stack](#tech-stack)
* [Quick Start](#quick-start)
* [Configuration](#configuration)
* [Project Structure](#project-structure)
* [Development Notes & Troubleshooting](#development-notes--troubleshooting)
* [Performance & Optimization](#performance--optimization)
* [Security & Privacy](#security--privacy)
* [Contributing](#contributing)
* [Changelog](#changelog)
* [License](#license)
* [Author & Acknowledgments](#author--acknowledgments)

---

## What is this?

**Shady Media Gallery Pro** is a Progressive Web App (PWA) that reimagines discovery and management of photos & videos. It uses AI (Google Gemini) to generate captions, supports mood-based search queries (30+ moods), works offline using IndexedDB + Service Workers, and includes experimental eye-tracking navigation via WebGazer.js — all built with vanilla JavaScript and no runtime frameworks.

---

## Why this project?

Two motivations:

1. Prove that production-ready, complex apps can be built without heavy frameworks—clean, performant, maintainable code wins.
2. Make visual search feel human: search by mood or vibe, not just text tags.

---

## Core Features

* **AI Auto-Captioning** — Gemini Vision API produces creative, human-like captions.
* **Mood-Based Search** — 30+ mood categories (e.g., *dark aesthetic, luxury vibes, feeling sad*).
* **Offline-First Architecture** — IndexedDB + Service Workers for full offline use.
* **Smart Sync & Background Sync** — Queue offline actions and sync when online.
* **Eye-Tracking Navigation** — WebGazer.js integration (9-point calibration, blink-select).
* **Advanced Filters** — Date ranges, media type, bulk operations, sort options.
* **NSFW Detection** — Custom skin-tone & color-space analysis (5-algorithm approach).
* **Lightbox Experience** — Full-screen viewing, slideshow, keyboard nav, zoom, download.
* **Favorites & History** — Save up to N items and track recent views.
* **Themes** — Light / Dark / Sepia / Neon with auto dark mode.
* **Zero Runtime Dependencies** — Vanilla JS, CSS3 — minimal bundle size.

---

## Tech Stack

* **Vanilla JavaScript (ES6+)** — Custom architecture, modular design
* **CSS3** — 4 theme variants (Light, Dark, Sepia, Neon)
* **IndexedDB** — Offline persistent storage
* **Service Workers** — Caching, offline strategy, background sync
* **Google Gemini Vision** — AI auto-caption generation
* **Pexels API** — Media sourcing (photos & videos)
* **WebGazer.js** — Browser eye-tracking (experimental)
* **No build step required** — Deploy static files to any static host

---

## Quick Start

### Prerequisites

* Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+).
* Pexels API key: [https://www.pexels.com/api](https://www.pexels.com/api)
* Local server: Python, `http-server`, or VS Code Live Server (Service Workers require a server or `localhost`).

### Clone & Run

```bash
# Clone
git clone https://github.com/yourusername/Shady-Media-Gallery-Pro.git
cd Shady-Media-Gallery-Pro

# Start a local server (Option A: Python 3)
python -m http.server 8000

# (Option B: Node)
npx http-server -p 8000

# Open
# http://localhost:8000
```

### Configure API Keys

Edit `js/config.js` and add keys:

```javascript
const CONFIG = {
  API_KEY: 'YOUR_PEXELS_API_KEY',
  API_BASE_URL: 'https://api.pexels.com/v1',
  API_VIDEO_URL: 'https://api.pexels.com/videos',
  GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY', // optional
  PER_PAGE: 30,
  CACHE_DURATION: 3600000,
  MAX_FAVORITES: 50,
  MAX_HISTORY: 100,
  ENABLE_NSFW_DETECTION: true,
  ENABLE_EYE_TRACKING: true,
  ENABLE_OFFLINE_MODE: true
};
```

> **Gemini AI:** Add your Google Gemini API key in `GEMINI_API_KEY` if you want AI captions. See [ai.google.dev](https://ai.google.dev).

---

## Project Structure

```
shady-gallery-pro/
├── index.html
├── manifest.json
├── sw.js
├── robots.txt
├── README.md
├── LICENSE
├── css/
│   ├── styles.css
│   ├── mood-styles.css
│   └── eye-tracking-styles.css
└── js/
    ├── config.js
    ├── utils.js
    ├── api.js
    ├── storage.js
    ├── ui.js
    ├── gallery.js
    ├── lightbox.js
    ├── shortcuts.js
    ├── mood-engine.js
    ├── mood-playlists.js
    ├── mood-ui.js
    ├── ai-analyzer.js
    ├── offline-manager.js
    ├── eye-tracking.js
    └── app.js
```

---

## Development Notes & Troubleshooting

### Common Issues

**401 / API errors**

* Verify `API_KEY` in `js/config.js`.
* Serve over `http://localhost` or HTTPS (Service Workers and some APIs require secure contexts).

**Images show broken placeholders**

* Check CORS and Pexels API quota/status.
* Disable ad blockers, clear SW caches (DevTools → Application → Clear storage).

**Service Worker not registering**

* Ensure served over `localhost` or HTTPS.
* Check DevTools → Application → Service Workers for error logs.

**Eye tracking inaccurate**

* Ensure proper lighting, face visibility, and camera permission.
* Use the calibration screen and re-run calibration if needed.

---

## Performance & Optimization

* **FCP < 1s** via precomputed thumbnails and minimal DOM bootstrap
* **Time to Interactive < 2s** using deferred initialization for heavy features (eye-tracking, AI)
* **Lighthouse**: Target 95+ performance and 100 for accessibility & best practices with optimizations below:

  * Image & video lazy loading (Intersection Observer)
  * Skeleton loaders and progressive blur-up images
  * Debounced search input (300ms)
  * Throttled scroll handlers
  * Service Worker caching strategies (cache-first for assets, network-first for search)

---

## Security & Privacy

* **Local-first**: user data stored locally (IndexedDB), no server-side storage by default.
* **API Keys** must be set securely — do not commit real keys to public repos.
* **CSP-ready**: avoid inline scripts and styles for easier policy enforcement.
* **Webcam** used only for optional eye-tracking; permission requested explicitly.
* **No analytics or tracking** included by default.

---

## Contributing

Contributions are welcome!

**Workflow**

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Keep code style consistent (ES6+, 2-space indent)
4. Test across supported browsers
5. Open a PR with a clear description and screenshots, if applicable

**Reporting bugs**

* Use the issue template and include browser, OS, steps to reproduce, and console output.

**Feature requests**

* Use Discussions or open an enhancement issue with use-case and suggested approach.

---

## Changelog

### Version 1.0.0 — 2025-11-30

Initial production release:

* Core gallery functionality with Pexels API
* Mood-based search (30+ categories)
* Gemini Vision AI captions
* Offline PWA capabilities (IndexedDB, Service Workers)
* Eye-tracking navigation (WebGazer.js)
* 4 themes, advanced filters, NSFW detection, and keyboard shortcuts

---

## License

This project is licensed under the **MIT License** — see the `LICENSE` file for details.

```
MIT License

Copyright (c) 2025 Shady

Permission is hereby granted...
```

(Full license in `LICENSE`)

---

## Author

**Shady** — Full-Stack Developer

* Portfolio: [https://your-website.com](https://your-website.com)
* GitHub: [https://github.com/yourusername](https://github.com/yourusername)
* LinkedIn: [https://linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)
* Email: [your.email@example.com](mailto:your.email@example.com)

---

## Acknowledgments

* **Pexels** — free photos & videos API
* **Google Gemini** — AI-powered captioning
* **WebGazer.js** — client-side eye-tracking
* **Font Awesome** — icons & UI inspiration
* Community contributors and early testers

---

### ⭐ If you found this repo helpful, please star it!

**Built with vanilla JavaScript — no frameworks — no runtime dependencies**
