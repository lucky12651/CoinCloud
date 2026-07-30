import { useState } from 'react'
import { ArrowDown, ArrowLeftRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { WALLET_COINS } from '../lib/coins'

export default function Swap() {
  const [from, setFrom] = useState('ETH')
  const [to, setTo] = useState('USDT')
  const [amount, setAmount] = useState('')

  const flip = () => {
    setFrom(to)
    setTo(from)
  }

  const onSwap = (e) => {
    e.preventDefault()
    toast(
      'Swap is preview-only. Use Send for on-chain transfers. DEX integration coming soon.',
      { icon: '⇄' }
    )
  }

  return (
    <div className="mx-auto max-w-md animate-fade-in">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">Exchange</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Swap</h1>
        <p className="mt-2 text-sm text-white/45">
          MetaMask-style swap UI. On-chain swaps via DEX will plug in here.
        </p>
      </div>

      <form onSubmit={onSwap} className="x-card space-y-2 p-4 sm:p-5">
        <TokenBox
          label="You pay"
          coin={from}
          setCoin={setFrom}
          amount={amount}
          setAmount={setAmount}
          exclude={to}
        />

        <div className="flex justify-center -my-1 relative z-10">
          <button
            type="button"
            onClick={flip}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#111] text-white shadow-lg hover:bg-white/10"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>

        <TokenBox label="You receive" coin={to} setCoin={setTo} amount="" readOnly exclude={from} />

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[11px] text-white/40">
          Estimated rate · network fee · slippage 0.5% (demo)
        </div>

        <button type="submit" className="x-btn-primary w-full py-3.5">
          <ArrowLeftRight className="h-4 w-4" />
          Review swap
        </button>
      </form>
    </div>
  )
}

function TokenBox({ label, coin, setCoin, amount, setAmount, readOnly, exclude }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-4">
      <div className="mb-2 flex items-center justify-between text-xs text-white/40">
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <input
          className="min-w-0 flex-1 bg-transparent text-2xl font-semibold outline-none placeholder:text-white/20"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount?.(e.target.value)}
          readOnly={readOnly}
          inputMode="decimal"
        />
        <select
          value={coin}
          onChange={(e) => setCoin(e.target.value)}
          className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-medium outline-none"
        >
          {WALLET_COINS.filter((c) => c !== exclude).map((c) => (
            <option key={c} value={c} className="bg-black">
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
