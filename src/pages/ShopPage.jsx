import { useMemo, useState } from 'react'
import { CATEGORIES } from '../data/products'
import { useProducts } from '../hooks/useProducts'
import { isSupabaseConfigured } from '../lib/config'
import ProductGrid from '../components/catalog/ProductGrid'
import { cn } from '../lib/cn'

export default function ShopPage() {
  const { products, loading, error, source } = useProducts()
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products
    return products.filter((p) => p.category === activeCategory)
  }, [products, activeCategory])

  if (loading) return <p className="py-8 text-text-muted">Loading catalog…</p>

  return (
    <section>
      <header className="mb-6 text-left">
        <h1>Shop vintage tech</h1>
        <p className="mt-2 text-text-muted">Select a category, then customize any item to match your setup.</p>
        {error && source === 'local' && isSupabaseConfigured && (
          <p className="mt-3 rounded-lg border border-phosphor/35 bg-phosphor/10 px-4 py-3 text-sm text-phosphor">
            {error}
          </p>
        )}
      </header>

      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Product categories">
        <button
          type="button"
          role="tab"
          aria-selected={activeCategory === 'all'}
          className={cn('filter-chip', activeCategory === 'all' && 'filter-chip-active')}
          onClick={() => setActiveCategory('all')}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={activeCategory === cat.id}
            className={cn('filter-chip', activeCategory === cat.id && 'filter-chip-active')}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <ProductGrid products={filteredProducts} />
    </section>
  )
}
