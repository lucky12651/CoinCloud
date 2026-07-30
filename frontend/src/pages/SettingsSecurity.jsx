import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { AlertTriangle, ArrowLeft, Copy, Eye, EyeOff, Shield } from 'lucide-react'
import { authApi } from '../services/api'
import { copyText } from '../lib/utils'

export default function SettingsSecurity() {
  const [bundle, setBundle] = useState(null)
  const [showSecrets, setShowSecrets] = useState(false)
  const [loadingPhrase, setLoadingPhrase] = useState(false)

  const loadSecrets = async () => {
    setLoadingPhrase(true)
    try {
      const { data } = await authApi.recoveryPhrase()
      setBundle(data)
      setShowSecrets(true)
    } catch {
      toast.error('Unable to load recovery data')
    } finally {
      setLoadingPhrase(false)
    }
  }

  const copy = async (text, label) => {
    if (!text) return
    try {
      await copyText(text)
      toast.success(`${label} copied`)
    } catch {
      toast.error('Copy failed')
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          to="/app/settings"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/60 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Settings</p>
          <h1 className="text-xl font-semibold tracking-tight">Security & privacy</h1>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 text-sm text-amber-100/80">
        <p className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          Never share your recovery phrase or private keys. Anyone with them can take your funds.
        </p>
      </div>

      <div className="x-card border-amber-500/20 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-sm font-medium text-amber-200/90">
          <Shield className="h-4 w-4" /> Recovery phrase & private keys
        </h2>
        <p className="mt-2 text-sm text-white/45">
          Full backup for <strong className="text-white/70">BTC, LTC, DOGE, ETH & USDT</strong>.
          Reveal only in a private place.
        </p>

        {!showSecrets ? (
          <button
            type="button"
            onClick={loadSecrets}
            disabled={loadingPhrase}
            className="x-btn-secondary mt-5 w-full sm:w-auto"
          >
            <Eye className="h-4 w-4" />
            {loadingPhrase ? 'Loading…' : 'Reveal recovery data'}
          </button>
        ) : (
          <div className="mt-5 space-y-4">
            <SecretBlock
              title={bundle?.mnemonic_utxo?.label || 'BTC / LTC / DOGE phrase'}
              note={bundle?.mnemonic_utxo?.note}
              value={bundle?.mnemonic_utxo?.passphrase || bundle?.passphrase}
              onCopy={() =>
                copy(bundle?.mnemonic_utxo?.passphrase || bundle?.passphrase, 'UTXO phrase')
              }
            />

            <SecretBlock
              title={bundle?.mnemonic_evm?.label || 'ETH / USDT phrase'}
              note={bundle?.mnemonic_evm?.note}
              value={bundle?.mnemonic_evm?.passphrase || bundle?.passphrase_eth}
              onCopy={() =>
                copy(bundle?.mnemonic_evm?.passphrase || bundle?.passphrase_eth, 'ETH phrase')
              }
            />

            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-white/40">
                Deposit addresses
              </p>
              <div className="mt-3 space-y-2 font-mono text-xs text-white/70">
                {Object.entries(bundle?.addresses || {}).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-2">
                    <span className="text-white/40">{k}</span>
                    <span className="min-w-0 flex-1 truncate text-right">{v || '—'}</span>
                    {v && (
                      <button
                        type="button"
                        onClick={() => copy(v, k)}
                        className="shrink-0 text-white/40 hover:text-white"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-red-200/70">
                Private keys (WIF / hex)
              </p>
              <p className="mt-1 text-[11px] text-white/40">
                BTC / LTC / DOGE use WIF. ETH / USDT use the same hex key.
              </p>
              <div className="mt-3 space-y-3">
                {[
                  { k: 'BTC_WIF', label: 'Bitcoin (WIF)' },
                  { k: 'LTC_WIF', label: 'Litecoin (WIF)' },
                  { k: 'DOGE_WIF', label: 'Dogecoin (WIF)' },
                  { k: 'ETH', label: 'Ethereum (hex)' },
                  { k: 'USDT', label: 'USDT ERC-20 (same as ETH)' },
                ].map(({ k, label }) => {
                  const v = bundle?.private_keys?.[k]
                  return (
                    <div
                      key={k}
                      className="rounded-lg border border-white/10 bg-black/40 p-3"
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-white/70">{label}</span>
                        {v ? (
                          <button
                            type="button"
                            onClick={() => copy(v, label)}
                            className="inline-flex items-center gap-1 text-[11px] text-white/40 hover:text-white"
                          >
                            <Copy className="h-3.5 w-3.5" /> Copy
                          </button>
                        ) : null}
                      </div>
                      <p className="break-all font-mono text-[11px] leading-relaxed text-white/90">
                        {v || 'Not available'}
                      </p>
                    </div>
                  )
                })}
                <p className="text-[11px] text-white/35">
                  {bundle?.private_keys?.USDT_note ||
                    'USDT uses the same private key and address as ETH.'}
                </p>
              </div>
            </div>

            {bundle?.broadcast_endpoints && (
              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-white/40">
                  Broadcast endpoints
                </p>
                <ul className="mt-2 space-y-1 text-[11px] text-white/45">
                  {Object.entries(bundle.broadcast_endpoints).map(([k, v]) => (
                    <li key={k}>
                      <span className="text-white/60">{k}:</span> {v}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setShowSecrets(false)
                setBundle(null)
              }}
              className="x-btn-ghost"
            >
              <EyeOff className="h-4 w-4" /> Hide secrets
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function SecretBlock({ title, note, value, onCopy }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/50 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-white/80">{title}</p>
          {note && <p className="mt-0.5 text-[11px] text-white/35">{note}</p>}
        </div>
        <button type="button" onClick={onCopy} className="x-btn-ghost px-2 py-1 text-xs">
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="mt-3 break-words font-mono text-sm leading-relaxed text-white/90">
        {value || '(not stored for this account)'}
      </p>
    </div>
  )
}
