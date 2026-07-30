import { cn } from '../lib/utils'

/**
 * CoinCloud brand mark — uses the same favicon asset site-wide.
 */
export default function BrandLogo({
  size = 32,
  className = '',
  rounded = 'rounded-lg',
  withBg = false,
}) {
  return (
    <img
      src="/favicon.png"
      alt="CoinCloud"
      width={size}
      height={size}
      className={cn(
        'object-contain shrink-0',
        rounded,
        withBg && 'bg-white p-0.5',
        className
      )}
      draggable={false}
    />
  )
}
