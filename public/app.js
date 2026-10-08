/**
 * Ultra-Smart AI Intraday Trading Assistant - Frontend App Logic
 * Integrated with Live Candlestick Patterns, Lightweight Charts & 6-Pillar Intelligence
 */

let currentSymbol = 'NIFTY';
let currentTimeframe = '5m';
let autoRefreshTimer = null;
let currentAnalysisData = null;
let currentChartView = 'candles'; // 'candles' or 'line'
let isInitialStockLoad = true;

// TradingView Lightweight Charts Instances
let lwChart = null;
let candleSeries = null;
let forecastCandleSeries = null;
let vwapSeries = null;
let ema9Series = null;
let forecastSeries = null;

// Chart.js instance for fallback line view
let chartJsInstance = null;

// Smart API Base URL
const API_BASE = (window.location.protocol === 'http:' || window.location.protocol === 'https:') ? '' : 'http://localhost:3000';

// DOM Elements
const symbolInput = document.getElementById('symbolInput');
const searchBtn = document.getElementById('searchBtn');
const refreshBtn = document.getElementById('refreshBtn');
const autoRefreshCheckbox = document.getElementById('autoRefresh');
const quickChips = document.querySelectorAll('.chip');
const tfBtns = document.querySelectorAll('.tf-btn');

// View Switch Buttons
const viewCandlesBtn = document.getElementById('viewCandlesBtn');
const viewLineBtn = document.getElementById('viewLineBtn');
const candlestickChartContainer = document.getElementById('candlestickChartContainer');
const lineChartContainer = document.getElementById('lineChartContainer');

// Displays
const stockNameDisplay = document.getElementById('stockNameDisplay');
const currentPriceDisplay = document.getElementById('currentPriceDisplay');
const changePercentDisplay = document.getElementById('changePercentDisplay');
const dayHighDisplay = document.getElementById('dayHighDisplay');
const dayLowDisplay = document.getElementById('dayLowDisplay');
const lastUpdated = document.getElementById('lastUpdated');

// Self-Awareness Banner Elements
const awarenessScoreVal = document.getElementById('awarenessScoreVal');
const awarenessLevelBadge = document.getElementById('awarenessLevelBadge');
const scoreMtf = document.getElementById('scoreMtf');
const scoreRegime = document.getElementById('scoreRegime');
const scoreRs = document.getElementById('scoreRs');
const scoreVeto = document.getElementById('scoreVeto');
const scoreOrderFlow = document.getElementById('scoreOrderFlow');
const scoreMemory = document.getElementById('scoreMemory');

// Trade Veto Elements
const tradeVetoCard = document.getElementById('tradeVetoCard');
const vetoIcon = document.getElementById('vetoIcon');
const vetoTitle = document.getElementById('vetoTitle');
const vetoExplanation = document.getElementById('vetoExplanation');

// 6-Pillar Radar Elements
const mtfOverallStatus = document.getElementById('mtfOverallStatus');
const mtf1mBadge = document.getElementById('mtf1mBadge');
const mtf5mBadge = document.getElementById('mtf5mBadge');
const mtf15mBadge = document.getElementById('mtf15mBadge');

const regimeBadge = document.getElementById('regimeBadge');
const regimeStrategyDesc = document.getElementById('regimeStrategyDesc');

const rsAlphaBadge = document.getElementById('rsAlphaBadge');
const rsDescText = document.getElementById('rsDescText');

const pocBadge = document.getElementById('pocBadge');
const valDisplay = document.getElementById('valDisplay');
const pocDisplay = document.getElementById('pocDisplay');
const vahDisplay = document.getElementById('vahDisplay');

// Candlestick Patterns Radar Elements
const patternCountBadge = document.getElementById('patternCountBadge');
const patternsCardsList = document.getElementById('patternsCardsList');

// Signal & Levels Elements
const signalBadge = document.getElementById('signalBadge');
const confidenceScore = document.getElementById('confidenceScore');
const aiVerdictText = document.getElementById('aiVerdictText');
const entryLevel = document.getElementById('entryLevel');
const slLevel = document.getElementById('slLevel');
const target1Level = document.getElementById('target1Level');
const target2Level = document.getElementById('target2Level');
const signalsList = document.getElementById('signalsList');

// 10-Step Forecast Elements
const forecastTrajectoryBadge = document.getElementById('forecastTrajectoryBadge');
const forecastSummaryText = document.getElementById('forecastSummaryText');
const forecastTableBody = document.getElementById('forecastTableBody');

// AI Post-Mortem Elements
const accuracyScoreDisplay = document.getElementById('accuracyScoreDisplay');
const pmTotalCount = document.getElementById('pmTotalCount');
const pmSuccessCount = document.getElementById('pmSuccessCount');
const pmFailedCount = document.getElementById('pmFailedCount');
const adaptiveRulesList = document.getElementById('adaptiveRulesList');
const auditCardsList = document.getElementById('auditCardsList');

// News & Catalyst Elements
const stockSectorBadge = document.getElementById('stockSectorBadge');
const factorsList = document.getElementById('factorsList');
const newsSentimentPill = document.getElementById('newsSentimentPill');
const newsList = document.getElementById('newsList');

// Metrics
const metricRsi = document.getElementById('metricRsi');
const rsiStatus = document.getElementById('rsiStatus');
const metricVwap = document.getElementById('metricVwap');
const vwapStatus = document.getElementById('vwapStatus');
const metricEma = document.getElementById('metricEma');
const emaStatus = document.getElementById('emaStatus');
const metricAtr = document.getElementById('metricAtr');

// Pivots
const pivotR2 = document.getElementById('pivotR2');
const pivotR1 = document.getElementById('pivotR1');
const pivotPP = document.getElementById('pivotPP');
const pivotS1 = document.getElementById('pivotS1');
const pivotS2 = document.getElementById('pivotS2');

// Paper Trading Elements
const virtualCashDisplay = document.getElementById('virtualCashDisplay');
const positionsTableBody = document.getElementById('positionsTableBody');
const tradeQtyInput = document.getElementById('tradeQty');
const tradeSLInput = document.getElementById('tradeSL');
const tradeTargetInput = document.getElementById('tradeTarget');
const autoSetRRBtn = document.getElementById('autoSetRRBtn');
const tradeRrRatioVal = document.getElementById('tradeRrRatioVal');
const tradeRiskVal = document.getElementById('tradeRiskVal');
const tradeProfitVal = document.getElementById('tradeProfitVal');
const quickBuyBtn = document.getElementById('quickBuyBtn');
const quickSellBtn = document.getElementById('quickSellBtn');
const resetAccountBtn = document.getElementById('resetAccountBtn');
const toast = document.getElementById('toast');

// Notification helper
function showToast(message, type = 'info') {
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.className = 'toast';
  }, 3500);
}

// Initialize TradingView Lightweight Charts
function initLightweightChart() {
  if (!candlestickChartContainer) return;
  if (typeof LightweightCharts === 'undefined') {
    setTimeout(initLightweightChart, 300);
    return;
  }

  candlestickChartContainer.innerHTML = '';

  lwChart = LightweightCharts.createChart(candlestickChartContainer, {
    width: candlestickChartContainer.clientWidth || 800,
    height: 360,
    layout: {
      background: { type: 'solid', color: 'transparent' },
      textColor: '#94a3b8',
      fontFamily: "'Outfit', sans-serif"
    },
    localization: {
      locale: 'en-IN',
      dateFormat: 'dd/MM/yyyy',
      timeFormatter: (timestamp) => {
        const d = new Date(timestamp * 1000);
        return d.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }) + ' (IST)';
      }
    },
    grid: {
      vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
      horzLines: { color: 'rgba(255, 255, 255, 0.04)' }
    },
    crosshair: {
      mode: LightweightCharts.CrosshairMode.Normal,
      vertLine: { color: 'rgba(0, 229, 255, 0.4)', width: 1, style: LightweightCharts.LineStyle.Dashed },
      horzLine: { color: 'rgba(0, 229, 255, 0.4)', width: 1, style: LightweightCharts.LineStyle.Dashed }
    },
    rightPriceScale: {
      borderColor: 'rgba(255, 255, 255, 0.1)',
      scaleMargins: { top: 0.1, bottom: 0.1 }
    },
    timeScale: {
      borderColor: 'rgba(255, 255, 255, 0.1)',
      timeVisible: true,
      secondsVisible: false,
      tickMarkFormatter: (time) => {
        const d = new Date(time * 1000);
        return d.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }
    }
  });

  candleSeries = lwChart.addCandlestickSeries({
    upColor: '#10b981',
    downColor: '#ef4444',
    borderVisible: false,
    wickUpColor: '#10b981',
    wickDownColor: '#ef4444'
  });

  // Dedicated 10-Step Future Candlestick Series
  forecastCandleSeries = lwChart.addCandlestickSeries({
    upColor: 'rgba(168, 85, 247, 0.9)',
    downColor: 'rgba(236, 72, 153, 0.9)',
    borderVisible: true,
    borderColor: '#c084fc',
    wickUpColor: '#c084fc',
    wickDownColor: '#f472b6',
    title: '🔮 Future Forecast Candles'
  });

  vwapSeries = lwChart.addLineSeries({
    color: '#f59e0b',
    lineWidth: 1.5,
    lineStyle: LightweightCharts.LineStyle.Dotted,
    title: 'VWAP'
  });

  ema9Series = lwChart.addLineSeries({
    color: '#06b6d4',
    lineWidth: 1.5,
    title: 'EMA 9'
  });

  forecastSeries = lwChart.addLineSeries({
    color: '#c084fc',
    lineWidth: 2.5,
    lineStyle: LightweightCharts.LineStyle.Dashed,
    title: '10-Step AI Forecast'
  });

  window.addEventListener('resize', () => {
    if (lwChart && candlestickChartContainer) {
      lwChart.applyOptions({ width: candlestickChartContainer.clientWidth });
    }
  });
}

// Fetch Stock Analysis & Candlestick Patterns
async function loadStockAnalysis() {
  try {
    const res = await fetch(`${API_BASE}/api/stock-analysis?symbol=${encodeURIComponent(currentSymbol)}&interval=${currentTimeframe}`);
    const json = await res.json();

    if (!json.success) {
      showToast(`Error: ${json.error}`, 'error');
      aiVerdictText.textContent = `⚠️ Error fetching data for ${currentSymbol}: ${json.error}`;
      return;
    }

    const data = json.data;
    currentAnalysisData = data;
    renderAnalysis(data);
    updatePaperTradingTable();
  } catch (err) {
    showToast('Cannot connect to backend server. Make sure server is running on http://localhost:3000', 'error');
    aiVerdictText.innerHTML = `⚠️ <strong>Connection Error:</strong> Backend server से connect नहीं हो पा रहा है। कृपया browser में <a href="http://localhost:3000" style="color: #38bdf8; text-decoration: underline;">http://localhost:3000</a> open करें।`;
    console.error(err);
  }
}

// Fetch News & Catalysts Intelligence
async function loadNewsAndCatalysts() {
  try {
    const res = await fetch(`${API_BASE}/api/stock-news-catalysts?symbol=${encodeURIComponent(currentSymbol)}`);
    const json = await res.json();

    if (!json.success) return;

    renderNewsAndCatalysts(json.data);
  } catch (err) {
    console.error('Error fetching news catalysts:', err);
  }
}

// Render News & Catalysts
function renderNewsAndCatalysts(data) {
  const c = data.catalysts;
  stockSectorBadge.textContent = c.sector || 'Equities';

  factorsList.innerHTML = '';
  if (c.keyFactors && c.keyFactors.length > 0) {
    c.keyFactors.forEach(f => {
      const item = document.createElement('div');
      item.className = 'factor-item';
      item.innerHTML = `
        <div class="factor-title-row">
          <strong>${f.factor}</strong>
          <span class="impact-tag ${f.impact}">${f.impact} IMPACT</span>
        </div>
        <p>${f.desc}</p>
      `;
      factorsList.appendChild(item);
    });
  }

  const n = data.news;
  newsSentimentPill.textContent = n.overallSentiment || 'Mixed Sentiment';

  newsList.innerHTML = '';
  if (n.newsItems && n.newsItems.length > 0) {
    n.newsItems.forEach(item => {
      const a = document.createElement('a');
      a.className = 'news-item';
      a.href = item.link;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.innerHTML = `
        <span class="news-item-title">${item.title}</span>
        <div class="news-item-footer">
          <span>🕒 ${item.date}</span>
          <span class="news-sent-tag ${item.impactClass}">${item.sentiment}</span>
        </div>
      `;
      newsList.appendChild(a);
    });
  } else {
    newsList.innerHTML = `<div style="color: var(--text-muted); font-size: 0.8rem; padding: 0.5rem;">No recent news found for this symbol.</div>`;
  }
}

