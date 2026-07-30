import { useEffect, useState } from 'react'
import { marketApi } from '../../services/api'
import { cn, formatUsd } from '../../lib/utils'

function TickerItem({ item }) {
  const ch = Number(item.change_24h)
  const up = !Number.isNaN(ch) && ch >= 0
  return (
    <div className="flex shrink-0 items-center gap-2.5 px-5">
      {item.image ? (
        <img src={item.image} alt="" className="h-5 w-5 rounded-full" />
      ) : (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[9px] font-bold">
          {(item.symbol || '?')[0]}
        </span>
      )}
      <span className="font-mono text-xs font-semibold tracking-wide text-white">
        {item.symbol}
      </span>
      <span className="font-mono text-xs text-white/70">{formatUsd(item.price_usd)}</span>
      <span
        className={cn(
          'font-mono text-[11px]',
          up ? 'text-emerald-400' : 'text-red-400'
        )}
      >
        {Number.isFinite(ch) ? `${up ? '+' : ''}${ch.toFixed(2)}%` : '—'}
      </span>
    </div>
  )
}

export default function PriceTicker() {
  const [items, setItems] = useState([])

  useEffect(() => {
    let alive = true
    const load = () => {
      marketApi
        .prices()
        .then((r) => {
          if (alive) setItems(Array.isArray(r.data) ? r.data : [])
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

  if (!items.length) {
    return (
      <div className="border-b border-white/[0.06] bg-black/80 px-4 py-2.5 text-center text-xs text-white/30">
        Loading live markets…
      </div>
    )
  }

  // Duplicate for seamless infinite scroll
  const row = [...items, ...items]

  return (
    <div className="ticker-wrap border-b border-white/[0.06] bg-black/90">
      <div className="ticker-track">
        {row.map((item, i) => (
          <TickerItem key={`${item.id || item.symbol}-${i}`} item={item} />
        ))}
      </div>
    </div>
  )
}
