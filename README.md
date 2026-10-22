<div align="center">

# 🛡️ PasswordSaver

### Zero-Knowledge Private Vault & Offline Password Manager

[![Deploy to GitHub Pages](https://github.com/passwordsaver/passwordsaver.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/passwordsaver/passwordsaver.github.io/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-287A74.svg)](https://opensource.org/licenses/MIT)
[![Encryption: Web Crypto AES-GCM 256](https://img.shields.io/badge/Encryption-AES--GCM_256--bit-55A9A0.svg)](#security-architecture)
[![Architecture: Zero-Server](https://img.shields.io/badge/Architecture-100%25_Client--Side-AEEED3?labelColor=122422)](https://passwordsaver.github.io/)
[![PWA: 100% Offline Ready](https://img.shields.io/badge/PWA-Offline_Ready-FFF8B0?labelColor=122422)](https://passwordsaver.github.io/)
[![i18n: 8 Languages](https://img.shields.io/badge/i18n-8_Languages-55A9A0.svg)](#internationalization-i18n)
[![Support on Ko-fi](https://img.shields.io/badge/Support-Ko--fi-FF5E5B.svg?logo=kofi&logoColor=white)](https://ko-fi.com/kishara)

**[Explore Live Application »](https://passwordsaver.github.io/)**

---

</div>

## 📖 Overview

**PasswordSaver** is an ultra-minimalist, zero-server, privacy-first password manager and secure credentials vault executed **100% inside your web browser**. 

Unlike conventional cloud-based password managers vulnerable to server-side breaches, third-party database compromises, or telemetry scraping, PasswordSaver guarantees that **your master password and raw credentials never touch an external server or network socket**. All encryption, key derivation, and decryption routines run locally via the native browser **Web Crypto API**.

---

## 🔒 Security Architecture & Threat Model

PasswordSaver is built upon modern cryptographic primitives standardized by W3C:

```
[ Master Password / PIN ] 
          │
          ▼
[ PBKDF2 (100,000 rounds, SHA-256, 16-byte random Salt) ]
          │
          ▼
[ 256-bit AES-GCM CryptoKey ]
          │
  ┌───────┴────────────────────────┐
  ▼                                ▼
[ Vault Verification Token ]     [ Credential Encrypted Record ]
• Sentinel Verification Phrase   • 12-byte Unique Cryptographic IV
• Zero Master Password Storage   • Authenticated Ciphertext & Auth Tag
```

- **Cipher Standard**: **AES-GCM (Galois/Counter Mode)** with 256-bit keys, ensuring both confidentiality and cryptographic integrity verification (AEAD).
- **Key Derivation (PBKDF2)**: Derives a high-entropy symmetric key from the user's Master Key / PIN using **100,000 iterations of HMAC-SHA-256** and a 16-byte cryptographically secure pseudorandom salt (`window.crypto.getRandomValues`).
- **Isolated Initialization Vectors (IV)**: Every credential record uses a unique, non-repeating 12-byte initialization vector, preventing replay attacks and cryptographic pattern leakage.
- **Sentinel Key Verification**: Master passwords are verified using an encrypted sentinel token (`PW_SAVER_MASTER_KEY_VERIFIED_SENTINEL_2026`). Plaintext master keys or hashes are **never stored** in local storage or anywhere else.
- **RAM Auto-Wipe on Lock**: Locking the vault immediately zeroes the derived `CryptoKey` reference and purges all decrypted strings from memory.

---

## ✨ Features

- 🔐 **100% Client-Side Execution**: Zero backend infrastructure, zero databases, zero external API dependencies.
- ⚡ **Minimal Steps Workflow**:
  - Quick master setup with real-time entropy scoring.
  - 1-Click **Add Credential** with auto-formatting URL sanitization.
  - 1-Click **Copy Username or Password** with visual status checkmarks and accessible toast feedback.
- 🎲 **Cryptographic Password Generator**:
  - Configurable length (8 to 48+ characters).
  - Fine-grained controls for uppercase, lowercase, numbers, symbols, and ambiguous character exclusion.
  - **Memorable Passphrase Mode** (random high-entropy natural words with optional number/symbol separators).
  - Real-time entropy bit rating and strength visualizer.
- 💾 **Encrypted Vault Backup & Restore**:
  - Export full encrypted snapshots as portable JSON files (`passwordsaver-encrypted-backup-*.json`).
  - Safe against browser cache purges or device migrations.
  - 1-click restore with format validation.
- 📱 **Progressive Web App (PWA) & Offline-First**:
  - Service Worker precaching all static assets.
  - Works **100% offline** on Windows, macOS, Linux, Android, and iOS.
  - Interactive in-app **"Add to Home Screen"** button (`beforeinstallprompt`) with a dedicated **iOS Safari installation guide modal**.
- 🌐 **Reactive 8-Language Internationalization (i18n)**:
  - English (`en`), Spanish (`es`), Portuguese (`pt`), German (`de`), French (`fr`), Japanese (`ja`), Simplified Chinese (`zh`), and Russian (`ru`).
  - Seamless instant language switching with persistent locale preferences.
- 🎨 **Luxury Minimalist UI & Dual Themes**:
  - Tailored palette: **Deep Teal (`#287A74`)**, **Sage Teal (`#55A9A0`)**, **Mint Glow (`#AEEED3`)**, and **Warm Cream (`#FFF8B0`)**.
  - High-craft light and dark themes with persistent user state.
  - **Strictly icon-only responsive mobile navigation** to preserve screen real estate.
- ☕ **Support the Creator**: Built-in direct support integration via [Ko-fi](https://ko-fi.com/kishara).

---

## 📁 Repository Structure

```tree
├── .github/
│   └── workflows/
│       └── deploy.yml        # Automated GitHub Pages CI/CD workflow
├── public/
│   ├── icon.svg              # Scalable luxury brand shield vector
│   ├── manifest.json         # PWA Web App Manifest
│   ├── robots.txt            # Search engine crawl directives
│   ├── sitemap.xml           # XML sitemap with 8-language hreflang alternates
│   ├── sw.js                 # PWA offline service worker
│   └── pwa-*.png             # Maskable & standard home screen icons
├── src/
│   ├── components/
│   │   ├── BackupModal.tsx       # Encrypted JSON export & import dialog
│   │   ├── CredentialModal.tsx   # Add/Edit modal with smart URL & generator
│   │   ├── FaqSection.tsx        # Semantic HTML5 FAQ & security deep dive
│   │   ├── IOSGuideModal.tsx     # Safari iOS Home Screen install guide
│   │   ├── MasterKeyModal.tsx    # Master unlock & initial setup screen
│   │   ├── Navbar.tsx            # Desktop & icon-only mobile navigation
│   │   ├── Toast.tsx             # ARIA live status notification container
│   │   └── VaultDashboard.tsx    # Credential cards, filters, and 1-click actions
│   ├── hooks/
│   │   └── usePWAInstall.ts      # PWA install prompt & offline status hooks
│   ├── lib/
│   │   ├── crypto.ts             # Web Crypto AES-GCM engine & password generator
│   │   └── i18n.ts               # Complete 8-language reactive dictionary
│   ├── layouts/
│   │   └── Layout.astro          # Astro layout with Gtag, SEO & JSON-LD
│   ├── pages/
│   │   └── index.astro           # Astro production entry island
│   ├── App.tsx                   # Main React interactive application
│   ├── index.css                 # Global Tailwind CSS and design tokens
│   └── main.tsx                  # React DOM mount & service worker bootstrap
├── index.html                # Production HTML5 entry point with Schema.org JSON-LD
├── package.json              # Project dependencies & build scripts
├── tsconfig.json             # TypeScript compiler configuration
└── vite.config.ts            # Vite & Tailwind bundler configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.0.0` or higher (Node 22 recommended)
- **Package Manager**: `npm` (v10+)

### 1. Clone the Repository

```bash
git clone https://github.com/passwordsaver/passwordsaver.github.io.git
cd passwordsaver.github.io
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open your browser at `http://localhost:3000` to preview the application with instant hot updates.

### 4. Build for Production

```bash
npm run build
```

The production-ready assets will be compiled into the `dist/` directory.

---

## 🚢 Publishing to GitHub Pages

This repository includes a production-ready GitHub Actions workflow (`.github/workflows/deploy.yml`) configured for automatic builds and deployments.

### Setup Instructions:

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: initial release of PasswordSaver"
   git push origin main
   ```

2. In your GitHub repository:
   - Navigate to **Settings** > **Pages** (under Code and automation).
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.

3. That's it! Every push to `main` will automatically build the project and publish it live to `https://<username>.github.io/<repo>/` (or `https://passwordsaver.github.io/`).

---

## 🛡️ Responsible Disclosure & Security

PasswordSaver relies purely on client-side math and the host browser's native implementation of the Web Crypto API. If you discover a cryptographic vulnerability or security edge case, please open an issue or submit a pull request with details.

---

## ☕ Support the Developer

If PasswordSaver protects your digital privacy, consider supporting continued open-source development:

👉 **[Support on Ko-fi: ko-fi.com/kishara](https://ko-fi.com/kishara)**

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more details.
