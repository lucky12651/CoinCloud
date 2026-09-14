import { create } from 'zustand'

const loadJson = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback
  } catch {
    return fallback
  }
}

const NETWORKS = [
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', color: '#627EEA', chainId: 1 },
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', color: '#F7931A', chainId: null },
  { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', color: '#345D9D', chainId: null },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', color: '#C2A633', chainId: null },
  { id: 'usdt', name: 'Tether (ERC-20)', symbol: 'USDT', color: '#26A17B', chainId: 1 },
]

export { NETWORKS }

export const useWalletStore = create((set, get) => ({
  networkId: loadJson('cc_network', 'ethereum'),
  locked: loadJson('cc_locked', false),
  hideBalances: loadJson('cc_hide_balances', false),
  connectedSites: loadJson('cc_connected_sites', []),
  pendingConnect: null, // { origin, name, icon, permissions }
  favoriteTokens: loadJson('cc_fav_tokens', ['BTC', 'ETH', 'SOL']),
  contacts: loadJson('cc_contacts', []),
  alerts: loadJson('cc_alerts', []),
  notifications: loadJson('cc_notifs', []),
  autoLockMinutes: loadJson('cc_autolock', 15),
  lastActive: Date.now(),
  backupOk: loadJson('cc_backup_ok', false),
  theme: loadJson('cc_theme', 'dark'),

  setNetwork: (networkId) => {
    localStorage.setItem('cc_network', JSON.stringify(networkId))
    set({ networkId })
  },

  getNetwork: () => NETWORKS.find((n) => n.id === get().networkId) || NETWORKS[0],

  lock: () => {
    localStorage.setItem('cc_locked', JSON.stringify(true))
    set({ locked: true })
  },

  unlock: () => {
    localStorage.setItem('cc_locked', JSON.stringify(false))
    set({ locked: false })
  },

  toggleHideBalances: () => {
    const next = !get().hideBalances
    localStorage.setItem('cc_hide_balances', JSON.stringify(next))
    set({ hideBalances: next })
  },

  connectSite: (site) => {
    const list = get().connectedSites.filter((s) => s.origin !== site.origin)
    const next = [{ ...site, connectedAt: new Date().toISOString() }, ...list]
    localStorage.setItem('cc_connected_sites', JSON.stringify(next))
    set({ connectedSites: next, pendingConnect: null })
  },

  disconnectSite: (origin) => {
    const next = get().connectedSites.filter((s) => s.origin !== origin)
    localStorage.setItem('cc_connected_sites', JSON.stringify(next))
    set({ connectedSites: next })
  },

  setPendingConnect: (pending) => set({ pendingConnect: pending }),

  toggleFavorite: (symbol) => {
    const fav = get().favoriteTokens
    const next = fav.includes(symbol)
      ? fav.filter((s) => s !== symbol)
      : [...fav, symbol]
    localStorage.setItem('cc_fav_tokens', JSON.stringify(next))
    set({ favoriteTokens: next })
  },

  setTheme: (theme) => {
    localStorage.setItem('cc_theme', JSON.stringify(theme))
    set({ theme })
  },

  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light'
    localStorage.setItem('cc_theme', JSON.stringify(next))
    set({ theme: next })
  },

  touch: () => set({ lastActive: Date.now() }),

  setAutoLockMinutes: (mins) => {
    localStorage.setItem('cc_autolock', JSON.stringify(mins))
    set({ autoLockMinutes: mins, lastActive: Date.now() })
  },

  markBackupOk: () => {
    localStorage.setItem('cc_backup_ok', JSON.stringify(true))
    set({ backupOk: true })
  },

  addContact: (contact) => {
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: contact.name.trim(),
      address: contact.address.trim(),
      coin: (contact.coin || 'ETH').toUpperCase(),
      createdAt: new Date().toISOString(),
    }
    const next = [item, ...get().contacts]
    localStorage.setItem('cc_contacts', JSON.stringify(next))
    set({ contacts: next })
    return item
  },

  removeContact: (id) => {
    const next = get().contacts.filter((c) => c.id !== id)
    localStorage.setItem('cc_contacts', JSON.stringify(next))
    set({ contacts: next })
  },

  addAlert: (alert) => {
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      symbol: (alert.symbol || 'BTC').toUpperCase(),
      dir: alert.dir === 'below' ? 'below' : 'above',
      target: Number(alert.target),
      triggered: false,
      createdAt: new Date().toISOString(),
    }
    const next = [item, ...get().alerts]
    localStorage.setItem('cc_alerts', JSON.stringify(next))
    set({ alerts: next })
    return item
  },

  removeAlert: (id) => {
    const next = get().alerts.filter((a) => a.id !== id)
    localStorage.setItem('cc_alerts', JSON.stringify(next))
    set({ alerts: next })
  },

  markAlertTriggered: (id) => {
    const next = get().alerts.map((a) => (a.id === id ? { ...a, triggered: true } : a))
    localStorage.setItem('cc_alerts', JSON.stringify(next))
    set({ alerts: next })
  },

  pushNotification: (n) => {
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: n.title,
      body: n.body || '',
      to: n.to || '/app',
      at: new Date().toISOString(),
      read: false,
    }
    const next = [item, ...get().notifications].slice(0, 40)
    localStorage.setItem('cc_notifs', JSON.stringify(next))
    set({ notifications: next })
  },

  markNotificationsRead: () => {
    const next = get().notifications.map((n) => ({ ...n, read: true }))
    localStorage.setItem('cc_notifs', JSON.stringify(next))
    set({ notifications: next })
  },

  clearNotifications: () => {
    localStorage.setItem('cc_notifs', JSON.stringify([]))
    set({ notifications: [] })
  },
}))
