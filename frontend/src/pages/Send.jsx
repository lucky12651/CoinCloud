import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Send as SendIcon } from 'lucide-react'
import { walletApi } from '../services/api'
import { cn, explorerUrl, formatBalance } from '../lib/utils'
import { DEFAULT_FEES, WALLET_COINS } from '../lib/coins'

export default function Send() {
  const [coin, setCoin] = useState('BTC')
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [fee, setFee] = useState(String(DEFAULT_FEES.BTC))
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const needsFee = coin === 'BTC' || coin === 'LTC' || coin === 'DOGE'

  useEffect(() => {
    const d = DEFAULT_FEES[coin]
    setFee(d != null ? String(d) : '')
    setResult(null)
    walletApi
      .balance(coin)
      .then((r) => setBalance(r.data?.balance || 0))
      .catch(() => setBalance(0))
  }, [coin])

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const payload = {
        coin,
        address: address.trim(),
        amount: Number(amount),
      }
      if (needsFee && fee) payload.fee = Number(fee)
      const { data } = await walletApi.send(payload)
      setResult(data)
      toast.success(data.message || 'Transaction broadcasted')
      setAmount('')
      setAddress('')
      const bal = await walletApi.balance(coin)
      setBalance(bal.data?.balance || 0)
    } catch (err) {
      const detail = err.response?.data?.detail
      toast.error(typeof detail === 'string' ? detail : 'Send failed')
    } finally {
      setLoading(false)
    }
  }

  const placeholders = {
    BTC: 'bc1… or 1…',
    LTC: 'L… or M…',
    DOGE: 'D…',
    ETH: '0x…',
    USDT: '0x… (ERC-20)',
  }

  const broadcastHints = {
    BTC: 'Broadcast via mempool.space',
    LTC: 'Broadcast via litecoinspace.org',
    DOGE: 'Broadcast via BlockCypher DOGE API',
    ETH: 'Broadcast via Ethereum RPC',
    USDT: 'ERC-20 transfer on Ethereum (same key as ETH)',
  }

  return (
    <div className="mx-auto max-w-xl animate-fade-in">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">Transfer</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Send crypto</h1>
        <p className="mt-2 text-sm text-white/45">
          Signs with your keys and broadcasts on-chain. {broadcastHints[coin]}
        </p>
      </div>

      <form onSubmit={onSubmit} className="x-card space-y-5 p-6 sm:p-8">
        <div>
          <label className="x-label">Asset</label>
          <div className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-black/40 p-1">
            {WALLET_COINS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCoin(c)}
                className={cn(
                  'flex-1 min-w-[56px] rounded-lg py-2.5 text-sm font-medium transition',
                  coin === c ? 'bg-white text-black' : 'text-white/50 hover:text-white'
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-white/35">
            Available:{' '}
            <span className="font-mono text-white/70">{formatBalance(balance)}</span> {coin}
          </p>
        </div>

        <div>
          <label className="x-label">Recipient address</label>
          <input
            className="x-input font-mono text-xs sm:text-sm"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            placeholder={placeholders[coin]}
          />
        </div>

        <div>
          <label className="x-label">Amount ({coin})</label>
          <input
            className="x-input font-mono"
            type="number"
            step="any"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder="0.0"
          />
        </div>

        {needsFee && (
          <div>
            <label className="x-label">Network fee ({coin})</label>
            <input
              className="x-input font-mono"
              type="number"
              step="any"
              min="0"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
            />
          </div>
        )}

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[11px] text-white/40">
          {broadcastHints[coin]}
        </div>

        <button type="submit" disabled={loading} className="x-btn-primary w-full py-3">
          <SendIcon className="h-4 w-4" />
          {loading ? 'Broadcasting…' : `Send ${coin}`}
        </button>
      </form>

      {result?.success && (
        <div className="x-card mt-4 border-emerald-500/20 bg-emerald-500/5 p-5">
          <p className="text-sm font-medium text-emerald-300">Broadcast successful</p>
          <p className="mt-2 break-all font-mono text-xs text-white/60">{result.txid}</p>
          {result.broadcast_via && (
            <p className="mt-1 text-[11px] text-white/35">via {result.broadcast_via}</p>
          )}
          <a
            href={explorerUrl(result.coin, result.txid)}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-xs text-white/70 underline hover:text-white"
          >
            View on explorer
          </a>
        </div>
      )}
    </div>
  )
}
