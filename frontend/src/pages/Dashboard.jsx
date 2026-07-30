import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Link2,
  QrCode,
  RefreshCw,
  Scan,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { marketApi, walletApi } from '../services/api'
import {
  cn,
  coinMeta,
  copyText,
  formatBalance,
  formatDate,
  formatUsd,
  shortAddress,
} from '../lib/utils'
import { WALLET_COINS } from '../lib/coins'
import { useAuthStore } from '../store/useAuthStore'
import { useWalletStore } from '../store/useWalletStore'
import TradingViewChart from '../components/market/TradingViewChart'
import TradingViewNews from '../components/market/TradingViewNews'

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const hideBalances = useWalletStore((s) => s.hideBalances)
  const toggleHideBalances = useWalletStore((s) => s.toggleHideBalances)
  const network = useWalletStore((s) => s.getNetwork())

  const [balances, setBalances] = useState({})
  const [addresses, setAddresses] = useState({})
  const [prices, setPrices] = useState([])
  const [txs, setTxs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async (soft = false) => {
    if (soft) setRefreshing(true)
    else setLoading(true)
    try {
      const [bRes, pRes, aRes, tRes] = await Promise.all([
        walletApi.balances(),
        marketApi.prices().catch(() => ({ data: [] })),
        walletApi.addresses().catch(() => ({ data: {} })),
        walletApi.transactions(network.symbol === 'USDT' ? 'ETH' : network.symbol).catch(() => ({ data: [] })),
      ])
      setBalances(bRes.data || {})
      setPrices(pRes.data || [])
      setAddresses(aRes.data || {})
      setTxs(Array.isArray(tRes.data) ? tRes.data.slice(0, 5) : [])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network.id])

  const priceMap = useMemo(() => {
    const m = {}
    for (const p of prices) m[(p.symbol || '').toUpperCase()] = p
    return m
  }, [prices])

  const totalUsd = useMemo(() => {
    return WALLET_COINS.reduce((sum, c) => {
      const bal = Number(balances[c]?.balance || 0)
      const px = Number(priceMap[c]?.price_usd || 0)
      return sum + bal * px
    }, 0)
  }, [balances, priceMap])

  const primaryAddress =
    addresses[network.symbol] ||
    addresses.ETH ||
    addresses.BTC ||
    ''

  const mask = (v) => (hideBalances ? '••••••' : v)

  const onCopy = async () => {
    if (!primaryAddress) return
    try {
      await copyText(primaryAddress)
      toast.success('Address copied')
    } catch {
      toast.error('Copy failed')
    }
  }

  const tokens = WALLET_COINS.map((c) => {
    const bal = Number(balances[c]?.balance || 0)
    const px = priceMap[c]
    const usd = bal * Number(px?.price_usd || 0)
    return {
      symbol: c,
      ...coinMeta(c),
      balance: bal,
      usd,
      change: px?.change_24h,
      price: px?.price_usd,
      image: px?.image,
    }
  }).sort((a, b) => b.usd - a.usd)

  return (
    <div className="mx-auto max-w-7xl animate-fade-in">
      {/* ═══ MOBILE-FIRST WALLET HOME (MetaMask style) ═══ */}
      <div className="lg:hidden">
        {/* Account chip */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-black"
              style={{
                background: `linear-gradient(135deg, ${network.color}, #fff)`,
              }}
            >
              {(user?.username || 'U')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold">{user?.username}</p>
              <button
                type="button"
                onClick={onCopy}
                className="flex items-center gap-1 font-mono text-[11px] text-white/45 hover:text-white"
              >
                {shortAddress(primaryAddress, 6, 4)}
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleHideBalances}
            className="rounded-full border border-white/10 p-2 text-white/50"
          >
            {hideBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Balance hero */}
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-white/35">Total balance</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight">
            {loading ? '—' : mask(formatUsd(totalUsd))}
          </p>
          <p className="mt-1 text-xs text-white/40">{network.name} network</p>
        </div>

        {/* Quick actions — big app-like buttons */}
        <div className="mb-6 grid grid-cols-4 gap-2">
          {[
            { to: '/app/send', label: 'Send', icon: ArrowUpRight },
            { to: '/app/receive', label: 'Receive', icon: ArrowDownLeft },
            { to: '/app/connect', label: 'Connect', icon: Link2 },
            { to: '/app/receive', label: 'Scan', icon: Scan },
          ].map(({ to, label, icon: Icon }) => (
            <Link
              key={label}
              to={to}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-2 py-3 transition active:scale-95 hover:bg-white/[0.06]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-medium text-white/80">{label}</span>
            </Link>
          ))}
        </div>

        {/* Tokens */}
        <div className="x-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <h2 className="text-sm font-medium">Tokens</h2>
            <button
              type="button"
              onClick={() => load(true)}
              className="text-white/40 hover:text-white"
            >
              <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            </button>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {tokens.map((t) => (
              <Link
                key={t.symbol}
                to="/app/send"
                className="flex items-center gap-3 px-4 py-3.5 active:bg-white/[0.04]"
              >
                {t.image ? (
                  <img src={t.image} alt="" className="h-10 w-10 rounded-full" />
                ) : (
                  <span
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold',
                      t.color
                    )}
                  >
                    {t.symbol[0]}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="font-mono text-sm">
                      {mask(
                        formatUsd(t.usd)
                      )}
                    </p>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2 text-xs text-white/40">
                    <span className="font-mono">
                      {mask(formatBalance(t.balance, t.symbol === 'USDT' ? 2 : 6))} {t.symbol}
                    </span>
                    {t.change != null && (
                      <span
                        className={cn(
                          'inline-flex items-center gap-0.5',
                          t.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                        )}
                      >
                        {t.change >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Number(t.change).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-white/20" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent activity mobile */}
        <div className="mt-4 x-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <h2 className="text-sm font-medium">Recent activity</h2>
            <Link to="/app/activity" className="text-xs text-white/40 hover:text-white">
              See all
            </Link>
          </div>
          {txs.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-white/35">No activity yet</p>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {txs.map((tx) => {
                const recv = (tx.transaction_type || '').toLowerCase() === 'received'
                return (
                  <div key={tx.txid + tx.date} className="flex items-center gap-3 px-4 py-3">
                    <span
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-full border',
                        recv
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                          : 'border-white/10 bg-white/5'
                      )}
                    >
                      {recv ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">{tx.transaction_type}</p>
                      <p className="text-[11px] text-white/35">{formatDate(tx.date)}</p>
                    </div>
                    <p className={cn('font-mono text-sm', recv && 'text-emerald-300')}>
                      {recv ? '+' : '−'}
                      {mask(formatBalance(tx.amount, 4))}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ═══ DESKTOP LAYOUT ═══ */}
      <div className="hidden space-y-6 lg:block">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">Portfolio</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              {loading ? '—' : formatUsd(totalUsd)}
            </h1>
            <button
              type="button"
              onClick={onCopy}
              className="mt-2 inline-flex items-center gap-1.5 font-mono text-xs text-white/45 hover:text-white"
            >
              <QrCode className="h-3.5 w-3.5" />
              {shortAddress(primaryAddress, 10, 8)}
              <Copy className="h-3 w-3" />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => load(true)}
              className="x-btn-secondary"
              disabled={refreshing}
            >
              <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
              Refresh
            </button>
            <Link to="/app/send" className="x-btn-primary">
              <ArrowUpRight className="h-4 w-4" /> Send
            </Link>
            <Link to="/app/receive" className="x-btn-secondary">
              <ArrowDownLeft className="h-4 w-4" /> Receive
            </Link>
            <Link to="/app/connect" className="x-btn-secondary">
              <Link2 className="h-4 w-4" /> Connect
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {tokens.map((t) => (
            <div
              key={t.symbol}
              className={cn(
                'x-card-solid relative overflow-hidden p-4 bg-gradient-to-br',
                t.color
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] text-white/45">{t.name}</p>
                  <p className={cn('mt-1 font-mono text-lg font-medium', t.accent)}>
                    {loading ? '…' : formatBalance(t.balance, t.symbol === 'USDT' ? 2 : 8)}
                  </p>
                  <p className="mt-1 text-xs text-white/40">{formatUsd(t.usd)}</p>
                </div>
                <span className="rounded-full border border-white/10 bg-black/40 px-2 py-0.5 font-mono text-[10px]">
                  {t.symbol}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-5 lg:grid-rows-[minmax(480px,1fr)]">
          <div className="x-card flex min-h-[420px] flex-col overflow-hidden p-3 lg:col-span-3">
            <div className="mb-2 shrink-0 px-2 pt-1">
              <h2 className="text-sm font-medium">Markets</h2>
              <p className="text-[11px] text-white/35">TradingView chart</p>
            </div>
            <div className="relative min-h-[400px] flex-1 overflow-hidden rounded-xl border border-white/[0.08] bg-black/50">
              <div className="absolute inset-0">
                <TradingViewChart fill />
              </div>
            </div>
          </div>
          <div className="x-card flex min-h-[420px] flex-col overflow-hidden p-3 lg:col-span-2">
            <div className="mb-2 shrink-0 px-2 pt-1">
              <h2 className="text-sm font-medium">Crypto news</h2>
              <p className="text-[11px] text-white/35">TradingView timeline</p>
            </div>
            <div className="relative min-h-[400px] flex-1 overflow-hidden rounded-xl border border-white/[0.08] bg-black/50">
              <div className="absolute inset-0">
                <TradingViewNews height="100%" fill />
              </div>
            </div>
          </div>
        </div>

        <div className="x-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <h2 className="text-sm font-medium">Recent activity</h2>
            <Link to="/app/activity" className="text-xs text-white/40 hover:text-white">
              View all
            </Link>
          </div>
          {txs.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-white/35">No transactions yet</p>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {txs.map((tx) => {
                const recv = (tx.transaction_type || '').toLowerCase() === 'received'
                return (
                  <div
                    key={tx.txid + tx.date}
                    className="flex items-center justify-between gap-4 px-5 py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-full border',
                          recv
                            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                            : 'border-white/10 bg-white/5'
                        )}
                      >
                        {recv ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{tx.transaction_type}</p>
                        <p className="font-mono text-xs text-white/35">
                          {shortAddress(tx.txid, 10, 8)} · {formatDate(tx.date)}
                        </p>
                      </div>
                    </div>
                    <p className={cn('font-mono text-sm', recv && 'text-emerald-300')}>
                      {recv ? '+' : '−'}
                      {formatBalance(tx.amount)} {tx.coin}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
