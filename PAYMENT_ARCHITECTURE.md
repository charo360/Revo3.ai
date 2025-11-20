# Payment System Architecture - Non-Recurring Payments

## 🎯 Overview

This document outlines the architecture for implementing a **non-recurring (one-time) payment system** for Revo3.ai using Stripe. The system will use a **credit-based model** where users purchase credit packs that can be used for generating designs, repurposing content, and other premium features.

---

## 📊 System Architecture

### High-Level Flow

```
User → Select Credit Pack → Stripe Checkout → Payment Success → Webhook → Credits Added → User Dashboard
```

### Core Components

1. **Frontend (React)**
   - Credit pack selection UI
   - Stripe Checkout integration
   - Payment status tracking
   - Credit balance display

2. **Backend (Supabase Edge Functions / API Routes)**
   - Payment session creation
   - Webhook handler for payment events
   - Credit management service
   - Transaction logging

3. **Database (Supabase PostgreSQL)**
   - User credits tracking
   - Payment transactions
   - Credit packs configuration
   - Usage logs

4. **Stripe Integration**
   - Payment Intents API (for one-time payments)
   - Webhooks for payment confirmation
   - Customer management (optional)

---

## 💳 Credit-Based Model

### Credit Packs

Instead of subscriptions, users purchase credit packs:

| Pack Name | Credits | Price | Best For |
|-----------|---------|-------|----------|
| Free Starter | 10 | $0 | Try Revo3.ai for free |
| Starter Pack | 50 | $9 | Individual creators |
| Pro Pack | 200 | $29 | Professional creators (Most Popular) |
| Enterprise Pack | 1000 | $99 | Teams & agencies |

### Credit Usage

- **Thumbnail Generation**: 1 credit per design
- **Content Repurposing**: 5 credits per video analysis
- **AI Video Generation**: 10 credits per video
- **Premium Features**: Variable (TBD)

### Welcome Bonus

New users automatically receive **10 free credits** when they sign up (equivalent to the Free Starter pack). This is handled automatically via a database trigger when a new user is created in `auth.users`.

---

## 🗄️ Database Schema

### 1. `credit_packs` Table

Stores available credit pack configurations.

```sql
CREATE TABLE credit_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    credits INTEGER NOT NULL,
    price_cents INTEGER NOT NULL CHECK (price_cents >= 0), -- Price in cents (e.g., 900 = $9.00)
    stripe_price_id TEXT UNIQUE, -- Stripe Price ID for this pack (null for free pack)
    description TEXT,
    features JSONB, -- Array of features included
    is_active BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false, -- For "Most Popular" badge
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default packs
INSERT INTO credit_packs (name, credits, price_cents, description, features, is_popular, sort_order) VALUES
    ('Free Starter', 10, 0, 'Perfect for trying out Revo3.ai',
     '["10 designs", "All platform types", "Basic AI editing", "Standard resolution", "Email support"]'::jsonb, false, 1),
    ('Starter Pack', 50, 900, 'Perfect for creators just starting out', 
     '["50 designs", "All platform types", "Basic AI editing", "Standard resolution", "Email support"]'::jsonb, false, 2),
    ('Pro Pack', 200, 2900, 'For professional content creators',
     '["200 designs", "All platform types", "Advanced AI editing", "HD & 4K resolution", "Priority support", "Custom brand integration", "Bulk generation"]'::jsonb, true, 3),
    ('Enterprise Pack', 1000, 9900, 'For teams and agencies',
     '["Unlimited designs", "All platform types", "Premium AI features", "Custom resolutions", "Dedicated support", "Team collaboration", "API access", "Custom integrations"]'::jsonb, false, 4);
```

### 2. `user_credits` Table

Tracks each user's credit balance and history.

```sql
CREATE TABLE user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
    total_earned INTEGER NOT NULL DEFAULT 0, -- Total credits ever earned
    total_spent INTEGER NOT NULL DEFAULT 0, -- Total credits ever spent
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create index for fast lookups
CREATE INDEX idx_user_credits_user_id ON user_credits(user_id);
```