// Render Complete Analysis, Candlesticks & 6 Pillars
function renderAnalysis(data) {
  stockNameDisplay.textContent = data.symbol === '^NSEI' ? 'NIFTY 50' : (data.symbol === '^NSEBANK' ? 'BANK NIFTY' : data.symbol);
  currentPriceDisplay.textContent = `₹${data.currentPrice.toFixed(2)}`;
  
  const isPos = data.dayChangePct >= 0;
  changePercentDisplay.textContent = `${isPos ? '+' : ''}${data.dayChangePct}%`;
  changePercentDisplay.className = `change-pill ${isPos ? '' : 'negative'}`;

  dayHighDisplay.textContent = `₹${data.dayHigh.toFixed(2)}`;
  dayLowDisplay.textContent = `₹${data.dayLow.toFixed(2)}`;
  lastUpdated.textContent = `Updated: ${new Date().toLocaleTimeString()}`;

  // 🌟 Self-Awareness Score Banner
  if (data.selfAwareness) {
    const sa = data.selfAwareness;
    awarenessScoreVal.textContent = sa.score;
    awarenessLevelBadge.textContent = sa.awarenessLevel;
    awarenessLevelBadge.style.color = sa.awarenessColor === 'green' ? 'var(--color-green)' : (sa.awarenessColor === 'cyan' ? 'var(--color-cyan)' : 'var(--color-amber)');
    
    scoreMtf.textContent = `${sa.components.mtfConfluence}%`;
    scoreRegime.textContent = `${sa.components.regimeClarity}%`;
    scoreRs.textContent = `${sa.components.relativeStrength}%`;
    scoreVeto.textContent = `${sa.components.riskVetoPrecision}%`;
    scoreOrderFlow.textContent = `${(sa.components.relativeStrength * 0.9 + 10).toFixed(0)}%`;
    scoreMemory.textContent = `${sa.components.postMortemMemory}%`;
  }

  // 📊 Option Chain Intelligence Pill
  const scoreOcPcr = document.getElementById('scoreOcPcr');
  if (scoreOcPcr && data.optionChain) {
    const oc = data.optionChain;
    scoreOcPcr.textContent = `${oc.pcr} (${oc.sentiment})`;
    scoreOcPcr.style.color = oc.pcr >= 1.1 ? 'var(--color-green)' : (oc.pcr <= 0.85 ? 'var(--color-red)' : 'var(--color-amber)');
  }

  // 🧮 Smart Margin & Sizing Calculator Update
  updateMarginCalculator(data);

  // 🛡️ Smart Trade Veto Banner
  if (data.tradeVeto) {
    const tv = data.tradeVeto;
    if (tv.isVetoed) {
      tradeVetoCard.className = 'trade-veto-card vetoed';
      vetoIcon.textContent = '🛑';
      vetoTitle.textContent = tv.vetoTitle;
      vetoExplanation.textContent = tv.vetoExplanation;
    } else {
      tradeVetoCard.className = 'trade-veto-card';
      vetoIcon.textContent = '🛡️';
      vetoTitle.textContent = tv.vetoTitle;
      vetoExplanation.textContent = tv.vetoExplanation;
    }
  }

  // ⏱️ Multi-Timeframe Confluence (MTF)
  if (data.multiTimeframe) {
    const mtf = data.multiTimeframe;
    const formatMtf = (item) => {
      const color = item.bias === 'BULLISH' ? 'var(--color-green)' : (item.bias === 'BEARISH' ? 'var(--color-red)' : 'var(--color-amber)');
      return `<span style="color: ${color}; font-weight: 700;">${item.bias}</span>`;
    };
    mtf1mBadge.innerHTML = `1m: ${formatMtf(mtf.m1)}`;
    mtf5mBadge.innerHTML = `5m: ${formatMtf(mtf.m5)}`;
    mtf15mBadge.innerHTML = `15m: ${formatMtf(mtf.m15)}`;

    const isFullAligned = mtf.m1.bias === mtf.m5.bias && mtf.m5.bias === mtf.m15.bias;
    mtfOverallStatus.textContent = isFullAligned ? '🔥 100% MTF Aligned' : 'Partial Alignment';
    mtfOverallStatus.style.color = isFullAligned ? 'var(--color-green)' : 'var(--color-cyan)';
  }

  // 🌪️ Market Regime Awareness
  if (data.marketRegime) {
    const mr = data.marketRegime;
    regimeBadge.textContent = mr.title;
    regimeBadge.style.color = mr.tagColor === 'green' ? 'var(--color-green)' : (mr.tagColor === 'red' ? 'var(--color-red)' : 'var(--color-amber)');
    regimeStrategyDesc.innerHTML = `<strong>Strategy:</strong> ${mr.recommendedStrategy}`;
  }

  // ⚖️ Relative Strength vs Nifty
  if (data.relativeStrength) {
    const rs = data.relativeStrength;
    rsAlphaBadge.textContent = `Alpha: ${rs.alpha >= 0 ? '+' : ''}${rs.alpha}%`;
    rsAlphaBadge.style.color = rs.alpha >= 0 ? 'var(--color-green)' : 'var(--color-red)';
    rsDescText.innerHTML = rs.desc.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  // 📊 Order Flow & POC
  if (data.volumeProfile) {
    const vp = data.volumeProfile;
    pocBadge.textContent = `POC: ₹${vp.poc}`;
    pocDisplay.textContent = `₹${vp.poc}`;
    vahDisplay.textContent = `₹${vp.vah}`;
    valDisplay.textContent = `₹${vp.val}`;
  }

  // 🕯️ Candlestick Patterns Radar List
  if (data.candlePatterns) {
    patternCountBadge.textContent = `${data.candlePatterns.length} Patterns Found`;
    patternsCardsList.innerHTML = '';

    const recentPatterns = data.candlePatterns.slice(-8).reverse();
    if (recentPatterns.length > 0) {
      recentPatterns.forEach(p => {
        const item = document.createElement('div');
        item.className = `pattern-card-item ${p.type}`;
        item.innerHTML = `
          <div class="pattern-title-row">
            <strong>${p.name}</strong>
            <span class="pattern-time">⏱️ ${p.timeLabel} (₹${p.price.toFixed(2)})</span>
          </div>
          <div class="pattern-desc">${p.desc}</div>
        `;
        patternsCardsList.appendChild(item);
      });
    } else {
      patternsCardsList.innerHTML = `<div style="color: var(--text-muted); font-size: 0.8rem; padding: 0.5rem;">Scanning candles for new pattern formations...</div>`;
    }
  }

  // 🌅 NEXT-DAY PRE-MARKET & GAP PREDICTOR RENDERING
  if (data.gapPredictor) {
    const gp = data.gapPredictor;
    const gapDirBadge = document.getElementById('gapDirBadge');
    const gapProbDisplay = document.getElementById('gapProbDisplay');
    const gapOpenRange = document.getElementById('gapOpenRange');
    const gapExpectedPts = document.getElementById('gapExpectedPts');
    const gapTomorrowFloor = document.getElementById('gapTomorrowFloor');
    const gapTomorrowCeil = document.getElementById('gapTomorrowCeil');
    const gapStrategyHindi = document.getElementById('gapStrategyHindi');

    if (gapDirBadge) {
      gapDirBadge.textContent = gp.badgeLabel;
      gapDirBadge.className = `gap-dir-badge ${gp.badgeColor}`;
    }
    if (gapProbDisplay) {
      gapProbDisplay.textContent = `${gp.probability}% Probability`;
    }
    if (gapOpenRange) {
      gapOpenRange.textContent = `₹${gp.projectedOpenLow.toFixed(1)} – ₹${gp.projectedOpenHigh.toFixed(1)}`;
    }
    if (gapExpectedPts) {
      gapExpectedPts.textContent = gp.expectedGapRange;
      gapExpectedPts.style.color = gp.direction === 'GAP_UP' ? '#34d399' : (gp.direction === 'GAP_DOWN' ? '#f87171' : '#fbbf24');
    }
    if (gapTomorrowFloor) {
      gapTomorrowFloor.textContent = `₹${gp.tomorrowSupport.toFixed(1)}`;
    }
    if (gapTomorrowCeil) {
      gapTomorrowCeil.textContent = `₹${gp.tomorrowResistance.toFixed(1)}`;
    }
    
    // Global Cues & GIFT NIFTY Pills
    const cueGiftNifty = document.getElementById('cueGiftNifty');
    const cueUsMarkets = document.getElementById('cueUsMarkets');
    const cueFiiFlow = document.getElementById('cueFiiFlow');
    if (gp.globalCues) {
      if (cueGiftNifty) cueGiftNifty.textContent = gp.globalCues.giftNifty || '🌐 GIFT NIFTY: Neutral';
      if (cueUsMarkets) cueUsMarkets.textContent = gp.globalCues.usMarkets || '🇺🇸 US Markets: Neutral';
      if (cueFiiFlow) cueFiiFlow.textContent = gp.globalCues.fiiFlow || '🏦 FIIs Flow: Neutral';
    }

    if (gapStrategyHindi) {
      gapStrategyHindi.innerHTML = gp.gameplanHindi;
    }
  }

  // 🕒 SAMEER AI: 30-Min & 1-Hour Directional Trajectory
  if (data.forecast) {
    const fc = data.forecast;
    const n30 = fc.next30Min;
    const n1h = fc.next1Hour;

    const dfMainBiasBadge = document.getElementById('dfMainBiasBadge');
    const dfDir30m = document.getElementById('dfDir30m');
    const dfProb30m = document.getElementById('dfProb30m');
    const dfTarget30m = document.getElementById('dfTarget30m');
    const dfMove30m = document.getElementById('dfMove30m');
    const dfRationale30m = document.getElementById('dfRationale30m');

    const dfDir1h = document.getElementById('dfDir1h');
    const dfProb1h = document.getElementById('dfProb1h');
    const dfTarget1h = document.getElementById('dfTarget1h');
    const dfRange1h = document.getElementById('dfRange1h');
    const dfStrategy1h = document.getElementById('dfStrategy1h');

    if (dfMainBiasBadge) {
      dfMainBiasBadge.textContent = `Bias: ${fc.trajectoryType || 'SIDEWAYS'}`;
      dfMainBiasBadge.style.color = fc.trajectoryType === 'BULLISH' ? '#34d399' : (fc.trajectoryType === 'BEARISH' ? '#f87171' : '#fbbf24');
    }

    if (n30) {
      if (dfDir30m) {
        dfDir30m.textContent = n30.direction;
        dfDir30m.style.color = n30.direction.includes('BULLISH') ? '#34d399' : (n30.direction.includes('BEARISH') ? '#f87171' : '#fbbf24');
      }
      if (dfProb30m) dfProb30m.textContent = `${n30.probability}% Probability`;
      if (dfTarget30m) dfTarget30m.textContent = `₹${n30.targetPrice.toFixed(2)}`;
      if (dfMove30m) {
        dfMove30m.textContent = `${n30.expectedMovePts >= 0 ? '+' : ''}${n30.expectedMovePts} pts (${n30.expectedMovePct >= 0 ? '+' : ''}${n30.expectedMovePct}%)`;
        dfMove30m.style.color = n30.expectedMovePts >= 0 ? '#34d399' : '#f87171';
      }
      if (dfRationale30m) dfRationale30m.innerHTML = n30.rationaleHindi;
    }

    if (n1h) {
      if (dfDir1h) {
        dfDir1h.textContent = n1h.direction;
        dfDir1h.style.color = n1h.direction.includes('BULLISH') || n1h.direction.includes('UPWARD') ? '#34d399' : (n1h.direction.includes('BEARISH') || n1h.direction.includes('DOWNWARD') ? '#f87171' : '#fbbf24');
      }
      if (dfProb1h) dfProb1h.textContent = `${n1h.probability}% Probability`;
      if (dfTarget1h) dfTarget1h.textContent = `₹${n1h.targetPrice.toFixed(2)}`;
      if (dfRange1h) dfRange1h.textContent = `₹${n1h.floorSupport.toFixed(0)} - ₹${n1h.ceilingResistance.toFixed(0)}`;
      if (dfStrategy1h) dfStrategy1h.innerHTML = n1h.strategyHindi;
    }
  }

  // AI Decision
  const d = data.decision;
  signalBadge.textContent = d.recommendation;
  signalBadge.className = `signal-type-badge ${d.actionType.toLowerCase()}`;
  confidenceScore.textContent = `${d.confidence}%`;
  
  aiVerdictText.innerHTML = d.aiVerdict.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  entryLevel.textContent = `₹${d.entryPrice.toFixed(2)}`;
  slLevel.textContent = d.stopLoss ? `₹${d.stopLoss.toFixed(2)}` : 'N/A';
  target1Level.textContent = d.target1 ? `₹${d.target1.toFixed(2)}` : 'N/A';
  target2Level.textContent = d.target2 ? `₹${d.target2.toFixed(2)}` : 'N/A';

  // 10-Step Forecast
  if (data.forecast) {
    const f = data.forecast;
    forecastTrajectoryBadge.textContent = f.trajectoryType === 'BULLISH' ? '🚀 UPTREND FORECAST' : (f.trajectoryType === 'BEARISH' ? '⚠️ DOWNTREND FORECAST' : '⏳ RANGE-BOUND');
    forecastTrajectoryBadge.style.color = f.trajectoryType === 'BULLISH' ? 'var(--color-green)' : (f.trajectoryType === 'BEARISH' ? 'var(--color-red)' : 'var(--color-amber)');
    
    forecastSummaryText.innerHTML = f.forecastSummary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    forecastTableBody.innerHTML = '';
    f.forecast.forEach(st => {
      const isUp = st.expectedChange >= 0;
      const pillClass = st.patternColor || (isUp ? 'green' : 'red');
      const icon = st.isGreen ? '🟢' : (st.patternColor === 'amber' ? '➕' : '🔴');
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong style="color: #c084fc;">+${st.step}</strong></td>
        <td>${st.timeLabel}</td>
        <td>
          <div style="display: flex; flex-direction: column; gap: 0.2rem;">
            <span class="candle-pill-tag ${pillClass}">${icon} ${st.predictedPattern}</span>
            <small style="color: var(--text-muted); font-size: 0.7rem;">${st.patternDesc}</small>
          </div>
        </td>
        <td>
          <div class="ohlc-mini-block">
            O: <span>₹${st.open}</span> H: <span>₹${st.high}</span><br>
            L: <span>₹${st.low}</span> C: <span>₹${st.close}</span>
          </div>
        </td>
        <td style="color: ${isUp ? 'var(--color-green)' : 'var(--color-red)'}; font-weight: 700; vertical-align: middle;">
          ${isUp ? '+' : ''}${st.expectedChange}%
        </td>
      `;
      forecastTableBody.appendChild(tr);
    });
  }

  // 🧠 AI Post-Mortem & Self-Learning Rendering
  if (data.postMortem) {
    const pm = data.postMortem;
    accuracyScoreDisplay.textContent = `${pm.accuracyRate}%`;
    accuracyScoreDisplay.style.color = pm.accuracyRate >= 65 ? 'var(--color-green)' : 'var(--color-amber)';
    pmTotalCount.textContent = pm.totalForecasts;
    pmSuccessCount.textContent = pm.successfulForecasts;
    pmFailedCount.textContent = pm.failedForecasts;

    // Adaptive Rules List
    adaptiveRulesList.innerHTML = '';
    (pm.adaptiveLearnings || []).forEach(rule => {
      const li = document.createElement('li');
      li.innerHTML = rule.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      adaptiveRulesList.appendChild(li);
    });

    // Audit Cards Breakdown
    auditCardsList.innerHTML = '';
    if (pm.audits && pm.audits.length > 0) {
      pm.audits.forEach(aud => {
        const card = document.createElement('div');
        card.className = `audit-card ${aud.isSuccess ? 'SUCCESS' : 'FAILED'}`;
        card.innerHTML = `
          <div class="audit-card-top">
            <span>⏱️ Prediction @ ${aud.originTime} ➔ Verified @ ${aud.verifiedTime}</span>
            <span class="audit-tag ${aud.isSuccess ? 'SUCCESS' : 'FAILED'}">${aud.isSuccess ? '✅ TARGET HIT' : '❌ FAILED / TRAP'}</span>
          </div>
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--text-secondary);">
            Origin Price: ₹${aud.originPrice} | Projected Target: ₹${aud.projectedTargetPrice} | Actual Outcome: ₹${aud.actualPrice} (${aud.actualMovePct >= 0 ? '+' : ''}${aud.actualMovePct}%)
          </div>
          <div class="audit-cause">${aud.rootCause.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>
          <div class="audit-learning">${aud.aiLearning.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>
        `;
        auditCardsList.appendChild(card);
      });
    } else {
      auditCardsList.innerHTML = `<div style="color: var(--text-muted); padding: 0.5rem; font-size: 0.8rem;">Waiting for more intraday candles to complete initial audit cycle.</div>`;
    }
  }

  // 🕒 Optimal Time-Window Radar & Autonomous Agent State
  if (data.timeWindow) {
    const tw = data.timeWindow;
    const currentWindowPill = document.getElementById('currentWindowPill');
    const currentWindowWinRate = document.getElementById('currentWindowWinRate');
    const bestUpcomingWindowText = document.getElementById('bestUpcomingWindowText');
    const twrAdviceHindi = document.getElementById('twrAdviceHindi');

    if (currentWindowPill) {
      currentWindowPill.textContent = tw.windowName;
      currentWindowPill.className = `twr-pill ${tw.badgeColor}`;
    }
    if (currentWindowWinRate) {
      currentWindowWinRate.textContent = `Win Rate: ${tw.expectedWinRate}%`;
    }
    if (bestUpcomingWindowText) {
      bestUpcomingWindowText.textContent = tw.bestUpcomingWindow;
    }
    if (twrAdviceHindi) {
      twrAdviceHindi.innerHTML = `💡 <strong>टाइमिंग गाइडेंस:</strong> ${tw.adviceHindi}`;
    }
  }

  // 🤖 Autonomous Agent Status & Logs
  if (data.autoTrader) {
    const at = data.autoTrader;
    const agentStatusBadge = document.getElementById('agentStatusBadge');
    const agentToggleBtn = document.getElementById('agentToggleBtn');
    const hourlyHeatmapGrid = document.getElementById('hourlyHeatmapGrid');
    const agentLogsList = document.getElementById('agentLogsList');

    if (agentStatusBadge && agentToggleBtn) {
      if (at.isEnabled) {
        agentStatusBadge.textContent = '🟢 Agent: LIVE & TRADING';
        agentStatusBadge.className = 'agent-status-badge active';
        agentToggleBtn.textContent = '⏸️ Pause Auto-Trader';
        agentToggleBtn.className = 'btn btn-agent-toggle paused-state';
      } else {
        agentStatusBadge.textContent = '⏸️ Agent: PAUSED';
        agentStatusBadge.className = 'agent-status-badge paused';
        agentToggleBtn.textContent = '⚡ Activate Auto-Trader';
        agentToggleBtn.className = 'btn btn-agent-toggle';
      }
    }

    // Render Hourly Heatmap Bars
    if (hourlyHeatmapGrid && at.hourlyPerformance) {
      hourlyHeatmapGrid.innerHTML = '';
      const currentKey = data.timeWindow?.windowKey;
      Object.entries(at.hourlyPerformance).forEach(([timeRange, info]) => {
        const isCurrent = currentKey === timeRange;
        const bar = document.createElement('div');
        bar.className = `heatmap-bar-card ${isCurrent ? 'active-hour' : ''}`;
        
        let fillColor = '#34d399';
        if (info.status === 'HIGH_RISK_CHOP') fillColor = '#ef4444';
        else if (info.status === 'MODERATE') fillColor = '#f59e0b';

        bar.innerHTML = `
          <div class="hm-time-row">
            <span>${timeRange}</span>
            <span style="color: ${fillColor};">${info.winRate}%</span>
          </div>
          <div class="hm-status-tag ${info.status}">${info.name}</div>
          <div class="hm-bar-visual">
            <div class="hm-bar-fill" style="width: ${info.winRate}%; background: ${fillColor};"></div>
          </div>
        `;
        hourlyHeatmapGrid.appendChild(bar);
      });
    }

    // Render Agent Logs
    if (agentLogsList && at.recentAgentLogs) {
      agentLogsList.innerHTML = '';
      at.recentAgentLogs.forEach(log => {
        const div = document.createElement('div');
        div.className = `agent-log-item ${log.type}`;
        div.innerHTML = `<span style="color: #64748b;">[${log.time}]</span> ${log.message}`;
        agentLogsList.appendChild(div);
      });
    }
  }

  // Signals Checklist
  signalsList.innerHTML = '';
  data.signals.forEach(sig => {
    const div = document.createElement('div');
    div.className = `signal-item ${sig.type}`;
    div.innerHTML = `<strong>${sig.name}</strong><span>${sig.desc}</span>`;
    signalsList.appendChild(div);
  });

  // Indicator Cards
  metricRsi.textContent = data.indicators.rsi;
  if (data.indicators.rsi > 70) {
    rsiStatus.textContent = 'Overbought (>70)';
    rsiStatus.style.color = 'var(--color-amber)';
  } else if (data.indicators.rsi < 30) {
    rsiStatus.textContent = 'Oversold (<30)';
    rsiStatus.style.color = 'var(--color-amber)';
  } else if (data.indicators.rsi >= 50) {
    rsiStatus.textContent = 'Bullish Zone';
    rsiStatus.style.color = 'var(--color-green)';
  } else {
    rsiStatus.textContent = 'Bearish Zone';
    rsiStatus.style.color = 'var(--color-red)';
  }

  metricVwap.textContent = `₹${data.indicators.vwap.toFixed(2)}`;
  vwapStatus.textContent = data.currentPrice >= data.indicators.vwap ? 'Trading Above VWAP' : 'Trading Below VWAP';
  vwapStatus.style.color = data.currentPrice >= data.indicators.vwap ? 'var(--color-green)' : 'var(--color-red)';

  metricEma.textContent = `₹${data.indicators.ema9} / ₹${data.indicators.ema21}`;
  emaStatus.textContent = data.indicators.ema9 >= data.indicators.ema21 ? 'EMA 9 > EMA 21 (Bullish)' : 'EMA 9 < EMA 21 (Bearish)';
  emaStatus.style.color = data.indicators.ema9 >= data.indicators.ema21 ? 'var(--color-green)' : 'var(--color-red)';

  metricAtr.textContent = `₹${data.indicators.atr.toFixed(2)}`;

  // Pivots
  const p = data.indicators.pivots;
  pivotR2.textContent = `₹${p.r2}`;
  pivotR1.textContent = `₹${p.r1}`;
  pivotPP.textContent = `₹${p.pp}`;
  pivotS1.textContent = `₹${p.s1}`;
  pivotS2.textContent = `₹${p.s2}`;

  // Render Charts (Candlesticks + Line)
  renderCandlestickChart(data.chartData, data.forecast?.forecast || [], data.candlePatterns || []);
  renderChartJsLine(data.chartData, data.forecast?.forecast || []);

  // Pre-fill / Sync Paper Trade 1:2 R:R Stop Loss & Target Levels
  autoPopulateTradeLevels();
  if (typeof updateMarginCalculator === 'function') updateMarginCalculator(data);
  if (typeof checkAlertTriggers === 'function') checkAlertTriggers(data);
}


// 🕯️ Render TradingView Candlestick Chart
function renderCandlestickChart(chartData, forecastSteps, candlePatterns) {
  if (!chartData || chartData.length === 0) return;
  if (!lwChart) {
    initLightweightChart();
  }

  if (!candleSeries) return;

  try {
    // 1. Format Candlestick Data (time must be sorted ascending)
    const formattedCandles = chartData.map(c => ({
      time: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close
    })).sort((a, b) => a.time - b.time);

    candleSeries.setData(formattedCandles);

    // 2. Format VWAP & EMA 9 Lines
    const vwapData = chartData.map(c => ({ time: c.time, value: c.vwap })).sort((a, b) => a.time - b.time);
    vwapSeries.setData(vwapData);

    const ema9Data = chartData.map(c => ({ time: c.time, value: c.ema9 || c.close })).sort((a, b) => a.time - b.time);
    ema9Series.setData(ema9Data);

    // 3. Format 10-Step Future Forecast Candlesticks & Pattern Markers
    const lastTime = chartData[chartData.length - 1].time;
    let stepSeconds = 300; // 5m
    if (currentTimeframe === '1m') stepSeconds = 60;
    else if (currentTimeframe === '15m') stepSeconds = 900;

    const forecastLineData = [
      { time: lastTime, value: chartData[chartData.length - 1].close }
    ];
    const forecastCandlesData = [];
    const forecastMarkers = [];

    forecastSteps.forEach((st, idx) => {
      const futureTime = lastTime + (idx + 1) * stepSeconds;
      forecastLineData.push({
        time: futureTime,
        value: st.price
      });

      forecastCandlesData.push({
        time: futureTime,
        open: st.open,
        high: st.high,
        low: st.low,
        close: st.close
      });

      // Markers placed directly on the future forecast candles
      forecastMarkers.push({
        time: futureTime,
        position: st.isGreen ? 'belowBar' : 'aboveBar',
        color: st.isGreen ? '#a855f7' : '#ec4899',
        shape: st.isGreen ? 'arrowUp' : 'arrowDown',
        text: `🔮 +${st.step}: ${st.predictedPattern.split(' ')[0]}`
      });
    });

    forecastSeries.setData(forecastLineData);
    if (forecastCandleSeries) {
      forecastCandleSeries.setData(forecastCandlesData);
      forecastCandleSeries.setMarkers(forecastMarkers);
    }

    // Preserve user zoom and scroll level across auto-refreshes
    const previousLogicalRange = lwChart.timeScale().getVisibleLogicalRange();

    // 4. Place AI BUY & SELL Signals Directly on Candlesticks
    const markerMap = new Map(); // deduplicate markers by time

    // (A) Scan historical intraday candles for AI VWAP & EMA Breakout Crossovers
    for (let i = 1; i < chartData.length - 1; i++) {
      const prev = chartData[i - 1];
      const curr = chartData[i];

      // Bullish VWAP Crossover (BUY)
      if (curr.close > curr.vwap && prev.close <= prev.vwap && (curr.ema9 || 0) >= (curr.ema21 || 0)) {
        markerMap.set(curr.time, {
          time: curr.time,
          position: 'belowBar',
          color: '#10b981',
          shape: 'arrowUp',
          text: `🟢 BUY @ ₹${curr.close.toFixed(0)}`
        });
      }
      // Bearish VWAP Breakdown (SELL)
      else if (curr.close < curr.vwap && prev.close >= prev.vwap && (curr.ema9 || 999999) <= (curr.ema21 || 999999)) {
        markerMap.set(curr.time, {
          time: curr.time,
          position: 'aboveBar',
          color: '#ef4444',
          shape: 'arrowDown',
          text: `🔴 SELL @ ₹${curr.close.toFixed(0)}`
        });
      }
    }

    // (B) Overlay Identified Candlestick Pattern Triggers
    candlePatterns.forEach(p => {
      if (!markerMap.has(p.time)) {
        const isBull = p.name.toLowerCase().includes('bullish') || p.name.toLowerCase().includes('hammer') || p.name.toLowerCase().includes('morning');
        const isBear = p.name.toLowerCase().includes('bearish') || p.name.toLowerCase().includes('star') || p.name.toLowerCase().includes('evening');
        markerMap.set(p.time, {
          time: p.time,
          position: isBull ? 'belowBar' : (isBear ? 'aboveBar' : 'aboveBar'),
          color: isBull ? '#34d399' : (isBear ? '#f87171' : '#fbbf24'),
          shape: isBull ? 'arrowUp' : (isBear ? 'arrowDown' : 'circle'),
          text: isBull ? `🟢 BUY (${p.name})` : (isBear ? `🔴 SELL (${p.name})` : `⚠️ ${p.name}`)
        });
      }
    });

    // (C) Place High-Conviction AI Signal on the LATEST Active Candle
    if (currentAnalysisData) {
      const dec = currentAnalysisData.decision || {};
      const veto = currentAnalysisData.tradeVeto || {};
      const sigAction = dec.actionType;
      const lastCandle = formattedCandles[formattedCandles.length - 1];

      if (sigAction === 'BUY' && !veto.isVetoed) {
        markerMap.set(lastCandle.time, {
          time: lastCandle.time,
          position: 'belowBar',
          color: '#10b981',
          shape: 'arrowUp',
          text: `🟢 BUY NOW @ ₹${dec.entryPrice?.toFixed(0) || lastCandle.close.toFixed(0)} | T1: ₹${dec.target1} | SL: ₹${dec.stopLoss}`
        });
      } else if (sigAction === 'SELL' && !veto.isVetoed) {
        markerMap.set(lastCandle.time, {
          time: lastCandle.time,
          position: 'aboveBar',
          color: '#ef4444',
          shape: 'arrowDown',
          text: `🔴 SELL NOW @ ₹${dec.entryPrice?.toFixed(0) || lastCandle.close.toFixed(0)} | T1: ₹${dec.target1} | SL: ₹${dec.stopLoss}`
        });
      } else {
        markerMap.set(lastCandle.time, {
          time: lastCandle.time,
          position: 'aboveBar',
          color: '#f59e0b',
          shape: 'circle',
          text: `⏳ WAIT / HOLD (${dec.recommendation || 'Consolidation'})`
        });
      }
    }

    // Set all markers directly pinned onto the candlestick bars
    const finalMarkers = Array.from(markerMap.values()).sort((a, b) => a.time - b.time);
    candleSeries.setMarkers(finalMarkers);


    if (isInitialStockLoad || !previousLogicalRange) {
      lwChart.timeScale().fitContent();
      isInitialStockLoad = false;
    } else {
      // Maintain user's exact zoom level and pan position smoothly
      lwChart.timeScale().setVisibleLogicalRange(previousLogicalRange);
    }
  } catch (err) {
    console.error('Error updating lightweight chart:', err);
  }
}

// Fallback Chart.js Line Chart
function renderChartJsLine(chartData, forecastSteps) {
  const canvas = document.getElementById('intradayLineChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const ctx = canvas.getContext('2d');
  const histLabels = chartData.map(c => c.timeLabel || c.time);
  const forecastLabels = forecastSteps.map(f => `+${f.minutesAhead}m`);
  const allLabels = [...histLabels, ...forecastLabels];

  const histCount = chartData.length;
  const priceData = [...chartData.map(c => c.close), ...Array(forecastSteps.length).fill(null)];
  const vwapData = [...chartData.map(c => c.vwap), ...Array(forecastSteps.length).fill(null)];
  const ema9Data = [...chartData.map(c => c.ema9), ...Array(forecastSteps.length).fill(null)];

  const lastHistPrice = chartData[histCount - 1].close;
  const forecastData = Array(histCount - 1).fill(null);
  forecastData.push(lastHistPrice);
  forecastSteps.forEach(f => forecastData.push(f.price));

  if (chartJsInstance) {
    chartJsInstance.data.labels = allLabels;
    chartJsInstance.data.datasets[0].data = priceData;
    chartJsInstance.data.datasets[1].data = vwapData;
    chartJsInstance.data.datasets[2].data = ema9Data;
    chartJsInstance.data.datasets[3].data = forecastData;
    chartJsInstance.update('none');
    return;
  }

  chartJsInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: allLabels,
      datasets: [
        { label: 'Close Price', data: priceData, borderColor: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.08)', borderWidth: 2, pointRadius: 0, fill: true, tension: 0.1 },
        { label: 'VWAP', data: vwapData, borderColor: '#f59e0b', borderWidth: 1.5, borderDash: [3, 3], pointRadius: 0, fill: false },
        { label: 'EMA 9', data: ema9Data, borderColor: '#06b6d4', borderWidth: 1.2, pointRadius: 0, fill: false },
        { label: '10-Step AI Forecast', data: forecastData, borderColor: '#c084fc', borderWidth: 2.5, borderDash: [5, 4], pointRadius: 2.5, pointBackgroundColor: '#c084fc', fill: false }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255, 255, 255, 0.04)' }, ticks: { color: '#64748b', maxTicksLimit: 12, font: { family: 'JetBrains Mono', size: 10 } } },
        y: { grid: { color: 'rgba(255, 255, 255, 0.04)' }, ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 10 }, callback: (v) => '₹' + v.toFixed(1) } }
      }
    }
  });
}

// Chart Zoom, Pan & Fullscreen Controls
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const resetZoomBtn = document.getElementById('resetZoomBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');

if (zoomInBtn) {
  zoomInBtn.addEventListener('click', () => {
    if (lwChart) {
      const logicalRange = lwChart.timeScale().getVisibleLogicalRange();
      if (logicalRange) {
        const delta = Math.max(2, Math.floor((logicalRange.to - logicalRange.from) * 0.25));
        lwChart.timeScale().setVisibleLogicalRange({
          from: logicalRange.from + delta,
          to: logicalRange.to - delta
        });
      }
    }
  });
}

if (zoomOutBtn) {
  zoomOutBtn.addEventListener('click', () => {
    if (lwChart) {
      const logicalRange = lwChart.timeScale().getVisibleLogicalRange();
      if (logicalRange) {
        const delta = Math.max(2, Math.floor((logicalRange.to - logicalRange.from) * 0.35));
        lwChart.timeScale().setVisibleLogicalRange({
          from: logicalRange.from - delta,
          to: logicalRange.to + delta
        });
      }
    }
  });
}

if (resetZoomBtn) {
  resetZoomBtn.addEventListener('click', () => {
    if (lwChart) {
      isInitialStockLoad = true;
      lwChart.timeScale().fitContent();
    }
  });
}

if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', () => {
    const chartWrapper = document.querySelector('.chart-container-wrapper');
    if (!document.fullscreenElement) {
      chartWrapper?.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  });
}

// Chart View Switch Handlers
viewCandlesBtn.addEventListener('click', () => {
  viewCandlesBtn.classList.add('active');
  viewLineBtn.classList.remove('active');
  candlestickChartContainer.classList.remove('hidden');
  lineChartContainer.classList.add('hidden');
  currentChartView = 'candles';
  if (lwChart) lwChart.applyOptions({ width: candlestickChartContainer.clientWidth });
});

viewLineBtn.addEventListener('click', () => {
  viewLineBtn.classList.add('active');
  viewCandlesBtn.classList.remove('active');
  candlestickChartContainer.classList.add('hidden');
  lineChartContainer.classList.remove('hidden');
  currentChartView = 'line';
  if (chartJsInstance) chartJsInstance.resize();
});

// Paper Trading Actions & 1:2 R:R Level Calculation
function syncTradeRRPreview() {
  if (!currentAnalysisData) return;
  const price = currentAnalysisData.currentPrice;
  const qty = parseInt(tradeQtyInput?.value, 10) || 1;
  const sl = parseFloat(tradeSLInput?.value);
  const tp = parseFloat(tradeTargetInput?.value);

  if (isNaN(sl) || isNaN(tp) || !sl || !tp) {
    if (tradeRrRatioVal) tradeRrRatioVal.textContent = '1 : 2.0';
    if (tradeRiskVal) tradeRiskVal.textContent = '-₹--';
    if (tradeProfitVal) tradeProfitVal.textContent = '+₹--';
    return;
  }

  const riskPerShare = Math.abs(price - sl);
  const rewardPerShare = Math.abs(tp - price);
  const totalRisk = riskPerShare * qty;
  const totalProfit = rewardPerShare * qty;
  const ratio = (riskPerShare > 0) ? (rewardPerShare / riskPerShare).toFixed(1) : '2.0';

  if (tradeRrRatioVal) tradeRrRatioVal.textContent = `1 : ${ratio}`;
  if (tradeRiskVal) tradeRiskVal.textContent = `-₹${totalRisk.toFixed(0)}`;
  if (tradeProfitVal) tradeProfitVal.textContent = `+₹${totalProfit.toFixed(0)}`;
}

function autoPopulateTradeLevels(forceAction = null) {
  if (!currentAnalysisData) return;
  const price = currentAnalysisData.currentPrice;
  const dec = currentAnalysisData.decision || {};
  const isSell = forceAction === 'SELL' || (!forceAction && dec.actionType === 'SELL');

  let sl = dec.stopLoss;
  let tp = dec.target2 || dec.target1;

  if (!sl || !tp || (isSell && sl < price) || (!isSell && sl > price)) {
    const riskPts = Math.max(price * 0.006, 1);
    sl = isSell ? (price + riskPts) : (price - riskPts);
    tp = isSell ? (price - riskPts * 2.0) : (price + riskPts * 2.0);
  }

  if (tradeSLInput) tradeSLInput.value = Number(sl).toFixed(1);
  if (tradeTargetInput) tradeTargetInput.value = Number(tp).toFixed(1);
  syncTradeRRPreview();
}

async function placePaperTrade(action) {
  if (!currentAnalysisData) return;
  const qty = parseInt(tradeQtyInput.value, 10) || 1;
  const price = currentAnalysisData.currentPrice;
  const symbol = currentAnalysisData.symbol;
  const stopLoss = tradeSLInput?.value ? parseFloat(tradeSLInput.value) : undefined;
  const target1 = tradeTargetInput?.value ? parseFloat(tradeTargetInput.value) : undefined;

  try {
    const res = await fetch(`${API_BASE}/api/paper-trade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, symbol, price, quantity: qty, stopLoss, target1 })
    });
    const json = await res.json();
    if (json.success) {
      showToast(`✅ ${json.message}`, 'success');
      updatePaperTradingTable();
    } else {
      showToast(`❌ ${json.error}`, 'error');
    }
  } catch (err) {
    showToast('Failed to place paper trade', 'error');
  }
}

