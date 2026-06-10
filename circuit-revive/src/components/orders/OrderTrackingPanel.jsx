import { useState } from 'react'
import {
  formatTrackingTimestamp,
  getCarrierTrackingUrl,
  refreshOrderTracking,
} from '../../api/tracking'
import Button from '../ui/Button'

export default function OrderTrackingPanel({ order, onTrackingUpdated, showRefresh = true }) {
  const [refreshing, setRefreshing] = useState(false)
  const [refreshError, setRefreshError] = useState('')

  const tracking = order.tracking_status
  const trackingUrl = order.tracking_number
    ? getCarrierTrackingUrl(order.carrier ?? 'ups', order.tracking_number)
    : null

  async function handleRefresh() {
    setRefreshing(true)
    setRefreshError('')

    const { data, error } = await refreshOrderTracking(order.id)
    if (error) {
      setRefreshError(error.message)
    } else if (data && onTrackingUpdated) {
      onTrackingUpdated(order.id, data)
    }

    setRefreshing(false)
  }

  if (!order.tracking_number) return null

  return (
    <div className="mt-3 rounded-lg border border-border/80 bg-surface-raised/60 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium text-text-h">Shipment</span>
        <code>{order.tracking_number}</code>
        {(order.carrier ?? 'ups').toUpperCase()}
      </div>

      {trackingUrl && (
        <p className="mb-2 text-sm">
          <a href={trackingUrl} target="_blank" rel="noopener noreferrer">
            Track on {(order.carrier ?? 'ups').toUpperCase()}
          </a>
        </p>
      )}

      {tracking && (
        <div className="mb-2 text-sm text-text-muted">
          <p className="text-text-h">{tracking.status}</p>
          {tracking.estimatedDelivery && (
            <p>Estimated delivery: {tracking.estimatedDelivery}</p>
          )}
          {order.tracking_updated_at && (
            <p>Updated: {formatTrackingTimestamp(order.tracking_updated_at)}</p>
          )}
        </div>
      )}

      {tracking?.activities?.length > 0 && (
        <ul className="m-0 list-none space-y-2 border-t border-border/60 pt-2 text-sm text-text-muted">
          {tracking.activities.map((activity, index) => (
            <li key={`${activity.date}-${activity.description}-${index}`}>
              <div className="text-text-h">{activity.description || 'Update'}</div>
              {(activity.location || activity.date) && (
                <div>
                  {[activity.location, formatTrackingTimestamp(activity.date)].filter(Boolean).join(' · ')}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {showRefresh && (order.carrier ?? 'ups') === 'ups' && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? 'Refreshing…' : 'Refresh tracking'}
          </Button>
          {refreshError && <span className="text-sm text-danger">{refreshError}</span>}
        </div>
      )}
    </div>
  )
}
