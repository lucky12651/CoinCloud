import { NavLink } from 'react-router-dom'
import { ArrowDownLeft, ArrowUpRight, History, LayoutDashboard, User } from 'lucide-react'

const tabs = [
  { to: '/app', end: true, label: 'Home', icon: LayoutDashboard },
  { to: '/app/activity', label: 'Activity', icon: History },
  { to: '/app/send', label: 'Send', icon: ArrowUpRight, primary: true },
  { to: '/app/receive', label: 'Receive', icon: ArrowDownLeft },
  { to: '/app/settings/profile', label: 'Profile', icon: User },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {tabs.map(({ to, end, label, icon: Icon, primary }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `${isActive ? 'active' : ''} ${primary ? 'nav-send' : ''}`.trim()}
        >
          {primary ? (
            <>
              <span className="send-fab">
                <Icon size={20} strokeWidth={2.25} />
              </span>
              {label}
            </>
          ) : (
            <>
              <Icon size={20} strokeWidth={1.8} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