async function captureProfitNow(positionId, exitPrice) {
  const price = exitPrice || (currentAnalysisData ? currentAnalysisData.currentPrice : null);
  if (!price) {
    showToast('❌ Live price not available.', 'error');
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/api/paper-trade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'CAPTURE_PROFIT', positionId, exitPrice: price })
    });
    const json = await res.json();
    if (json.success) {
      showToast(json.message, 'success');
      updatePaperTradingTable();
    }
  } catch (err) {
    showToast('Failed to capture profit', 'error');
  }
}

async function trailStopLossNow(positionId) {
  try {
    const res = await fetch(`${API_BASE}/api/paper-trade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'TRAIL_SL', positionId })
    });
    const json = await res.json();
    if (json.success) {
      showToast(json.message, 'success');
      updatePaperTradingTable();
    }
  } catch (err) {
    showToast('Failed to trail stop loss', 'error');
  }
}

async function closePosition(positionId, exitPrice) {
  // exitPrice is now passed directly from the portfolio table (live price of that specific stock)
  const price = exitPrice || (currentAnalysisData ? currentAnalysisData.currentPrice : null);
  if (!price) {
    showToast('❌ Live price not available. Try again.', 'error');
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/api/paper-trade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'CLOSE', positionId, exitPrice: price })
    });
    const json = await res.json();
    if (json.success) {
      showToast(json.message, 'success');
      updatePaperTradingTable();
    }
  } catch (err) {
    showToast('Failed to close position', 'error');
  }
}

window.captureProfitNow = captureProfitNow;
window.trailStopLossNow = trailStopLossNow;
window.closePosition = closePosition;

async function updatePaperTradingTable() {
  try {
    const res = await fetch(`${API_BASE}/api/paper-trade`);
    const json = await res.json();
    if (!json.success) return;

    const { cash, positions, totalPnl, history } = json.data;
    virtualCashDisplay.textContent = `₹${cash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    if (positions.length === 0) {
      positionsTableBody.innerHTML = `<tr><td colspan="8" class="empty-state">No open positions. Use the Buy/Sell buttons above to place a paper trade!</td></tr>`;
      return;
    }

    // ✅ Fetch live prices for EVERY unique symbol in the portfolio independently
    const uniqueSymbols = [...new Set(positions.map(p => p.symbol))];
    const livePriceMap = {};

    await Promise.all(uniqueSymbols.map(async (sym) => {
      try {
        if (currentAnalysisData && currentAnalysisData.symbol === sym) {
          livePriceMap[sym] = currentAnalysisData.currentPrice;
        } else {
          const r = await fetch(`${API_BASE}/api/stock-analysis?symbol=${sym}&interval=5m`);
          const d = await r.json();
          if (d.success) livePriceMap[sym] = d.data.currentPrice;
        }
      } catch (e) {
        // fallback to entry price if fetch fails
      }
    }));

    // Compute total unrealized P&L across all positions
    let totalUnrealizedPnl = 0;

    positionsTableBody.innerHTML = '';
    positions.forEach(pos => {
      const livePrice = livePriceMap[pos.symbol] || pos.entryPrice;

      const pnl = pos.type === 'BUY'
        ? (livePrice - pos.entryPrice) * pos.quantity
        : (pos.entryPrice - livePrice) * pos.quantity;

      totalUnrealizedPnl += pnl;

      const pnlColor = pnl >= 0 ? 'var(--color-green)' : 'var(--color-red)';
      const agentBadge = pos.autoByAgent ? '<span style="font-size:0.6rem; background:rgba(139,92,246,0.25); color:#c084fc; border:1px solid #8b5cf6; padding:1px 5px; border-radius:4px; margin-left:4px;">🤖 AI</span>' : '';
      const t1Badge = pos.t1Reached ? '<span style="font-size:0.6rem; color:#34d399; margin-left:4px;">⭐ Risk-Free</span>' : '';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${pos.symbol}</strong>${agentBadge}</td>
        <td><span class="change-pill ${pos.type === 'BUY' ? '' : 'negative'}">${pos.type}</span></td>
        <td>${pos.quantity}</td>
        <td>₹${pos.entryPrice.toFixed(2)}</td>
        <td><strong>₹${livePrice.toFixed(2)}</strong>${t1Badge}</td>
        <td style="font-size: 0.75rem; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace;">
          SL: <b style="color:#f87171;">₹${pos.stopLoss ? Number(pos.stopLoss).toFixed(0) : '--'}</b><br>
          T1: <b style="color:#34d399;">₹${pos.target1 ? Number(pos.target1).toFixed(0) : '--'}</b>
        </td>
        <td style="color: ${pnlColor}; font-weight: 700; font-family: 'JetBrains Mono', monospace;">${pnl >= 0 ? '+' : ''}₹${pnl.toFixed(2)}</td>
        <td>
          <div class="pos-actions-cell">
            <button class="btn-capture-profit" title="Lock Profit Immediately at CMP" onclick="captureProfitNow('${pos.id}', ${livePrice.toFixed(2)})">🎯 Capture Profit</button>
            <button class="btn-trail-sl" title="Move SL to Entry Price (Zero Risk)" onclick="trailStopLossNow('${pos.id}')">🛡️ Trail SL</button>
            <button class="btn-pos-close" title="Exit Position" onclick="closePosition('${pos.id}', ${livePrice.toFixed(2)})">🛑 Exit</button>
          </div>
        </td>
      `;
      positionsTableBody.appendChild(tr);
    });

    // Update total P&L display if element exists
    const totalPnlEl = document.getElementById('totalPortfolioPnl');
    if (totalPnlEl) {
      totalPnlEl.textContent = `${totalUnrealizedPnl >= 0 ? '+' : ''}₹${totalUnrealizedPnl.toFixed(2)}`;
      totalPnlEl.style.color = totalUnrealizedPnl >= 0 ? 'var(--color-green)' : 'var(--color-red)';
    }

  } catch (e) {
    console.error(e);
  }
}

// Reset Virtual Balance (with custom budget support)
async function resetPaperAccount() {
  const presetSelect = document.getElementById('paperBalancePresetSelect');
  const chosenBudget = presetSelect ? Number(presetSelect.value) : 1000000;
  const budgetFormatted = chosenBudget >= 100000 ? `₹${(chosenBudget/100000).toFixed(0)} Lakh` : `₹${chosenBudget.toLocaleString('en-IN')}`;

  if (!confirm(`Are you sure you want to reset your Paper Trading wallet balance to ${budgetFormatted}?`)) return;
  try {
    const res = await fetch(`${API_BASE}/api/paper-trade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'RESET', initialBalance: chosenBudget })
    });
    const json = await res.json();
    if (json.success) {
      showToast(json.message, 'success');
      updatePaperTradingTable();
    }
  } catch (e) {
    console.error(e);
  }
}

// Load AI Error Black-Box & Mistakes Training Bank
async function loadFailureBank() {
  const fbRecordedCount = document.getElementById('fbRecordedCount');
  const fbResolvedCount = document.getElementById('fbResolvedCount');
  const failureBankList = document.getElementById('failureBankList');
  if (!failureBankList) return;

  try {
    const res = await fetch(`${API_BASE}/api/failure-bank`);
    const json = await res.json();
    if (!json.success) return;

    const bank = json.data;
    if (fbRecordedCount) fbRecordedCount.textContent = bank.totalMistakesRecorded;
    if (fbResolvedCount) fbResolvedCount.textContent = bank.totalMistakesResolved;

    if (bank.records.length === 0) {
      failureBankList.innerHTML = `<div style="color: var(--text-muted); font-size: 0.75rem; padding: 0.4rem;">No trading mistakes recorded yet. Every trapped call will be logged here.</div>`;
      return;
    }

    failureBankList.innerHTML = '';
    bank.records.forEach(rec => {
      const card = document.createElement('div');
      card.className = `fb-record-card ${rec.resolved ? 'resolved' : ''}`;
      card.innerHTML = `
        <div class="fb-record-top">
          <span class="fb-record-tag ${rec.resolved ? 'resolved-tag' : ''}">
            ${rec.resolved ? '✅ RESOLVED IN TRAINING' : '🚨 ACTIVE MISTAKE'} (${rec.failureCategory})
          </span>
          <span class="fb-record-meta">${rec.symbol} @ ${rec.originTime}</span>
        </div>
        <div class="fb-record-desc">
          <strong>Root Cause:</strong> ${rec.rootCause.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
        </div>
        <div class="fb-record-desc" style="color: #38bdf8;">
          <strong>AI Resolution:</strong> ${rec.resolutionNote || rec.aiLearning}
        </div>
        <div class="fb-indicators-pill">
          <span>Action: ${rec.actionAttempted}</span>
          <span>Price: ₹${rec.originPrice} ➔ ₹${rec.actualPrice}</span>
          <span>RSI: ${rec.indicators?.rsi || 'N/A'}</span>
          <span>VWAP: ₹${rec.indicators?.vwap || 'N/A'}</span>
        </div>
      `;
      failureBankList.appendChild(card);
    });
  } catch (err) {
    console.error('Failed to load failure bank:', err);
  }
}

