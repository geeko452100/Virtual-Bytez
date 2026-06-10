import { useEffect, useState } from 'react'
import { deleteProduct, fetchAllOrders, fetchProducts, updateOrderStatus, upsertProduct } from '../api/products'
import {
  shipOrderWithTracking,
} from '../api/tracking'
import { useProducts } from '../hooks/useProducts'
import { seedProducts } from '../data/products'
import { formatPrice } from '../utils/pricing'
import AdminProductForm from '../components/admin/AdminProductForm'
import OrderTrackingPanel from '../components/orders/OrderTrackingPanel'
import Button from '../components/ui/Button'

const ORDER_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'cancelled']
const CARRIERS = ['ups', 'usps', 'fedex', 'other']

export default function AdminPage() {
  const { reloadAll } = useProducts()
  const [adminProducts, setAdminProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [trackingDrafts, setTrackingDrafts] = useState({})
  const [shippingOrderId, setShippingOrderId] = useState(null)

  useEffect(() => {
    fetchAllOrders().then(({ data }) => setOrders(data ?? []))
    fetchProducts({ includeInactive: true }).then(({ data }) => setAdminProducts(data ?? []))
  }, [])

  function refreshAdminProducts() {
    fetchProducts({ includeInactive: true }).then(({ data }) => setAdminProducts(data ?? []))
    reloadAll()
  }

  function getTrackingDraft(order) {
    return trackingDrafts[order.id] ?? {
      trackingNumber: order.tracking_number ?? '',
      carrier: order.carrier ?? 'ups',
    }
  }

  function updateTrackingDraft(orderId, patch) {
    setTrackingDrafts((prev) => {
      const order = orders.find((item) => item.id === orderId)
      const current = prev[orderId] ?? {
        trackingNumber: order?.tracking_number ?? '',
        carrier: order?.carrier ?? 'ups',
      }
      return {
        ...prev,
        [orderId]: { ...current, ...patch },
      }
    })
  }

  function updateOrderInState(orderId, patch) {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, ...patch } : order)))
  }

  async function handleSaveProduct(product) {
    const { error } = await upsertProduct(product)
    if (error) {
      setMessage(error.message)
      return
    }
    setMessage('Product saved.')
    setShowForm(false)
    setEditingProduct(null)
    refreshAdminProducts()
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this product?')) return
    const { error } = await deleteProduct(id)
    if (error) setMessage(error.message)
    else {
      setMessage('Product deleted.')
      refreshAdminProducts()
    }
  }

  async function handleStatusChange(orderId, status) {
    const { error } = await updateOrderStatus(orderId, status)
    if (error) setMessage(error.message)
    else updateOrderInState(orderId, { status })
  }

  async function handleShipOrder(order) {
    const draft = getTrackingDraft(order)
    if (!draft.trackingNumber.trim()) {
      setMessage('Enter a tracking number before marking the order as shipped.')
      return
    }

    setShippingOrderId(order.id)
    setMessage('')

    const { data, error } = await shipOrderWithTracking(order.id, draft)
    if (error) {
      setMessage(error.message)
      setShippingOrderId(null)
      return
    }

    updateOrderInState(order.id, data)
    setMessage('Order marked as shipped with tracking.')
    setShippingOrderId(null)
  }

  function handleTrackingUpdated(orderId, tracking) {
    updateOrderInState(orderId, {
      tracking_status: tracking,
      tracking_updated_at: tracking?.lastUpdated ?? new Date().toISOString(),
    })
  }

  function startNewProduct() {
    setEditingProduct({
      id: '',
      name: '',
      era: '',
      category: 'computers',
      basePrice: 0,
      description: '',
      condition: '',
      conditionGrade: 7,
      imageUrl: '',
      stockCount: 0,
      active: true,
      customizationOptions: [],
    })
    setShowForm(true)
  }

  function seedCatalog() {
    setEditingProduct(null)
    setShowForm(false)
    Promise.all(seedProducts.map((p) => upsertProduct(p))).then(() => {
      setMessage('Seed catalog uploaded to Supabase.')
      refreshAdminProducts()
    })
  }

  return (
    <div className="text-left">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1>Admin</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={startNewProduct}>
            New product
          </Button>
          <Button onClick={seedCatalog}>
            Upload seed catalog
          </Button>
        </div>
      </header>

      {message && <p className="text-sm text-phosphor">{message}</p>}

      {showForm && editingProduct && (
        <AdminProductForm
          initial={editingProduct}
          onSave={handleSaveProduct}
          onCancel={() => {
            setShowForm(false)
            setEditingProduct(null)
          }}
        />
      )}

      <section className="mb-8">
        <h2>Products ({adminProducts.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-border px-3 py-2.5 text-left">ID</th>
                <th className="border-b border-border px-3 py-2.5 text-left">Name</th>
                <th className="border-b border-border px-3 py-2.5 text-left">Price</th>
                <th className="border-b border-border px-3 py-2.5 text-left">Stock</th>
                <th className="border-b border-border px-3 py-2.5 text-left">Grade</th>
                <th className="border-b border-border px-3 py-2.5 text-left">Active</th>
                <th className="border-b border-border px-3 py-2.5 text-left" />
              </tr>
            </thead>
            <tbody>
              {adminProducts.map((product) => (
                <tr key={product.id}>
                  <td className="border-b border-border px-3 py-2.5"><code>{product.id}</code></td>
                  <td className="border-b border-border px-3 py-2.5">{product.name}</td>
                  <td className="border-b border-border px-3 py-2.5">{formatPrice(product.basePrice)}</td>
                  <td className="border-b border-border px-3 py-2.5">{product.stockCount}</td>
                  <td className="border-b border-border px-3 py-2.5">{product.conditionGrade ?? '—'}/10</td>
                  <td className="border-b border-border px-3 py-2.5">{product.active === false ? 'No' : 'Yes'}</td>
                  <td className="border-b border-border px-3 py-2.5">
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingProduct(product)
                          setShowForm(true)
                        }}
                      >
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="mt-0 w-auto" onClick={() => handleDelete(product.id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2>Orders ({orders.length})</h2>
        {orders.length === 0 ? (
          <p className="py-8 text-text-muted">No orders yet.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {orders.map((order) => {
              const draft = getTrackingDraft(order)
              const isShipping = shippingOrderId === order.id

              return (
                <li key={order.id} className="panel rounded-[10px] p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <code>{order.id.slice(0, 8)}…</code>
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    <strong>{formatPrice(Number(order.subtotal))}</strong>
                  </div>
                  <label className="my-2 flex items-center gap-2 text-sm text-text-muted">
                    Status
                    <select
                      className="rounded-md border border-border bg-bg px-2 py-1.5 text-text-h"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>

                  <div className="my-3 flex flex-wrap items-end gap-2 text-sm">
                    <label className="flex flex-col gap-1 text-text-muted">
                      Carrier
                      <select
                        className="rounded-md border border-border bg-bg px-2 py-1.5 text-text-h"
                        value={draft.carrier}
                        onChange={(e) => updateTrackingDraft(order.id, { carrier: e.target.value })}
                      >
                        {CARRIERS.map((carrier) => (
                          <option key={carrier} value={carrier}>{carrier.toUpperCase()}</option>
                        ))}
                      </select>
                    </label>
                    <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-text-muted">
                      Tracking number
                      <input
                        className="rounded-md border border-border bg-bg px-2 py-1.5 text-text-h"
                        value={draft.trackingNumber}
                        onChange={(e) => updateTrackingDraft(order.id, { trackingNumber: e.target.value })}
                        placeholder="1Z999AA10123456784"
                      />
                    </label>
                    <Button
                      size="sm"
                      onClick={() => handleShipOrder(order)}
                      disabled={isShipping}
                    >
                      {isShipping ? 'Shipping…' : 'Save tracking & ship'}
                    </Button>
                  </div>

                  <OrderTrackingPanel
                    order={order}
                    onTrackingUpdated={handleTrackingUpdated}
                  />

                  <ul className="m-0 list-disc pl-4 text-sm text-text-muted">
                    {(order.order_items ?? []).map((item) => (
                      <li key={item.id}>
                        {item.product_name} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
