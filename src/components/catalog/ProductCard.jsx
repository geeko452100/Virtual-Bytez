import { Link } from 'react-router-dom'
import { formatPrice } from '../../utils/pricing'
import ConditionBadge from '../product/ConditionBadge'
import { ProductImageWithFallback } from '../product/ProductImage'

export default function ProductCard({ product }) {
  const inStock = (product.stockCount ?? 0) > 0

  return (
    <article className="panel flex flex-col overflow-hidden text-left">
      <div className="relative flex min-h-[180px] items-start justify-between border-b border-border bg-gradient-to-br from-[#1a221e] to-surface p-3">
        <ProductImageWithFallback product={product} />
        <span className="font-mono text-xs text-phosphor">{product.era}</span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <ConditionBadge grade={product.conditionGrade} condition={product.condition} />
        <p className="font-mono text-xs text-text-muted">
          {(product.customizationOptions?.length ?? 0)} custom options
          {!inStock && ' · Out of stock'}
        </p>
        <h3 className="m-0">{product.name}</h3>
        <p className="flex-1 text-[0.92rem] text-text-muted">{product.description}</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="font-mono text-accent">From {formatPrice(product.basePrice)}</span>
          <Link to={`/shop/${product.id}`} className="btn btn-primary no-underline">
            Customize
          </Link>
        </div>
      </div>
    </article>
  )
}
