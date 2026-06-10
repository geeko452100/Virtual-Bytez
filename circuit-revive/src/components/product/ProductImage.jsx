import { cn } from '../../lib/cn'

const CATEGORY_ICONS = {
  computers: '💻',
  audio: '🎧',
  gaming: '🎮',
  peripherals: '⌨️',
  cameras: '📷',
}

export default function ProductImage({ product, className = '' }) {
  const fallback = CATEGORY_ICONS[product.category] ?? '📦'

  if (product.imageUrl) {
    return (
      <img
        src={product.imageUrl}
        alt={product.name}
        className={cn('h-full w-full rounded-[inherit] object-cover', className)}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
          e.currentTarget.nextElementSibling?.classList.remove('hidden')
        }}
      />
    )
  }

  return (
    <span className={cn('text-[2.5rem]', className)} aria-hidden="true">
      {fallback}
    </span>
  )
}

export function ProductImageWithFallback({ product, className = '' }) {
  const fallback = CATEGORY_ICONS[product.category] ?? '📦'

  return (
    <div className={cn('relative grid min-h-[140px] w-full place-items-center', className)}>
      {product.imageUrl ? (
        <>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full rounded-[inherit] object-cover max-md:max-h-40 max-md:object-contain"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.classList.add('hidden')
            }}
          />
          <span className="hidden text-[2.5rem]" aria-hidden="true">
            {fallback}
          </span>
        </>
      ) : (
        <span className="text-[2.5rem] max-md:text-5xl" aria-hidden="true">
          {fallback}
        </span>
      )}
    </div>
  )
}
