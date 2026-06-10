import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import Stripe from 'https://esm.sh/stripe@17.7.0?target=deno'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

async function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return { user: null, error: 'Missing authorization header' }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } },
  )

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { user: null, error: 'Unauthorized' }

  return { user, error: null }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      return jsonResponse({ error: 'Stripe is not configured on the server' }, 503)
    }

    const { user, error: authError } = await getAuthenticatedUser(req)
    if (authError || !user) {
      return jsonResponse({ error: authError ?? 'Unauthorized' }, 401)
    }

    const { orderId, successUrl, cancelUrl } = await req.json()
    if (!orderId || !successUrl || !cancelUrl) {
      return jsonResponse({ error: 'orderId, successUrl, and cancelUrl are required' }, 400)
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (orderError || !order) {
      return jsonResponse({ error: 'Order not found' }, 404)
    }

    if (order.status !== 'pending') {
      return jsonResponse({ error: 'This order is not awaiting payment' }, 400)
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })
    const lineItems = (order.order_items ?? []).map((item: {
      product_name: string
      unit_price: number
      quantity: number
    }) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.product_name },
        unit_amount: Math.round(Number(item.unit_price) * 100),
      },
      quantity: item.quantity,
    }))

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: orderId,
      metadata: {
        order_id: orderId,
        user_id: user.id,
      },
    })

    await admin
      .from('orders')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', orderId)

    return jsonResponse({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return jsonResponse({ error: message }, 500)
  }
})
