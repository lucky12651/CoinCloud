const KEY = 'cc_prices_cache'

export const PRICE_PLACEHOLDERS = [
  { symbol: 'BTC', name: 'Bitcoin', price_usd: 0, change_24h: 0 },
  { symbol: 'ETH', name: 'Ethereum', price_usd: 0, change_24h: 0 },
  { symbol: 'SOL', name: 'Solana', price_usd: 0, change_24h: 0 },
  { symbol: 'BNB', name: 'BNB', price_usd: 0, change_24h: 0 },
]

export function readPriceCache() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (Array.isArray(raw?.items) && raw.items.length) return raw.items
  } catch {
    /* ignore */
  }
  return PRICE_PLACEHOLDERS
}

export function writePriceCache(items) {
  if (!Array.isArray(items) || !items.length) return
  try {
    localStorage.setItem(KEY, JSON.stringify({ items, at: Date.now() }))
  } catch {
    /* ignore */
  }
}
