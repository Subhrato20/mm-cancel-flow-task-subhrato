'use client'

import Link from 'next/link'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Offer Accepted!
            </h1>
            <p className="text-gray-600 mb-6">
              Your subscription has been updated with the $10 discount. You'll be charged $15/month for your next billing cycle.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Subscription Details</h3>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-medium">Plan:</span> Premium</p>
                <p><span className="font-medium">Current Price:</span> $15/month (discounted)</p>
                <p><span className="font-medium">Status:</span> Active</p>
                <p><span className="font-medium">Next Billing:</span> December 1, 2024</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Account Details</h3>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-medium">Email:</span> user1@example.com</p>
                <p><span className="font-medium">Member Since:</span> January 2024</p>
                <p><span className="font-medium">Account ID:</span> 550e8400-e29b-41d4-a716-446655440001</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
