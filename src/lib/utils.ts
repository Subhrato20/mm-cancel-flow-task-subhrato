import { createHash } from 'crypto'

/**
 * Deterministically assigns A/B test variant based on user ID
 * Uses cryptographically secure hash to ensure 50/50 split
 */
export function assignVariant(userId: string): 'A' | 'B' {
  const hash = createHash('sha256').update(userId).digest('hex')
  const lastChar = hash.charAt(hash.length - 1)
  const decimal = parseInt(lastChar, 16)
  return decimal % 2 === 0 ? 'A' : 'B'
}

/**
 * Validates cancellation reason input
 */
export function validateCancellationReason(reason: string): boolean {
  const validReasons = [
    'Too expensive',
    'Not using it enough',
    'Found a better alternative',
    'Technical issues',
    'Customer service problems',
    'Other'
  ]
  return validReasons.includes(reason)
}

/**
 * Validates user ID format (UUID)
 */
export function validateUserId(userId: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(userId)
}

/**
 * Validates subscription ID format
 */
export function validateSubscriptionId(subscriptionId: string): boolean {
  return subscriptionId.length > 0 && subscriptionId.length <= 100
}

/**
 * Sanitizes user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 1000) // Limit length
}

/**
 * Formats price from cents to dollars
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

/**
 * Calculates discounted price
 */
export function calculateDiscountedPrice(currentPrice: number, discount: number): number {
  return Math.max(currentPrice - discount, 0)
}

/**
 * Generates a secure random string for CSRF tokens
 */
export function generateCSRFToken(): string {
  return createHash('sha256')
    .update(Math.random().toString() + Date.now().toString())
    .digest('hex')
    .substring(0, 32)
}

/**
 * Validates CSRF token
 */
export function validateCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken && token.length === 32
}