// Current active Top Picks category
let currentTopPicksCategory = 'all';

// 🎯 Load Today's Best Stock Picks Radar (with Small Budget & Category Filters)
async function loadTodayTopPicks(category = currentTopPicksCategory) {
  currentTopPicksCategory = category;
  const topPicksGrid = document.getElementById('topPicksGrid');
  const tphScanTime = document.getElementById('tphScanTime');
  if (!topPicksGrid) return;

  try {
    const res = await fetch(`${API_BASE}/api/top-picks?category=${category}`);
    const json = await res.json();
    if (!json.success || !json.data) return;

    const { topPick, runnerUp, avoidStock, rankedList, scannedAt } = json.data;
    if (tphScanTime) tphScanTime.textContent = `Scanned: ${scannedAt}`;

    topPicksGrid.innerHTML = '';

    const createPickCard = (item, rankType, rankTitle) => {
      if (!item) return;
      const card = document.createElement('div');
      card.className = `top-pick-card ${rankType}`;
      
      const badgeClass = rankType === 'rank-1' ? 'rank-1-badge' : (rankType === 'rank-2' ? 'rank-2-badge' : 'rank-avoid-badge');
      const actionColor = item.action === 'BUY' ? '#34d399' : (item.action === 'SELL' ? '#f87171' : '#fbbf24');
      const changeColor = item.dayChangePct >= 0 ? '#34d399' : '#f87171';

      // Sizing breakdown text
      const isIndex = item.category === 'INDEX';
      const sizingText = isIndex 
        ? `Option Chain PCR: <b>${item.pcr || '--'}</b> | Index Option Setup`
        : `₹1,000 में: <b>${item.sharesFor1000} शेयर्स</b> | Target Profit: <b style="color:#10b981;">+₹${item.estProfit1000}</b> | Risk: <b style="color:#ef4444;">-₹${item.estRisk1000}</b>`;

      card.innerHTML = `
        <div class="tpc-top-row">
          <span class="tpc-badge ${badgeClass}">${rankTitle}</span>
          <div style="display: flex; gap: 0.4rem; align-items: center;">
            <span class="budget-suitability-badge">${item.budgetSuitability || '5x MARGIN'}</span>
            <span class="tpc-score-gauge">Score: ${item.opportunityScore}/100</span>
          </div>
        </div>
        <div class="tpc-stock-info">
          <div>
            <div class="tpc-symbol">${item.symbol}</div>
            <div class="tpc-name">${item.companyName}</div>
          </div>
          <div style="text-align: right;">
            <div class="tpc-price">₹${item.currentPrice.toFixed(2)}</div>
            <small style="color: ${changeColor}; font-weight:700;">${item.dayChangePct >= 0 ? '+' : ''}${item.dayChangePct}%</small>
          </div>
        </div>
        <div class="tpc-levels-grid">
          <div><small>Action</small><b style="color:${actionColor};">${item.action}</b></div>
          <div><small>Target 1</small><b>₹${item.target1 || '--'}</b></div>
          <div><small>Stop Loss</small><b>₹${item.stopLoss || '--'}</b></div>
        </div>
        <div class="budget-sizing-preview">
          <span>💡 5x Margin Sizing:</span>
          <span>${sizingText}</span>
        </div>
        <div class="tpc-rationale">${item.rationaleHindi}</div>
        <div class="tpc-action-row">
          <span style="font-size: 0.68rem; color: var(--text-muted);">Clarity: ${item.clarityScore}%</span>
          <button class="tpc-switch-btn" onclick="switchDashboardStock('${item.symbol}')">📊 Open Chart &amp; Sizer</button>
        </div>
      `;
      topPicksGrid.appendChild(card);
    };

    if (category === 'small_cap' || category === 'budget') {
      // In small budget mode, render top 3 budget stocks
      const picks = (rankedList || []).slice(0, 3);
      if (picks[0]) createPickCard(picks[0], 'rank-1', '⭐ #1 BEST BUDGET PICK (UNDER ₹500)');
      if (picks[1]) createPickCard(picks[1], 'rank-2', '🥈 #2 BUDGET RUNNER UP');
      if (picks[2]) createPickCard(picks[2], 'rank-2', '🥉 #3 BUDGET PICK');
    } else if (category === 'index') {
      const picks = (rankedList || []).slice(0, 3);
      if (picks[0]) createPickCard(picks[0], 'rank-1', '⭐ #1 INDEX SETUP (NIFTY/BANKNIFTY)');
      if (picks[1]) createPickCard(picks[1], 'rank-2', '🥈 #2 INDEX/ETF PICK');
      if (picks[2]) createPickCard(picks[2], 'rank-avoid', '🛑 INDEX RISK WARNING');
    } else {
      createPickCard(topPick, 'rank-1', '🌟 #1 TOP PICK (HOT OPPORTUNITY)');
      createPickCard(runnerUp, 'rank-2', '🥈 #2 RUNNER UP (MOMENTUM)');
      createPickCard(avoidStock, 'rank-avoid', '🛑 AVOID / NO-TRADE ZONE');
    }

  } catch(e) {
    console.error('Error loading top picks:', e);
  }
}

// 🧮 SMART MARGIN & CAPITAL POSITION SIZING CALCULATOR LOGIC
let lastAnalysisDataForCalc = null;

function initMarginCalculator() {
  const capitalInput = document.getElementById('calcCapitalInput');
  const presetBtns = document.querySelectorAll('.calc-preset-btn');
  const oneClickTradeBtn = document.getElementById('calcTradeOneClickBtn');

  if (capitalInput) {
    capitalInput.addEventListener('input', () => {
      presetBtns.forEach(btn => {
        if (Number(btn.dataset.amount) === Number(capitalInput.value)) btn.classList.add('active');
        else btn.classList.remove('active');
      });
      if (lastAnalysisDataForCalc) updateMarginCalculator(lastAnalysisDataForCalc);
    });
  }

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (capitalInput) {
        capitalInput.value = btn.dataset.amount;
        if (lastAnalysisDataForCalc) updateMarginCalculator(lastAnalysisDataForCalc);
      }
    });
  });

  if (oneClickTradeBtn) {
    oneClickTradeBtn.addEventListener('click', async () => {
      if (!lastAnalysisDataForCalc) {
        showToast('Waiting for live stock data...', 'info');
        return;
      }
      const data = lastAnalysisDataForCalc;
      const dec = data.decision;
      const price = data.currentPrice;
      const action = dec.actionType === 'SELL' ? 'SELL' : 'BUY';

      const capital = Number(document.getElementById('calcCapitalInput')?.value || 1000);
      const marginPerShare = price / 5;
      const isIndex = data.symbol.toUpperCase().includes('NIFTY') || data.symbol.toUpperCase().includes('BANK');
      const isEtf = data.symbol.toUpperCase().includes('BEES');
      const defaultLot = isIndex && !isEtf ? (data.symbol.includes('BANK') ? 15 : 25) : 1;
      const shares = isIndex && !isEtf ? defaultLot : Math.max(1, Math.floor(capital / Math.max(0.1, marginPerShare)));

      try {
        const res = await fetch(`${API_BASE}/api/paper-trade`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            symbol: data.symbol,
            price,
            quantity: shares,
            type: 'INTRADAY_5X'
          })
        });
        const json = await res.json();
        if (json.success) {
          showToast(`✅ Executed 1-Click Paper Trade: ${action} ${shares} shares of ${data.symbol}!`, 'success');
          updatePaperTradingTable();
        } else {
          showToast(`❌ Trade failed: ${json.error}`, 'error');
        }
      } catch (e) {
        console.error(e);
        showToast('Trade execution failed', 'error');
      }
    });
  }

  // Top Picks category tabs
  const tpTabs = document.querySelectorAll('.tp-tab-btn');
  tpTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tpTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      loadTodayTopPicks(tab.dataset.cat || 'all');
    });
  });
}

function updateMarginCalculator(data) {
  if (!data) return;
  lastAnalysisDataForCalc = data;

  const capitalInput = document.getElementById('calcCapitalInput');
  const sharesDisplay = document.getElementById('calcSharesDisplay');
  const marginDisplay = document.getElementById('calcMarginDisplay');
  const riskDisplay = document.getElementById('calcRiskDisplay');
  const profit1Display = document.getElementById('calcProfit1Display');
  const profit2Display = document.getElementById('calcProfit2Display');
  const rrDisplay = document.getElementById('calcRrDisplay');
  const advicePill = document.getElementById('calcAdvicePill');

  if (!sharesDisplay) return;

  const capital = Math.max(100, Number(capitalInput?.value || 1000));
  const price = data.currentPrice || 100;
  const dec = data.decision || {};
  const isIndex = data.symbol.toUpperCase().includes('NIFTY') || data.symbol.toUpperCase().includes('BANK');
  const isEtf = data.symbol.toUpperCase().includes('BEES');

  const marginPerShare = Number((price / 5).toFixed(2));
  const shares = isIndex && !isEtf 
    ? (data.symbol.includes('BANK') ? 15 : 25) 
    : Math.max(1, Math.floor(capital / Math.max(0.1, marginPerShare)));

  const marginUsed = isIndex && !isEtf ? Math.round(price * shares / 5) : Math.round(shares * marginPerShare);

  const sl = dec.stopLoss || (price * 0.99);
  const t1 = dec.target1 || (price * 1.015);
  const t2 = dec.target2 || (price * 1.03);

  const riskPerShare = Math.abs(price - sl);
  const profit1PerShare = Math.abs(t1 - price);
  const profit2PerShare = Math.abs(t2 - price);

  const totalRisk = Number((riskPerShare * shares).toFixed(0));
  const totalProfit1 = Number((profit1PerShare * shares).toFixed(0));
  const totalProfit2 = Number((profit2PerShare * shares).toFixed(0));

  const rrRatio = totalRisk > 0 ? (totalProfit1 / totalRisk).toFixed(1) : '2.0';

  sharesDisplay.textContent = isIndex && !isEtf ? `${shares} Qty (1 Lot)` : `${shares} Shares`;
  marginDisplay.textContent = `₹${marginUsed.toLocaleString('en-IN')}`;
  riskDisplay.textContent = `-₹${totalRisk.toLocaleString('en-IN')}`;
  profit1Display.textContent = `+₹${totalProfit1.toLocaleString('en-IN')}`;
  profit2Display.textContent = `+₹${totalProfit2.toLocaleString('en-IN')}`;
  rrDisplay.textContent = `1 : ${rrRatio}`;

  if (advicePill) {
    if (price <= 500) {
      advicePill.innerHTML = `💡 <b>Sameer AI:</b> ${data.symbol} ₹${price.toFixed(0)} की कीमत पर ₹${capital.toLocaleString('en-IN')} कैपिटल के लिए <b>परफेक्ट</b> है! 5x मार्जिन से ${shares} शेयर्स पर +₹${totalProfit1} टारगेट प्रॉफिट संभावित है।`;
    } else {
      advicePill.innerHTML = `💡 <b>Sameer AI:</b> ${data.symbol} ₹${price.toFixed(0)} है। ₹${capital.toLocaleString('en-IN')} कैपिटल में 5x मार्जिन से ${shares} शेयर्स मिलेंगे। रिस्क सिर्फ -₹${totalRisk} रहेगा।`;
    }
  }
}

function switchDashboardStock(sym) {
  currentSymbol = sym;
  isInitialStockLoad = true;
  symbolInput.value = sym;
  quickChips.forEach(c => {
    if (c.dataset.sym === sym) c.classList.add('active');
    else c.classList.remove('active');
  });
  refreshAll();
  showToast(`Switched to ${sym} — Chart & Analysis Loaded!`, 'success');
  window.scrollTo({ top: 350, behavior: 'smooth' });
}

window.switchDashboardStock = switchDashboardStock;

// Refresh All
function refreshAll() {
  updateTrainingSymbolLabel();
  loadStockAnalysis();
  loadNewsAndCatalysts();
  loadFailureBank();
  loadTodayTopPicks();
}

// Event Listeners
searchBtn.addEventListener('click', () => {
  const val = symbolInput.value.trim().toUpperCase();
  if (val) {
    currentSymbol = val;
    isInitialStockLoad = true;
    quickChips.forEach(c => c.classList.remove('active'));
    refreshAll();
  }
});

symbolInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchBtn.click();
});

quickChips.forEach(chip => {
  chip.addEventListener('click', () => {
    quickChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentSymbol = chip.dataset.symbol;
    isInitialStockLoad = true;
    symbolInput.value = currentSymbol;
    refreshAll();
  });
});

tfBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tfBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTimeframe = btn.dataset.tf;
    isInitialStockLoad = true;
    refreshAll();
  });
});

refreshBtn.addEventListener('click', () => {
  refreshAll();
  showToast('Live candles, patterns & 6-pillar intel refreshed!');
});

const refreshTopPicksBtn = document.getElementById('refreshTopPicksBtn');
if (refreshTopPicksBtn) {
  refreshTopPicksBtn.addEventListener('click', () => {
    loadTodayTopPicks();
    showToast('🎯 Top AI Stock Picks Scanned & Refreshed!', 'success');
  });
}

quickBuyBtn.addEventListener('click', () => placePaperTrade('BUY'));
quickSellBtn.addEventListener('click', () => placePaperTrade('SELL'));
resetAccountBtn.addEventListener('click', resetPaperAccount);

if (tradeQtyInput) tradeQtyInput.addEventListener('input', syncTradeRRPreview);
if (tradeSLInput) tradeSLInput.addEventListener('input', syncTradeRRPreview);
if (tradeTargetInput) tradeTargetInput.addEventListener('input', syncTradeRRPreview);
if (autoSetRRBtn) {
  autoSetRRBtn.addEventListener('click', () => {
    autoPopulateTradeLevels();
    showToast('🎯 Pre-filled 1:2 R:R Target & Stop Loss from AI Signal!', 'info');
  });
}

const trainModelBtn = document.getElementById('trainModelBtn');
const trainAllModelsBtn = document.getElementById('trainAllModelsBtn');
const trainCurrentSymLabel = document.getElementById('trainCurrentSymLabel');
const trainingStatusFeedback = document.getElementById('trainingStatusFeedback');

function updateTrainingSymbolLabel() {
  if (trainCurrentSymLabel) {
    trainCurrentSymLabel.textContent = currentSymbol || 'NIFTY';
  }
}

if (trainModelBtn) {
  trainModelBtn.addEventListener('click', async () => {
    trainModelBtn.disabled = true;
    if (trainAllModelsBtn) trainAllModelsBtn.disabled = true;
    trainModelBtn.textContent = '⏳ Training in Progress...';
    trainingStatusFeedback.classList.remove('hidden');
    trainingStatusFeedback.innerHTML = `
      <div style="color: #c084fc; font-weight: 700; margin-bottom: 0.3rem;">🧠 AI Continuous Learning Engine Active...</div>
      <div style="color: var(--text-secondary);">Analyzing past 5 sessions of intraday bars, false breakouts, and pivot support bounces for <strong>${currentSymbol}</strong>...</div>
    `;

    try {
      const res = await fetch(`${API_BASE}/api/train-ai-model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: currentSymbol })
      });
      const json = await res.json();

      if (json.success) {
        const d = json.data;
        showToast(`✅ ${json.message}`, 'success');

        trainingStatusFeedback.innerHTML = `
          <div style="color: #34d399; font-weight: 700; margin-bottom: 0.4rem;">
            ✅ Single Stock Training Complete (Iteration #${d.trainedIterations}) — Accuracy: ${d.initialAccuracy}% ➔ <span style="color: #38bdf8;">${d.optimizedAccuracy}%</span>
          </div>
          <ul style="padding-left: 1.1rem; margin-bottom: 0.5rem; color: #cbd5e1;">
            ${d.trainingSummary.map(s => `<li>${s}</li>`).join('')}
          </ul>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 0.2rem;">Recalibrated Dynamic Model Weights for <strong>${currentSymbol}</strong>:</div>
          <div class="training-weights-grid">
            <div class="weight-pill-item">Pivot Penalty: <b style="color: #38bdf8;">${d.weights.pivotProximityPenalty}x</b></div>
            <div class="weight-pill-item">RSI Cutoff: <b style="color: #38bdf8;">${d.weights.rsiOverboughtThreshold}</b></div>
            <div class="weight-pill-item">Volume Penalty: <b style="color: #38bdf8;">${d.weights.volumeTrapPenalty}x</b></div>
            <div class="weight-pill-item">Dataset: <b style="color: #38bdf8;">${d.totalDatasetBars} bars</b></div>
          </div>
        `;
        loadStockAnalysis();
        loadFailureBank();
      } else {
        trainingStatusFeedback.innerHTML = `<div style="color: #f87171;">❌ Training Error: ${json.error}</div>`;
      }
    } catch (err) {
      trainingStatusFeedback.innerHTML = `<div style="color: #f87171;">❌ Training Connection Error: Cannot reach backend server.</div>`;
    } finally {
      trainModelBtn.disabled = false;
      if (trainAllModelsBtn) trainAllModelsBtn.disabled = false;
      trainModelBtn.innerHTML = `⚡ Train Current Stock (<span id="trainCurrentSymLabel">${currentSymbol}</span>)`;
    }
  });
}

if (trainAllModelsBtn) {
  trainAllModelsBtn.addEventListener('click', async () => {
    trainAllModelsBtn.disabled = true;
    if (trainModelBtn) trainModelBtn.disabled = true;
    trainAllModelsBtn.textContent = '⏳ Training All 15+ Assets...';
    trainingStatusFeedback.classList.remove('hidden');
    trainingStatusFeedback.innerHTML = `
      <div style="color: #34d399; font-weight: 700; margin-bottom: 0.3rem;">🌐 Master Continuous AI Reinforcement Cycle Active...</div>
      <div style="color: var(--text-secondary);">Retraining NIFTY, BANKNIFTY, RELIANCE, TCS, INFY, ICICIBANK, SBIN, TATASTEEL and all failure bank assets across 5,000+ intraday candles...</div>
    `;

    try {
      const res = await fetch(`${API_BASE}/api/train-all-models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();

      if (json.success) {
        const d = json.data;
        showToast(`🎉 Master Training Complete! 100% Traps Solved!`, 'success');

        trainingStatusFeedback.innerHTML = `
          <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 8px; padding: 0.8rem; margin-bottom: 0.5rem;">
            <div style="color: #34d399; font-weight: 800; font-size: 0.95rem; margin-bottom: 0.3rem;">
              🎉 100% Master Retraining Complete! (${d.totalMistakesResolved}/${d.totalBankMistakes} Traps Resolved)
            </div>
            <div style="color: #cbd5e1; font-size: 0.8rem;">
              ✅ <strong>${d.totalAssetsTrained} Assets</strong> individually calibrated with <strong>${d.totalBarsAnalyzed} historical 5m candles</strong>.
            </div>
          </div>
          <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.4rem;">Trained Assets: <strong>${d.trainedSymbols.join(', ')}</strong></div>
          <div class="training-weights-grid">
            <div class="weight-pill-item">Total Assets: <b style="color: #34d399;">${d.totalAssetsTrained}</b></div>
            <div class="weight-pill-item">Candles Analyzed: <b style="color: #38bdf8;">${d.totalBarsAnalyzed} bars</b></div>
            <div class="weight-pill-item">Traps Solved: <b style="color: #34d399;">${d.totalMistakesResolved} (100%)</b></div>
            <div class="weight-pill-item">Pending Mistakes: <b style="color: #34d399;">0</b></div>
          </div>
        `;
        loadStockAnalysis();
        loadFailureBank();
      } else {
        trainingStatusFeedback.innerHTML = `<div style="color: #f87171;">❌ Master Training Error: ${json.error}</div>`;
      }
    } catch (err) {
      trainingStatusFeedback.innerHTML = `<div style="color: #f87171;">❌ Training Connection Error: Cannot reach backend server.</div>`;
    } finally {
      trainAllModelsBtn.disabled = false;
      if (trainModelBtn) trainModelBtn.disabled = false;
      trainAllModelsBtn.textContent = '🌐 Master Train All Assets (100% Traps Solve)';
    }
  });
}

const agentToggleBtn = document.getElementById('agentToggleBtn');
if (agentToggleBtn) {
  agentToggleBtn.addEventListener('click', async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auto-trader/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const json = await res.json();
      if (json.success) {
        showToast(`🤖 ${json.message}`, 'success');
        refreshAll();
      }
    } catch (e) {
      showToast('Failed to toggle Auto-Trader Agent', 'error');
    }
  });
}

