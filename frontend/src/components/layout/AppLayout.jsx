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
  ArrowLeftRight,
  Compass,
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useWalletStore } from '../../store/useWalletStore'
import { cn } from '../../lib/utils'
import BrandLogo from '../BrandLogo'
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
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-white/[0.06] bg-black/95 backdrop-blur-xl lg:flex">
          <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-white/[0.06] px-5">
            <BrandLogo size={36} rounded="rounded-xl" />
            <Link to="/app" className="text-base font-semibold tracking-tight">
              CoinCloud
            </Link>
          </div>

          <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3.5">
            {items.map(({ to, end, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn('sidebar-item', isActive && 'sidebar-item-active')
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="shrink-0 border-t border-white/[0.06] bg-black p-3.5">
            <div className="mb-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
              <p className="truncate text-[0.95rem] font-medium text-white">{user?.username}</p>
              <p className="truncate text-sm text-white/40">{user?.email}</p>
              {user?.is_admin && (
                <span className="mt-2 inline-flex rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs uppercase tracking-wider text-white/70">
                  Admin
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => lock()}
              className="sidebar-item mb-1 w-full text-left"
            >
              <Lock className="h-5 w-5" />
              Lock wallet
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="sidebar-item w-full text-left text-red-300/80 hover:text-red-200"
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col lg:pl-72">
          <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-black/85 backdrop-blur-xl">
            <div className="flex h-14 items-center justify-between gap-3 px-4 lg:px-6">
              {/* Mobile: brand only — no hamburger menu */}
              <div className="flex min-w-0 items-center gap-2 lg:hidden">
                <BrandLogo size={28} rounded="rounded-lg" />
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
