import { useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Globe2,
  History,
  LayoutDashboard,
  Link2,
  Lock,
  LogOut,
  Shield,
  User,
  Wallet,
  ArrowLeftRight,
  Compass,
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useWalletStore } from '../../store/useWalletStore'
import { cn } from '../../lib/utils'
import PriceTicker from '../market/PriceTicker'
import BottomNav from './BottomNav'
import LockScreen from './LockScreen'
import NetworkSwitcher from '../wallet/NetworkSwitcher'

const nav = [
  { to: '/app', end: true, label: 'Home', icon: LayoutDashboard },
  { to: '/app/send', label: 'Send', icon: ArrowUpRight },
  { to: '/app/receive', label: 'Receive', icon: ArrowDownLeft },
  { to: '/app/activity', label: 'Activity', icon: History },
  { to: '/app/swap', label: 'Swap', icon: ArrowLeftRight },
  { to: '/app/connect', label: 'Connect', icon: Link2 },
  { to: '/app/browser', label: 'Discover', icon: Compass },
  { to: '/app/networks', label: 'Networks', icon: Globe2 },
  { to: '/app/settings/profile', label: 'Profile', icon: User },
  { to: '/app/settings/security', label: 'Security', icon: Shield },
]

export default function AppLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const refreshMe = useAuthStore((s) => s.refreshMe)
  const locked = useWalletStore((s) => s.locked)
  const lock = useWalletStore((s) => s.lock)
  const navigate = useNavigate()

  useEffect(() => {
    refreshMe()
  }, [refreshMe])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const items = [
    ...nav,
    ...(user?.is_admin
      ? [{ to: '/app/admin', label: 'Admin', icon: Shield }]
      : []),
  ]

  return (
    <div className="min-h-screen mesh-bg text-white">
      {locked && <LockScreen />}

      <div className="flex min-h-screen">
        {/* Desktop sidebar only — no mobile left menu */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/[0.06] bg-black/95 backdrop-blur-xl lg:flex">
          <div className="flex h-14 shrink-0 items-center gap-2 border-b border-white/[0.06] px-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black">
              <Wallet className="h-4 w-4" />
            </div>
            <Link to="/app" className="text-sm font-semibold tracking-tight">
              CoinCloud
            </Link>
          </div>

          <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-3">
            {items.map(({ to, end, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn('sidebar-item', isActive && 'sidebar-item-active')
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="shrink-0 border-t border-white/[0.06] bg-black p-3">
            <div className="mb-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <p className="truncate text-sm font-medium text-white">{user?.username}</p>
              <p className="truncate text-xs text-white/40">{user?.email}</p>
              {user?.is_admin && (
                <span className="mt-2 inline-flex rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/70">
                  Admin
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => lock()}
              className="sidebar-item mb-0.5 w-full text-left"
            >
              <Lock className="h-4 w-4" />
              Lock wallet
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="sidebar-item w-full text-left text-red-300/80 hover:text-red-200"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
          <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-black/85 backdrop-blur-xl">
            <div className="flex h-14 items-center justify-between gap-3 px-4 lg:px-6">
              {/* Mobile: brand only — no hamburger menu */}
              <div className="flex min-w-0 items-center gap-2 lg:hidden">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-black">
                  <Wallet className="h-3.5 w-3.5" />
                </div>
                <span className="truncate text-sm font-semibold">CoinCloud</span>
              </div>

              <div className="hidden text-sm text-white/40 lg:block">
                Self-custody multi-chain wallet
              </div>

              <div className="flex items-center gap-2">
                <NetworkSwitcher compact />
              </div>
            </div>
            <div className="hidden sm:block">
              <PriceTicker />
            </div>
          </header>

          <main className="flex-1 overflow-x-hidden p-4 pb-28 sm:p-6 lg:p-8 lg:pb-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile bottom nav only */}
      <BottomNav />
    </div>
  )
}