### 3. `credit_transactions` Table

Logs all credit additions and deductions.

```sql
CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund', 'bonus', 'expiration', 'free_trial')),
    amount INTEGER NOT NULL, -- Positive for additions, negative for deductions
    balance_after INTEGER NOT NULL, -- Balance after this transaction
    description TEXT,
    reference_id TEXT, -- Links to payment_id or usage_id
    metadata JSONB, -- Additional context (e.g., design_id, video_id)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for queries
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX idx_credit_transactions_reference_id ON credit_transactions(reference_id);
```

### 4. `payments` Table

Tracks all payment attempts and their status.

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credit_pack_id UUID NOT NULL REFERENCES credit_packs(id),
    stripe_payment_intent_id TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT, -- Optional: for customer management
    amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded')),
    credits_purchased INTEGER NOT NULL,
    credits_added BOOLEAN DEFAULT false, -- Whether credits were added to user account
    metadata JSONB, -- Additional Stripe metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
```

### 5. `credit_usage` Table (Optional)

Tracks detailed usage of credits for analytics.

```sql
CREATE TABLE credit_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES credit_transactions(id) ON DELETE CASCADE,
    feature_type TEXT NOT NULL CHECK (feature_type IN ('thumbnail', 'repurpose', 'video_generation', 'premium')),
    feature_id TEXT, -- ID of the generated design/video/etc.
    credits_used INTEGER NOT NULL,
    platform TEXT, -- e.g., 'youtube', 'tiktok'
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_credit_usage_user_id ON credit_usage(user_id);
CREATE INDEX idx_credit_usage_feature_type ON credit_usage(feature_type);
```

---

## 🔄 Payment Flow

### Step 1: User Selects Credit Pack

```
Frontend → GET /api/credit-packs → Returns available packs
```

### Step 2: Create Payment Session

```
Frontend → POST /api/payments/create-session
Body: { credit_pack_id: "uuid" }

Backend:
1. Validate user is authenticated
2. Fetch credit pack details
3. Create Stripe Payment Intent
4. Store payment record in database (status: 'pending')
5. Return client_secret to frontend
```

### Step 3: Stripe Checkout

```
Frontend:
1. Use Stripe.js to confirm payment with client_secret
2. Show loading state
3. Redirect to success page on completion
```

### Step 4: Webhook Processing

```
Stripe → POST /api/webhooks/stripe
Events handled:
- payment_intent.succeeded → Add credits to user
- payment_intent.payment_failed → Mark payment as failed
- payment_intent.canceled → Mark payment as canceled
```

### Step 5: Credit Addition

```
Webhook Handler:
1. Verify webhook signature (security)
2. Update payment status in database
3. Add credits to user_credits table
4. Create credit_transaction record
5. Update payment.credits_added = true
```

---

## 🔌 API Endpoints

### Frontend API Routes (Supabase Edge Functions or API Routes)

#### 1. `GET /api/credit-packs`
Returns all active credit packs.

**Response:**
```json
{
  "packs": [
    {
      "id": "uuid",
      "name": "Starter Pack",
      "credits": 50,
      "price_cents": 900,
      "price_display": "$9.00",
      "description": "...",
      "features": [...]
    }
  ]
}
```

#### 2. `POST /api/payments/create-session`
Creates a Stripe Payment Intent for a credit pack purchase.

**Request:**
```json
{
  "credit_pack_id": "uuid"
}
```

**Response:**
```json
{
  "client_secret": "pi_xxx_secret_xxx",
  "payment_id": "uuid",
  "amount_cents": 900,
  "credits": 50
}
```

#### 3. `GET /api/payments/:payment_id/status`
Check payment status (for polling if needed).

**Response:**
```json
{
  "status": "succeeded",
  "credits_added": true,
  "credits": 50
}
```

#### 4. `GET /api/user/credits`
Get current user's credit balance and recent transactions.

**Response:**
```json
{
  "balance": 150,
  "total_earned": 200,
  "total_spent": 50,
  "recent_transactions": [...]
}
```

#### 5. `POST /api/webhooks/stripe`
Webhook endpoint for Stripe events (handles payment confirmations).

**Security:** Must verify webhook signature using Stripe secret.

---

## 🛠️ Stripe Integration

### Setup Requirements

1. **Stripe Account Setup**
   - Create account at https://stripe.com
   - **Select "Non-recurring payments"** as primary use case
   - **Enable "Fraud protection"** (recommended for security)
   - Get API keys (Publishable Key + Secret Key)
   - Configure webhook endpoint
   - Optional: Enable "Tax collection" if you need automatic tax calculation

2. **Environment Variables**
   ```
   STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   STRIPE_SECRET_KEY=sk_test_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

