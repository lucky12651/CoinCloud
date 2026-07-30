import { useEffect, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, ExternalLink } from 'lucide-react'
import { walletApi } from '../services/api'
import {
  cn,
  explorerUrl,
  formatBalance,
  formatDate,
  shortAddress,
} from '../lib/utils'
import { WALLET_COINS } from '../lib/coins'

const COINS = WALLET_COINS

export default function Transactions() {
  const [coin, setCoin] = useState('BTC')
  const [txs, setTxs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    setLoading(true)
    walletApi
      .transactions(coin)
      .then((r) => setTxs(Array.isArray(r.data) ? r.data : []))
      .catch(() => setTxs([]))
      .finally(() => setLoading(false))
  }, [coin])

  const filtered = txs.filter((tx) => {
    if (filter === 'all') return true
    return (tx.transaction_type || '').toLowerCase() === filter
  })

  return (
    <div className="mx-auto max-w-4xl animate-fade-in">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">History</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Activity</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 rounded-full border border-white/10 bg-black/40 p-1">
            {COINS.map((c) => (
              <button
                key={c}
                onClick={() => setCoin(c)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition',
                  coin === c ? 'bg-white text-black' : 'text-white/50 hover:text-white'
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-1 rounded-full border border-white/10 bg-black/40 p-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'received', label: 'In' },
              { id: 'sent', label: 'Out' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition',
                  filter === f.id ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="x-card overflow-hidden">
        {loading && (
          <p className="px-5 py-12 text-center text-sm text-white/35">Loading transactions…</p>
        )}
        {!loading && filtered.length === 0 && (
          <p className="px-5 py-12 text-center text-sm text-white/35">No activity for {coin}</p>
        )}
        <div className="divide-y divide-white/[0.05]">
          {filtered.map((tx) => {
            const recv = (tx.transaction_type || '').toLowerCase() === 'received'
            return (
              <div
                key={tx.txid + String(tx.date)}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-white/[0.02]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border',
                      recv
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                        : 'border-white/10 bg-white/5 text-white/70'
                    )}
                  >
                    {recv ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{tx.transaction_type}</p>
                    <p className="text-xs text-white/35">{formatDate(tx.date)}</p>
                    <a
                      href={explorerUrl(tx.coin, tx.txid)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1 font-mono text-[11px] text-white/40 hover:text-white"
                    >
                      {shortAddress(tx.txid, 12, 10)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn('font-mono text-sm', recv ? 'text-emerald-300' : 'text-white')}>
                    {recv ? '+' : '−'}
                    {formatBalance(tx.amount)} {tx.coin}
                  </p>
                  <p className="text-[11px] capitalize text-white/30">
                    {tx.status}
                    {tx.confirmations ? ` · ${tx.confirmations} conf` : ''}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
