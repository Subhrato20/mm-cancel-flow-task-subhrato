import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { validateUserId, validateSubscriptionId, sanitizeInput, assignVariant } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, subscriptionId } = body

    // Input validation
    if (!validateUserId(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    if (!validateSubscriptionId(subscriptionId)) {
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

    const supabase = createServerClient()

    // Check if cancellation already exists for this user
    const { data: existingCancellation } = await supabase
      .from('cancellations')
      .select('id, downsell_variant')
      .eq('user_id', sanitizedUserId)
      .single()

    if (existingCancellation) {
      // Return existing variant if cancellation already exists
      return NextResponse.json({
        id: existingCancellation.id,
        downsell_variant: existingCancellation.downsell_variant
      })
    }

    // Create new cancellation record
    const { data, error } = await supabase
      .from('cancellations')
      .insert({
        user_id: sanitizedUserId,
        subscription_id: sanitizedSubscriptionId,
        downsell_variant,
        reason: null,
        accepted_downsell: false
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create cancellation record' },
        { status: 500 }
      )
    }

    // Update subscription status
    await supabase
      .from('subscriptions')
      .update({ status: 'pending_cancellation' })
      .eq('user_id', sanitizedUserId)

    return NextResponse.json({
      id: data.id,
      downsell_variant: data.downsell_variant
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

    if (!cancellationId) {
      return NextResponse.json(
        { error: 'Cancellation ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const updateData: any = {}

    if (reason !== undefined) {
      updateData.reason = sanitizeInput(reason)
    }

    if (acceptedDownsell !== undefined) {
      updateData.accepted_downsell = Boolean(acceptedDownsell)
    }

    const { data, error } = await supabase
      .from('cancellations')
      .update(updateData)
      .eq('id', cancellationId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update cancellation record' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
