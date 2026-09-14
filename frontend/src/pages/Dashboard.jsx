import { useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { EyeOff } from 'lucide-react'
import { marketApi, walletApi } from '../services/api'
import { formatUsd, formatBalance, formatDate, coinMeta, shortAddress } from '../lib/utils'
import { WALLET_COINS } from '../lib/coins'
import { NETWORKS, useWalletStore } from '../store/useWalletStore'
import { readPriceCache, writePriceCache } from '../lib/priceCache'
import TradingViewChart from '../components/market/TradingViewChart'
import CoinIcon from '../components/vortex/CoinIcon'
import Change from '../components/vortex/Change'
import Sparkline, { synthSpark } from '../components/vortex/Sparkline'

const INTERVALS = [
  { label: '15m', value: '15' },
  { label: '1H', value: '60' },
  { label: '4H', value: '240' },
  { label: '1D', value: 'D' },
]

function timeAgo(ts) {
  if (!ts) return 'just now'
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000))
  if (s < 60) return `${s} seconds ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m} minute${m === 1 ? '' : 's'} ago`
  const h = Math.round(m / 60)
  return `${h} hour${h === 1 ? '' : 's'} ago`
}

export default function Dashboard() {
  const hideBalances = useWalletStore((s) => s.hideBalances)
  const toggleHideBalances = useWalletStore((s) => s.toggleHideBalances)
  const network = useWalletStore((s) => s.getNetwork())
  const setNetwork = useWalletStore((s) => s.setNetwork)
  const { searchQuery = '', prices: ctxPrices } = useOutletContext() || {}

  const [balances, setBalances] = useState({})
  const [prices, setPrices] = useState(() =>
    Array.isArray(ctxPrices) && ctxPrices.length ? ctxPrices : readPriceCache()
  )
  const [loading, setLoading] = useState(true)
  const [updatedAt, setUpdatedAt] = useState(Date.now())
  const [netOpen, setNetOpen] = useState(false)
  const [chartSymbol, setChartSymbol] = useState('BTC')
  const [interval, setIntervalId] = useState('60')
  const [intervalOpen, setIntervalOpen] = useState(false)
  const [txs, setTxs] = useState([])
  const [picked, setPicked] = useState(null)
  const [, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000)
    return () => clearInterval(id)
  }, [])

  const loadPrices = () => {
    marketApi
      .prices()
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : []
        if (!list.length) return
        writePriceCache(list)
        setPrices(list)
        setUpdatedAt(Date.now())
      })
      .catch(() => {})
  }

  const loadWallet = async () => {
    setLoading(true)
    try {
      const [bRes, tRes] = await Promise.all([
        walletApi.balances(),
        walletApi.transactions(network.symbol === 'USDT' ? 'ETH' : network.symbol).catch(() => ({ data: [] })),
      ])
      setBalances(bRes.data || {})
      setTxs(Array.isArray(tRes.data) ? tRes.data.slice(0, 6) : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (Array.isArray(ctxPrices) && ctxPrices.length) {
      setPrices(ctxPrices)
      writePriceCache(ctxPrices)
    }
  }, [ctxPrices])

  useEffect(() => {
    loadPrices()
    loadWallet()
    const id = setInterval(() => {
      loadPrices()
      loadWallet()
    }, 60_000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network.id])

  const priceMap = useMemo(() => {
    const m = {}
    for (const p of prices) m[(p.symbol || '').toUpperCase()] = p
    return m
  }, [prices])

  const tokens = useMemo(() => {
    return WALLET_COINS.map((c) => {
      const bal = Number(balances[c]?.balance || 0)
      const px = priceMap[c]
      const usd = bal * Number(px?.price_usd || 0)
      const change = Number(px?.change_24h || 0)
      const spark = Array.isArray(px?.sparkline) && px.sparkline.length
        ? px.sparkline
        : synthSpark(c, change)
      return {
        symbol: c,
        name: coinMeta(c).name,
        balance: bal,
        usd,
        change,
        change30: Number(px?.change_30d ?? px?.change_24h ?? 0),
        price: Number(px?.price_usd || 0),
        spark,
      }
    })
  }, [balances, priceMap])

  const totalUsd = useMemo(() => tokens.reduce((s, t) => s + t.usd, 0), [tokens])

  const pnl24 = useMemo(() => {
    return tokens.reduce((s, t) => {
      const ch = t.change / 100
      if (!Number.isFinite(ch) || !t.usd) return s
      return s + t.usd * (ch / (1 + ch))
    }, 0)
  }, [tokens])

  const avgGrow = useMemo(() => {
    if (!totalUsd) return 0
    return tokens.reduce((s, t) => s + (t.usd / totalUsd) * t.change, 0)
  }, [tokens, totalUsd])

  const best = useMemo(() => {
    const held = tokens.filter((t) => t.usd > 0)
    const pool = held.length ? held : tokens
    return [...pool].sort((a, b) => b.change - a.change)[0]
  }, [tokens])

  const pnl30pct = useMemo(() => {
    if (!totalUsd) return 0
    return tokens.reduce((s, t) => s + (t.usd / totalUsd) * t.change30, 0)
  }, [tokens, totalUsd])

  const q = searchQuery.trim().toLowerCase()
  const liveCards = useMemo(() => {
    const preferred = ['BTC', 'ETH', 'BNB']
    const extras = prices.filter((p) => !preferred.includes((p.symbol || '').toUpperCase()))
    const ordered = [
      ...preferred.map((s) => priceMap[s]).filter(Boolean),
      ...extras,
    ]
    const list = ordered.filter((p) => {
      if (!q) return true
      return (
        (p.symbol || '').toLowerCase().includes(q) ||
        (p.name || '').toLowerCase().includes(q)
      )
    })
    return list.slice(0, 3)
  }, [priceMap, prices, q])

  const holdings = useMemo(() => {
    return tokens
      .filter((t) => (q ? t.name.toLowerCase().includes(q) || t.symbol.toLowerCase().includes(q) : true))
      .sort((a, b) => b.usd - a.usd)
  }, [tokens, q])

  const mask = (v) => (hideBalances ? '••••••' : v)

  const intervalLabel = INTERVALS.find((i) => i.value === interval)?.label || '1H'
  const highToken = [...tokens].sort((a, b) => b.price - a.price)[0]
  const today = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

  const alloc = holdings.filter((t) => t.usd > 0)
  const COLORS = ['#d7f24c', '#627eea', '#f7931a', '#3ddc84', '#f0b90b']

  return (
    <>
      <div className="vx-content">
        <section className="vx-card balance-card">
          <div className="card-head">
            <div className="card-head-left">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="14" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </div>
              <span className="card-title">My Balance</span>
            </div>
            <button type="button" className="expand-btn" onClick={toggleHideBalances} aria-label="Toggle balances">
              {hideBalances ? <EyeOff /> : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M7 17L17 7M7 7h10v10" />
                </svg>
              )}
            </button>
          </div>

          <div className="balance-row">
            <div className="balance-amount">{loading ? '—' : mask(formatUsd(totalUsd))}</div>
            <button type="button" className="coin-chip" onClick={() => setNetOpen((v) => !v)}>
              {network.symbol}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
              {netOpen && (
                <div className="coin-chip-menu" onClick={(e) => e.stopPropagation()}>
                  {NETWORKS.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      className={n.symbol === network.symbol ? 'active' : ''}
                      onClick={() => {
                        setNetwork(n.id)
                        setNetOpen(false)
                        setChartSymbol(n.symbol === 'USDT' ? 'ETH' : n.symbol)
                      }}
                    >
                      <CoinIcon symbol={n.symbol} />
                      {n.symbol}
                    </button>
                  ))}
                </div>
              )}
            </button>
          </div>

          <div className="balance-stats">
            <div>
              <div className="stat-label">Total Profit</div>
              <div className={`stat-value ${pnl24 >= 0 ? 'green' : 'red'}`}>
                {hideBalances ? '••••' : `${pnl24 >= 0 ? '+' : ''}${formatUsd(pnl24)}`}
              </div>
            </div>
            <div>
              <div className="stat-label">Avg. Growing</div>
              <div className={`stat-value ${avgGrow >= 0 ? 'green' : 'red'}`}>
                {hideBalances ? '••••' : `${avgGrow >= 0 ? '+' : ''}${avgGrow.toFixed(2)}%`}
              </div>
            </div>
            <div>
              <div className="stat-label">Best Performer</div>
              <div className="stat-value">
                {best ? `${best.name} (${best.symbol})` : '—'}
              </div>
            </div>
          </div>

          <div className="balance-actions">
            <Link to="/app/receive" className="vx-btn btn-accent">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Top Up
            </Link>
            <Link to="/app/send" className="vx-btn btn-ghost">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M12 19V5M5 12l7 7 7-7" />
              </svg>
              Withdraw
            </Link>
          </div>
        </section>

        <section className="crypto-section">
          <div className="crypto-header">
            <div>
              <div className="crypto-title">Live Crypto Updates</div>
              <div className="crypto-updated">
                <span className="live-dot" />
                Last Update: {timeAgo(updatedAt)}
              </div>
            </div>
            <div className="crypto-header-spacer" />
            <div className="chip-row">
              <div className="chip">
                USD
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
              <div className="chip">
                {network.name}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
              <div className="chip">
                1D
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
            <Link to="/app/market" className="see-all" style={{ marginLeft: 10 }}>
              See All
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
          </div>

          <div className="crypto-cards">
            {liveCards.map((c) => {
              const pos = Number(c.change_24h) >= 0
              const spark = Array.isArray(c.sparkline) && c.sparkline.length
                ? c.sparkline
                : synthSpark(c.symbol, c.change_24h)
              return (
                <button
                  type="button"
                  key={c.symbol}
                  className="ccard"
                  onClick={() => setChartSymbol((c.symbol || 'BTC').toUpperCase())}
                >
                  <div className="ccard-head">
                    <CoinIcon symbol={c.symbol} />
                    <div>
                      <div className="ccard-pair">{c.symbol}/USD</div>
                      <div className="ccard-name">{c.name}</div>
                    </div>
                    <div className="ccard-more">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="5" r="1" />
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="19" r="1" />
                      </svg>
                    </div>
                  </div>
                  <div className="ccard-price-label">Price</div>
                  <div className="ccard-bottom">
                    <div>
                      <div className="ccard-price">{formatUsd(c.price_usd)}</div>
                      <Change value={c.change_24h} className="ccard-change" />
                    </div>
                    <Sparkline points={spark} pos={pos} />
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="vx-card chart-card">
          <div className="chart-toolbar">
            <div className="chart-pair">
              <CoinIcon symbol={chartSymbol} />
              <div>
                <div className="chart-pair-name">
                  {chartSymbol} / USD
                  <button
                    type="button"
                    className="add-btn"
                    onClick={() => {
                      const order = ['BTC', 'ETH', 'LTC', 'DOGE', 'USDT']
                      const i = order.indexOf(chartSymbol)
                      setChartSymbol(order[(i + 1) % order.length])
                    }}
                    aria-label="Next pair"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
                <div className="chart-pair-sub">Live market</div>
              </div>
            </div>
            <div className="tb-divider" />
            <div className="tb-item select" style={{ position: 'relative' }}>
              <button type="button" onClick={() => setIntervalOpen((v) => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {intervalLabel}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {intervalOpen && (
                <div className="coin-chip-menu" style={{ left: 0, right: 'auto' }}>
                  {INTERVALS.map((i) => (
                    <button
                      key={i.value}
                      type="button"
                      className={i.value === interval ? 'active' : ''}
                      onClick={() => {
                        setIntervalId(i.value)
                        setIntervalOpen(false)
                      }}
                    >
                      {i.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="tb-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 6h16M4 12h10M4 18h6" strokeLinecap="round" />
                <circle cx="17" cy="12" r="1.6" />
                <circle cx="13" cy="18" r="1.6" />
              </svg>
            </div>
            <div className="tb-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="10" width="4" height="8" />
                <rect x="10" y="5" width="4" height="13" />
                <rect x="17" y="13" width="4" height="5" />
              </svg>
              Indicator
            </div>
            <div className="tb-spacer" />
          </div>

          <div className="chart-body">
            <div className="chart-tools">
              <div className="tool-btn active">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <div className="tool-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M4 20L20 4" />
                </svg>
              </div>
              <div className="tool-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M4 8h16M4 16h16" />
                </svg>
              </div>
              <div className="tool-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 17c3-6 6 6 9-6s6 6 9-6" />
                </svg>
              </div>
              <div className="tool-sep" />
              <div className="tool-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <div className="chart-canvas-wrap">
              <TradingViewChart fill mode="advanced" symbol={chartSymbol} interval={interval} />
            </div>
          </div>
        </section>

        <aside className="portfolio-card">
          <div className="vx-card portfolio-top">
            <div className="card-head">
              <div className="card-head-left">
                <div className="card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18" />
                    <path d="M7 15l4-5 3 3 5-7" />
                  </svg>
                </div>
                <span className="card-title">My Portfolio</span>
              </div>
              <Link to="/app/activity" className="expand-btn" aria-label="Open activity">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M7 17L17 7M7 7h10v10" />
                </svg>
              </Link>
            </div>

            <div className="portfolio-perf">
              <div className={`perf-badge ${pnl30pct >= 0 ? '' : 'neg'}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d={pnl30pct >= 0 ? 'M4 15l6-6 4 4 6-8' : 'M4 9l6 6 4-4 6 8'} />
                </svg>
                {Math.abs(pnl30pct).toFixed(2)}%
              </div>
              <div className="perf-label">Profit in last 24 hours</div>
            </div>

            {alloc.length > 0 && (
              <div className="alloc-wrap">
                <svg width="72" height="72" viewBox="0 0 36 36">
                  {(() => {
                    let off = 0
                    const sum = alloc.reduce((s, t) => s + t.usd, 0) || 1
                    return alloc.map((t, i) => {
                      const pct = (t.usd / sum) * 100
                      const dash = `${pct} ${100 - pct}`
                      const el = (
                        <circle
                          key={t.symbol}
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke={COLORS[i % COLORS.length]}
                          strokeWidth="4"
                          strokeDasharray={dash}
                          strokeDashoffset={-off}
                          transform="rotate(-90 18 18)"
                        />
                      )
                      off += pct
                      return el
                    })
                  })()}
                </svg>
                <div className="alloc-legend">
                  {alloc.map((t, i) => (
                    <div key={t.symbol} className="alloc-leg">
                      <span className="alloc-sw" style={{ background: COLORS[i % COLORS.length] }} />
                      {t.symbol} {totalUsd ? ((t.usd / totalUsd) * 100).toFixed(0) : 0}%
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="holdings">
              {holdings.map((t) => (
                <button type="button" key={t.symbol} className="wl-item" onClick={() => setPicked(t)} style={{ width: '100%' }}>
                  <CoinIcon symbol={t.symbol} />
                  <div className="wl-info">
                    <div className="wl-name">
                      {t.name} ({t.symbol})
                    </div>
                    <div className="wl-price">
                      {hideBalances ? '••••' : formatUsd(t.usd)} · {hideBalances ? '••••' : t.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </div>
                  </div>
                  <Change value={t.change} />
                </button>
              ))}
            </div>

            {txs.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div className="card-title" style={{ marginBottom: 8 }}>Recent activity</div>
                {txs.slice(0, 4).map((tx) => {
                  const recv = (tx.transaction_type || '').toLowerCase() === 'received'
                  return (
                    <div key={tx.txid + tx.date} className="wl-item">
                      <div className="wl-info">
                        <div className="wl-name">{recv ? 'Received' : 'Sent'}</div>
                        <div className="wl-price">{formatDate(tx.date)} · {shortAddress(tx.txid, 6, 4)}</div>
                      </div>
                      <div className={`wl-change ${recv ? 'pos' : 'neg'}`}>
                        {recv ? '+' : '−'}{formatBalance(tx.amount, 4)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="yearly-card">
            <div className="yearly-head">
              <span className="yearly-title">24h Performance</span>
              <span className="yearly-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4l3 2" />
                </svg>
              </span>
            </div>
            <div className="yearly-pill">
              <span className="dot" />
              {pnl24 >= 0 ? 'High' : 'Low'} • {today}
            </div>
            <div className="yearly-value">{hideBalances ? '••••' : formatUsd(Math.abs(pnl24) || highToken?.price || 0)}</div>
            <svg className="yearly-chart" viewBox="0 0 260 46" preserveAspectRatio="none">
              <polyline
                points="0,36 20,30 40,33 60,22 80,26 100,14 120,20 140,10 160,16 180,6 200,12 220,4 240,9 260,2"
                fill="none"
                stroke={pnl24 >= 0 ? '#3ddc84' : '#f36969'}
                strokeWidth="2"
              />
              <polygon
                points="0,36 20,30 40,33 60,22 80,26 100,14 120,20 140,10 160,16 180,6 200,12 220,4 240,9 260,2 260,46 0,46"
                fill={pnl24 >= 0 ? 'url(#yg)' : 'url(#yr)'}
                opacity="0.25"
              />
              <defs>
                <linearGradient id="yg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3ddc84" />
                  <stop offset="100%" stopColor="#3ddc84" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="yr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f36969" />
                  <stop offset="100%" stopColor="#f36969" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </aside>
      </div>
      <div className="credit">CoinCloud — live balances, gas, alerts, and on-chain activity</div>

      {picked && (
        <>
          <button type="button" className="drawer-bg" onClick={() => setPicked(null)} aria-label="Close" />
          <aside className="drawer">
            <div className="card-head">
              <div className="card-head-left">
                <CoinIcon symbol={picked.symbol} />
                <div>
                  <div className="wl-name">{picked.name}</div>
                  <div className="wl-price">{picked.symbol}</div>
                </div>
              </div>
              <button type="button" className="expand-btn" onClick={() => setPicked(null)}>×</button>
            </div>
            <div className="balance-amount" style={{ fontSize: 28, margin: '8px 0 4px' }}>
              {hideBalances ? '••••' : formatUsd(picked.usd)}
            </div>
            <div className="wl-price" style={{ marginBottom: 16 }}>
              {hideBalances ? '••••' : `${formatBalance(picked.balance, 8)} ${picked.symbol}`} · {formatUsd(picked.price)}
            </div>
            <Change value={picked.change} />
            <div className="balance-actions" style={{ marginTop: 22 }}>
              <Link to="/app/send" className="vx-btn btn-accent">Send</Link>
              <Link to="/app/receive" className="vx-btn btn-ghost">Receive</Link>
            </div>
            <button
              type="button"
              className="vx-btn btn-ghost"
              style={{ width: '100%', marginTop: 10 }}
              onClick={() => {
                setChartSymbol(picked.symbol)
                setPicked(null)
              }}
            >
              View chart
            </button>
          </aside>
        </>
      )}
    </>
  )
}
