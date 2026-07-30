import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Lock,
  Shield,
  Sparkles,
  Wallet,
  Zap,
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

const features = [
  {
    icon: Wallet,
    title: 'Multi-chain wallets',
    desc: 'Bitcoin, Litecoin, and Ethereum addresses created the moment you sign up.',
  },
  {
    icon: Zap,
    title: 'Real broadcast',
    desc: 'Sign and broadcast with the same bitcoinlib flow as production scripts — mempool.space & litecoinspace.',
  },
  {
    icon: Lock,
    title: 'You hold the keys',
    desc: 'Recovery phrase for BTC/LTC and dedicated ETH keys, surfaced only to you.',
  },
  {
    icon: Shield,
    title: 'Admin control plane',
    desc: 'Platform stats, user management, and activity monitoring for operators.',
  },
]

const stats = [
  { label: 'Networks', value: '3' },
  { label: 'Latency target', value: '<200ms' },
  { label: 'Stack', value: 'React + FastAPI' },
]

export default function Landing() {
  const token = useAuthStore((s) => s.token)

  return (
    <div className="min-h-screen mesh-bg text-white">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-black/70 backdrop-blur-xl">
        <div className="x-container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">CoinCloud</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="x-nav-link">Features</a>
            <a href="#stack" className="x-nav-link">Stack</a>
            <a href="#start" className="x-nav-link">Get started</a>
          </nav>
          <div className="flex items-center gap-2">
            {token ? (
              <Link to="/app" className="x-btn-primary">
                Open wallet <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="x-btn-ghost hidden sm:inline-flex">
                  Sign in
                </Link>
                <Link to="/register" className="x-btn-primary">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-fade" />
        <div className="x-container relative pb-24 pt-20 sm:pt-28 lg:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/60">
              <Sparkles className="h-3.5 w-3.5" />
              New · FastAPI + React multi-chain wallet
            </div>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              <span className="text-gradient">Frontier crypto wallet</span>
              <br />
              <span className="text-white/80">for everything you hold.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-white/50 sm:text-lg">
              Send, receive, and track BTC, LTC, and ETH with a professional operator-grade interface.
              Built on the same signing and broadcast logic as your bitcoinlib scripts.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link to={token ? '/app' : '/register'} className="x-btn-primary px-7 py-3 text-base">
                {token ? 'Open dashboard' : 'Create wallet'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#features" className="x-btn-secondary px-7 py-3 text-base">
                Explore features
              </a>
            </div>
          </motion.div>

          {/* Product preview card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mx-auto mt-16 max-w-4xl"
          >
            <div className="x-card overflow-hidden p-1 shadow-glow">
              <div className="rounded-[14px] border border-white/[0.05] bg-gradient-to-b from-white/[0.06] to-transparent p-6 sm:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/40">Portfolio</p>
                    <p className="mt-1 text-3xl font-semibold tracking-tight">$0.00</p>
                  </div>
                  <div className="flex gap-2">
                    {['BTC', 'LTC', 'ETH'].map((c) => (
                      <span
                        key={c}
                        className="rounded-full border border-white/10 bg-black/40 px-3 py-1 font-mono text-xs text-white/70"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { c: 'BTC', n: 'Bitcoin' },
                    { c: 'LTC', n: 'Litecoin' },
                    { c: 'ETH', n: 'Ethereum' },
                  ].map((a) => (
                    <div key={a.c} className="rounded-xl border border-white/[0.06] bg-black/50 p-4">
                      <p className="text-xs text-white/40">{a.n}</p>
                      <p className="mt-2 font-mono text-lg">0.00000000</p>
                      <p className="mt-1 text-xs text-white/30">{a.c}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-6 border-t border-white/[0.06] pt-10 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-semibold tracking-tight sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-xs text-white/40 sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-white/[0.06] py-24">
        <div className="x-container">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">Capabilities</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              One product. Every chain you need.
            </h2>
            <p className="mt-4 text-white/50">
              A complete rewrite of CoinCloud — FastAPI API, React SPA, and a clean dark interface:
              pure black, crisp type, quiet motion.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="x-card group p-6 transition hover:border-white/15 hover:bg-white/[0.035]"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-medium">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/45">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stack */}
      <section id="stack" className="border-t border-white/[0.06] py-24">
        <div className="x-container grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">For builders</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              FastAPI backend.
              <br />
              React frontend.
            </h2>
            <p className="mt-4 text-white/50">
              JWT auth, SQLAlchemy models, bitcoinlib for BTC/LTC, eth-account + web3 for ETH.
              Admin APIs for ops; market prices via CoinGecko.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-white/55">
              {[
                'JWT session with role-aware admin routes',
                'Broadcast via mempool.space / litecoinspace / Ethereum RPC',
                'Portfolio, send, receive QR, activity, recovery phrase',
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="text-white/30">—</span> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="x-card-solid overflow-hidden">
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="ml-2 font-mono text-[11px] text-white/40">wallet_service.py</span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-relaxed text-white/70">
{`# Same logic as btc/ scripts
tx = wallet.transaction_create(
  [(recipient, amount_sats)],
  fee=fee_sats,
)
tx.sign()
raw = tx.raw_hex()
requests.post(
  "https://mempool.space/api/tx",
  data=raw,
)`}
            </pre>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="start" className="border-t border-white/[0.06] py-24">
        <div className="x-container">
          <div className="x-card relative overflow-hidden px-8 py-14 text-center sm:px-16">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_60%)]" />
            <h2 className="relative text-3xl font-semibold tracking-tight sm:text-4xl">
              Choose how to get started
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg text-white/50">
              Create a free wallet in seconds, or sign in to your existing CoinCloud account.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/register" className="x-btn-primary px-8 py-3">
                Create account
              </Link>
              <Link to="/login" className="x-btn-secondary px-8 py-3">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-10">
        <div className="x-container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-white/40">
            <Wallet className="h-4 w-4" />
            CoinCloud
          </div>
          <p className="text-xs text-white/30">
            Built with React · FastAPI · bitcoinlib
          </p>
        </div>
      </footer>
    </div>
  )
}