// Auto Refresh Timer Toggle
function setupAutoRefresh() {
  if (autoRefreshCheckbox.checked) {
    autoRefreshTimer = setInterval(() => {
      loadStockAnalysis();
    }, 10000);
  } else {
    clearInterval(autoRefreshTimer);
  }
}

autoRefreshCheckbox.addEventListener('change', setupAutoRefresh);

window.closePosition = closePosition;

// Initial Load
initLightweightChart();
refreshAll();
setupAutoRefresh();

// ============================================================
// 💬 AI CHAT WIDGET LOGIC
// ============================================================

(function initChatWidget() {
  const chatToggleBtn = document.getElementById('chatToggleBtn');
  const chatPanel = document.getElementById('chatPanel');
  const chatCloseBtn = document.getElementById('chatCloseBtn');
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');
  const chatUnreadBadge = document.getElementById('chatUnreadBadge');
  const chatToggleIcon = document.getElementById('chatToggleIcon');

  if (!chatToggleBtn) return;

  let isChatOpen = false;

  // Render a message bubble
  function appendMessage(role, text, time) {
    const wrapper = document.createElement('div');
    wrapper.className = `chat-bubble ${role}`;
    const timeStr = time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const avatar = role === 'ai' ? '🤖' : '👤';
    // Convert **bold** and \n in text
    const formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    wrapper.innerHTML = `
      <div class="bubble-avatar">${avatar}</div>
      <div class="bubble-content">
        <div class="bubble-text">${formattedText}</div>
        <div class="bubble-time">${timeStr}</div>
      </div>`;
    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Show animated typing indicator
  function showTyping() {
    const el = document.createElement('div');
    el.className = 'chat-bubble ai chat-typing-indicator';
    el.id = 'chatTypingIndicator';
    el.innerHTML = `
      <div class="bubble-avatar">🤖</div>
      <div class="bubble-content">
        <div class="bubble-text">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>`;
    chatMessages.appendChild(el);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById('chatTypingIndicator');
    if (el) el.remove();
  }

  // Send message to backend
  async function sendChat(userMessage) {
    if (!userMessage.trim()) return;

    appendMessage('user', userMessage);
    chatInput.value = '';
    chatInput.style.height = 'auto';
    chatSendBtn.disabled = true;

    showTyping();

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, symbol: currentSymbol })
      });
      const data = await res.json();
      removeTyping();
      if (data.success) {
        appendMessage('ai', data.reply, data.timestamp);
      } else {
        appendMessage('ai', '❌ Server se jawab nahi mila. Thodi der baad phir try karo.', null);
      }
    } catch (e) {
      removeTyping();
      appendMessage('ai', '❌ Server se connect nahi ho pa raha. Check karo ki server chal raha hai.', null);
    } finally {
      chatSendBtn.disabled = false;
    }
  }

  // Open / close panel
  function toggleChat() {
    isChatOpen = !isChatOpen;
    chatPanel.classList.toggle('hidden', !isChatOpen);
    chatToggleIcon.textContent = isChatOpen ? '✕' : '💬';
    chatUnreadBadge.classList.add('hidden');
    if (isChatOpen) {
      chatInput.focus();
      // Show welcome message once
      if (chatMessages.children.length === 0) {
        appendMessage('ai',
          `🤖 **नमस्ते भाई! मैं समीर (Sameer) हूँ — आपका AI ट्रेडिंग मेंटर और 24x7 मार्केट एनालिस्ट!**\n\nमैं लाइव टेक्निकल डेटा, 6-Pillars, VWAP, और 5x मार्जिन साइजिंग से आपकी ट्रेडिंग को आसान और सेफ बनाता हूँ।\n\n💡 **कुछ भी पूछ सकते हैं:**\n• 🌅 *"कल सुबह 9:15 पर क्या करना है?"*\n• ❓ *"Put (PE) का मतलब Buy है या Sell?"*\n• 💰 *"₹1,000 कैपिटल में कौन सा शेयर सही रहेगा?"*\n• 📊 *"PCR 0.67 का क्या मतलब है?"*\n• 🛡️ *"Trade Veto क्यों लगा?"*\n\nबताइए भाई, अभी क्या समझना चाहते हैं? 🚀`,
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        );
      }
    }
  }

  chatToggleBtn.addEventListener('click', toggleChat);
  chatCloseBtn.addEventListener('click', toggleChat);

  // Send on button click
  chatSendBtn.addEventListener('click', () => sendChat(chatInput.value));

  // Send on Enter (Shift+Enter = new line)
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChat(chatInput.value);
    }
  });

  // Auto-expand textarea
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 80) + 'px';
  });

  // Quick question buttons
  document.querySelectorAll('.cq-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.q;
      if (q) sendChat(q);
    });
  });

  // Show unread badge after 3s to draw attention
  setTimeout(() => {
    if (!isChatOpen) {
      chatUnreadBadge.classList.remove('hidden');
    }
  }, 3000);
})();

// ============================================================================
// 🧪 SAMEER AI: HISTORICAL BACKTESTING LAB FRONTEND CONTROLLER
// ============================================================================

let btLwChart = null;
let btCandleSeries = null;
let btVwapSeries = null;
let btCurrentCandles = [];
let btCurrentTrades = [];
let btActivePriceLines = [];

// Interactive Zoom & Pan State for Canvas Backtest Chart
const btZoomState = {
  startIdx: 0,
  endIdx: 0,
  zoomLevel: 1.0,
  hoverIdx: -1,
  hoverX: -1,
  hoverY: -1,
  isDragging: false,
  dragStartX: 0,
  dragStartStartIndex: 0,
  dragStartEndIndex: 0,
  isTouchDragging: false,
  touchStartX: 0,
  touchStartStartIndex: 0,
  touchStartEndIndex: 0,
  lastCandleCount: 0
};

// Standard Indian Time (IST) Formatter
function formatISTTime(timeVal) {
  if (!timeVal) return '--';
  if (typeof timeVal === 'number') {
    const ms = timeVal < 1e11 ? timeVal * 1000 : timeVal;
    return new Date(ms).toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) + ' IST';
  }
  const clean = timeVal.toString().trim();
  if (/ist/i.test(clean)) return clean;
  return `${clean} IST`;
}

function clearBtPriceLines() {
  if (btCandleSeries && btActivePriceLines.length > 0) {
    btActivePriceLines.forEach(line => {
      try { btCandleSeries.removePriceLine(line); } catch (e) {}
    });
    btActivePriceLines = [];
  }
}

function updateBtZoomBadge() {
  const badge = document.getElementById('btZoomBadge');
  if (!badge) return;
  const level = btZoomState.zoomLevel || 1.0;
  const pct = Math.round(level * 100);
  badge.textContent = `🔍 ${level.toFixed(1)}x (${pct}%)`;
}

function renderBacktestChart(chartCandles, tradeMarkers, completedTrades = [], highlightTradeIdx = -1, resetZoom = false) {
  const container = document.getElementById('btChartContainer');
  if (!container || !chartCandles || chartCandles.length === 0) return;

  btCurrentCandles = chartCandles;
  btCurrentTrades = completedTrades;

  if (resetZoom || btZoomState.lastCandleCount !== chartCandles.length || btZoomState.endIdx === 0) {
    btZoomState.startIdx = 0;
    btZoomState.endIdx = chartCandles.length - 1;
    btZoomState.zoomLevel = 1.0;
    btZoomState.lastCandleCount = chartCandles.length;
  }

  const containerWidth = Math.max(container.clientWidth || container.parentElement?.clientWidth - 30 || 800, 320);

  // Render High-DPI TradingView-Style Canvas Chart with Interactive Zoom & Indian Time (IST)
  renderCanvasBacktestFallback(container, chartCandles, tradeMarkers, completedTrades, highlightTradeIdx, containerWidth);
}

// Crisp HTML5 Canvas Replay Candlestick Chart with Zoom, Pan & Indian Standard Time (IST)
function renderCanvasBacktestFallback(container, candles, markers, trades = [], highlightIdx = -1, width) {
  container.innerHTML = '';
  const canvas = document.createElement('canvas');
  canvas.id = 'btFallbackCanvas';
  canvas.width = width;
  canvas.height = 380;
  canvas.style.width = '100%';
  canvas.style.height = '380px';
  canvas.style.borderRadius = '10px';
  canvas.style.cursor = 'crosshair';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const h = 380;
  const padding = { top: 40, bottom: 45, left: 25, right: 85 };
  const plotW = width - padding.left - padding.right;
  const plotH = h - padding.top - padding.bottom;

  if (!candles || candles.length === 0) return;

  // Clamp Zoom indices safely
  const totalCandles = candles.length;
  if (btZoomState.startIdx < 0) btZoomState.startIdx = 0;
  if (btZoomState.endIdx >= totalCandles || btZoomState.endIdx <= btZoomState.startIdx) {
    btZoomState.endIdx = totalCandles - 1;
  }
  const startI = btZoomState.startIdx;
  const endI = btZoomState.endIdx;
  const visibleCount = Math.max(1, endI - startI + 1);
  btZoomState.zoomLevel = Number((totalCandles / visibleCount).toFixed(1));
  updateBtZoomBadge();

  // 1. Dark Slate Chart Background with subtle grid
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, h);

  // Visible Candles Slice for dynamic auto-scaling
  const visibleCandles = candles.slice(startI, endI + 1);
  const allLows = visibleCandles.map(c => c.low);
  const allHighs = visibleCandles.map(c => c.high);

  if (trades && trades.length > 0) {
    trades.forEach(t => {
      const eIdx = (t.entryBarIdx !== undefined && t.entryBarIdx >= 0) ? t.entryBarIdx : candles.findIndex(c => c.time === t.entryTimestamp || c.timeLabel === t.entryTime);
      const xIdx = (t.exitBarIdx !== undefined && t.exitBarIdx >= 0) ? t.exitBarIdx : candles.findIndex(c => c.time === t.exitTimestamp || c.timeLabel === t.exitTime);

      // Only include trade levels in price scale if trade is within visible window
      if ((eIdx >= startI && eIdx <= endI) || (xIdx >= startI && xIdx <= endI)) {
        const isBuy = t.type === 'BUY';
        const riskPts = Math.abs(t.entryPrice - t.stopLoss) || (t.entryPrice * 0.005);
        const rewardPts = riskPts * 2.0;
        const targetPrice = isBuy ? (t.entryPrice + rewardPts) : (t.entryPrice - rewardPts);
        const slPrice = isBuy ? (t.entryPrice - riskPts) : (t.entryPrice + riskPts);

        allLows.push(slPrice, targetPrice, t.entryPrice);
        allHighs.push(slPrice, targetPrice, t.entryPrice);
      }
    });
  }

  const minPrice = Math.min(...allLows) * 0.998;
  const maxPrice = Math.max(...allHighs) * 1.002;
  const priceRange = maxPrice - minPrice || 1;

  const getY = (val) => padding.top + plotH - ((val - minPrice) / priceRange) * plotH;
  const getX = (idx) => padding.left + ((idx - startI) / Math.max(1, endI - startI)) * plotW;

  // 2. Horizontal Grid Lines & Price Labels
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const pY = padding.top + (i / 5) * plotH;
    const pVal = maxPrice - (i / 5) * priceRange;
    ctx.beginPath();
    ctx.moveTo(padding.left, pY);
    ctx.lineTo(width - padding.right, pY);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText('₹' + pVal.toFixed(1), width - padding.right + 6, pY + 4);
  }

  // 3. 🎯 TRADINGVIEW 1:2 RISK-REWARD POSITION BOX (2:1 Height Proportions)
  if (trades && trades.length > 0) {
    trades.forEach((t, i) => {
      let eIdx = (t.entryBarIdx !== undefined && t.entryBarIdx >= 0) ? t.entryBarIdx : -1;
      if (eIdx === -1) eIdx = candles.findIndex(c => c.time === t.entryTimestamp || c.timeLabel === t.entryTime);

      let xIdx = (t.exitBarIdx !== undefined && t.exitBarIdx >= 0) ? t.exitBarIdx : -1;
      if (xIdx === -1) xIdx = candles.findIndex(c => c.time === t.exitTimestamp || c.timeLabel === t.exitTime);

      if (eIdx !== -1 && xIdx !== -1 && xIdx >= eIdx) {
        // Skip if entirely outside visible window
        if (xIdx < startI || eIdx > endI) return;

        const x1 = Math.max(padding.left, getX(eIdx));
        const x2 = Math.min(width - padding.right, getX(xIdx));
        const boxW = Math.max(28, (x2 - x1));
        const isBuy = t.type === 'BUY';
        const isSelected = highlightIdx === i;

        const riskPts = Math.abs(t.entryPrice - t.stopLoss) || (t.entryPrice * 0.005);
        const rewardPts = riskPts * 2.0; // Exact 2.0x Reward
        const targetPrice = isBuy ? (t.entryPrice + rewardPts) : (t.entryPrice - rewardPts);
        const slPrice = isBuy ? (t.entryPrice - riskPts) : (t.entryPrice + riskPts);

        const yEntry = getY(t.entryPrice);
        const ySL = getY(slPrice);
        const yTarget = getY(targetPrice);

        if (isBuy) {
          // 🟢 LONG SETUP: GREEN TOP (2R) & RED BOTTOM (1R)
          const greenTop = yTarget;
          const greenHeight = yEntry - yTarget;
          const redTop = yEntry;
          const redHeight = ySL - yEntry;

          // Target Box (2R)
          ctx.fillStyle = isSelected ? 'rgba(38, 166, 154, 0.45)' : 'rgba(38, 166, 154, 0.28)';
          ctx.fillRect(x1, greenTop, boxW, greenHeight);
          ctx.strokeStyle = 'rgba(38, 166, 154, 0.9)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x1, greenTop, boxW, greenHeight);

          // Stop Loss Box (1R)
          ctx.fillStyle = isSelected ? 'rgba(239, 83, 80, 0.45)' : 'rgba(239, 83, 80, 0.28)';
          ctx.fillRect(x1, redTop, boxW, redHeight);
          ctx.strokeStyle = 'rgba(239, 83, 80, 0.9)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x1, redTop, boxW, redHeight);

          // Labels
          ctx.fillStyle = '#26a69a';
          ctx.font = 'bold 9px JetBrains Mono, sans-serif';
          ctx.fillText(`Target (2.0R): +₹${rewardPts.toFixed(1)} (+${((rewardPts / t.entryPrice) * 100).toFixed(1)}%)`, x1 + 6, greenTop + 14);

          ctx.fillStyle = '#ef5350';
          ctx.font = 'bold 9px JetBrains Mono, sans-serif';
          ctx.fillText(`Stop (1.0R): -₹${riskPts.toFixed(1)} (-${((riskPts / t.entryPrice) * 100).toFixed(1)}%)`, x1 + 6, ySL - 6);

        } else {
          // 🔴 SHORT SETUP: RED TOP (1R) & GREEN BOTTOM (2R)
          const redTop = ySL;
          const redHeight = yEntry - ySL;
          const greenTop = yEntry;
          const greenHeight = yTarget - yEntry;

          // Stop Loss Box (1R)
          ctx.fillStyle = isSelected ? 'rgba(239, 83, 80, 0.45)' : 'rgba(239, 83, 80, 0.28)';
          ctx.fillRect(x1, redTop, boxW, redHeight);
          ctx.strokeStyle = 'rgba(239, 83, 80, 0.9)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x1, redTop, boxW, redHeight);

          // Target Box (2R)
          ctx.fillStyle = isSelected ? 'rgba(38, 166, 154, 0.45)' : 'rgba(38, 166, 154, 0.28)';
          ctx.fillRect(x1, greenTop, boxW, greenHeight);
          ctx.strokeStyle = 'rgba(38, 166, 154, 0.9)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x1, greenTop, boxW, greenHeight);

          // Labels
          ctx.fillStyle = '#ef5350';
          ctx.font = 'bold 9px JetBrains Mono, sans-serif';
          ctx.fillText(`Stop (1.0R): -₹${riskPts.toFixed(1)} (-${((riskPts / t.entryPrice) * 100).toFixed(1)}%)`, x1 + 6, redTop + 14);

          ctx.fillStyle = '#26a69a';
          ctx.font = 'bold 9px JetBrains Mono, sans-serif';
          ctx.fillText(`Target (2.0R): +₹${rewardPts.toFixed(1)} (+${((rewardPts / t.entryPrice) * 100).toFixed(1)}%)`, x1 + 6, yTarget - 6);
        }

        // Middle Entry Dividing Line
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x1, yEntry);
        ctx.lineTo(x2, yEntry);
        ctx.stroke();

        // 1:2 R:R Ratio Badge
        const rrText = `⚖️ 1:2 R:R`;
        ctx.font = 'bold 9px JetBrains Mono, sans-serif';
        const rrW = ctx.measureText(rrText).width;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(x1 + 6, yEntry - 7, rrW + 8, 14);
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(rrText, x1 + 10, yEntry + 3);

        // Vector Path
        const yExit = getY(t.exitPrice);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.8)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x1, yEntry);
        ctx.lineTo(x2, yExit);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  }

  // 4. 📈 DRAW BRIGHT GOLD VWAP LINE (Visible Window)
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([5, 3]);
  ctx.beginPath();
  let lastVwapY = 0;
  let lastVwapVal = 0;

  for (let idx = startI; idx <= endI; idx++) {
    const c = candles[idx];
    if (!c) continue;
    const x = getX(idx);
    const v = c.vwap || c.close;
    const y = getY(v);
    if (idx === startI) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
    lastVwapY = y;
    lastVwapVal = v;
  }
  ctx.stroke();
  ctx.setLineDash([]);

  if (lastVwapY > 0) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 9px JetBrains Mono, sans-serif';
    ctx.fillText(`🟠 VWAP: ₹${lastVwapVal.toFixed(1)}`, width - padding.right + 6, lastVwapY + 3);
  }

  // 5. Draw Candlesticks & Indian Standard Time (IST) X-Axis Ticks
  const candleW = Math.min(28, Math.max(3.5, (plotW / visibleCount) * 0.7));
  const timeStep = Math.max(1, Math.floor(visibleCount / 6));

  for (let idx = startI; idx <= endI; idx++) {
    const c = candles[idx];
    if (!c) continue;
    const x = getX(idx);
    const yOpen = getY(c.open);
    const yClose = getY(c.close);
    const yHigh = getY(c.high);
    const yLow = getY(c.low);
    const isGreen = c.close >= c.open;

    ctx.strokeStyle = isGreen ? '#10b981' : '#ef4444';
    ctx.fillStyle = isGreen ? '#10b981' : '#ef4444';

    // Wick
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x, yHigh);
    ctx.lineTo(x, yLow);
    ctx.stroke();

    // Body
    const bodyY = Math.min(yOpen, yClose);
    const bodyH = Math.max(2, Math.abs(yClose - yOpen));
    ctx.fillRect(x - candleW / 2, bodyY, candleW, bodyH);

    // 🇮🇳 INDIAN STANDARD TIME (IST) TICKS ON BOTTOM AXIS
    if ((idx - startI) % timeStep === 0 || idx === endI) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      const istLabel = formatISTTime(c.timeLabel);
      const txtW = ctx.measureText(istLabel).width;
      ctx.fillText(istLabel, Math.max(padding.left, Math.min(width - padding.right - txtW, x - txtW / 2)), h - 12);
    }
  }

  // 6. 📍 PROMINENT ENTRY & EXIT CANDLE MARKERS (Indian Time Badges)
  if (trades && trades.length > 0) {
    trades.forEach((t, i) => {
      let eIdx = (t.entryBarIdx !== undefined && t.entryBarIdx >= 0) ? t.entryBarIdx : -1;
      if (eIdx === -1) eIdx = candles.findIndex(c => c.time === t.entryTimestamp || c.timeLabel === t.entryTime);

      let xIdx = (t.exitBarIdx !== undefined && t.exitBarIdx >= 0) ? t.exitBarIdx : -1;
      if (xIdx === -1) xIdx = candles.findIndex(c => c.time === t.exitTimestamp || c.timeLabel === t.exitTime);

      const isWin = t.pnl >= 0;
      const isBuy = t.type === 'BUY';

      // 🟢 ENTRY CANDLE MARKER
      if (eIdx >= startI && eIdx <= endI && candles[eIdx]) {
        const x = getX(eIdx);
        const candleHigh = getY(candles[eIdx].high);
        const candleLow = getY(candles[eIdx].low);
        const yBadge = isBuy ? candleLow + 26 : candleHigh - 26;

        ctx.strokeStyle = isBuy ? '#10b981' : '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, yBadge + (isBuy ? -10 : 10));
        ctx.lineTo(x, isBuy ? candleLow + 2 : candleHigh - 2);
        ctx.stroke();

        const badgeTxt = `📍 #${i + 1} ENTRY [${formatISTTime(t.entryTime)}]: ₹${t.entryPrice.toFixed(1)}`;
        ctx.font = 'bold 9px JetBrains Mono, sans-serif';
        const txtW = ctx.measureText(badgeTxt).width;

        ctx.fillStyle = isBuy ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x - txtW / 2 - 5, yBadge - 8, txtW + 10, 16, 4) : ctx.rect(x - txtW / 2 - 5, yBadge - 8, txtW + 10, 16);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(badgeTxt, x - txtW / 2, yBadge + 3);
      }

      // 🎯 EXIT CANDLE MARKER
      if (xIdx >= startI && xIdx <= endI && candles[xIdx]) {
        const x = getX(xIdx);
        const candleHigh = getY(candles[xIdx].high);
        const candleLow = getY(candles[xIdx].low);
        const yBadge = isBuy ? candleHigh - 26 : candleLow + 26;

        ctx.strokeStyle = isWin ? '#34d399' : '#f87171';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, yBadge + (isBuy ? 10 : -10));
        ctx.lineTo(x, isBuy ? candleHigh - 2 : candleLow + 2);
        ctx.stroke();

        const badgeTxt = `${isWin ? '🎯' : '🛑'} #${i + 1} EXIT [${formatISTTime(t.exitTime)}]: ₹${t.exitPrice.toFixed(1)} (${t.pnl >= 0 ? '+' : ''}₹${t.pnl.toFixed(0)})`;
        ctx.font = 'bold 9px JetBrains Mono, sans-serif';
        const txtW = ctx.measureText(badgeTxt).width;

        ctx.fillStyle = isWin ? 'rgba(52, 211, 153, 0.95)' : 'rgba(248, 113, 113, 0.95)';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x - txtW / 2 - 5, yBadge - 8, txtW + 10, 16, 4) : ctx.rect(x - txtW / 2 - 5, yBadge - 8, txtW + 10, 16);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.fillText(badgeTxt, x - txtW / 2, yBadge + 3);
      }
    });
  }

  // 7. Interactive Crosshair & Top HUD Header
  if (btZoomState.hoverIdx >= startI && btZoomState.hoverIdx <= endI && candles[btZoomState.hoverIdx]) {
    const hc = candles[btZoomState.hoverIdx];
    const hx = getX(btZoomState.hoverIdx);

    // Crosshair Vertical Line
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(hx, padding.top);
    ctx.lineTo(hx, h - padding.bottom);
    ctx.stroke();
    ctx.setLineDash([]);

    // Top HUD Bar Banner
    const hudText = `⏰ ${formatISTTime(hc.timeLabel)} | O: ₹${hc.open.toFixed(1)} | H: ₹${hc.high.toFixed(1)} | L: ₹${hc.low.toFixed(1)} | C: ₹${hc.close.toFixed(1)} | VWAP: ₹${(hc.vwap || hc.close).toFixed(1)}`;
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    const hudW = ctx.measureText(hudText).width;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(padding.left, 8, hudW + 16, 20);
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(padding.left, 8, hudW + 16, 20);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText(hudText, padding.left + 8, 22);
  } else {
    // Default Top Title Banner
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText(`🔍 Zoom: ${btZoomState.zoomLevel}x | 🖱️ Scroll to Zoom | Drag to Pan | 🇮🇳 Indian Standard Time (IST)`, padding.left + 4, 22);
  }

  // =========================================================================
  // 8. INTERACTIVE EVENT HANDLERS: ZOOM (WHEEL), PAN (DRAG), TOUCH
  // =========================================================================

  // Mouse Wheel Zoom centered around cursor
  canvas.onwheel = function(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const centerRatio = Math.max(0, Math.min(1, (mouseX - padding.left) / plotW));
    const currentSpan = btZoomState.endIdx - btZoomState.startIdx;

    const zoomFactor = e.deltaY < 0 ? 0.75 : 1.35; // Scroll Up -> Zoom in; Scroll Down -> Zoom out
    const newSpan = Math.max(6, Math.min(candles.length - 1, Math.round(currentSpan * zoomFactor)));

    const centerIdx = btZoomState.startIdx + currentSpan * centerRatio;
    let newStart = Math.round(centerIdx - newSpan * centerRatio);
    let newEnd = newStart + newSpan;

    if (newStart < 0) {
      newStart = 0;
      newEnd = Math.min(candles.length - 1, newSpan);
    }
    if (newEnd >= candles.length) {
      newEnd = candles.length - 1;
      newStart = Math.max(0, newEnd - newSpan);
    }

    btZoomState.startIdx = newStart;
    btZoomState.endIdx = newEnd;
    renderCanvasBacktestFallback(container, candles, markers, trades, highlightIdx, width);
  };

  // Mouse Move for Hover Crosshair & Drag Panning
  canvas.onmousemove = function(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    if (btZoomState.isDragging) {
      const dx = e.clientX - btZoomState.dragStartX;
      const span = btZoomState.dragStartEndIndex - btZoomState.dragStartStartIndex;
      const deltaBars = Math.round((dx / plotW) * span);

      let newStart = btZoomState.dragStartStartIndex - deltaBars;
      let newEnd = btZoomState.dragStartEndIndex - deltaBars;

      if (newStart < 0) {
        newStart = 0;
        newEnd = Math.min(candles.length - 1, span);
      }
      if (newEnd >= candles.length) {
        newEnd = candles.length - 1;
        newStart = Math.max(0, newEnd - span);
      }

      btZoomState.startIdx = newStart;
      btZoomState.endIdx = newEnd;
      renderCanvasBacktestFallback(container, candles, markers, trades, highlightIdx, width);
      return;
    }

    // Hover Crosshair Detection
    const relX = mouseX - padding.left;
    if (relX >= 0 && relX <= plotW) {
      const idx = Math.round(btZoomState.startIdx + (relX / plotW) * (btZoomState.endIdx - btZoomState.startIdx));
      if (idx !== btZoomState.hoverIdx) {
        btZoomState.hoverIdx = idx;
        renderCanvasBacktestFallback(container, candles, markers, trades, highlightIdx, width);
      }
    }
  };

  canvas.onmousedown = function(e) {
    btZoomState.isDragging = true;
    btZoomState.dragStartX = e.clientX;
    btZoomState.dragStartStartIndex = btZoomState.startIdx;
    btZoomState.dragStartEndIndex = btZoomState.endIdx;
    canvas.style.cursor = 'grabbing';
  };

  canvas.onmouseup = function() {
    if (btZoomState.isDragging) {
      btZoomState.isDragging = false;
      canvas.style.cursor = 'crosshair';
    }
  };

  canvas.onmouseleave = function() {
    btZoomState.isDragging = false;
    btZoomState.hoverIdx = -1;
    renderCanvasBacktestFallback(container, candles, markers, trades, highlightIdx, width);
  };

  // Touch Support for Mobile / Tablets
  canvas.ontouchstart = function(e) {
    if (e.touches.length === 1) {
      btZoomState.isTouchDragging = true;
      btZoomState.touchStartX = e.touches[0].clientX;
      btZoomState.touchStartStartIndex = btZoomState.startIdx;
      btZoomState.touchStartEndIndex = btZoomState.endIdx;
    }
  };

  canvas.ontouchmove = function(e) {
    if (!btZoomState.isTouchDragging || e.touches.length !== 1) return;
    e.preventDefault();
    const dx = e.touches[0].clientX - btZoomState.touchStartX;
    const span = btZoomState.touchStartEndIndex - btZoomState.touchStartStartIndex;
    const deltaBars = Math.round((dx / plotW) * span);

    let newStart = btZoomState.touchStartStartIndex - deltaBars;
    let newEnd = btZoomState.touchStartEndIndex - deltaBars;

    if (newStart < 0) {
      newStart = 0;
      newEnd = Math.min(candles.length - 1, span);
    }
    if (newEnd >= candles.length) {
      newEnd = candles.length - 1;
      newStart = Math.max(0, newEnd - span);
    }

    btZoomState.startIdx = newStart;
    btZoomState.endIdx = newEnd;
    renderCanvasBacktestFallback(container, candles, markers, trades, highlightIdx, width);
  };

  canvas.ontouchend = function() {
    btZoomState.isTouchDragging = false;
  };
}

