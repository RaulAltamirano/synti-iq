-- Migration: Customer Profile, Subscription, and Address Support
-- Note: This project uses TypeORM synchronize: true, so these changes are applied automatically
-- This SQL file is for reference only

-- Create customer_profiles table
CREATE TABLE IF NOT EXISTS customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "customerId" UUID NOT NULL,
    "stripeSubscriptionId" VARCHAR,
    "stripeCustomerId" VARCHAR,
    status VARCHAR NOT NULL DEFAULT 'trialing',
    "trialStart" TIMESTAMP WITH TIME ZONE,
    "trialEnd" TIMESTAMP WITH TIME ZONE,
    "currentPeriodStart" TIMESTAMP WITH TIME ZONE NOT NULL,
    "currentPeriodEnd" TIMESTAMP WITH TIME ZONE NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "planId" VARCHAR,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "FK_subscriptions_customer" FOREIGN KEY ("customerId") 
        REFERENCES customer_profiles(id) ON DELETE CASCADE
);

-- Add addressType, isDefaultShipping, isDefaultBilling to locations table
ALTER TABLE locations 
    ADD COLUMN IF NOT EXISTS "addressType" VARCHAR,
    ADD COLUMN IF NOT EXISTS "isDefaultShipping" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS "isDefaultBilling" BOOLEAN NOT NULL DEFAULT false;

-- Create index for efficient address queries
CREATE INDEX IF NOT EXISTS "IDX_locations_user_addressType" 
    ON locations("userId", "addressType");

-- Create index for subscription queries
CREATE INDEX IF NOT EXISTS "IDX_subscriptions_customerId" 
    ON subscriptions("customerId");

-- Update user_profiles check constraint to allow customer with profile_id
ALTER TABLE user_profiles 
    DROP CONSTRAINT IF EXISTS "CHK_eafd052a407555684e25c085f4";

ALTER TABLE user_profiles 
    ADD CONSTRAINT "CHK_user_profiles_profile_type" 
    CHECK (
        (profile_type IN ('cashier', 'delivery', 'provider', 'customer') AND profile_id IS NOT NULL) 
        OR 
        (profile_type IN ('admin', 'manager') AND profile_id IS NULL)
    );
