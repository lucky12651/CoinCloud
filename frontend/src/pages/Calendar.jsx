import { useEffect, useRef } from 'react'
import BinancePage from '../components/layout/BinancePage'

export default function Calendar() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.innerHTML = ''
    const widget = document.createElement('div')
    widget.className = 'tradingview-widget-container__widget'
    widget.style.height = '100%'
    widget.style.width = '100%'
    el.appendChild(widget)
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      colorTheme: 'dark',
      isTransparent: true,
      locale: 'en',
      importanceFilter: '-1,0,1',
      currencyFilter: 'USD,EUR,GBP,JPY,CNY',
      width: '100%',
      height: '100%',
    })
    el.appendChild(script)
    return () => {
      el.innerHTML = ''
    }
  }, [])

  return (
    <BinancePage crumb="Calendar" title="Economic Calendar" sub="Macro events that move markets." wide>
      <div className="bn-panel" style={{ padding: 8, minHeight: 640 }}>
        <div className="tradingview-widget-container" style={{ height: 620, width: '100%' }} ref={ref} />
      </div>
    </BinancePage>
  )
}
