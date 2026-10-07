# ⚡ AI Intraday Trading Assistant & Order Flow Replay Terminal

An advanced, free, and open-source **Intraday Market Analytics, Footprint Order Flow Engine, & AI Decision Support System** tailored for Indian Indices (Bank Nifty, Nifty) and NSE/BSE Stocks.

---

## 🌟 Key Features

### 1. 📊 Institutional Order Flow & Footprint Engine (`/footprint-replay.html`)
- **Bid × Ask Diagonal Imbalance Ladders**: Real-time footprint cluster breakdown per price level.
- **Delta & Cumulative Volume Delta (CVD)**: Real-time aggressive buyer vs seller pressure sub-chart.
- **Dynamic VWAP & Point of Control (POC)**: Identifies institutional value nodes and high-volume price acceptance.
- **Historical Bar-by-Bar Replay Simulator**:
  - Play, Pause, Next Bar, and Previous Bar (`◀ Back`) controls.
  - Custom speed control (1x to 10x).
  - Practice real intraday sessions bar-by-bar without risking real capital.
- **Interactive Options Paper Trading (CE / PE)**:
  - 1-click ATM Call / Put trade execution.
  - Auto-calculating Stop Loss & Target Price overlays directly on the chart.
  - Customizable Starting Capital modal (₹25K, ₹50K, ₹1L, ₹2L, ₹5L, ₹10L or custom).
- **Mobile-Friendly & Touch-Optimized**:
  - Direct touch-drag and pan navigation for smartphones.
  - Zoom-in / Zoom-out buttons for easy mobile inspection.

### 2. 🤖 AI Signal & Reasoning Engine
- Computes overall intraday momentum scores (-100 to +100) and confidence metrics.
- Generates actionable trade verdicts (`BUY`, `STRONG BUY`, `SELL`, `WAIT`).
- Identifies **Order Flow Traps** (Bull traps, Bear traps, Absorption, and Exhaustion patterns).
- Provides plain-language AI reasoning in Hinglish + English.

### 3. 📈 Technical Analysis & Stock Radar (`/index.html`)
- **VWAP, RSI(14), EMA 9, EMA 21, EMA 50**, ATR(14), and Pivot Points (PP, R1, R2, S1, S2).
- Automatic candlestick pattern detection (Hammer, Shooting Star, Pin Bar, Engulfing).
- Pre-market scanner and multi-symbol tracking.

---

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or newer recommended).

### 2. Installation & Launch
```bash
# Clone the repository
git clone https://github.com/rockyhandso/ai-trading-assistant.git

# Enter the project directory
cd ai-trading-assistant

# Install dependencies
npm install

# Start the local server
node server.js
```

### 3. Access in Browser
- **Footprint Replay & Simulator**: [http://localhost:3000/footprint-replay.html](http://localhost:3000/footprint-replay.html)
- **Main Trading Dashboard**: [http://localhost:3000](http://localhost:3000)

---

## 📡 API Endpoints

- `GET /api/volume-footprint?symbol=BANKNIFTY&mode=backtest&date=YYYY-MM-DD` - Footprint order flow, ladders, delta, and CVD data.
- `GET /api/stock-analysis?symbol=RELIANCE&interval=5m&range=1d` - Technical indicators, momentum score, and AI signal.
- `GET /api/paper-trade` - Virtual portfolio & active positions.
- `POST /api/paper-trade` - Execute paper orders or manage positions.

---

## 🛡️ License
MIT License. Created for traders, developers, and market researchers.
