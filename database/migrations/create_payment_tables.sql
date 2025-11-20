-- Payment System Database Schema
-- Run this migration in your Supabase SQL editor
-- This creates all tables needed for the non-recurring payment system

-- ============================================================================
-- 1. CREDIT PACKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS credit_packs (
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

-- Insert default credit packs
INSERT INTO credit_packs (name, credits, price_cents, description, features, is_popular, sort_order) VALUES
    (
        'Free Starter',
        10,
        0,
        'Perfect for trying out Revo3.ai',
        '["10 designs", "All platform types", "Basic AI editing", "Standard resolution", "Email support"]'::jsonb,
        false,
        1
    ),
    (
        'Starter Pack',
        50,
        900,
        'Perfect for creators just starting out',
        '["50 designs", "All platform types", "Basic AI editing", "Standard resolution", "Email support"]'::jsonb,
        false,
        2
    ),
    (
        'Pro Pack',
        200,
        2900,
        'For professional content creators',
        '["200 designs", "All platform types", "Advanced AI editing", "HD & 4K resolution", "Priority support", "Custom brand integration", "Bulk generation"]'::jsonb,
        true,
        3
    ),
    (
        'Enterprise Pack',
        1000,
        9900,
        'For teams and agencies',
        '["Unlimited designs", "All platform types", "Premium AI features", "Custom resolutions", "Dedicated support", "Team collaboration", "API access", "Custom integrations"]'::jsonb,
        false,
        4
    )
ON CONFLICT DO NOTHING;

-- Create index for active packs
CREATE INDEX IF NOT EXISTS idx_credit_packs_active ON credit_packs(is_active, sort_order) WHERE is_active = true;

-- ============================================================================
-- 2. USER CREDITS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_credits (
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
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);

-- ============================================================================
-- 3. CREDIT TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS credit_transactions (
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
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_reference_id ON credit_transactions(reference_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(transaction_type);

-- ============================================================================
-- 4. PAYMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
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
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_credit_pack_id ON payments(credit_pack_id);

-- ============================================================================
-- 5. CREDIT USAGE TABLE (Optional - for analytics)
-- ============================================================================
CREATE TABLE IF NOT EXISTS credit_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES credit_transactions(id) ON DELETE CASCADE,
    feature_type TEXT NOT NULL CHECK (feature_type IN ('thumbnail', 'repurpose', 'video_generation', 'premium', 'image_generation')),
    feature_id TEXT, -- ID of the generated design/video/etc.
    credits_used INTEGER NOT NULL,
    platform TEXT, -- e.g., 'youtube', 'tiktok', 'instagram'
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_usage_user_id ON credit_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_feature_type ON credit_usage(feature_type);
CREATE INDEX IF NOT EXISTS idx_credit_usage_transaction_id ON credit_usage(transaction_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_created_at ON credit_usage(created_at DESC);

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE credit_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_usage ENABLE ROW LEVEL SECURITY;

-- Credit Packs: Everyone can view active packs
CREATE POLICY "Anyone can view active credit packs"
    ON credit_packs FOR SELECT
    USING (is_active = true);

-- User Credits: Users can only see their own credits
CREATE POLICY "Users can view their own credits"
    ON user_credits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
    ON user_credits FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert user credits"
    ON user_credits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Credit Transactions: Users can only see their own transactions
CREATE POLICY "Users can view their own credit transactions"
    ON credit_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert credit transactions"
    ON credit_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Payments: Users can only see their own payments
CREATE POLICY "Users can view their own payments"
    ON payments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments"
    ON payments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update payments"
    ON payments FOR UPDATE
    USING (auth.uid() = user_id);

-- Credit Usage: Users can only see their own usage
CREATE POLICY "Users can view their own credit usage"
    ON credit_usage FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert credit usage"
    ON credit_usage FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 7. HELPER FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_credit_packs_updated_at BEFORE UPDATE ON credit_packs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON user_credits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. INITIAL FREE CREDITS FOR NEW USERS (Optional)
-- ============================================================================

-- Function to give new users free starter credits
CREATE OR REPLACE FUNCTION give_new_user_free_credits()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert user_credits record with 10 free credits
    INSERT INTO user_credits (user_id, balance, total_earned)
    VALUES (NEW.id, 10, 10)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Create transaction record
    INSERT INTO credit_transactions (
        user_id,
        transaction_type,
        amount,
        balance_after,
        description,
        reference_id
    )
    VALUES (
        NEW.id,
        'free_trial',
        10,
        10,
        'Welcome bonus - Free Starter Pack credits',
        'welcome_bonus_' || NEW.id::text
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to automatically give free credits to new users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION give_new_user_free_credits();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- To verify the migration:
-- SELECT * FROM credit_packs ORDER BY sort_order;
-- SELECT COUNT(*) FROM user_credits;
-- SELECT COUNT(*) FROM credit_transactions;

