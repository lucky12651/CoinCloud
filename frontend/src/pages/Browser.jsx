import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

const EXPLORE = [
  {
    name: 'Uniswap',
    desc: 'Swap tokens on Ethereum',
    url: 'https://app.uniswap.org',
    color: 'from-pink-500/20 to-pink-600/5',
  },
  {
    name: 'OpenSea',
    desc: 'NFT marketplace',
    url: 'https://opensea.io',
    color: 'from-blue-500/20 to-blue-600/5',
  },
  {
    name: 'Aave',
    desc: 'Lend & borrow',
    url: 'https://app.aave.com',
    color: 'from-purple-500/20 to-purple-600/5',
  },
  {
    name: 'mempool.space',
    desc: 'Bitcoin explorer',
    url: 'https://mempool.space',
    color: 'from-orange-500/20 to-orange-600/5',
  },
  {
    name: 'Etherscan',
    desc: 'Ethereum explorer',
    url: 'https://etherscan.io',
    color: 'from-indigo-500/20 to-slate-600/5',
  },
  {
    name: 'Litecoin Space',
    desc: 'Litecoin explorer',
    url: 'https://litecoinspace.org',
    color: 'from-slate-400/20 to-slate-600/5',
  },
]

export default function Browser() {
  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">Discover</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Explore Web3</h1>
        <p className="mt-2 text-sm text-white/45">
          Popular dApps and explorers. Connect via the{' '}
          <Link to="/app/connect" className="text-white underline">
            Connect
          </Link>{' '}
          tab.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {EXPLORE.map((item) => (
          <a
            key={item.url}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className={`x-card group relative overflow-hidden bg-gradient-to-br p-5 transition hover:border-white/20 ${item.color}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-medium">{item.name}</h3>
                <p className="mt-1 text-sm text-white/45">{item.desc}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-white/30 group-hover:text-white/70" />
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
