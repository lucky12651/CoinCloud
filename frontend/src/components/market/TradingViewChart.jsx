import { useEffect, useRef } from 'react'
import { TV_OVERVIEW_SYMBOLS } from '../../lib/coins'

/**
 * TradingView Symbol Overview — fills parent box (use with aspect-square container)
 */
export default function TradingViewChart({ height = 520, fill = false }) {
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
      'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbols: TV_OVERVIEW_SYMBOLS,
      chartOnly: false,
      width: '100%',
      height: '100%',
      locale: 'en',
      colorTheme: 'dark',
      autosize: true,
      showVolume: false,
      showMA: false,
      hideDateRanges: false,
      hideMarketStatus: false,
      hideSymbolLogo: false,
      scalePosition: 'right',
      scaleMode: 'Normal',
      fontFamily: 'Inter, sans-serif',
      fontSize: '12',
      noTimeScale: false,
      valuesTracking: '1',
      changeMode: 'price-and-percent',
      chartType: 'area',
      maLineColor: '#ffffff',
      maLineWidth: 1,
      maLength: 9,
      fontColor: 'rgba(255, 255, 255, 0.9)',
      gridLineColor: 'rgba(255, 255, 255, 0.06)',
      backgroundColor: 'rgba(0, 0, 0, 0)',
      widgetFontColor: 'rgba(255, 255, 255, 0.9)',
      lineWidth: 2,
      lineType: 0,
      dateRanges: ['1d|1', '1m|30', '3m|60', '12m|1D', '60m|1W', 'all|1M'],
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
