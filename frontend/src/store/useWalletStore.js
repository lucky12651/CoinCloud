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
  favoriteTokens: loadJson('cc_fav_tokens', ['BTC', 'ETH', 'USDT', 'LTC', 'DOGE']),

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
}))