3. **Stripe Products & Prices**
   - Create Products in Stripe Dashboard for each credit pack
   - Create Prices for each product (one-time payment)
   - Store Price IDs in `credit_packs.stripe_price_id`

### Implementation Options

#### Option A: Payment Intents (Recommended)
- More control over payment flow
- Better for custom UI
- Supports 3D Secure authentication

#### Option B: Checkout Session
- Simpler implementation
- Stripe-hosted checkout page
- Less customization

**Recommendation:** Use **Payment Intents** for better UX control.

---

## 🔐 Security Considerations

### 1. Webhook Signature Verification
Always verify Stripe webhook signatures to prevent fake events:

```typescript
const signature = request.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(
  payload,
  signature,
  STRIPE_WEBHOOK_SECRET
);
```

### 2. Row Level Security (RLS)
Enable RLS on all payment-related tables:

```sql
-- Users can only see their own payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
    ON payments FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only see their own credits
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credits"
    ON user_credits FOR SELECT
    USING (auth.uid() = user_id);
```

### 3. Credit Deduction Validation
- Always check balance before deducting credits
- Use database transactions to prevent race conditions
- Implement optimistic locking if needed

### 4. Payment Amount Validation
- Never trust frontend for payment amounts
- Always fetch pack price from database
- Validate amount matches Stripe Payment Intent

---

## 📱 Frontend Components

### 1. `CreditPacksSelector.tsx`
- Displays available credit packs
- Shows pricing and features
- "Buy Now" button for each pack

### 2. `PaymentCheckout.tsx`
- Integrates Stripe Elements
- Handles payment form
- Shows loading states
- Redirects on success

### 3. `CreditBalance.tsx`
- Displays current credit balance
- Shows in header/navbar
- Link to credit history

### 4. `CreditHistory.tsx`
- Lists all credit transactions
- Shows purchases and usage
- Filter by type (purchase/usage)

### 5. `PaymentSuccess.tsx`
- Success page after payment
- Shows credits added
- Link to dashboard

---

## 🔄 Credit Management Service

### Core Functions

#### 1. `addCredits(userId, amount, referenceId, description)`
Adds credits to user account.

```typescript
async function addCredits(
  userId: string,
  amount: number,
  referenceId: string,
  description: string
): Promise<void> {
  // 1. Get current balance
  // 2. Calculate new balance
  // 3. Update user_credits table (atomic operation)
  // 4. Create credit_transaction record
  // 5. Update payment.credits_added = true
}
```

#### 2. `deductCredits(userId, amount, featureType, featureId)`
Deducts credits for feature usage.

```typescript
async function deductCredits(
  userId: string,
  amount: number,
  featureType: string,
  featureId: string
): Promise<boolean> {
  // 1. Check if user has sufficient credits
  // 2. Deduct credits (atomic operation)
  // 3. Create credit_transaction record
  // 4. Create credit_usage record
  // 5. Return success/failure
}
```

#### 3. `getCreditBalance(userId)`
Gets current credit balance.

```typescript
async function getCreditBalance(userId: string): Promise<number> {
  // Query user_credits table
  // Return balance
}
```

---

## 🚨 Error Handling