// Render Visual Trade Journey Breakdown Cards in #btJourneysList
function renderTradeJourneys(completedTrades, chartCandles) {
  const journeysList = document.getElementById('btJourneysList');
  if (!journeysList) return;

  if (!completedTrades || completedTrades.length === 0) {
    journeysList.innerHTML = `
      <div style="background: rgba(30, 41, 59, 0.5); padding: 1.5rem; border-radius: 10px; text-align: center; color: #94a3b8;">
        🛡️ <strong>No trades executed on this date.</strong><br>
        <span style="font-size: 0.8rem; color: #64748b;">AI Veto Protection prevented false entries during choppy session periods.</span>
      </div>`;
    return;
  }

  journeysList.innerHTML = '';

  completedTrades.forEach((t, idx) => {
    const isWin = t.pnl > 0;
    const isBreakeven = t.pnl === 0;
    const pnlClass = isWin ? 'profit' : (isBreakeven ? 'trailed' : 'loss');
    const pnlColor = isWin ? '#34d399' : (isBreakeven ? '#38bdf8' : '#f87171');
    const pnlSign = t.pnl >= 0 ? '+' : '';

    const card = document.createElement('div');
    card.className = `bt-journey-card ${pnlClass}`;
    card.id = `btJourneyCard-${idx}`;

    card.innerHTML = `
      <div class="bt-journey-top">
        <div class="bt-journey-title">
          <span style="font-size: 1.1rem;">${isWin ? '🎯' : (isBreakeven ? '⭐' : '🛑')}</span>
          <span>Trade #${idx + 1}: <strong style="color: ${t.type === 'BUY' ? '#10b981' : '#ef4444'};">${t.type} Setup</strong></span>
          <span class="change-pill ${t.type === 'BUY' ? '' : 'negative'}" style="font-size: 0.72rem; padding: 0.15rem 0.5rem;">${t.pattern || 'Pattern Trigger'}</span>
        </div>
        <div class="bt-journey-pnl" style="color: ${pnlColor};">
          ${pnlSign}₹${t.pnl.toFixed(2)} (${pnlSign}${t.returnPct || 0}%)
        </div>
      </div>

      <div class="bt-journey-stepper">
        <!-- 🟢 Entry Candle Step -->
        <div class="bt-step-box entry">
          <span class="bt-step-label">🟢 ENTRY CANDLE (कैंडल एंट्री)</span>
          <span class="bt-step-time">⏰ ${t.entryTime} IST</span>
          <span class="bt-step-price" style="color: #38bdf8;">₹${t.entryPrice.toFixed(2)}</span>
          <small style="color: #94a3b8; font-size: 0.72rem;">Score: ${t.score > 0 ? '+' : ''}${t.score || '--'}</small>
        </div>

        <!-- ⏳ Holding Path Vector -->
        <div class="bt-journey-path">
          <span class="bt-path-duration">⏳ ${t.durationMins ? `${t.durationMins} Mins` : 'Holding Period'}</span>
          <span class="bt-path-arrow">━━━━━ 🎯 ━━━━▶</span>
          <span style="font-size: 0.7rem; color: #94a3b8;">${t.t1Reached ? '⭐ Trailed SL Active' : 'Standard Levels'}</span>
        </div>

        <!-- 🎯 Exit Candle Step -->
        <div class="bt-step-box exit">
          <span class="bt-step-label">${isWin ? '🎯' : '🛑'} EXIT CANDLE (प्रॉफिट/लॉस बुक)</span>
          <span class="bt-step-time">⏰ ${t.exitTime} IST</span>
          <span class="bt-step-price" style="color: ${pnlColor};">₹${t.exitPrice.toFixed(2)}</span>
          <small style="color: ${isWin ? '#34d399' : '#f87171'}; font-size: 0.72rem; font-weight: 600;">${t.exitReason}</small>
        </div>
      </div>

      <div class="bt-journey-bottom">
        <div class="bt-journey-levels">
          <span>🎯 T1: <b style="color:#34d399;">₹${t.target1 || '--'}</b></span>
          <span>🎯 T2: <b style="color:#10b981;">₹${t.target2 || '--'}</b></span>
          <span>🛡️ SL: <b style="color:#ef4444;">₹${t.stopLoss || '--'}</b></span>
          <span>📦 Qty: <b>${t.quantity || 1}</b></span>
        </div>
        <button class="bt-focus-btn" onclick="focusBacktestTrade(${idx})">
          🔍 Focus on Chart (चार्ट पर देखें)
        </button>
      </div>
    `;

    journeysList.appendChild(card);
  });
}

// 1-Click Interactive Focus on Chart for a specific trade
window.focusBacktestTrade = function(tradeIdx) {
  if (!btCurrentTrades || !btCurrentTrades[tradeIdx]) return;
  const t = btCurrentTrades[tradeIdx];

  // Highlight the card
  document.querySelectorAll('.bt-journey-card').forEach(c => c.style.boxShadow = 'none');
  const card = document.getElementById(`btJourneyCard-${tradeIdx}`);
  if (card) {
    card.style.boxShadow = '0 0 15px rgba(139, 92, 246, 0.6)';
  }

  // Scroll to chart smoothly
  const chartWrapper = document.querySelector('.bt-chart-wrapper');
  if (chartWrapper) {
    chartWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
    chartWrapper.style.transition = 'all 0.3s ease';
    chartWrapper.style.boxShadow = '0 0 25px rgba(56, 189, 248, 0.4)';
    setTimeout(() => { chartWrapper.style.boxShadow = 'none'; }, 2000);
  }

  // Zoom Lightweight Charts or Re-render Canvas with Highlight
  if (btLwChart && t.entryTimestamp && t.exitTimestamp) {
    try {
      const padSecs = 1800; // 30 mins padding
      btLwChart.timeScale().setVisibleRange({
        from: t.entryTimestamp - padSecs,
        to: t.exitTimestamp + padSecs
      });
    } catch (e) {
      console.warn('LwChart zoom range error:', e);
    }
  }

  // Re-render chart with highlighted lines
  renderBacktestChart(btCurrentCandles, [], btCurrentTrades, tradeIdx);
  showToast(`🔍 Focused on Trade #${tradeIdx + 1}: ${t.type} @ ₹${t.entryPrice} ➔ ₹${t.exitPrice} (${t.pnl >= 0 ? '+' : ''}₹${t.pnl})`, 'info');
};

