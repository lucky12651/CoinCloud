import { useState } from 'react'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { cn } from '../../lib/utils'
import { NETWORKS, useWalletStore } from '../../store/useWalletStore'

export default function NetworkSwitcher({ compact = false }) {
  const networkId = useWalletStore((s) => s.networkId)
  const setNetwork = useWalletStore((s) => s.setNetwork)
  const network = NETWORKS.find((n) => n.id === networkId) || NETWORKS[0]
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 font-medium text-emerald-50 transition hover:border-emerald-400/40 hover:bg-emerald-500/15',
          compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
        )}
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: network.color }}
        />
        {!compact && <Globe className="h-3.5 w-3.5 text-white/40" />}
        <span className="max-w-[100px] truncate">{network.name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-white/40" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-emerald-400/20 bg-[rgba(2,12,6,0.92)] py-1 shadow-2xl backdrop-blur-xl">
            <p className="px-3 py-2 text-[10px] uppercase tracking-wider text-emerald-200/40">
              Networks
            </p>
            {NETWORKS.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  setNetwork(n.id)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-emerald-50 hover:bg-emerald-500/10"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: n.color }}
                />
                <span className="flex-1">{n.name}</span>
                <span className="font-mono text-[10px] text-emerald-200/35">{n.symbol}</span>
                {n.id === networkId && <Check className="h-4 w-4 text-emerald-400" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