### Payment Failures
- **Card declined**: Show user-friendly message, allow retry
- **Insufficient funds**: Suggest alternative payment method
- **Network error**: Retry with exponential backoff
- **Webhook failure**: Log error, implement retry mechanism

### Credit Deduction Failures
- **Insufficient credits**: Show "Buy Credits" CTA
- **Concurrent usage**: Use database transactions to prevent double-spending
- **System error**: Log error, don't charge user, allow retry

### Webhook Failures
- **Signature verification failed**: Log security event, reject webhook
- **Database error**: Retry webhook processing (Stripe will retry)
- **Duplicate webhook**: Idempotency check using `stripe_event_id`

---

## 📊 Monitoring & Analytics

### Key Metrics to Track

1. **Payment Metrics**
   - Conversion rate (visits → purchases)
   - Average order value
   - Payment success rate
   - Refund rate

2. **Credit Metrics**
   - Credits purchased per user
   - Credits used per feature
   - Average credits per user
   - Credit expiration (if implemented)

3. **Revenue Metrics**
   - Total revenue
   - Revenue by pack
   - Monthly recurring revenue (if applicable)

### Logging

- Log all payment attempts (success/failure)
- Log all credit transactions
- Log webhook events
- Monitor for suspicious activity

---

## 🧪 Testing Strategy

### Unit Tests
- Credit addition/deduction logic
- Payment validation
- Webhook signature verification

### Integration Tests
- End-to-end payment flow
- Webhook processing
- Credit balance updates

### Test Cards (Stripe Test Mode)
- `4242 4242 4242 4242` - Success
- `4000 0000 0000 0002` - Card declined
- `4000 0000 0000 9995` - Insufficient funds

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Database schema creation
- [ ] Stripe account setup
- [ ] Basic API endpoints
- [ ] Webhook handler skeleton

### Phase 2: Payment Flow (Week 2)
- [ ] Frontend credit pack selector
- [ ] Stripe Payment Intent integration
- [ ] Payment checkout UI
- [ ] Success/failure pages

### Phase 3: Credit System (Week 3)
- [ ] Credit management service
- [ ] Credit balance display
- [ ] Credit history page
- [ ] Credit deduction integration

### Phase 4: Polish & Testing (Week 4)
- [ ] Error handling
- [ ] Loading states
- [ ] Analytics integration
- [ ] Security audit
- [ ] End-to-end testing

---

## 📝 Environment Variables

```env
# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Supabase (already exists)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

---

## 🔗 Related Files Structure

```
src/
├── services/
│   └── payment/
│       ├── paymentService.ts      # Payment session creation
│       ├── creditService.ts        # Credit management
│       ├── webhookService.ts      # Webhook handling
│       └── stripeClient.ts        # Stripe client initialization
├── components/
│   └── payment/
│       ├── CreditPacksSelector.tsx
│       ├── PaymentCheckout.tsx
│       ├── CreditBalance.tsx
│       ├── CreditHistory.tsx
│       └── PaymentSuccess.tsx
├── pages/
│   ├── PricingPage.tsx             # Update to show credit packs
│   └── PaymentSuccessPage.tsx     # New
└── types/
    └── payment.ts                  # Payment-related types
```

---

## ✅ Next Steps

1. **Review this architecture** with the team
2. **Set up Stripe account** and get API keys
3. **Run database migration**: Execute `database/migrations/create_payment_tables.sql` in Supabase SQL editor
4. **Install Stripe SDK**: `npm install @stripe/stripe-js @stripe/react-stripe-js`
5. **Begin implementation** starting with Phase 1

### Database Migration

The migration file `database/migrations/create_payment_tables.sql` includes:
- All payment-related tables
- Default credit packs (including Free Starter)
- Row Level Security policies
- Automatic welcome bonus trigger for new users
- Helper functions and indexes

---

## 📚 Resources

- [Stripe Payment Intents API](https://stripe.com/docs/payments/payment-intents)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions) (if using for API routes)

---

**Last Updated:** 2024
**Version:** 1.0

