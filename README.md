# ⛽ Fuel Price Pursuer

> **Hunt the best diesel & benzin prices across Austria — right in your browser.**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 🗺️ What is Fuel Price Pursuer?

**Fuel Price Pursuer** is a privacy-first, browser-based web app that helps Austrian drivers find the cheapest fuel nearby — and actually *predict* how prices will move over the next 2–3 days.

No account. No server. No tracking. All price history is stored locally in your browser.

---

## ✨ Features

- 🔍 **Location search** — Find places instantly via OpenStreetMap / Nominatim autocomplete
- 🗺️ **Interactive map** — Leaflet-powered map showing nearby tank stations with live price pins
- ⛽ **Diesel & Benzin prices** — Fetched in real time from the [Sprit.org](https://www.sprit.org) API
- 📈 **Local price history** — Prices are logged to `localStorage` on every visit, building up your personal dataset over time
- 🔮 **Price trend prediction** — Simple trend analysis helps you gauge whether prices are likely to rise or fall in the next 2–3 days
- 📍 **Station detail view** — See price history charts, address, and opening hours per station
- 🌙 **Dark / Light mode** — Respects your system preference
- 📴 **Offline-ready** — Historical data stays available even without an internet connection

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend framework | [React](https://react.dev) + [Vite](https://vitejs.dev) |
| Map rendering | [Leaflet](https://leafletjs.com) via `react-leaflet` |
| Place search | [OpenStreetMap Nominatim API](https://nominatim.org) |
| Fuel price data | [Sprit.org API](https://www.sprit.org) |
| Local storage | Browser `localStorage` (no backend required) |
| Charts | Recharts (or your preferred chart library) |
| Styling | CSS Modules / Tailwind CSS |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) ≥ 18
- npm or pnpm

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/fuel-price-pursuer.git
cd fuel-price-pursuer

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
npm run preview
```

---

## 📖 How It Works

### 1. Find your location
Type a city, town, or address into the search bar. Nominatim returns matching suggestions from OpenStreetMap — select one and the map centers on it.

### 2. Discover nearby stations
Fuel Price Pursuer queries the **Sprit.org API** for tank stations within your chosen radius. Each station appears as a map pin labeled with its current diesel and benzin price.

### 3. Build your price history
Every time you load prices, the app appends a timestamped snapshot to `localStorage`. Over repeated visits (or days), this builds up a per-station price timeline — entirely in your own browser, private to you.

### 4. Predict tomorrow's prices
The built-in trend engine analyses your local history to detect patterns (e.g. prices typically rise on Thursday evenings before the weekend and drop mid-week). It shows a simple forecast indicator — **↑ likely rising**, **↓ likely falling**, or **→ stable** — for the next 2–3 days.

> **Note:** The more history you accumulate, the more accurate the trend analysis becomes.

---

## 🔑 API Notes

### Sprit.org
Fuel Price Pursuer uses the public [Sprit.org](https://www.sprit.org) API to retrieve Austrian fuel prices. No API key is required for basic requests, but please respect their rate limits and terms of service.

### Nominatim (OpenStreetMap)
Place search uses the free [Nominatim API](https://nominatim.org/release-docs/latest/api/Search/). Per their usage policy, requests must include a meaningful `User-Agent` header and must not exceed 1 request per second.

---

## 🤝 Contributing

This is a fully open, free project — everyone is welcome to contribute! Whether it's a bug fix, a new feature, an idea, or just improving the docs, all contributions are appreciated.

Fork the repo, make your changes, and open a pull request. For bigger changes, opening an issue first to discuss the idea is always a good move.

```bash
# Run linting
npm run lint

# Run tests
npm run test
```

---

## 📄 License

MIT © 2025 — made with ☕ and a hatred of expensive diesel.
