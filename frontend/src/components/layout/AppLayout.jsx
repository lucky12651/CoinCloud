import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Bell,
  Image as ImageIcon,
  Lock,
  LogOut,
  Search,
  Shield,
  User,
  Users,
  Compass,
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useWalletStore } from '../../store/useWalletStore'
import { marketApi, walletApi } from '../../services/api'
import { formatUsd } from '../../lib/utils'
import { readPriceCache, writePriceCache } from '../../lib/priceCache'
import BrandLogo from '../BrandLogo'
import BottomNav from './BottomNav'
import LockScreen from './LockScreen'
import CoinIcon from '../vortex/CoinIcon'
import Change from '../vortex/Change'
import '../../vortex.css'

const nav = [
  {
    to: '/app',
    end: true,
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    to: '/app/activity',
    label: 'Activity',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 17l6-6 4 4 6-8" />
        <path d="M20 7v6M20 7h-6" />
      </svg>
    ),
  },
  {
    to: '/app/swap',
    label: 'Swap',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 7h10M17 7l-3-3M17 7l-3 3M17 17H7M7 17l3-3M7 17l3 3" />
      </svg>
    ),
  },
  {
    to: '/app/nfts',
    label: 'NFTs',
    icon: <ImageIcon size={18} />,
  },
  {
    to: '/app/market',
    label: 'Market',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9s1.3-6.4 3.8-9z" />
      </svg>
    ),
  },
  {
    to: '/app/browser',
    label: 'Discover',
    icon: <Compass size={18} />,
  },
  {
    to: '/app/contacts',
    label: 'Contacts',
    icon: <Users size={18} />,
  },
]

const PAGES = [
  { to: '/app', label: 'Dashboard', hint: 'Portfolio home' },
  { to: '/app/send', label: 'Send', hint: 'Withdraw crypto' },
  { to: '/app/receive', label: 'Receive', hint: 'Deposit address & QR' },
  { to: '/app/swap', label: 'Swap', hint: 'Live rate quote' },
  { to: '/app/nfts', label: 'NFTs', hint: 'Collectibles' },
  { to: '/app/activity', label: 'Activity', hint: 'Transaction history' },
  { to: '/app/contacts', label: 'Contacts', hint: 'Address book' },
  { to: '/app/alerts', label: 'Price alerts', hint: 'Notify on targets' },
  { to: '/app/connect', label: 'Connected dApps', hint: 'Sessions' },
  { to: '/app/browser', label: 'Discover', hint: 'Web3 apps' },
  { to: '/app/market', label: 'Market', hint: 'Live prices' },
  { to: '/app/settings/security', label: 'Security', hint: 'Backup & keys' },
]

