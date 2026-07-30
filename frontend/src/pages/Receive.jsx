import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'
import { Check, Copy } from 'lucide-react'
import { walletApi } from '../services/api'
import { cn, copyText, shortAddress } from '../lib/utils'
import { WALLET_COINS } from '../lib/coins'

export default function Receive() {
  const [coin, setCoin] = useState('BTC')
  const [addresses, setAddresses] = useState({})
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    walletApi
      .addresses()
      .then((r) => setAddresses(r.data || {}))
      .catch(() => toast.error('Failed to load addresses'))
  }, [])

  const address = addresses[coin] || ''

  const onCopy = async () => {
    if (!address) return
    try {
      await copyText(address)
      setCopied(true)
      toast.success('Address copied')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Copy failed')
    }
  }

  const notes = {
    BTC: 'Send only Bitcoin (BTC) to this address.',
    LTC: 'Send only Litecoin (LTC) to this address.',
    DOGE: 'Send only Dogecoin (DOGE) to this address.',
    ETH: 'Send only Ethereum (ETH) to this address.',
    USDT: 'USDT (ERC-20) uses your Ethereum address. Send only Ethereum-network USDT.',
  }

  return (
    <div className="mx-auto max-w-xl animate-fade-in">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">Deposit</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Receive crypto</h1>
        <p className="mt-2 text-sm text-white/45">
          Share your address or QR. {notes[coin]}
        </p>
      </div>

      <div className="x-card p-6 sm:p-8">
        <div className="mb-6 flex flex-wrap gap-1 rounded-xl border border-white/10 bg-black/40 p-1">
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

        <div className="flex flex-col items-center">
          <div className="rounded-2xl border border-white/10 bg-white p-4 shadow-glow-sm">
            {address ? (
              <QRCodeSVG value={address} size={200} level="M" includeMargin={false} />
            ) : (
              <div className="flex h-[200px] w-[200px] items-center justify-center text-sm text-black/40">
                Loading…
              </div>
            )}
          </div>

          <p className="mt-6 text-xs uppercase tracking-widest text-white/40">
            {coin} address{coin === 'USDT' ? ' (ERC-20 / ETH)' : ''}
          </p>
          <p className="mt-2 max-w-full break-all text-center font-mono text-sm text-white/90">
            {address || '—'}
          </p>
          <p className="mt-1 font-mono text-xs text-white/30">{shortAddress(address, 12, 10)}</p>

          <button onClick={onCopy} disabled={!address} className="x-btn-primary mt-6 min-w-[160px]">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy address'}
          </button>
        </div>

        <div className="mt-8 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs leading-relaxed text-white/40">
          {notes[coin]} Wrong network deposits may be unrecoverable.
        </div>
      </div>
    </div>
  )
}
