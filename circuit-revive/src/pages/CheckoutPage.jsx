import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createOrder } from '../api/orders'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { formatPrice, summarizeSelections } from '../utils/pricing'
import Button from '../components/ui/Button'

const emptyAddress = {
  name: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [address, setAddress] = useState({
    ...emptyAddress,
    name: profile?.full_name ?? '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (items.length === 0) {
    return (
      <div className="text-left">
        <h1>Checkout</h1>
        <p className="py-8 text-text-muted">Your cart is empty.</p>
        <Link to="/shop" className="btn btn-primary no-underline">Browse shop</Link>
      </div>
    )
  }

  function updateField(field, value) {
    setAddress((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const { data, error: orderError } = await createOrder({
      items,
      subtotal,
      shippingAddress: address,
    })

    setSubmitting(false)

    if (orderError) {
      setError(orderError.message)
      return
    }

    clearCart()
    navigate(`/account?order=${data.id}`)
  }

  return (
    <div className="text-left">
      <h1>Checkout</h1>
      <p className="mb-6 text-text-muted">Ordering as {user?.email}</p>

      <div className="grid items-start gap-6 max-md:grid-cols-1 md:grid-cols-[1fr_320px]">
        <form className="panel p-5" onSubmit={handleSubmit}>
          <h2>Shipping address</h2>
          <label className="form-label">
            Full name
            <input className="form-input" required value={address.name} onChange={(e) => updateField('name', e.target.value)} />
          </label>
          <label className="form-label">
            Address line 1
            <input className="form-input" required value={address.line1} onChange={(e) => updateField('line1', e.target.value)} />
          </label>
          <label className="form-label">
            Address line 2
            <input className="form-input" value={address.line2} onChange={(e) => updateField('line2', e.target.value)} />
          </label>
          <div className="form-row">
            <label className="form-label">
              City
              <input className="form-input" required value={address.city} onChange={(e) => updateField('city', e.target.value)} />
            </label>
            <label className="form-label">
              State
              <input className="form-input" required value={address.state} onChange={(e) => updateField('state', e.target.value)} />
            </label>
            <label className="form-label">
              ZIP
              <input className="form-input" required value={address.postalCode} onChange={(e) => updateField('postalCode', e.target.value)} />
            </label>
          </div>
          <label className="form-label">
            Country
            <input className="form-input" required value={address.country} onChange={(e) => updateField('country', e.target.value)} />
          </label>

          {error && <p className="text-sm text-danger">{error}</p>}

          <section className="mb-5 rounded-lg border border-border/80 bg-surface-raised/40 p-4">
            <h3 className="mb-2 text-base">Payment</h3>
            <p className="text-sm leading-relaxed text-text-muted">
              Every custom build is reviewed before billing. After we confirm your configuration
              and parts availability, we&apos;ll email an invoice with payment instructions to{' '}
              <strong className="text-text">{user?.email}</strong>. Your order remains{' '}
              <span className="status-pill status-pill-pending inline-block px-2 py-0.5 text-xs">pending</span>{' '}
              until payment is received.
            </p>
          </section>

          <Button type="submit" variant="primary" size="lg" disabled={submitting}>
            {submitting ? 'Submitting order…' : `Submit order — ${formatPrice(subtotal)}`}
          </Button>
          <p className="mt-3 text-sm text-text-muted">
            No payment is collected on this site. You&apos;ll receive an invoice by email to complete your purchase.
          </p>
        </form>

        <aside className="panel p-5">
          <h2>Order summary</h2>
          <ul className="m-0 mb-4 list-none p-0">
            {items.map((item) => {
              const summary = summarizeSelections(item.product, item.selections)
              return (
                <li key={item.lineId} className="border-b border-border py-2.5 text-sm">
                  <strong>{item.product.name}</strong> × {item.quantity}
                  <span>{formatPrice(item.lineTotal)}</span>
                  {summary.length > 0 && (
                    <ul className="mt-1 mb-0 list-disc pl-4 text-sm text-text-muted">
                      {summary.map((line) => (
                        <li key={`${line.option}-${line.value}`}>
                          {line.option}: {line.value}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
          <div className="flex justify-between font-mono font-bold text-accent">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </aside>
      </div>
    </div>
  )
}
