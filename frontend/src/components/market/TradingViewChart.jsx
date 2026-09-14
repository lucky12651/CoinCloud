import { useEffect, useRef } from 'react'
import { TV_OVERVIEW_SYMBOLS, TV_SYMBOLS } from '../../lib/coins'

/**
 * TradingView chart.
 * mode="advanced" — candlestick (Vortex dashboard)
 * default — symbol overview widget
 */
export default function TradingViewChart({
  height = 520,
  fill = false,
  mode = 'overview',
  symbol = 'BTC',
  interval = '60',
}) {
  const containerRef = useRef(null)
  const tvSymbol = TV_SYMBOLS[symbol] || symbol || 'BITSTAMP:BTCUSD'

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
    script.type = 'text/javascript'
    script.async = true

    if (mode === 'advanced') {
      script.src =
        'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: tvSymbol,
        interval,
        timezone: 'Etc/UTC',
        theme: 'dark',
        style: '1',
        locale: 'en',
        backgroundColor: '#111114',
        gridColor: 'rgba(28, 28, 34, 1)',
        hide_top_toolbar: true,
        hide_legend: true,
        allow_symbol_change: false,
        calendar: false,
        hide_volume: true,
        support_host: 'https://www.tradingview.com',
      })
    } else {
      script.src =
        'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js'
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
        maLineColor: '#d7f24c',
        maLineWidth: 1,
        maLength: 9,
        fontColor: 'rgba(245, 245, 247, 0.9)',
        gridLineColor: 'rgba(35, 35, 41, 1)',
        backgroundColor: '#111114',
        widgetFontColor: 'rgba(245, 245, 247, 0.9)',
        lineWidth: 2,
        lineType: 0,
        dateRanges: ['1d|1', '1m|30', '3m|60', '12m|1D', '60m|1W', 'all|1M'],
      })
    }
    el.appendChild(script)

    return () => {
      el.innerHTML = ''
    }
  }, [mode, tvSymbol, interval])

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