export default function AppLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const refreshMe = useAuthStore((s) => s.refreshMe)
  const locked = useWalletStore((s) => s.locked)
  const lock = useWalletStore((s) => s.lock)
  const favoriteTokens = useWalletStore((s) => s.favoriteTokens)
  const contacts = useWalletStore((s) => s.contacts)
  const alerts = useWalletStore((s) => s.alerts)
  const notifications = useWalletStore((s) => s.notifications)
  const autoLockMinutes = useWalletStore((s) => s.autoLockMinutes)
  const lastActive = useWalletStore((s) => s.lastActive)
  const backupOk = useWalletStore((s) => s.backupOk)
  const connectedSites = useWalletStore((s) => s.connectedSites)
  const theme = useWalletStore((s) => s.theme)
  const setTheme = useWalletStore((s) => s.setTheme)
  const touch = useWalletStore((s) => s.touch)
  const markAlertTriggered = useWalletStore((s) => s.markAlertTriggered)
  const pushNotification = useWalletStore((s) => s.pushNotification)
  const markNotificationsRead = useWalletStore((s) => s.markNotificationsRead)
  const navigate = useNavigate()
  const location = useLocation()

  const [prices, setPrices] = useState(() => readPriceCache())
  const [gas, setGas] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    refreshMe()
  }, [refreshMe])

  useEffect(() => {
    const light = theme === 'light'
    document.documentElement.classList.toggle('theme-light', light)
    document.body.style.background = light ? '#f5f6f8' : '#0a0a0c'
    document.body.style.color = light ? '#1e2329' : '#f5f5f7'
  }, [theme])

  useEffect(() => {
    setMenuOpen(false)
    setNotifOpen(false)
    setQuery('')
  }, [location.pathname])

  useEffect(() => {
    const onAct = () => touch()
    window.addEventListener('pointerdown', onAct)
    window.addEventListener('keydown', onAct)
    return () => {
      window.removeEventListener('pointerdown', onAct)
      window.removeEventListener('keydown', onAct)
    }
  }, [touch])

  useEffect(() => {
    if (!autoLockMinutes) return undefined
    const id = setInterval(() => {
      const idle = Date.now() - useWalletStore.getState().lastActive
      if (idle > autoLockMinutes * 60_000) lock()
    }, 10_000)
    return () => clearInterval(id)
  }, [autoLockMinutes, lastActive, lock])

  useEffect(() => {
    let alive = true
    const load = () => {
      marketApi
        .prices()
        .then((r) => {
          const list = Array.isArray(r.data) ? r.data : []
          if (!alive || !list.length) return
          writePriceCache(list)
          setPrices(list)
        })
        .catch(() => {})
      walletApi
        .gas()
        .then((r) => {
          if (alive) setGas(r.data)
        })
        .catch(() => {})
    }
    load()
    const id = setInterval(load, 60_000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [])

  useEffect(() => {
    if (!prices.length || !alerts.length) return
    const map = {}
    for (const p of prices) map[(p.symbol || '').toUpperCase()] = Number(p.price_usd)
    for (const a of alerts) {
      if (a.triggered) continue
      const px = map[a.symbol]
      if (!Number.isFinite(px) || !Number.isFinite(a.target)) continue
      const hit = a.dir === 'below' ? px <= a.target : px >= a.target
      if (!hit) continue
      markAlertTriggered(a.id)
      pushNotification({
        title: `${a.symbol} alert`,
        body: `${a.symbol} is ${formatUsd(px)} (${a.dir} ${formatUsd(a.target)})`,
        to: '/app/alerts',
      })
      toast.success(`${a.symbol} hit ${formatUsd(a.target)}`)
    }
  }, [prices, alerts, markAlertTriggered, pushNotification])

  const watchlist = useMemo(() => {
    const wanted = favoriteTokens.length ? favoriteTokens : ['BTC', 'ETH', 'SOL']
    const bySym = {}
    for (const p of prices) bySym[(p.symbol || '').toUpperCase()] = p
    return wanted.map((s) => bySym[s]).filter(Boolean)
  }, [prices, favoriteTokens])

  const searchHits = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 1) return []
    const pages = PAGES.filter(
      (p) => p.label.toLowerCase().includes(q) || p.hint.toLowerCase().includes(q)
    ).slice(0, 5)
    const toks = prices
      .filter(
        (p) =>
          (p.symbol || '').toLowerCase().includes(q) || (p.name || '').toLowerCase().includes(q)
      )
      .slice(0, 5)
    const people = contacts
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q)
      )
      .slice(0, 4)
    return { pages, toks, people }
  }, [query, prices, contacts])

  const unread = notifications.filter((n) => !n.read).length
  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const initials = ((user?.username || 'U').slice(0, 2) || 'U').toUpperCase()
  const isDashboard = location.pathname === '/app' || location.pathname === '/app/'
  const showSearch = query.trim().length > 0

  if (locked) {
    return <LockScreen />
  }

  return (
    <div className={`vortex-shell${theme === 'light' ? ' theme-light' : ''}`}>
      <aside className="sidebar">
        <Link to="/app" className="logo">
          <div className="logo-mark">
            <BrandLogo size={34} rounded="rounded-lg" />
          </div>
          <div className="logo-text-wrap">
            <div className="logo-text">CoinCloud</div>
            <div className="logo-sub">Self-custody wallet</div>
          </div>
        </Link>

        <nav className="vx-nav">
          {nav.map(({ to, end, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="watchlist-head">
          WATCHLIST
          <Link to="/app/market" aria-label="Edit watchlist">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </Link>
        </div>
        <ul className="watchlist">
          {watchlist.map((c) => (
            <li key={c.symbol} className="wl-item">
              <CoinIcon symbol={c.symbol} />
              <div className="wl-info">
                <div className="wl-name">
                  {c.name} ({c.symbol})
                </div>
                <div className="wl-price">{formatUsd(c.price_usd)}</div>
              </div>
              <Change value={c.change_24h} />
            </li>
          ))}
        </ul>

        <div className="sidebar-spacer" />

        <div className="side-widget">
          <h4>ETH GAS</h4>
          <div className="gas-row">
            <div className="gas-pill">
              <span>Slow</span>
              <b>{gas?.slow_gwei || '—'}</b>
            </div>
            <div className="gas-pill">
              <span>Live</span>
              <b>{gas?.gwei || '—'}</b>
            </div>
            <div className="gas-pill">
              <span>Fast</span>
              <b>{gas?.fast_gwei || '—'}</b>
            </div>
          </div>
        </div>

        <div className="side-widget">
          <h4>WALLET HEALTH</h4>
          <div className="sec-row">
            <span className={`sec-dot ${backupOk ? '' : 'warn'}`} />
            {backupOk ? 'Backup saved' : 'Backup not confirmed'}
          </div>
          <div className="sec-row">
            <span className="sec-dot" />
            Auto-lock {autoLockMinutes ? `${autoLockMinutes}m` : 'off'}
          </div>
          <div className="sec-row">
            <span className={`sec-dot ${connectedSites.length ? '' : 'warn'}`} />
            {connectedSites.length} connected dApp{connectedSites.length === 1 ? '' : 's'}
          </div>
          {!backupOk && (
            <Link to="/app/settings/security" className="premium-btn" style={{ marginTop: 10 }}>
              Back up wallet
            </Link>
          )}
        </div>
      </aside>

      <div className="vx-main">
        <header className="topbar">
          {menuOpen && (
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 20, background: 'transparent', border: 0 }}
            />
          )}
          <div className="vx-profile" style={{ zIndex: 21 }} onClick={() => setMenuOpen((v) => !v)}>
            <div className="vx-avatar">{initials}</div>
            <div>
              <div className="profile-name">{user?.username || 'Wallet'}</div>
              <div className="profile-handle">@{user?.username || 'user'}</div>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
            {menuOpen && (
              <div className="profile-menu" onClick={(e) => e.stopPropagation()}>
                <Link to="/app/settings/profile" onClick={() => setMenuOpen(false)}>
                  <User size={15} /> Profile
                </Link>
                <Link to="/app/settings/security" onClick={() => setMenuOpen(false)}>
                  <Shield size={15} /> Security
                </Link>
                <Link to="/app/alerts" onClick={() => setMenuOpen(false)}>
                  <Bell size={15} /> Price alerts
                </Link>
                {user?.is_admin && (
                  <Link to="/app/admin" onClick={() => setMenuOpen(false)}>
                    <Shield size={15} /> Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    lock()
                  }}
                >
                  <Lock size={15} /> Lock wallet
                </button>
                <button type="button" className="danger" onClick={handleLogout}>
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            )}
          </div>

          <Link to="/app/receive" className="deposit-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="2" y="6" width="20" height="14" rx="2" />
              <path d="M2 10h20M7 15h3" />
            </svg>
            Deposit
          </Link>

          <div className="topbar-spacer" />

          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="icon-btn"
              aria-label="Notifications"
              onClick={() => {
                setNotifOpen((v) => !v)
                markNotificationsRead()
              }}
            >
              <Bell size={17} />
              {unread > 0 && <span className="vx-badge">{unread > 9 ? '9+' : unread}</span>}
            </button>
            {notifOpen && (
              <div className="notif-pop">
                <div className="pop-kicker">NOTIFICATIONS</div>
                {notifications.length === 0 && (
                  <div style={{ padding: 14, fontSize: 13, color: '#5c5c66' }}>No alerts yet</div>
                )}
                {notifications.slice(0, 8).map((n) => (
                  <Link key={n.id} to={n.to || '/app'} onClick={() => setNotifOpen(false)}>
                    {!n.read && <span className="unread" />}
                    <span>
                      <b style={{ color: '#f5f5f7', fontWeight: 650 }}>{n.title}</b>
                      <div style={{ fontSize: 12, marginTop: 2 }}>{n.body}</div>
                    </span>
                  </Link>
                ))}
                <Link to="/app/alerts" onClick={() => setNotifOpen(false)} style={{ justifyContent: 'center', color: '#d7f24c' }}>
                  Manage price alerts
                </Link>
              </div>
            )}
          </div>

          <div className="search-wrap">
            <div className="search-box">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search tokens, pages…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {showSearch && (
              <div className="search-pop">
                {searchHits.pages?.map((p) => (
                  <Link key={p.to} to={p.to} onClick={() => setQuery('')}>
                    <span>
                      <b style={{ color: '#f5f5f7' }}>{p.label}</b>
                      <div style={{ fontSize: 11, marginTop: 2 }}>{p.hint}</div>
                    </span>
                  </Link>
                ))}
                {searchHits.toks?.map((t) => (
                  <Link key={t.symbol} to="/app/market" onClick={() => setQuery('')}>
                    <CoinIcon symbol={t.symbol} />
                    <span>
                      <b style={{ color: '#f5f5f7' }}>{t.name}</b>
                      <div style={{ fontSize: 11, marginTop: 2 }}>{formatUsd(t.price_usd)}</div>
                    </span>
                  </Link>
                ))}
                {searchHits.people?.map((c) => (
                  <Link key={c.id} to="/app/send" onClick={() => setQuery('')}>
                    <span>
                      <b style={{ color: '#f5f5f7' }}>{c.name}</b>
                      <div style={{ fontSize: 11, marginTop: 2, fontFamily: 'monospace' }}>
                        {c.coin} · {c.address.slice(0, 10)}…
                      </div>
                    </span>
                  </Link>
                ))}
                {!searchHits.pages?.length && !searchHits.toks?.length && !searchHits.people?.length && (
                  <div style={{ padding: 14, fontSize: 13, color: '#5c5c66' }}>No matches</div>
                )}
              </div>
            )}
          </div>

          <div className="theme-toggle" role="group" aria-label="Theme">
            <button
              type="button"
              className={`seg${theme === 'light' ? ' active' : ''}`}
              onClick={() => setTheme('light')}
              aria-label="Light mode"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            </button>
            <button
              type="button"
              className={`seg${theme === 'dark' ? ' active' : ''}`}
              onClick={() => setTheme('dark')}
              aria-label="Dark mode"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
              </svg>
            </button>
          </div>
        </header>

        <div className={isDashboard ? '' : 'vx-page-pad'}>
          <Outlet context={{ searchQuery: query, prices, gas }} />
        </div>

        <BottomNav />
      </div>
    </div>
  )
}
