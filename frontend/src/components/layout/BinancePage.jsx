import { Link, NavLink } from 'react-router-dom'

export const TRANSFER_TABS = [
  { to: '/app/send', label: 'Withdraw' },
  { to: '/app/receive', label: 'Deposit' },
  { to: '/app/swap', label: 'Convert' },
]

export function TransferTabs() {
  return (
    <div className="bn-tabs">
      {TRANSFER_TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) => `bn-tab${isActive ? ' active' : ''}`}
        >
          {t.label}
        </NavLink>
      ))}
    </div>
  )
}

export default function BinancePage({
  crumb = 'Wallet',
  title,
  sub,
  tabs,
  aside,
  children,
  wide = false,
}) {
  return (
    <div className="bn-page">
      <div className="bn-crumb">
        <Link to="/app">Wallet</Link>
        <span className="sep">/</span>
        <span>{crumb}</span>
      </div>
      <h1 className="bn-title">{title}</h1>
      {sub && <p className="bn-sub">{sub}</p>}
      {tabs}
      {wide || !aside ? (
        children
      ) : (
        <div className="bn-grid">
          <div>{children}</div>
          <aside className="bn-aside">{aside}</aside>
        </div>
      )}
    </div>
  )
}

export function Faq({ items }) {
  return (
    <div className="bn-side">
      <h3>FAQ</h3>
      <div className="bn-faq">
        {items.map((it) => (
          <details key={it.q}>
            <summary>{it.q}</summary>
            <p>{it.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
