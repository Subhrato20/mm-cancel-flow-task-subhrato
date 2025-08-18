# Migrate Mate - Subscription Cancellation Flow

A fully-functional subscription cancellation flow with A/B testing, built with Next.js, TypeScript, and Supabase.

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS 4 for responsive design
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **A/B Testing**: Deterministic variant assignment based on user ID

### Key Features Implemented

#### 1. Progressive Cancellation Flow
- **Step 1**: Confirmation screen with current subscription details
- **Step 2**: A/B testing - Variant A (no downsell) or Variant B ($10 discount offer)
- **Step 3**: Reason selection (if downsell declined or Variant A)
- **Step 4**: Completion confirmation

#### 2. Deterministic A/B Testing
- Uses cryptographically secure SHA-256 hash of user ID
- Ensures 50/50 split with consistent assignment per user
- Variant B offers $10 discount: $25 → $15, $29 → $19
- Accepting downsell redirects to profile page
- Declining continues to reason selection

#### 3. Data Persistence & Security
- **Row Level Security (RLS)** policies on all tables
- Input validation and sanitization for XSS protection
- Secure API routes with proper error handling
- Cancellation records track: user_id, subscription_id, downsell_variant, reason, accepted_downsell

#### 4. Mobile-First Responsive Design
- Pixel-perfect implementation on mobile and desktop
- Progress indicators and intuitive navigation
- Accessible form controls and clear call-to-actions

## Security Implementation

### Row Level Security Policies
```sql
-- Users can only access their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Subscription access control
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Cancellation record protection
CREATE POLICY "Users can insert own cancellations" ON cancellations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Input Validation & Sanitization
- UUID format validation for user IDs
- Reason selection from predefined list
- Input sanitization to prevent XSS attacks
- Length limits and type checking

### API Security
- Server-side validation for all endpoints
- Proper error handling without information leakage
- CSRF protection through secure token validation

## A/B Testing Approach

### Deterministic Assignment
```typescript
export function assignVariant(userId: string): 'A' | 'B' {
  const hash = createHash('sha256').update(userId).digest('hex')
  const lastChar = hash.charAt(hash.length - 1)
  const decimal = parseInt(lastChar, 16)
  return decimal % 2 === 0 ? 'A' : 'B'
}
```

### Variant Persistence
- Variant assigned on first cancellation attempt
- Stored in `cancellations.downsell_variant` field
- Reused on subsequent visits (never re-randomized)
- Supports analytics and conversion tracking

## Database Schema

### Core Tables
```sql
-- Users table with UUID primary key
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions with status tracking
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  monthly_price INTEGER NOT NULL, -- Price in USD cents
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_cancellation', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cancellation records with A/B testing data
CREATE TABLE cancellations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  downsell_variant TEXT NOT NULL CHECK (downsell_variant IN ('A', 'B')),
  reason TEXT,
  accepted_downsell BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Docker Desktop (for local Supabase)
- Supabase CLI

### Installation
```bash
# Clone repository
git clone [repository-url]
cd mmtht

# Install dependencies
npm install

# Start local Supabase
npm run db:setup

# Start development server
npm run dev
```

### Environment Setup
The application uses local Supabase by default with these credentials:
- URL: `http://localhost:54321`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## API Endpoints

### POST /api/cancellations
Creates new cancellation record with A/B variant assignment
```json
{
  "userId": "uuid",
  "subscriptionId": "string"
}
```

### PUT /api/cancellations
Updates cancellation record (reason or downsell acceptance)
```json
{
  "cancellationId": "uuid",
  "reason": "string",
  "acceptedDownsell": boolean
}
```

## Testing the Flow

1. **Home Page**: Visit `http://localhost:3000`
2. **Start Cancellation**: Click "Start Cancellation Flow"
3. **A/B Testing**: Experience different flows based on user ID
4. **Variant A**: Direct to reason selection
5. **Variant B**: See $10 discount offer first

## Future Enhancements

- Payment processing integration (currently stubbed)
- Email notifications for cancellation events
- Analytics dashboard for A/B test results
- User authentication system
- Advanced segmentation for A/B testing

## Performance & Scalability

- Server-side rendering for SEO and performance
- Optimized database queries with proper indexing
- Efficient A/B testing with minimal database calls
- Responsive design for all device sizes

---

**Note**: This implementation focuses on core functionality. Payment processing, email notifications, and user authentication are marked as out of scope per requirements.
