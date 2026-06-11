import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchProducts } from '../api/products'
import { seedProducts } from '../data/products'
import { isSupabaseConfigured } from '../lib/config'
import { ProductsContext } from './productsContext'

function useLocalFallback(reason) {
  return {
    products: seedProducts,
    source: 'local',
    error: reason,
  }
}

async function loadCatalog(includeInactive = false) {
  if (!isSupabaseConfigured) {
    return { products: seedProducts, source: 'local', error: null }
  }

  try {
    const { data, error: fetchError } = await fetchProducts({ includeInactive })

    if (fetchError) {
      console.warn('Using local catalog fallback', fetchError)
      return useLocalFallback(fetchError.message)
    }

    const products = (data ?? []).filter(Boolean)

    if (products.length === 0) {
      console.warn('Supabase catalog is empty — using local seed catalog')
      return useLocalFallback(
        'Supabase catalog is empty. Run npm run seed or use Admin → Upload seed catalog.',
      )
    }

    return { products, source: 'supabase', error: null }
  } catch (err) {
    console.warn('Catalog load failed — using local seed', err)
    return useLocalFallback(err.message || 'Failed to load catalog')
  }
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(seedProducts)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState(null)
  const [source, setSource] = useState(isSupabaseConfigured ? 'loading' : 'local')

  useEffect(() => {
    let active = true

    loadCatalog()
      .then((result) => {
        if (!active) return
        setProducts(result.products)
        setSource(result.source)
        setError(result.error)
        setLoading(false)
      })
      .catch((err) => {
        if (!active) return
        console.warn('Catalog load failed — using local seed', err)
        setProducts(seedProducts)
        setSource('local')
        setError(err.message || 'Failed to load catalog')
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const reload = useCallback(async (includeInactive = false) => {
    setLoading(true)
    const result = await loadCatalog(includeInactive)
    setProducts(result.products)
    setSource(result.source)
    setError(result.error)
    setLoading(false)
  }, [])

  const getProductById = useCallback(
    (id) => products.find((p) => p.id === id) ?? null,
    [products],
  )

  const value = useMemo(
    () => ({
      products,
      loading,
      error,
      source,
      getProductById,
      reload: () => reload(false),
      reloadAll: () => reload(true),
    }),
    [products, loading, error, source, getProductById, reload],
  )

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}
