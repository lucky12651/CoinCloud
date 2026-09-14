export function synthSpark(symbol, change) {
  const n = 12
  const seed = [...String(symbol || 'X')].reduce((a, c) => a + c.charCodeAt(0), 0)
  const dir = Number(change) >= 0 ? 1 : -1
  const mag = Math.min(4, Math.abs(Number(change) || 1) * 0.12)
  const pts = []
  let v = 16
  for (let i = 0; i < n; i++) {
    const jitter = ((seed * (i + 3)) % 10) / 10 - 0.45
    v += dir * mag + jitter * 2
    pts.push(v)
  }
  return pts
}

export default function Sparkline({ points = [], pos = true, width = 76, height = 32 }) {
  if (!points.length) return null
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1
  const pts = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * width
      const y = height - ((v - min) / span) * (height - 2) - 1
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  const color = pos ? '#3ddc84' : '#f36969'
  return (
    <svg className="spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