async function initBacktestLab() {
  const btStockSelect = document.getElementById('btStockSelect');
  const btDateSelect = document.getElementById('btDateSelect');
  const btTpSelect = document.getElementById('btTpSelect');
  const btSlSelect = document.getElementById('btSlSelect');
  const btQtyInput = document.getElementById('btQtyInput');
  const btQtyPresetSelect = document.getElementById('btQtyPresetSelect');
  const runBacktestBtn = document.getElementById('runBacktestBtn');
  const btChartContainer = document.getElementById('btChartContainer');

  if (!btStockSelect || !runBacktestBtn || !btChartContainer) return;

  // Smart Quantity Presets based on selected Symbol
  function updateQtyPresetsForSymbol(sym) {
    if (!btQtyPresetSelect || !btQtyInput) return;
    const clean = sym.toUpperCase();

    if (clean.includes('BANK')) {
      btQtyPresetSelect.innerHTML = `
        <option value="15" selected>1 Lot (15 Qty)</option>
        <option value="30">2 Lots (30 Qty)</option>
        <option value="75">5 Lots (75 Qty)</option>
        <option value="150">10 Lots (150 Qty)</option>
        <option value="300">20 Lots (300 Qty)</option>
        <option value="custom">Custom...</option>
      `;
      btQtyInput.value = '15';
    } else if (clean.includes('NIFTY')) {
      btQtyPresetSelect.innerHTML = `
        <option value="25" selected>1 Lot (25 Qty)</option>
        <option value="50">2 Lots (50 Qty)</option>
        <option value="100">4 Lots (100 Qty)</option>
        <option value="250">10 Lots (250 Qty)</option>
        <option value="500">20 Lots (500 Qty)</option>
        <option value="custom">Custom...</option>
      `;
      btQtyInput.value = '25';
    } else {
      btQtyPresetSelect.innerHTML = `
        <option value="50" selected>50 Shares</option>
        <option value="100">100 Shares</option>
        <option value="250">250 Shares</option>
        <option value="500">500 Shares</option>
        <option value="1000">1000 Shares</option>
        <option value="custom">Custom...</option>
      `;
      btQtyInput.value = '50';
    }
  }

  // Handle Preset dropdown changes
  if (btQtyPresetSelect && btQtyInput) {
    btQtyPresetSelect.addEventListener('change', () => {
      if (btQtyPresetSelect.value !== 'custom') {
        btQtyInput.value = btQtyPresetSelect.value;
      } else {
        btQtyInput.focus();
        btQtyInput.select();
      }
    });

    btQtyInput.addEventListener('input', () => {
      const val = btQtyInput.value;
      const matched = Array.from(btQtyPresetSelect.options).find(o => o.value === val);
      if (matched) {
        btQtyPresetSelect.value = val;
      } else {
        btQtyPresetSelect.value = 'custom';
      }
    });
  }

  // Populate Dates
  async function loadDatesForSymbol(sym) {
    try {
      const res = await fetch(`${API_BASE}/api/backtest-dates?symbol=${sym}`);
      const json = await res.json();
      if (json.success && json.dates && json.dates.length > 0) {
        btDateSelect.innerHTML = '';
        json.dates.forEach((d, idx) => {
          const opt = document.createElement('option');
          opt.value = d.dateStr;
          opt.textContent = d.label;
          if (idx === 0) opt.selected = true;
          btDateSelect.appendChild(opt);
        });
      }
    } catch (e) {
      console.error('Failed to load backtest dates:', e);
    }
  }

  // Reload dates & presets when stock selection changes
  btStockSelect.addEventListener('change', () => {
    loadDatesForSymbol(btStockSelect.value);
    updateQtyPresetsForSymbol(btStockSelect.value);
  });

  // Run Backtest button handler
  runBacktestBtn.addEventListener('click', async () => {
    const symbol = btStockSelect.value;
    const date = btDateSelect.value;
    const tpMult = btTpSelect.value;
    const slMult = btSlSelect.value;
    const qty = btQtyInput ? (parseInt(btQtyInput.value, 10) || 25) : 25;

    const btStatusBadge = document.getElementById('btStatusBadge');
    if (btStatusBadge) {
      btStatusBadge.textContent = '⏳ Running Replay Simulation...';
      btStatusBadge.className = 'bt-status-badge running';
    }
    runBacktestBtn.disabled = true;

    try {
      const res = await fetch(`${API_BASE}/api/backtest?symbol=${symbol}&date=${date}&tpMultiplier=${tpMult}&slMultiplier=${slMult}&autoTrailSL=true&quantity=${qty}`);
      const json = await res.json();

      if (json.success && json.data) {
        const bt = json.data;
        const kpis = bt.kpis;

        if (btStatusBadge) {
          btStatusBadge.textContent = `✅ Completed (${bt.completedTrades.length} Trades | ${qty} Qty)`;
          btStatusBadge.className = 'bt-status-badge success';
        }

        // Update KPIs
        const btNetPnl = document.getElementById('btNetPnl');
        const btProfitFactor = document.getElementById('btProfitFactor');
        const btWinRate = document.getElementById('btWinRate');
        const btTradesRatio = document.getElementById('btTradesRatio');
        const btTrapsAvoided = document.getElementById('btTrapsAvoided');
        const btLossPrevented = document.getElementById('btLossPrevented');
        const btBestTrade = document.getElementById('btBestTrade');
        const btWorstTrade = document.getElementById('btWorstTrade');
        const btAiSummaryText = document.getElementById('btAiSummaryText');

        if (btNetPnl) {
          const isProfitable = kpis.netPnl >= 0;
          btNetPnl.textContent = `${isProfitable ? '+' : ''}₹${kpis.netPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
          btNetPnl.className = `bt-kpi-val ${isProfitable ? 'green' : 'red'}`;
        }

        if (btProfitFactor) btProfitFactor.textContent = `Profit Factor: ${kpis.profitFactor}x | Gross Win: ₹${kpis.grossProfit}`;
        if (btWinRate) btWinRate.textContent = `${kpis.winRate}%`;
        if (btTradesRatio) btTradesRatio.textContent = `${kpis.winningTradesCount} Wins / ${kpis.losingTradesCount} Losses (${kpis.totalTrades} Total)`;
        if (btTrapsAvoided) btTrapsAvoided.textContent = `${kpis.trapsAvoidedCount} Traps Avoided`;
        if (btLossPrevented) btLossPrevented.textContent = `₹${kpis.totalLossPrevented.toLocaleString('en-IN')} Saved via Veto`;
        if (btBestTrade) btBestTrade.textContent = kpis.bestTrade ? `+₹${kpis.bestTrade.pnl}` : '--';
        if (btWorstTrade) btWorstTrade.textContent = kpis.worstTrade ? `Worst: ₹${kpis.worstTrade.pnl}` : '--';
        if (btAiSummaryText) btAiSummaryText.innerHTML = bt.aiSummaryHindi.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Render Replay Chart with Exact Entry & Exit Markers & Price Lines
        renderBacktestChart(bt.chartCandles, bt.tradeMarkers, bt.completedTrades);

        // Render Visual Trade Journey Stepper Cards (Exact Entry Candle to Exit Candle)
        renderTradeJourneys(bt.completedTrades, bt.chartCandles);

        // Render Trade Execution Ledger Table
        const btLedgerTableBody = document.getElementById('btLedgerTableBody');
        if (btLedgerTableBody) {
          if (bt.completedTrades.length === 0) {
            btLedgerTableBody.innerHTML = `<tr><td colspan="9" class="empty-state">No trades executed on this day. AI Veto protected capital during unclear setups.</td></tr>`;
          } else {
            btLedgerTableBody.innerHTML = '';
            bt.completedTrades.forEach((t, idx) => {
              const isWin = t.pnl > 0;
              const isBreakeven = t.pnl === 0;
              const pnlColor = isWin ? '#34d399' : (isBreakeven ? '#38bdf8' : '#f87171');

              const tr = document.createElement('tr');
              tr.innerHTML = `
                <td><strong>#${idx + 1}</strong></td>
                <td><strong style="color:#10b981;">🟢 ${formatISTTime(t.entryTime)}</strong></td>
                <td><strong style="color:${isWin ? '#34d399' : '#f87171'};">${isWin ? '🎯' : '🛑'} ${formatISTTime(t.exitTime)}</strong></td>
                <td><span class="change-pill ${t.type === 'BUY' ? '' : 'negative'}">${t.type}</span></td>
                <td>${t.pattern}</td>
                <td>₹${t.entryPrice.toFixed(2)}</td>
                <td>₹${t.exitPrice.toFixed(2)}</td>
                <td style="font-size: 0.75rem; color: #cbd5e1;">${t.exitReason}</td>
                <td style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: ${pnlColor};">
                  ${t.pnl >= 0 ? '+' : ''}₹${t.pnl.toFixed(2)} (${t.returnPct >= 0 ? '+' : ''}${t.returnPct}%)
                </td>
              `;
              btLedgerTableBody.appendChild(tr);
            });
          }
        }

        // Render Traps Avoided Table
        const btTrapsTableBody = document.getElementById('btTrapsTableBody');
        if (btTrapsTableBody) {
          if (bt.vetoedTraps.length === 0) {
            btTrapsTableBody.innerHTML = `<tr><td colspan="6" class="empty-state">Clean market trend — no major trap vetoes needed on this date.</td></tr>`;
          } else {
            btTrapsTableBody.innerHTML = '';
            bt.vetoedTraps.forEach(v => {
              const tr = document.createElement('tr');
              tr.innerHTML = `
                <td><strong>${formatISTTime(v.time)}</strong></td>
                <td><span class="change-pill ${v.attemptedAction === 'BUY' ? '' : 'negative'}">${v.attemptedAction}</span></td>
                <td>${v.pattern}</td>
                <td>₹${v.price ? Number(v.price).toFixed(2) : '--'}</td>
                <td style="color: #fbbf24; font-size: 0.78rem;">${v.reason}</td>
                <td style="color: #34d399; font-weight: 700; font-family: 'JetBrains Mono', monospace;">+₹${v.savedLossEstimate || 0}</td>
              `;
              btTrapsTableBody.appendChild(tr);
            });
          }
        }

        showToast(`✅ ${date} Backtest Complete for ${symbol}! Net P&L: ${kpis.netPnl >= 0 ? '+' : ''}₹${kpis.netPnl}`, 'success');
      }
    } catch (err) {
      console.error('Backtest error:', err);
      showToast('Backtest simulation failed. Check console.', 'error');
    } finally {
      runBacktestBtn.disabled = false;
    }
  });

  // Attach Zoom & Pan Toolbar Button Listeners
  const btZoomInBtn = document.getElementById('btZoomInBtn');
  const btZoomOutBtn = document.getElementById('btZoomOutBtn');
  const btPanLeftBtn = document.getElementById('btPanLeftBtn');
  const btPanRightBtn = document.getElementById('btPanRightBtn');
  const btResetViewBtn = document.getElementById('btResetViewBtn');

  if (btZoomInBtn) {
    btZoomInBtn.addEventListener('click', () => {
      if (!btCurrentCandles || btCurrentCandles.length === 0) return;
      const span = btZoomState.endIdx - btZoomState.startIdx;
      const newSpan = Math.max(6, Math.round(span * 0.7));
      const mid = Math.round((btZoomState.startIdx + btZoomState.endIdx) / 2);
      let newStart = Math.max(0, mid - Math.round(newSpan / 2));
      let newEnd = Math.min(btCurrentCandles.length - 1, newStart + newSpan);
      if (newEnd >= btCurrentCandles.length - 1) {
        newStart = Math.max(0, newEnd - newSpan);
      }
      btZoomState.startIdx = newStart;
      btZoomState.endIdx = newEnd;
      renderBacktestChart(btCurrentCandles, [], btCurrentTrades);
    });
  }

  if (btZoomOutBtn) {
    btZoomOutBtn.addEventListener('click', () => {
      if (!btCurrentCandles || btCurrentCandles.length === 0) return;
      const span = btZoomState.endIdx - btZoomState.startIdx;
      const newSpan = Math.min(btCurrentCandles.length - 1, Math.round(span * 1.4));
      const mid = Math.round((btZoomState.startIdx + btZoomState.endIdx) / 2);
      let newStart = Math.max(0, mid - Math.round(newSpan / 2));
      let newEnd = Math.min(btCurrentCandles.length - 1, newStart + newSpan);
      if (newStart === 0) {
        newEnd = Math.min(btCurrentCandles.length - 1, newSpan);
      }
      btZoomState.startIdx = newStart;
      btZoomState.endIdx = newEnd;
      renderBacktestChart(btCurrentCandles, [], btCurrentTrades);
    });
  }

  if (btPanLeftBtn) {
    btPanLeftBtn.addEventListener('click', () => {
      if (!btCurrentCandles || btCurrentCandles.length === 0) return;
      const span = btZoomState.endIdx - btZoomState.startIdx;
      const shift = Math.max(2, Math.round(span * 0.25));
      let newStart = Math.max(0, btZoomState.startIdx - shift);
      let newEnd = newStart + span;
      if (newEnd >= btCurrentCandles.length) {
        newEnd = btCurrentCandles.length - 1;
        newStart = Math.max(0, newEnd - span);
      }
      btZoomState.startIdx = newStart;
      btZoomState.endIdx = newEnd;
      renderBacktestChart(btCurrentCandles, [], btCurrentTrades);
    });
  }

  if (btPanRightBtn) {
    btPanRightBtn.addEventListener('click', () => {
      if (!btCurrentCandles || btCurrentCandles.length === 0) return;
      const span = btZoomState.endIdx - btZoomState.startIdx;
      const shift = Math.max(2, Math.round(span * 0.25));
      let newEnd = Math.min(btCurrentCandles.length - 1, btZoomState.endIdx + shift);
      let newStart = Math.max(0, newEnd - span);
      btZoomState.startIdx = newStart;
      btZoomState.endIdx = newEnd;
      renderBacktestChart(btCurrentCandles, [], btCurrentTrades);
    });
  }

  if (btResetViewBtn) {
    btResetViewBtn.addEventListener('click', () => {
      if (!btCurrentCandles || btCurrentCandles.length === 0) return;
      btZoomState.startIdx = 0;
      btZoomState.endIdx = btCurrentCandles.length - 1;
      renderBacktestChart(btCurrentCandles, [], btCurrentTrades, -1, true);
    });
  }

  // Initial Load
  await loadDatesForSymbol('NIFTY');
  // Auto-run initial backtest after 500ms
  setTimeout(() => {
    if (runBacktestBtn) runBacktestBtn.click();
  }, 500);
}

// Initialize on DOM ready
function initAllModules() {
  initMarginCalculator();
  initBacktestLab();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllModules);
} else {
  initAllModules();
}

// ============================================================
// 🧠 SAMEER AI LLM BRAIN — Button Handler
// ============================================================
const askSameerBrainBtn = document.getElementById('askSameerBrainBtn');
const llmBrainOutput = document.getElementById('llmBrainOutput');
const llmBrainLoading = document.getElementById('llmBrainLoading');
const llmKeyNotice = document.getElementById('llmKeyNotice');
const llmBrainStatus = document.getElementById('llmBrainStatus');
const llmUserQuestionInput = document.getElementById('llmUserQuestionInput');
const askSameerCustomBtn = document.getElementById('askSameerCustomBtn');
const llmQChips = document.querySelectorAll('.llm-q-chip');

// Check LLM Brain status on load
async function checkLLMBrainStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/sameer-brain/status`);
    const data = await res.json();
    if (llmBrainStatus) {
      llmBrainStatus.textContent = data.llmEnabled
        ? `✅ Gemini 3.6 Flash Active • Expert Trader Intelligence Live`
        : `⚠️ Demo Mode — API Key set करने के बाद Full Intelligence मिलेगी`;
      llmBrainStatus.style.color = data.llmEnabled ? '#34d399' : '#fbbf24';
    }
    if (data.llmEnabled && llmKeyNotice) {
      llmKeyNotice.classList.add('hidden');
    }
  } catch (e) { /* silent */ }
}
checkLLMBrainStatus();

async function triggerSameerBrain(questionText = '') {
  const btn = askSameerCustomBtn || askSameerBrainBtn;
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ सोच रहा है...';
  }
  llmBrainOutput.classList.add('hidden');
  llmBrainLoading.classList.remove('hidden');

  try {
    const res = await fetch(`${API_BASE}/api/sameer-brain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: currentSymbol,
        question: questionText.trim() || undefined
      })
    });
    const json = await res.json();

    llmBrainLoading.classList.add('hidden');

    if (json.success) {
      const brain = json.llmBrain;
      const action = (brain.finalAction || 'WAIT').toUpperCase();
      const confLevel = (brain.confidenceLevel || 'LOW').toLowerCase();
      const actionClass = action === 'BUY' ? 'buy' : action === 'SELL' ? 'sell' : 'wait';
      const actionEmoji = action === 'BUY' ? '🟢' : action === 'SELL' ? '🔴' : '⏸️';

      const keyLevels = (brain.keyLevelsToWatch || [])
        .map(l => `<span class="llm-level-pill">${l}</span>`).join('');

      const warnings = (brain.riskWarnings || [])
        .map(w => `<li>${w}</li>`).join('');

      llmBrainOutput.innerHTML = `
        ${questionText ? `
        <div style="background: rgba(56, 189, 248, 0.09); border-left: 3px solid #38bdf8; border-radius: 0 6px 6px 0; padding: 0.5rem 0.8rem; margin-bottom: 0.75rem; font-size: 0.82rem; color: #bae6fd;">
          <strong>💬 आपका सवाल:</strong> "${questionText}"
        </div>` : ''}

        <div style="margin-bottom: 0.5rem;">
          <span class="llm-action-badge ${actionClass}">${actionEmoji} ${action}</span>
          <div class="llm-confidence-bar">
            <span class="llm-conf-dot ${confLevel}"></span>
            <span>AI Confidence: <strong>${brain.confidenceLevel || 'N/A'}</strong> • Math Score: ${json.mathDecision?.score || 0}/100</span>
            <span style="margin-left: auto; color: #64748b; font-size: 0.7rem;">${json.generatedAt}</span>
          </div>
        </div>

        <div class="llm-reasoning-box">${brain.hinglishReasoning || '—'}</div>

        ${keyLevels ? `
        <div style="font-size: 0.72rem; color: var(--text-muted); margin: 0.5rem 0 0.2rem;">📍 Key Levels to Watch:</div>
        <div class="llm-levels-grid">${keyLevels}</div>` : ''}

        ${warnings ? `<ul class="llm-warning-list">${warnings}</ul>` : ''}

        ${brain.entryCondition ? `
        <div class="llm-entry-box">
          <b>✅ Entry Condition:</b> ${brain.entryCondition}<br>
          <b>🛡️ Stop Loss Logic:</b> ${brain.stopLossLogic || '—'}
        </div>` : ''}

        ${!brain.llmAvailable ? `<div class="llm-key-notice" style="margin-top:0.6rem;display:flex;">
          <span>🔑</span>
          <div><b>Demo Mode</b><p>Full intelligence के लिए <a href="https://aistudio.google.com/app/apikey" target="_blank">aistudio.google.com</a> से Free API Key लें और ऊपर paste करें।</p></div>
        </div>` : ''}
      `;
      llmBrainOutput.classList.remove('hidden');
      showToast(`🧠 Sameer ने ${action} recommend किया — ${json.symbol} @ ₹${json.currentPrice}`, action === 'BUY' ? 'success' : action === 'SELL' ? 'error' : 'info');
    } else {
      llmBrainOutput.innerHTML = `<div style="color:#f87171;">❌ Brain Error: ${json.error}</div>`;
      llmBrainOutput.classList.remove('hidden');
    }
  } catch (err) {
    llmBrainLoading.classList.add('hidden');
    llmBrainOutput.innerHTML = `<div style="color:#f87171;">❌ Connection Error: Server तक नहीं पहुंच पाया।</div>`;
    llmBrainOutput.classList.remove('hidden');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '🚀 पूछें';
    }
  }
}

if (askSameerCustomBtn) {
  askSameerCustomBtn.addEventListener('click', () => {
    const q = llmUserQuestionInput ? llmUserQuestionInput.value.trim() : '';
    triggerSameerBrain(q);
  });
}

if (askSameerBrainBtn) {
  askSameerBrainBtn.addEventListener('click', () => {
    const q = llmUserQuestionInput ? llmUserQuestionInput.value.trim() : '';
    triggerSameerBrain(q);
  });
}

if (llmUserQuestionInput) {
  llmUserQuestionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const q = llmUserQuestionInput.value.trim();
      triggerSameerBrain(q);
    }
  });
}

llmQChips.forEach(chip => {
  chip.addEventListener('click', () => {
    const q = chip.dataset.q;
    if (llmUserQuestionInput) llmUserQuestionInput.value = q;
    triggerSameerBrain(q);
  });
});


const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
const geminiApiKeyInput = document.getElementById('geminiApiKeyInput');
const keySaveStatus = document.getElementById('keySaveStatus');

if (saveApiKeyBtn && geminiApiKeyInput) {
  saveApiKeyBtn.addEventListener('click', async () => {
    const key = geminiApiKeyInput.value.trim();
    if (!key) {
      if (keySaveStatus) keySaveStatus.innerHTML = '<span style="color:#f87171;">⚠️ कृपया API Key दर्ज करें।</span>';
      return;
    }
    saveApiKeyBtn.disabled = true;
    saveApiKeyBtn.textContent = 'Verifying...';
    if (keySaveStatus) keySaveStatus.innerHTML = '<span style="color:#38bdf8;">Connecting with Gemini...</span>';

    try {
      const res = await fetch(`${API_BASE}/api/sameer-brain/set-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key })
      });
      const json = await res.json();

      if (json.success) {
        if (keySaveStatus) keySaveStatus.innerHTML = '<span style="color:#34d399;">✅ Connected! LLM Brain अब Live सक्रिय है।</span>';
        showToast('🎉 Gemini LLM Brain successfully activated!', 'success');
        geminiApiKeyInput.value = '';
        checkLLMBrainStatus();
      } else {
        if (keySaveStatus) keySaveStatus.innerHTML = `<span style="color:#f87171;">${json.message || 'Verification failed.'}</span>`;
      }
    } catch (e) {
      if (keySaveStatus) keySaveStatus.innerHTML = '<span style="color:#f87171;">Server connection error.</span>';
    } finally {
      saveApiKeyBtn.disabled = false;
      saveApiKeyBtn.textContent = 'Connect 🚀';
    }
  });
}

// ============================================================
// 🔔 SAMEER AI — SMART TRADE ALERTS & AUTO-EXIT NOTIFIER HUB
// ============================================================

