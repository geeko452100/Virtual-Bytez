import { getSupabase } from '../lib/supabase'
import { advanceMockTracking, buildMockTracking } from '../utils/mockTracking'

export async function shipOrderWithTracking(orderId, { trackingNumber, carrier = 'ups' }) {
  const supabase = getSupabase()
  if (!supabase) return { data: null, error: new Error('Supabase not configured') }

  const trimmed = trackingNumber?.trim()
  if (!trimmed) {
    return { data: null, error: new Error('Tracking number is required') }
  }

  const tracking = buildMockTracking(trimmed, carrier, { stageIndex: 2 })

  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'shipped',
      carrier,
      tracking_number: trimmed,
      shipped_at: new Date().toISOString(),
      tracking_status: tracking,
      tracking_updated_at: tracking.lastUpdated,
    })
    .eq('id', orderId)
    .select()
    .single()

  return { data, error }
}

export async function refreshOrderTracking(orderId) {
  const supabase = getSupabase()
  if (!supabase) return { data: null, error: new Error('Supabase not configured') }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('tracking_number, carrier, tracking_status')
    .eq('id', orderId)
    .single()

  if (orderError || !order?.tracking_number) {
    return { data: null, error: orderError ?? new Error('No tracking number on this order') }
  }

  const tracking = advanceMockTracking({
    trackingNumber: order.tracking_number,
    carrier: order.carrier ?? 'ups',
    demoStage: order.tracking_status?.demoStage ?? 2,
  })

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      tracking_status: tracking,
      tracking_updated_at: tracking.lastUpdated,
    })
    .eq('id', orderId)

  if (updateError) return { data: null, error: updateError }

  return { data: tracking, error: null }
}

export function getCarrierTrackingUrl(carrier, trackingNumber) {
  const number = encodeURIComponent(trackingNumber.trim())

  switch (carrier) {
    case 'ups':
      return `https://www.ups.com/track?tracknum=${number}`
    case 'usps':
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${number}`
    case 'fedex':
      return `https://www.fedex.com/fedextrack/?trknbr=${number}`
    default:
      return null
  }
}

export function formatTrackingTimestamp(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString()
}
