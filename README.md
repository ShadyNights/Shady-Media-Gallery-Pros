# 📸 Shady Media Gallery Pro

> **AI-Powered Progressive Web Media Gallery built with Vanilla JavaScript**
>
> A modern, offline-first media gallery built with **Vanilla JavaScript**, featuring AI-powered captions, mood-based search, intelligent media discovery, eye-tracking navigation, and Progressive Web App capabilities—all without frontend frameworks.

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-Active-success)
![Framework](https://img.shields.io/badge/framework-None-orange)

### AI • Offline First • Mood Search • Eye Tracking • Zero Frameworks

**[🚀 Live Demo](https://shady-media-gallery.netlify.app/)** • **[⭐ Star Repository](https://github.com/ShadyNights/Shady-Media-Gallery-Pro)** • **[🐛 Report Bug](../../issues)** • **[✨ Request Feature](../../issues/new)**

</div>

---

## ✨ Overview

Shady Media Gallery Pro is a production-oriented Progressive Web App designed for discovering, browsing, and managing photos and videos through an intelligent user experience. It combines AI-assisted caption generation, semantic mood-based search, offline caching, advanced media management, and experimental eye-tracking interaction into a lightweight application built entirely with modern web technologies.

Unlike traditional galleries, the project demonstrates how complex, scalable frontend applications can be developed without relying on heavyweight frameworks while maintaining performance, modularity, and maintainability.

> **Built as a production-grade frontend engineering project showcasing modern browser APIs, AI integration, offline-first architecture, and modular Vanilla JavaScript development.**

## Table of Contents

- [Overview](#-overview)
- [Why This Project](#-why-this-project)
- [Key Highlights](#-key-highlights)
- [Core Features](#-core-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [Project Structure](#-project-structure)
- [Development Notes & Troubleshooting](#-development-notes--troubleshooting)
- [Performance](#-performance)
- [Security & Privacy](#-security--privacy)
- [Roadmap](#-roadmap)
- [Known Limitations](#-known-limitations)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## Why This Project

Modern media gallery applications often rely on large frontend frameworks and multiple third-party dependencies for functionality that can be achieved using native browser capabilities.

This project was built to demonstrate that a feature-rich, production-quality Progressive Web App can be developed using modern Vanilla JavaScript while maintaining excellent performance, modular architecture, and a clean developer experience.

The project focuses on three primary goals:

- Building a scalable frontend architecture without frameworks.
- Delivering an AI-enhanced media browsing experience.
- Leveraging modern browser APIs for offline functionality and intelligent interactions.

---

## Key Highlights

- Progressive Web App (PWA) with offline support
- AI-generated image captions using Google Gemini
- Intelligent mood-based media discovery
- Integrated eye-tracking navigation using WebGazer.js
- IndexedDB-powered local storage
- Background synchronization and smart caching
- Advanced search, filtering, and sorting
- Keyboard shortcuts and accessibility support
- Responsive design for desktop and mobile devices
- Zero frontend frameworks or runtime dependencies
  
---

## Core Features

| Feature | Description |
|----------|-------------|
| 🤖 AI Caption Generation | Generate contextual captions for images using Google Gemini. |
| 😊 Mood-Based Search | Discover media through semantic mood categories instead of simple keywords. |
| 📷 Photo & Video Gallery | Browse curated photos and videos with a unified interface. |
| 🌐 Progressive Web App | Installable application with offline browsing capabilities. |
| 💾 Offline Storage | Cache media and application data locally using IndexedDB. |
| 🔄 Background Sync | Synchronize cached content automatically when connectivity returns. |
| 👁 Eye Tracking Navigation | Navigate media using experimental browser-based eye tracking powered by WebGazer.js. |
| ❤️ Favorites | Save frequently accessed media locally. |
| 🕒 History | Maintain recently viewed media for quick access. |
| 🔍 Advanced Search | Search by keyword, mood, category, and media type. |
| 🎛 Advanced Filters | Filter using media type, date range, sorting options, and custom criteria. |
| 🖼 Lightbox Viewer | Fullscreen viewer with slideshow, zoom, keyboard navigation, and download support. |
| 📦 Bulk Operations | Select and download multiple media files simultaneously. |
| 🌙 Multiple Themes | Light, Dark, Sepia, and Neon themes with persistent preferences. |
| ⚡ Lazy Loading | Efficient loading strategy using Intersection Observer for improved performance. |
| 🛡 NSFW Detection | Experimental browser-side image filtering using heuristic analysis. |
| ⌨ Keyboard Shortcuts | Extensive keyboard navigation throughout the application. |
| 📱 Fully Responsive | Optimized experience across desktop, tablet, and mobile devices. |

---

## Technology Stack

| Layer | Technology |
|--------|------------|
| Frontend | HTML5 |
| Styling | CSS3 |
| Programming Language | Vanilla JavaScript (ES6+) |
| Media API | Pexels API |
| AI Integration | Google Gemini API |
| Offline Storage | IndexedDB |
| Offline Support | Service Workers |
| Browser APIs | Cache API, Background Sync, Local Storage |
| Eye Tracking | WebGazer.js |
| Deployment | Any Static Hosting Platform |

---

## System Architecture

```text
                    User
                      │
                      ▼
              Application UI
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
 Gallery Manager   Search Engine   Theme Manager
        │             │             │
        └─────────────┼─────────────┘
                      │
                      ▼
                 API Manager
              ┌───────────────┐
              │               │
              ▼               ▼
         Pexels API      Gemini API
              │               │
              └───────┬───────┘
                      ▼
               Media Processing
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
 IndexedDB      Service Worker    Cache API
        │             │             │
        └─────────────┼─────────────┘
                      ▼
                Offline Experience
```

### Architectural Principles

- Modular component-based JavaScript architecture
- Separation of concerns across UI, business logic, storage, and API layers
- Offline-first design using Service Workers and IndexedDB
- Progressive enhancement for advanced browser capabilities
- Lazy loading and caching to minimize network usage
- Framework-independent implementation for reduced bundle size and improved maintainability

---

## Quick Start

### Prerequisites

Before running the project, ensure you have:

- A modern browser (Chrome, Edge, Firefox, or Safari)
- A local development server
- A Pexels API Key
- (Optional) A Google Gemini API Key for AI-powered features

> **Note**
> Service Workers require the application to run over **localhost** or **HTTPS**. Opening `index.html` directly from the filesystem will disable offline functionality.

---

### Clone the Repository

```bash
git clone https://github.com/ShadyNights/Shady-Media-Gallery-Pro.git

cd Shady-Media-Gallery-Pro
```

---

### Start a Local Server

#### Python

```bash
python -m http.server 8000
```

#### Node.js

```bash
npx http-server -p 8000
```

#### VS Code

Open the project using **Live Server**.

---

### Open the Application

```
http://localhost:8000
```

The application will automatically initialize its local storage, cache, service worker, and user preferences during the first launch.

## Configuration

Before using the application, configure your API keys inside:

```
js/config.js
```

Replace the placeholder values:

```javascript
const CONFIG = {
  API_KEY: "YOUR_PEXELS_API_KEY",
  GEMINI_API_KEY: "YOUR_GEMINI_API_KEY"
};
```

---

### Required Configuration

| Configuration | Required | Purpose |
|--------------|----------|----------|
| Pexels API Key | ✅ | Photo & video search |
| Gemini API Key | Optional | AI-generated captions |
| Service Worker | Automatic | Offline support |
| IndexedDB | Automatic | Local storage |
| Local Storage | Automatic | User preferences |

---

### Obtain API Keys

#### Pexels

https://www.pexels.com/api/

Generate a free API key and replace:

```javascript
API_KEY: "YOUR_PEXELS_API_KEY"
```

---

#### Google Gemini

https://ai.google.dev/

Generate an API key and replace:

```javascript
GEMINI_API_KEY: "YOUR_GEMINI_API_KEY"
```

If no Gemini API key is configured, the application will continue to function normally while AI-powered caption generation is disabled.

---

### Security Notice

Never commit real API keys to a public repository.

Instead, use placeholders such as:

```javascript
API_KEY: "YOUR_API_KEY"
```

or load secrets from environment variables during deployment.

---

## Project Structure

```
Shady-Media-Gallery-Pro
│
├── css/
│   ├── styles.css
│   ├── mood-styles.css
│   └── eye-tracking-styles.css
│
├── js/
│   ├── app.js
│   ├── api.js
│   ├── config.js
│   ├── gallery.js
│   ├── ui.js
│   ├── storage.js
│   ├── utils.js
│   ├── lightbox.js
│   ├── shortcuts.js
│   ├── mood-engine.js
│   ├── mood-ui.js
│   ├── mood-playlists.js
│   ├── ai-analyzer.js
│   ├── offline-manager.js
│   └── eye-tracking.js
│
├── index.html
├── manifest.json
├── sw.js
├── robots.txt
├── LICENSE
└── README.md
```

---

### Directory Overview

| Directory | Purpose |
|-----------|----------|
| **css/** | Application styling and themes |
| **js/** | Application modules and business logic |
| **index.html** | Main application entry point |
| **manifest.json** | Progressive Web App configuration |
| **sw.js** | Service Worker and offline caching |
| **README.md** | Project documentation |
| **LICENSE** | Project license |

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

## Performance

The application is designed around an **offline-first**, **modular**, and **high-performance** architecture.

### Performance Features

- Lazy loading using Intersection Observer
- Progressive image loading
- Service Worker asset caching
- IndexedDB offline storage
- Request deduplication
- API response caching
- Infinite scrolling
- Debounced search requests
- Throttled event listeners
- Modular JavaScript architecture
- Background synchronization
- Deferred initialization for heavy features

---

### Optimization Techniques

| Feature | Implementation |
|----------|----------------|
| Lazy Loading | Intersection Observer |
| Offline Storage | IndexedDB |
| Asset Caching | Cache API |
| Search Optimization | Debounce |
| Scroll Optimization | Throttle |
| Infinite Scroll | Intersection Observer |
| Background Sync | Service Worker |
| Image Compression | Browser-side optimization |
| Request Caching | In-memory cache |
| Duplicate Prevention | Cached request tracking |

---

### Target Performance Goals

| Metric | Target |
|---------|---------|
| First Contentful Paint | < 1 second |
| Time to Interactive | < 2 seconds |
| Lighthouse Performance | 95+ |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 95+ |

Actual results may vary depending on browser, hardware, network conditions, and API response times.

---

## Security & Privacy

* **Local-first**: user data stored locally (IndexedDB), no server-side storage by default.
* **API Keys** must be set securely — do not commit real keys to public repos.
* **CSP-ready**: avoid inline scripts and styles for easier policy enforcement.
* **Webcam** used only for optional eye-tracking; permission requested explicitly.
* **No analytics or tracking** included by default.

---

## Roadmap

### Completed

- AI-powered caption generation
- Mood-based media search
- Progressive Web App (PWA)
- Offline-first architecture
- IndexedDB storage
- Service Worker caching
- Eye-tracking navigation
- Bulk media operations
- Advanced filtering and sorting
- Multiple UI themes
- Keyboard shortcuts
- Responsive interface

### Planned

- AI semantic image search
- User-created collections
- EXIF metadata viewer
- Cloud synchronization
- OCR-based image search
- Multi-language support
- Drag & drop uploads
- Enhanced accessibility improvements

---

## Known Limitations

- AI caption generation requires a valid Google Gemini API key.
- Eye tracking is experimental and works best in Chromium-based browsers.
- Offline mode caches previously viewed content and application assets only.
- Camera permission is required for eye-tracking functionality.
- Search quality depends on the metadata provided by the Pexels API.

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

This project is licensed under the **MIT License**.

See the [LICENSE](LICENSE) file for complete licensing information.

---

## Author

**Kashif Ansari**

AI • Cybersecurity • Backend Developer • Full-Stack Development

- GitHub: https://github.com/ShadyNights
- LinkedIn: https://www.linkedin.com/in/kashifansari18

---

## Acknowledgments

This project is built using several excellent open-source technologies and services.

- Pexels API — Photo and video content
- Google Gemini — AI-powered caption generation
- WebGazer.js — Browser-based eye tracking
- Font Awesome — Icons

---

If you found this project useful, consider leaving a ⭐ on the repository.

Contributions, feedback, and feature suggestions are always welcome.

Built with ❤️ using Vanilla JavaScript.
