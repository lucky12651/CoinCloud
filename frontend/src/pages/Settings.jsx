import {
  ArrowLeftRight,
  ChevronRight,
  Compass,
  Eye,
  EyeOff,
  Globe2,
  Link2,
  Lock,
  LogOut,
  Shield,
  User,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useWalletStore } from '../store/useWalletStore'

// Mobile menu extras — bottom nav already has Home / Activity / Send / Receive
const MENU_LINKS = [
  { to: '/app/swap', label: 'Swap', desc: 'Exchange tokens', icon: ArrowLeftRight },
  { to: '/app/connect', label: 'Connect', desc: 'dApps & WalletConnect', icon: Link2 },
  { to: '/app/browser', label: 'Discover', desc: 'Explore Web3 apps', icon: Compass },
  { to: '/app/networks', label: 'Networks', desc: 'BTC · LTC · ETH · DOGE · USDT', icon: Globe2 },
]

export default function Settings() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const lock = useWalletStore((s) => s.lock)
  const hideBalances = useWalletStore((s) => s.hideBalances)
  const toggleHideBalances = useWalletStore((s) => s.toggleHideBalances)
  const connectedSites = useWalletStore((s) => s.connectedSites)

  const menuLinks = [
    ...MENU_LINKS,
    ...(user?.is_admin
      ? [{ to: '/app/admin', label: 'Admin', desc: 'Platform control', icon: Shield }]
      : []),
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">Account</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-white/40">Profile, security, and more</p>
      </div>

      {/* Profile box — click to open details + password */}
      <Link
        to="/app/settings/profile"
        className="x-card flex items-center gap-4 p-4 transition hover:border-white/20 active:scale-[0.99]"
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-white/60 text-lg font-bold text-black">
          {(user?.username || 'U')[0].toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold">{user?.username}</p>
          <p className="truncate text-sm text-white/45">{user?.email}</p>
          <p className="mt-0.5 text-[11px] text-white/30">
            {user?.is_admin ? 'Administrator' : 'User'} · Tap for profile & password
          </p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-white/30" />
      </Link>

      {/* Security & Privacy box */}
      <Link
        to="/app/settings/security"
        className="x-card flex items-center gap-4 border-amber-500/20 p-4 transition hover:border-amber-500/40 active:scale-[0.99]"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/25 bg-amber-500/10">
          <Shield className="h-5 w-5 text-amber-200/90" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-amber-100/90">Security & privacy</p>
          <p className="mt-0.5 text-sm text-white/45">
            Recovery phrase & private keys
          </p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-white/30" />
      </Link>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => lock()}
          className="x-card flex items-center gap-3 p-4 text-left hover:border-white/20"
        >
          <Lock className="h-5 w-5 text-white/50" />
          <div>
            <p className="text-sm font-medium">Lock wallet</p>
            <p className="text-xs text-white/40">Require password to open</p>
          </div>
        </button>
        <button
          type="button"
          onClick={toggleHideBalances}
          className="x-card flex items-center gap-3 p-4 text-left hover:border-white/20"
        >
          {hideBalances ? (
            <EyeOff className="h-5 w-5 text-white/50" />
          ) : (
            <Eye className="h-5 w-5 text-white/50" />
          )}
          <div>
            <p className="text-sm font-medium">
              {hideBalances ? 'Show balances' : 'Hide balances'}
            </p>
            <p className="text-xs text-white/40">Privacy mode on portfolio</p>
          </div>
        </button>
        <Link
          to="/app/connect"
          className="x-card flex items-center gap-3 p-4 hover:border-white/20"
        >
          <Link2 className="h-5 w-5 text-white/50" />
          <div>
            <p className="text-sm font-medium">Connected sites</p>
            <p className="text-xs text-white/40">
              {connectedSites.length} active connection(s)
            </p>
          </div>
        </Link>
        <Link
          to="/app/networks"
          className="x-card flex items-center gap-3 p-4 hover:border-white/20"
        >
          <Globe2 className="h-5 w-5 text-white/50" />
          <div>
            <p className="text-sm font-medium">Networks</p>
            <p className="text-xs text-white/40">BTC · LTC · ETH · DOGE · USDT</p>
          </div>
        </Link>
      </div>

      {/* Mobile: extra menu links */}
      <div className="x-card overflow-hidden lg:hidden">
        <div className="border-b border-white/[0.06] px-4 py-3">
          <h2 className="text-sm font-medium">More</h2>
          <p className="text-[11px] text-white/35">Features & tools</p>
        </div>
        <div className="divide-y divide-white/[0.05]">
          {menuLinks.map(({ to, label, desc, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 px-4 py-3.5 active:bg-white/[0.04] hover:bg-white/[0.03]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <Icon className="h-4 w-4 text-white/70" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-white/40">{desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-white/25" />
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop: profile/security shortcuts also listed */}
      <div className="hidden x-card overflow-hidden lg:block">
        <div className="border-b border-white/[0.06] px-4 py-3">
          <h2 className="text-sm font-medium">Account</h2>
        </div>
        <div className="divide-y divide-white/[0.05]">
          <Link
            to="/app/settings/profile"
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.03]"
          >
            <User className="h-4 w-4 text-white/50" />
            <div className="flex-1">
              <p className="text-sm font-medium">Profile</p>
              <p className="text-xs text-white/40">Details & change password</p>
            </div>
            <ChevronRight className="h-4 w-4 text-white/25" />
          </Link>
          <Link
            to="/app/settings/security"
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.03]"
          >
            <Shield className="h-4 w-4 text-amber-200/70" />
            <div className="flex-1">
              <p className="text-sm font-medium">Security & privacy</p>
              <p className="text-xs text-white/40">Recovery phrase & private keys</p>
            </div>
            <ChevronRight className="h-4 w-4 text-white/25" />
          </Link>
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="x-card flex w-full items-center gap-3 p-4 text-left text-red-300/90 hover:border-red-500/30 lg:hidden"
      >
        <LogOut className="h-5 w-5" />
        <div>
          <p className="text-sm font-medium">Sign out</p>
          <p className="text-xs text-white/40">Leave this wallet session</p>
        </div>
      </button>
    </div>
  )
}
