'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Mock user data for demo purposes
const MOCK_USER = {
  id: '550e8400-e29b-41d4-a716-446655440002', // Changed to get Variant B
  email: 'user1@example.com',
  subscription: {
    id: 'sub_001',
    monthly_price: 2500, // $25.00 in cents
    status: 'active'
  }
}

type CancellationStep = 'confirm' | 'downsell' | 'reason' | 'special-discount' | 'complete'
type DownsellVariant = 'A' | 'B'

export default function CancellationPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<CancellationStep>('confirm')
  const [downsellVariant, setDownsellVariant] = useState<DownsellVariant>('A')
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [cancellationId, setCancellationId] = useState<string | null>(null)

  // Random A/B testing - will be overridden by server response
  useEffect(() => {
    // Set a random initial variant (will be overridden by server)
    setDownsellVariant(Math.random() < 0.5 ? 'A' : 'B')
  }, [])

  const handleConfirmCancellation = async () => {
    setIsLoading(true)
    
    try {
      // Create cancellation record via API
      const response = await fetch('/api/cancellations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: MOCK_USER.id,
          subscriptionId: MOCK_USER.subscription.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create cancellation')
      }

      const data = await response.json()
      setCancellationId(data.id)
      setDownsellVariant(data.downsell_variant)

      // Move to next step based on variant
      if (data.downsell_variant === 'A') {
        setCurrentStep('reason')
      } else {
        setCurrentStep('downsell')
      }
    } catch (error) {
      console.error('Error creating cancellation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownsellAccept = async () => {
    setIsLoading(true)
    
    try {
      // Update cancellation record via API
      const response = await fetch('/api/cancellations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancellationId,
          acceptedDownsell: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update cancellation')
      }

      // TODO: Process payment update (stub)
      console.log('Payment processing would happen here')
      
      // Redirect to profile page
      router.push('/profile')
    } catch (error) {
      console.error('Error accepting downsell:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownsellDecline = () => {
    setCurrentStep('reason')
  }

  const handleReasonSubmit = async () => {
    if (!selectedReason) return
    
    setIsLoading(true)
    
    try {
      // Update cancellation record with reason via API
      const response = await fetch('/api/cancellations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancellationId,
          reason: selectedReason,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update cancellation reason')
      }

      // Check if reason qualifies for special discount
      if (selectedReason === 'Too expensive' || selectedReason === 'Found a better alternative') {
        setCurrentStep('special-discount')
      } else {
        setCurrentStep('complete')
      }
    } catch (error) {
      console.error('Error updating cancellation reason:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = () => {
    router.push('/')
  }

  const getCurrentPrice = () => {
    return MOCK_USER.subscription.monthly_price / 100
  }

  const getDiscountedPrice = () => {
    return Math.max(getCurrentPrice() - 10, 0)
  }

  const getSpecialDiscountedPrice = () => {
    return Math.max(getCurrentPrice() * 0.5, 0) // 50% discount
  }

  const handleSpecialDiscountAccept = async () => {
    setIsLoading(true)
    
    try {
      // Update cancellation record to mark special discount as accepted
      const response = await fetch('/api/cancellations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancellationId,
          acceptedDownsell: true,
          reason: `${selectedReason} - Special 50% discount accepted`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update cancellation')
      }

      // TODO: Process payment update (stub)
      console.log('Special 50% discount payment processing would happen here')
      
      // Redirect to profile page
      router.push('/profile')
    } catch (error) {
      console.error('Error accepting special discount:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSpecialDiscountDecline = () => {
    setCurrentStep('complete')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'confirm' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              currentStep !== 'confirm' ? 'bg-red-600' : 'bg-gray-200'
            }`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'downsell' || currentStep === 'reason' || currentStep === 'special-discount' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              currentStep === 'complete' ? 'bg-red-600' : 'bg-gray-200'
            }`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'complete' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {currentStep === 'confirm' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Cancel Subscription?
              </h1>
              <p className="text-gray-600 mb-6">
                We're sorry to see you go. Your current plan is ${getCurrentPrice()}/month.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleConfirmCancellation}
                  disabled={isLoading}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Yes, Cancel My Subscription'}
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300"
                >
                  Keep My Subscription
                </button>
              </div>
            </div>
          )}

          {currentStep === 'downsell' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Wait! Special Offer
              </h1>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-lg font-semibold text-yellow-800 mb-2">
                  Get $10 off your next month!
                </p>
                <p className="text-yellow-700">
                  ${getCurrentPrice()} → ${getDiscountedPrice()}/month
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleDownsellAccept}
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Accept Offer'}
                </button>
                <button
                  onClick={handleDownsellDecline}
                  className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300"
                >
                  No Thanks, Continue Cancellation
                </button>
              </div>
            </div>
          )}

          {currentStep === 'reason' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                Help Us Improve
              </h1>
              <p className="text-gray-600 mb-6 text-center">
                Please let us know why you're cancelling so we can improve our service.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  'Too expensive',
                  'Not using it enough',
                  'Found a better alternative',
                  'Technical issues',
                  'Customer service problems',
                  'Other'
                ].map((reason) => (
                  <label key={reason} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-gray-700">{reason}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={handleReasonSubmit}
                disabled={!selectedReason || isLoading}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Complete Cancellation'}
              </button>
            </div>
          )}

          {currentStep === 'special-discount' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Special Offer Just For You!
              </h1>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <p className="text-lg font-semibold text-purple-800 mb-2">
                  Get 50% off your subscription!
                </p>
                <p className="text-purple-700 mb-2">
                  ${getCurrentPrice()} → ${getSpecialDiscountedPrice().toFixed(2)}/month
                </p>
                <p className="text-sm text-purple-600">
                  We understand your concerns and want to make it work for you.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleSpecialDiscountAccept}
                  disabled={isLoading}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Accept 50% Discount'}
                </button>
                <button
                  onClick={handleSpecialDiscountDecline}
                  className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300"
                >
                  No Thanks, Continue Cancellation
                </button>
              </div>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Cancellation Complete
              </h1>
              <p className="text-gray-600 mb-6">
                Your subscription has been cancelled. You'll continue to have access until the end of your current billing period.
              </p>
              <button
                onClick={handleComplete}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700"
              >
                Return to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