// 1. Alert State & Persistence
const ALERT_STORAGE_KEY = 'sameer_ai_alert_state_v1';
let alertState = {
  soundEnabled: true,
  desktopEnabled: true,
  unreadCount: 0,
  activeRules: [
    { id: 'RULE-1', symbol: 'RELIANCE', type: 'SIGNAL_ENTRY', name: 'RELIANCE: जब BUY/SELL बने' },
    { id: 'RULE-2', symbol: 'RELIANCE', type: 'POSITION_EXIT', name: 'RELIANCE: Target या Stop Loss Exit' },
    { id: 'RULE-3', symbol: 'NIFTY', type: 'SIGNAL_ENTRY', name: 'NIFTY 50: जब BUY/SELL बने' }
  ],
  triggeredHistory: []
};

// Load saved alert state
try {
  const savedAlerts = localStorage.getItem(ALERT_STORAGE_KEY);
  if (savedAlerts) {
    const parsed = JSON.parse(savedAlerts);
    alertState.soundEnabled = parsed.soundEnabled !== false;
    alertState.desktopEnabled = parsed.desktopEnabled !== false;
    if (Array.isArray(parsed.activeRules) && parsed.activeRules.length > 0) {
      alertState.activeRules = parsed.activeRules;
    }
    if (Array.isArray(parsed.triggeredHistory)) {
      alertState.triggeredHistory = parsed.triggeredHistory.slice(0, 40);
    }
  }
} catch (e) { /* silent */ }

function saveAlertState() {
  try {
    localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(alertState));
  } catch (e) { /* silent */ }
}

// Track previous state to avoid duplicate notifications
const lastAlertedSignal = {};
const alertedExits = {}; // key: posId_action

// 2. Synthesizer Audio Chimes (Web Audio API - No files required!)
function playTone(ctx, freq, start, duration, gainVal = 0.25) {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(gainVal, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration);
  } catch (e) { /* silent */ }
}

function playAlertSound(type = 'buy') {
  if (!alertState.soundEnabled) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'buy') {
      // 🟢 Uplifting dual chime: C5 (523Hz) -> G5 (784Hz)
      playTone(ctx, 523.25, now, 0.15, 0.25);
      playTone(ctx, 783.99, now + 0.12, 0.35, 0.3);
    } else if (type === 'sell') {
      // 🔴 Warning descending alert: G5 (784Hz) -> Eb5 (622Hz)
      playTone(ctx, 783.99, now, 0.15, 0.25);
      playTone(ctx, 622.25, now + 0.12, 0.35, 0.3);
    } else if (type === 'target') {
      // 🎯 Victory triple chime: C5 -> E5 -> G5 (Target Achieved)
      playTone(ctx, 523.25, now, 0.12, 0.22);
      playTone(ctx, 659.25, now + 0.10, 0.12, 0.25);
      playTone(ctx, 783.99, now + 0.20, 0.40, 0.35);
    } else if (type === 'sl') {
      // 🛑 Urgent double risk tone: A4 -> F4
      playTone(ctx, 440.00, now, 0.18, 0.3);
      playTone(ctx, 349.23, now + 0.15, 0.35, 0.35);
    } else {
      playTone(ctx, 587.33, now, 0.25, 0.25);
    }
  } catch (e) {
    console.warn('[Alert Sound] Failed:', e);
  }
}

// 3. Desktop HTML5 Notifications
function sendDesktopNotification(title, body) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted' && alertState.desktopEnabled) {
    try {
      new Notification(title, {
        body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
      });
    } catch (e) {
      console.warn('[Desktop Notification] Error:', e);
    }
  }
}

// 4. Core Smart Alert Dispatcher
function triggerSmartAlert({ title, body, symbol, type, soundType }) {
  playAlertSound(soundType || (type === 'BUY' ? 'buy' : type === 'SELL' ? 'sell' : 'target'));
  sendDesktopNotification(title, body);
  showToast(`${title} — ${body}`, type === 'BUY' ? 'success' : (type === 'SELL' || type === 'SL') ? 'error' : 'info');

  const alertItem = {
    id: `ALT-${Date.now()}`,
    title,
    body,
    symbol: symbol || currentSymbol,
    type: type || 'ALERT',
    time: new Date().toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  };

  alertState.triggeredHistory.unshift(alertItem);
  if (alertState.triggeredHistory.length > 50) alertState.triggeredHistory.pop();
  alertState.unreadCount++;
  saveAlertState();
  renderTriggeredAlerts();
  updateUnreadAlertBadge();
}

// 5. Live Evaluation Engine (called on every 10s auto-refresh)
function checkAlertTriggers(data) {
  if (!data || !data.symbol || !data.decision) return;

  const symbol = data.symbol.replace('.NS', '').replace('^', '').toUpperCase();
  const currentPrice = data.currentPrice;
  const decision = data.decision;
  const action = decision.actionType;

  // A. Check Signal Entry Transition (e.g. RELIANCE entered BUY or SELL)
  const isWatchedForEntry = alertState.activeRules.some(
    r => (r.symbol === symbol || r.symbol === 'CURRENT') && r.type === 'SIGNAL_ENTRY'
  );

  if (isWatchedForEntry) {
    if (action === 'BUY' && lastAlertedSignal[symbol] !== 'BUY' && !data.tradeVeto?.isVetoed) {
      triggerSmartAlert({
        title: `🟢 ${symbol} BUY Signal Alert!`,
        body: `CMP: ₹${currentPrice.toFixed(2)} | Target: ₹${decision.target1} | SL: ₹${decision.stopLoss} | Score: +${decision.score}`,
        symbol,
        type: 'BUY',
        soundType: 'buy'
      });
      lastAlertedSignal[symbol] = 'BUY';
    } else if (action === 'SELL' && lastAlertedSignal[symbol] !== 'SELL' && !data.tradeVeto?.isVetoed) {
      triggerSmartAlert({
        title: `🔴 ${symbol} SELL Signal Alert!`,
        body: `CMP: ₹${currentPrice.toFixed(2)} | Target: ₹${decision.target1} | SL: ₹${decision.stopLoss} | Score: ${decision.score}`,
        symbol,
        type: 'SELL',
        soundType: 'sell'
      });
      lastAlertedSignal[symbol] = 'SELL';
    } else if (action === 'WAIT') {
      lastAlertedSignal[symbol] = 'WAIT';
    }
  }

  // B. Check Position Exit Triggers (Target Reached or Stop Loss Hit)
  if (typeof paperAccount !== 'undefined' && Array.isArray(paperAccount.positions)) {
    const isWatchedForExit = alertState.activeRules.some(
      r => (r.symbol === symbol || r.symbol === 'CURRENT') && r.type === 'POSITION_EXIT'
    );

    if (isWatchedForExit) {
      paperAccount.positions.forEach(pos => {
        if (pos.symbol.toUpperCase() === symbol) {
          const isBuy = pos.type === 'BUY';
          const posId = pos.id || `${symbol}_${pos.entryPrice}`;

          // Target 2 Exit Check
          if (pos.target2) {
            const hitT2 = isBuy ? currentPrice >= pos.target2 : currentPrice <= pos.target2;
            if (hitT2 && !alertedExits[`${posId}_T2`]) {
              triggerSmartAlert({
                title: `🎯 ${symbol} TARGET 2 HIT (Full Profit Exit)!`,
                body: `CMP: ₹${currentPrice.toFixed(2)} ने Target 2 (₹${pos.target2}) अचीव कर लिया। अब पूरा प्रॉफिट बुक करके EXIT करें!`,
                symbol,
                type: 'TARGET',
                soundType: 'target'
              });
              alertedExits[`${posId}_T2`] = true;
              alertedExits[`${posId}_T1`] = true;
            }
          }

          // Target 1 Exit / Partial Booking Check
          if (pos.target1 && !alertedExits[`${posId}_T1`]) {
            const hitT1 = isBuy ? currentPrice >= pos.target1 : currentPrice <= pos.target1;
            if (hitT1) {
              triggerSmartAlert({
                title: `🎯 ${symbol} TARGET 1 HIT! (Trail SL to Cost)`,
                body: `CMP: ₹${currentPrice.toFixed(2)} Target 1 (₹${pos.target1}) पर पहुँच गया। आधा प्रॉफिट बुक करें और SL Breakeven पर ट्रेल करें।`,
                symbol,
                type: 'TARGET',
                soundType: 'target'
              });
              alertedExits[`${posId}_T1`] = true;
            }
          }

          // Stop Loss Cut Alert Check
          if (pos.stopLoss && !alertedExits[`${posId}_SL`]) {
            const hitSL = isBuy ? currentPrice <= pos.stopLoss : currentPrice >= pos.stopLoss;
            if (hitSL) {
              triggerSmartAlert({
                title: `🛑 ${symbol} STOP LOSS HIT — Exit Immediately!`,
                body: `CMP: ₹${currentPrice.toFixed(2)} Stop Loss (₹${pos.stopLoss}) के पार चला गया। अपनी कैपिटल बचाने के लिए तुरंत EXIT करें!`,
                symbol,
                type: 'SL',
                soundType: 'sl'
              });
              alertedExits[`${posId}_SL`] = true;
            }
          }
        }
      });
    }
  }

  // C. Check Custom Price Rules (Price Above / Price Below)
  alertState.activeRules.forEach(rule => {
    if (rule.symbol === symbol || rule.symbol === 'CURRENT') {
      if (rule.type === 'PRICE_ABOVE' && rule.targetPrice && currentPrice >= rule.targetPrice) {
        if (!rule.lastTriggered || (Date.now() - rule.lastTriggered > 300000)) {
          triggerSmartAlert({
            title: `📈 ${symbol} Price Alert: Above ₹${rule.targetPrice}!`,
            body: `CMP: ₹${currentPrice.toFixed(2)} आपके टारगेट लेवल ₹${rule.targetPrice} के ऊपर निकल गया।`,
            symbol,
            type: 'PRICE_ALERT',
            soundType: 'target'
          });
          rule.lastTriggered = Date.now();
          saveAlertState();
        }
      } else if (rule.type === 'PRICE_BELOW' && rule.targetPrice && currentPrice <= rule.targetPrice) {
        if (!rule.lastTriggered || (Date.now() - rule.lastTriggered > 300000)) {
          triggerSmartAlert({
            title: `📉 ${symbol} Price Alert: Below ₹${rule.targetPrice}!`,
            body: `CMP: ₹${currentPrice.toFixed(2)} आपके सपोर्ट/SL लेवल ₹${rule.targetPrice} के नीचे चला गया।`,
            symbol,
            type: 'PRICE_ALERT',
            soundType: 'sl'
          });
          rule.lastTriggered = Date.now();
          saveAlertState();
        }
      }
    }
  });
}

// 6. UI Renderers & Event Handlers
const alertCenterBtn = document.getElementById('alertCenterBtn');
const alertCenterModal = document.getElementById('alertCenterModal');
const closeAlertModalBtn = document.getElementById('closeAlertModalBtn');
const alertModalBackdrop = document.getElementById('alertModalBackdrop');
const unreadAlertCount = document.getElementById('unreadAlertCount');
const toggleDesktopPermBtn = document.getElementById('toggleDesktopPermBtn');
const desktopPermStatus = document.getElementById('desktopPermStatus');
const toggleSoundBtn = document.getElementById('toggleSoundBtn');
const soundStatusText = document.getElementById('soundStatusText');
const testAlertChimeBtn = document.getElementById('testAlertChimeBtn');
const alertTypeSelect = document.getElementById('alertTypeSelect');
const alertTargetPrice = document.getElementById('alertTargetPrice');
const createAlertRuleBtn = document.getElementById('createAlertRuleBtn');
const activeRulesList = document.getElementById('activeRulesList');
const activeRulesCount = document.getElementById('activeRulesCount');
const triggeredAlertsFeed = document.getElementById('triggeredAlertsFeed');
const clearAlertsHistoryBtn = document.getElementById('clearAlertsHistoryBtn');

function updateUnreadAlertBadge() {
  if (!unreadAlertCount) return;
  if (alertState.unreadCount > 0) {
    unreadAlertCount.textContent = alertState.unreadCount;
    unreadAlertCount.classList.remove('hidden');
  } else {
    unreadAlertCount.classList.add('hidden');
  }
}

function updateDesktopPermUI() {
  if (!desktopPermStatus) return;
  if (!('Notification' in window)) {
    desktopPermStatus.textContent = 'Not Supported';
    desktopPermStatus.style.color = '#ef4444';
  } else if (Notification.permission === 'granted') {
    desktopPermStatus.textContent = alertState.desktopEnabled ? 'Active 🟢' : 'Muted ⏸️';
    desktopPermStatus.style.color = alertState.desktopEnabled ? '#34d399' : '#fbbf24';
  } else if (Notification.permission === 'denied') {
    desktopPermStatus.textContent = 'Blocked 🔴';
    desktopPermStatus.style.color = '#ef4444';
  } else {
    desktopPermStatus.textContent = 'Request Permission 🔔';
    desktopPermStatus.style.color = '#fbbf24';
  }
}

function renderActiveRules() {
  if (!activeRulesList) return;
  activeRulesList.innerHTML = '';
  if (activeRulesCount) {
    activeRulesCount.textContent = `${alertState.activeRules.length} Rules Active`;
  }

  if (alertState.activeRules.length === 0) {
    activeRulesList.innerHTML = '<div style="color:#64748b;font-size:0.75rem;">कोई सक्रिय Alert Rule नहीं है। ऊपर से नया Rule जोड़ें।</div>';
    return;
  }

  alertState.activeRules.forEach((rule, idx) => {
    const pill = document.createElement('div');
    pill.className = 'active-rule-pill';
    pill.innerHTML = `
      <span>🔔 <strong>${rule.symbol}</strong>: ${rule.name || rule.type}</span>
      <button class="rule-delete-btn" title="Delete Rule" onclick="deleteAlertRule('${rule.id}')">✕</button>
    `;
    activeRulesList.appendChild(pill);
  });
}

function renderTriggeredAlerts() {
  if (!triggeredAlertsFeed) return;
  if (alertState.triggeredHistory.length === 0) {
    triggeredAlertsFeed.innerHTML = '<div style="color: #64748b; font-size: 0.78rem; text-align: center; padding: 1rem;">यहाँ नए BUY, SELL और EXIT Alerts लाइव दिखाई देंगे।</div>';
    return;
  }

  triggeredAlertsFeed.innerHTML = '';
  alertState.triggeredHistory.forEach(item => {
    const div = document.createElement('div');
    const typeClass = item.type.toLowerCase();
    div.className = `triggered-alert-item ${typeClass}`;
    div.innerHTML = `
      <div>
        <div class="alert-item-title">${item.title}</div>
        <div class="alert-item-body">${item.body}</div>
      </div>
      <div class="alert-item-time">${item.time}</div>
    `;
    triggeredAlertsFeed.appendChild(div);
  });
}

window.deleteAlertRule = function(ruleId) {
  alertState.activeRules = alertState.activeRules.filter(r => r.id !== ruleId);
  saveAlertState();
  renderActiveRules();
  showToast('Alert Rule removed.', 'info');
};

// Toggle Price Input in Creator based on alert type
if (alertTypeSelect && alertTargetPrice) {
  alertTypeSelect.addEventListener('change', () => {
    const val = alertTypeSelect.value;
    if (val === 'PRICE_ABOVE' || val === 'PRICE_BELOW') {
      alertTargetPrice.style.display = 'block';
    } else {
      alertTargetPrice.style.display = 'none';
    }
  });
}

// Open & Close Alert Center Modal
function openAlertCenterModal() {
  if (!alertCenterModal) return;
  alertCenterModal.classList.remove('hidden');
  alertCenterModal.style.display = 'flex';
  alertState.unreadCount = 0;
  updateUnreadAlertBadge();
  updateDesktopPermUI();
  renderActiveRules();
  renderTriggeredAlerts();
}
window.openAlertCenterModal = openAlertCenterModal;

function closeAlertCenterModal() {
  if (!alertCenterModal) return;
  alertCenterModal.classList.add('hidden');
  alertCenterModal.style.display = 'none';
}
window.closeAlertCenterModal = closeAlertCenterModal;

if (alertCenterBtn) {
  alertCenterBtn.addEventListener('click', openAlertCenterModal);
}

if (closeAlertModalBtn) {
  closeAlertModalBtn.addEventListener('click', closeAlertCenterModal);
}

if (alertModalBackdrop) {
  alertModalBackdrop.addEventListener('click', closeAlertCenterModal);
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && alertCenterModal && alertCenterModal.style.display !== 'none') {
    closeAlertCenterModal();
  }
});

// Toggle Desktop Notification Permission
if (toggleDesktopPermBtn) {
  toggleDesktopPermBtn.addEventListener('click', async () => {
    if (!('Notification' in window)) {
      showToast('Notifications are not supported in this browser.', 'error');
      return;
    }
    if (Notification.permission === 'default') {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        alertState.desktopEnabled = true;
        showToast('✅ Desktop Notifications Allowed!', 'success');
      }
    } else if (Notification.permission === 'granted') {
      alertState.desktopEnabled = !alertState.desktopEnabled;
      showToast(`Desktop Alerts ${alertState.desktopEnabled ? 'Enabled' : 'Muted'}`, 'info');
    } else {
      showToast('Browser has blocked notifications. Please allow in browser settings.', 'error');
    }
    saveAlertState();
    updateDesktopPermUI();
  });
}

// Toggle Sound Alerts
if (toggleSoundBtn && soundStatusText) {
  toggleSoundBtn.addEventListener('click', () => {
    alertState.soundEnabled = !alertState.soundEnabled;
    soundStatusText.textContent = alertState.soundEnabled ? 'ON' : 'OFF';
    soundStatusText.style.color = alertState.soundEnabled ? '#34d399' : '#ef4444';
    toggleSoundBtn.classList.toggle('active', alertState.soundEnabled);
    showToast(`Audio Sound Chimes: ${alertState.soundEnabled ? 'ON 🔊' : 'OFF 🔇'}`, 'info');
    saveAlertState();
  });
}

// Test Chime Sound
if (testAlertChimeBtn) {
  testAlertChimeBtn.addEventListener('click', () => {
    playAlertSound('target');
    showToast('🎵 Sound Chime Tested: Target Hit Melody!', 'success');
  });
}

// Add New Alert Rule
if (createAlertRuleBtn) {
  createAlertRuleBtn.addEventListener('click', () => {
    const symbol = document.getElementById('alertSymbolSelect')?.value || 'RELIANCE';
    const type = alertTypeSelect?.value || 'SIGNAL_ENTRY';
    const priceVal = Number(alertTargetPrice?.value || 0);

    let name = '';
    if (type === 'SIGNAL_ENTRY') name = `${symbol}: जब BUY/SELL Signal बने`;
    else if (type === 'POSITION_EXIT') name = `${symbol}: Target Hit या Stop Loss Hit`;
    else if (type === 'PRICE_ABOVE') name = `${symbol}: Price >= ₹${priceVal}`;
    else if (type === 'PRICE_BELOW') name = `${symbol}: Price <= ₹${priceVal}`;

    const newRule = {
      id: `RULE-${Date.now()}`,
      symbol,
      type,
      targetPrice: (type === 'PRICE_ABOVE' || type === 'PRICE_BELOW') ? priceVal : undefined,
      name
    };

    alertState.activeRules.push(newRule);
    saveAlertState();
    renderActiveRules();
    showToast(`✅ Alert Rule Saved: ${name}`, 'success');
  });
}

// Clear History
if (clearAlertsHistoryBtn) {
  clearAlertsHistoryBtn.addEventListener('click', () => {
    alertState.triggeredHistory = [];
    saveAlertState();
    renderTriggeredAlerts();
    showToast('Alerts history cleared.', 'info');
  });
}

// Initial UI sync
updateUnreadAlertBadge();
renderActiveRules();
renderTriggeredAlerts();
updateDesktopPermUI();
