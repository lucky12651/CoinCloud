import { NavLink } from 'react-router-dom'
import {
  ArrowDownLeft,
  ArrowUpRight,
  History,
  LayoutDashboard,
  Settings,
} from 'lucide-react'
import { cn } from '../../lib/utils'

const tabs = [
  { to: '/app', end: true, label: 'Home', icon: LayoutDashboard },
  { to: '/app/activity', label: 'Activity', icon: History },
  { to: '/app/send', label: 'Send', icon: ArrowUpRight, primary: true },
  { to: '/app/receive', label: 'Receive', icon: ArrowDownLeft },
  { to: '/app/settings', label: 'Settings', icon: Settings },
]

export default function BottomNav() {
  return (
    <nav className="safe-bottom glass-bottom-nav fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <div className="mx-auto flex h-[4.25rem] max-w-lg items-end justify-around px-1 pb-1 pt-1">
        {tabs.map(({ to, end, label, icon: Icon, primary }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium transition',
                primary
                  ? '-top-3'
                  : isActive
                    ? 'text-emerald-100'
                    : 'text-emerald-200/40 hover:text-emerald-100/80'
              )
            }
          >
            {({ isActive }) =>
              primary ? (
                <>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-black shadow-[0_0_22px_rgba(34,197,94,0.55)]">
                    <Icon className="h-5 w-5" strokeWidth={2.25} />
                  </span>
                  <span className={cn(isActive ? 'text-emerald-100' : 'text-emerald-200/50')}>
                    {label}
                  </span>
                </>
              ) : (
                <>
                  <Icon
                    className={cn('h-5 w-5', isActive && 'text-emerald-300')}
                    strokeWidth={isActive ? 2.25 : 1.75}
                  />
                  <span>{label}</span>
                  {isActive && (
                    <span className="absolute bottom-0.5 h-0.5 w-4 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.9)]" />
                  )}
                </>
              )
            }
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
