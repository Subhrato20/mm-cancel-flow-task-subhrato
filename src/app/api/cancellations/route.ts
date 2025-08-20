import { NextRequest, NextResponse } from 'next/server'

// Mock data storage for demo purposes
const mockCancellations = new Map()

// Clear mock data every 5 minutes for testing
setInterval(() => {
  mockCancellations.clear()
  console.log('Mock data cleared for testing')
}, 5 * 60 * 1000)

// Random A/B testing function
function assignVariant(userId: string): 'A' | 'B' {
  // Use Math.random() for true randomization
  return Math.random() < 0.5 ? 'A' : 'B'
}

// Simple validation functions
function validateUserId(userId: string): boolean {
  return userId && userId.length > 0
}

function validateSubscriptionId(subscriptionId: string): boolean {
  return subscriptionId && subscriptionId.length > 0
}

function sanitizeInput(input: string): string {
  return input ? input.replace(/[<>]/g, '').trim().substring(0, 1000) : ''
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, subscriptionId } = body

    console.log('Received request:', { userId, subscriptionId })

    // Input validation
    if (!validateUserId(userId)) {
      console.log('Invalid user ID:', userId)
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    if (!validateSubscriptionId(subscriptionId)) {
      console.log('Invalid subscription ID:', subscriptionId)
      return NextResponse.json(
        { error: 'Invalid subscription ID' },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const sanitizedUserId = sanitizeInput(userId)
    const sanitizedSubscriptionId = sanitizeInput(subscriptionId)

    // Assign A/B test variant
    const downsellVariant = assignVariant(sanitizedUserId)

    console.log('Assigned variant:', downsellVariant)

    // Check if cancellation already exists for this user
    if (mockCancellations.has(sanitizedUserId)) {
      const existingCancellation = mockCancellations.get(sanitizedUserId)
      console.log('Found existing cancellation:', existingCancellation)
      return NextResponse.json({
        id: existingCancellation.id,
        downsell_variant: existingCancellation.downsell_variant
      })
    }

    // Create new cancellation record (mock)
    const mockId = `cancel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const cancellationData = {
      id: mockId,
      user_id: sanitizedUserId,
      subscription_id: sanitizedSubscriptionId,
      downsell_variant: downsellVariant,
      reason: null,
      accepted_downsell: false,
      created_at: new Date().toISOString()
    }

    // Store in mock data
    mockCancellations.set(sanitizedUserId, cancellationData)

    console.log('Mock cancellation created:', cancellationData)

    return NextResponse.json({
      id: cancellationData.id,
      downsell_variant: cancellationData.downsell_variant
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { cancellationId, reason, acceptedDownsell } = body

    console.log('PUT request:', { cancellationId, reason, acceptedDownsell })

    if (!cancellationId) {
      return NextResponse.json(
        { error: 'Cancellation ID is required' },
        { status: 400 }
      )
    }

    // Find the cancellation in mock data
    let foundCancellation = null
    for (const [userId, cancellation] of mockCancellations.entries()) {
      if (cancellation.id === cancellationId) {
        foundCancellation = cancellation
        break
      }
    }

    if (!foundCancellation) {
      return NextResponse.json(
        { error: 'Cancellation not found' },
        { status: 404 }
      )
    }

    // Update the cancellation
    if (reason !== undefined) {
      foundCancellation.reason = sanitizeInput(reason)
    }

    if (acceptedDownsell !== undefined) {
      foundCancellation.accepted_downsell = Boolean(acceptedDownsell)
    }

    console.log('Mock cancellation updated:', foundCancellation)

    return NextResponse.json(foundCancellation)

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
