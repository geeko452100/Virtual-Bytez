const TRACKING_STAGES = [
  {
    status: 'Delivered',
    description: 'Package delivered to recipient',
    location: 'Portland, OR',
  },
  {
    status: 'Out for delivery',
    description: 'Out for delivery today',
    location: 'Portland, OR',
  },
  {
    status: 'In transit',
    description: 'Package is in transit',
    location: 'Sacramento, CA',
  },
  {
    status: 'At carrier facility',
    description: 'Arrived at regional facility',
    location: 'Oakland, CA',
  },
  {
    status: 'Label created',
    description: 'Shipping label created, awaiting pickup',
    location: 'San Jose, CA',
  },
]

function shiftHours(base, hoursAgo) {
  const date = new Date(base)
  date.setHours(date.getHours() - hoursAgo)
  return date.toISOString()
}

export function buildMockTracking(trackingNumber, carrier = 'ups', { stageIndex = 2 } = {}) {
  const safeStage = Math.min(Math.max(stageIndex, 0), TRACKING_STAGES.length - 1)
  const stage = TRACKING_STAGES[safeStage]
  const now = new Date()

  const activities = TRACKING_STAGES.slice(safeStage).map((entry, index) => ({
    date: shiftHours(now, index * 8),
    location: entry.location,
    description: entry.description,
    code: entry.status.slice(0, 2).toUpperCase(),
  }))

  const estimatedDelivery = new Date(now)
  estimatedDelivery.setDate(estimatedDelivery.getDate() + Math.max(safeStage, 1))

  return {
    trackingNumber,
    carrier,
    status: stage.status,
    statusCode: stage.status.slice(0, 2).toUpperCase(),
    estimatedDelivery: safeStage === 0 ? null : estimatedDelivery.toISOString().slice(0, 10),
    activities,
    lastUpdated: now.toISOString(),
    demo: true,
    demoStage: safeStage,
  }
}

export function advanceMockTracking(existing) {
  if (!existing?.trackingNumber) return null

  const nextStage = Math.max(0, (existing.demoStage ?? 2) - 1)
  return buildMockTracking(existing.trackingNumber, existing.carrier ?? 'ups', {
    stageIndex: nextStage,
  })
}
