export default function Change({ value, className = 'wl-change' }) {
  const n = Number(value)
  const pos = !Number.isFinite(n) ? true : n >= 0
  const label = Number.isFinite(n) ? `${Math.abs(n).toFixed(2)}%` : '—'
  return (
    <div className={`${className} ${pos ? 'pos' : 'neg'}`}>
      {pos ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 15l6-6 4 4 6-8" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 9l6 6 4-4 6 8" />
        </svg>
      )}
      {label}
    </div>
  )
}
