import { useEffect, useRef } from 'react'

/**
 * TradingView Timeline (news) — fills parent box next to chart
 */
export default function TradingViewNews({ height = 420, fill = false }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    el.innerHTML = ''
    const widget = document.createElement('div')
    widget.className = 'tradingview-widget-container__widget'
    widget.style.height = '100%'
    widget.style.width = '100%'
    el.appendChild(widget)

    const script = document.createElement('script')
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      feedMode: 'all_symbols',
      isTransparent: true,
      displayMode: 'regular',
      width: '100%',
      height: '100%',
      colorTheme: 'dark',
      locale: 'en',
    })
    el.appendChild(script)

    return () => {
      el.innerHTML = ''
    }
  }, [])

  return (
    <div
      className="tradingview-widget-container h-full w-full overflow-hidden"
      style={
        fill
          ? { height: '100%', width: '100%', minHeight: 0 }
          : { height, width: '100%' }
      }
      ref={containerRef}
    />
  )
}
