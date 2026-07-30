import { useEffect, useRef } from 'react'

/** TradingView Market Overview — crypto tab */
export default function MarketOverview({ height = 340 }) {
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
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      colorTheme: 'dark',
      dateRange: '12M',
      showChart: true,
      locale: 'en',
      width: '100%',
      height: '100%',
      largeChartUrl: '',
      isTransparent: true,
      showSymbolLogo: true,
      showFloatingTooltip: true,
      plotLineColorGrowing: 'rgba(255, 255, 255, 0.8)',
      plotLineColorFalling: 'rgba(255, 255, 255, 0.35)',
      gridLineColor: 'rgba(255, 255, 255, 0.06)',
      scaleFontColor: 'rgba(255, 255, 255, 0.55)',
      belowLineFillColorGrowing: 'rgba(255, 255, 255, 0.08)',
      belowLineFillColorFalling: 'rgba(255, 255, 255, 0.03)',
      symbolActiveColor: 'rgba(255, 255, 255, 0.08)',
      tabs: [
        {
          title: 'Crypto',
          symbols: [
            { s: 'BITSTAMP:BTCUSD', d: 'Bitcoin' },
            { s: 'BITSTAMP:ETHUSD', d: 'Ethereum' },
            { s: 'BINANCE:DOGEUSDT', d: 'Dogecoin' },
            { s: 'BITSTAMP:LTCUSD', d: 'Litecoin' },
            { s: 'BINANCE:SOLUSDT', d: 'Solana' },
            { s: 'BINANCE:XRPUSDT', d: 'XRP' },
            { s: 'BINANCE:BNBUSDT', d: 'BNB' },
            { s: 'CRYPTOCAP:USDT', d: 'Tether' },
          ],
        },
      ],
    })
    el.appendChild(script)
    return () => {
      el.innerHTML = ''
    }
  }, [])

  return (
    <div
      className="tradingview-widget-container h-full w-full overflow-hidden rounded-2xl"
      style={{ height }}
      ref={containerRef}
    />
  )
}
