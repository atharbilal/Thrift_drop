# 🛍️ ThriftDrop
 
<div align="center">
 
![ThriftDrop Banner](https://img.shields.io/badge/ThriftDrop-Marketplace-6C63FF?style=for-the-badge&logo=shopify&logoColor=white)
 
**A high-performance, mobile-first thrift marketplace — discover and drop second-hand gems with ease.**
 
[![Expo](https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![NativeWind](https://img.shields.io/badge/NativeWind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://www.nativewind.dev/)
 
[Features](#-features) · [Tech Stack](#️-tech-stack) · [Getting Started](#-getting-started) · [Screenshots](#-screenshots) · [Roadmap](#️-roadmap)
 
</div>
 
---
 
## 📖 About
 
ThriftDrop is my first mobile app — a marketplace built for thrifters who want a fast, clean, and modern experience for buying and selling second-hand items. Built with **Expo** and **Supabase**, it focuses on performance, real-time updates, and a seamless "drop" workflow that makes listing items feel effortless.
 
This project marks the beginning of my app development journey, combining full-stack mobile development with plans for future **Agentic AI** features like automated price estimation.
 
---
 
## ✨ Features
 
| Feature | Description |
|---|---|
| 🔍 **Optimized Discovery** | Standard feed + `feed-optimized.tsx` for high-performance, smooth scrolling through listings |
| 📦 **Item Dropping** | Dedicated listing workflows via `create-drop.tsx` and `new-drop.tsx` |
| 🔐 **Auth & Backend** | Full Supabase integration — authentication, real-time DB, and secure file storage |
| 📱 **Native-Ready** | Custom development client to support native modules and AI integrations |
| 📡 **Offline Support** | Built-in network monitoring with an `OfflineBanner` component for graceful offline handling |
| 🤖 **AI-Ready Architecture** | Structured with Pydantic outputs and LangGraph state transitions for future AI features |
 
---
 
## 🛠️ Tech Stack
 
```
├── Framework        →  Expo (React Native) + Expo Router (file-based navigation)
├── Language         →  TypeScript
├── Database & Auth  →  Supabase (PostgreSQL)
├── Styling          →  NativeWind (Tailwind CSS for React Native)
├── State/AI         →  Pydantic + LangGraph
└── Tooling          →  Node.js (LTS), CocoaPods (iOS)
```
 
---
 
## 📋 Prerequisites
 
Before you begin, make sure you have the following installed:
 
- **Node.js** (LTS version) — [Download here](https://nodejs.org/)
- **Expo Go** app on your phone for quick testing, or a **Development Build** for native features
- **Xcode** (macOS only, for iOS builds)
- **CocoaPods** (for iOS native modules)
- **Android Studio** (optional, for Android emulator)
- A **Supabase** account — [Sign up free](https://supabase.com/)
 
---
 
## 🚀 Getting Started
 
### 1. Clone the Repository
 
```bash
git clone https://github.com/atharbilal/Thrift_drop.git
cd Thrift_drop
```
 
### 2. Install Dependencies
 
```bash
npm install --legacy-peer-deps
```
 
> ⚠️ **Note:** The `--legacy-peer-deps` flag is required due to some peer dependency conflicts between Expo and certain native modules.
 
### 3. Set Up Environment Variables
 
Create a `.env` file in the root directory of the project:
 
```bash
touch .env
```
 
Then open it and add your Supabase credentials (refer to `.env.example` as a template):
 
```plaintext
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
 
> 💡 You can find these values in your Supabase project dashboard under **Settings → API**.
 
---
 
## ▶️ Running the App
 
### iOS (macOS only — requires Xcode)
 
```bash
npx expo run:ios
```
 
### Android
 
```bash
npx expo run:android
```
 
### Quick Preview with Expo Go
 
```bash
npx expo start
```
 
Then scan the QR code in the terminal using the **Expo Go** app on your phone.
 
---
 
## 📁 Project Structure
 
```
Thrift_drop/
├── app/
│   ├── (tabs)/
│   │   ├── feed.tsx              # Standard item discovery feed
│   │   ├── feed-optimized.tsx    # High-performance optimized feed
│   │   ├── create-drop.tsx       # New listing creation flow
│   │   └── new-drop.tsx          # Alternative drop workflow
│   └── _layout.tsx               # Root navigation layout
├── components/
│   └── OfflineBanner.tsx         # Offline/network status indicator
├── lib/
│   └── supabase.ts               # Supabase client configuration
├── .env.example                  # Environment variable template
├── app.json                      # Expo app configuration
└── package.json
```
 
---
 
## 🔒 Security
 
- The `.env` file and all sensitive credentials (including service account JSON files) are excluded from this repository via `.gitignore`.
- **Never commit your `.env` file** or any API keys to version control.
- Always use the `.env.example` as a reference template when setting up for local development.
 
---
 
## 🗺️ Roadmap
 
Here's what's coming next for ThriftDrop:
 
- [ ] 🤖 **Agentic AI Integration** — Specialized AI agents for automated price estimation and financial tracking
- [ ] 💬 **In-App Messaging** — Direct buyer-seller chat
- [ ] ❤️ **Wishlist / Save Items** — Bookmark listings for later
- [ ] 🔔 **Push Notifications** — Alerts for new drops and price changes
- [ ] 🌏 **International Expansion** — Architecture prep for scaling to Japan and Italy
- [ ] 📊 **Seller Analytics Dashboard** — Track views, likes, and sales
 
---
 
## 🤝 Contributing
 
Contributions, issues, and feature requests are welcome!
 
1. Fork the project
2. Create your feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request
 
---
 
## 👨‍💻 Author
 
**Athar Bilal**
 
[![GitHub](https://img.shields.io/badge/GitHub-atharbilal-181717?style=flat-square&logo=github)](https://github.com/atharbilal)
 
---
 
## 📄 License
 
This project is open source and available under the [MIT License](LICENSE).
 
---
 
<div align="center">
 
 
⭐ **If you like ThriftDrop, please give it a star — it means a lot!** ⭐
 
</div>
