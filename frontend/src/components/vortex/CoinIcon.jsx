const META = {
  BTC: { cls: 'btc', letter: 'B' },
  ETH: { cls: 'eth', letter: 'Ξ' },
  BNB: { cls: 'bnb', letter: 'B' },
  SOL: { cls: 'sol', letter: 'S' },
  LTC: { cls: 'ltc', letter: 'Ł' },
  DOGE: { cls: 'doge', letter: 'D' },
  USDT: { cls: 'usdt', letter: 'T' },
}

export function coinClass(symbol) {
  return META[(symbol || '').toUpperCase()]?.cls || 'btc'
}

export function coinLetter(symbol) {
  const s = (symbol || '').toUpperCase()
  return META[s]?.letter || s[0] || '?'
}

export default function CoinIcon({ symbol, className = '' }) {
  const s = (symbol || '').toUpperCase()
  const meta = META[s] || { cls: 'btc', letter: s[0] || '?' }
  return (
    <div className={`coin-icon ${meta.cls} ${className}`.trim()}>
      {meta.letter}
    </div>
  )
}
