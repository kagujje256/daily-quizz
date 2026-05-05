-- Daily Quizz Database Schema
-- Run in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Levels
CREATE TABLE IF NOT EXISTS dq_levels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,           -- 'starter', 'active', 'pro'
  display_name TEXT NOT NULL,   -- 'Starter', 'Active', 'Pro'
  entry_ugx INTEGER NOT NULL,   -- entry fee in UGX
  min_earn_ugx INTEGER NOT NULL,
  max_earn_ugx INTEGER NOT NULL,
  referral_percent DECIMAL(5,2) NOT NULL,  -- % of referee entry fee
  owner_cut_percent DECIMAL(5,2) DEFAULT 30,
  lock_days INTEGER DEFAULT 120,
  color TEXT DEFAULT '#22c55e',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0
);

-- Insert default levels
INSERT INTO dq_levels (name, display_name, entry_ugx, min_earn_ugx, max_earn_ugx, referral_percent, display_order) VALUES
  ('starter', 'Starter', 15000, 200, 800, 10, 1),
  ('active', 'Active', 35000, 800, 3000, 15, 2),
  ('pro', 'Pro', 75000, 3000, 12000, 20, 3)
ON CONFLICT DO NOTHING;

-- Users
CREATE TABLE IF NOT EXISTS dq_users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  level_id UUID REFERENCES dq_levels(id),
  available_balance INTEGER DEFAULT 0,  -- UGX, withdrawable
  locked_balance INTEGER DEFAULT 0,     -- UGX, entry fee locked
  total_earned INTEGER DEFAULT 0,
  total_withdrawn INTEGER DEFAULT 0,
  referral_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  referred_by UUID REFERENCES dq_users(id),
  referral_count INTEGER DEFAULT 0,
  entry_paid_at TIMESTAMPTZ,
  entry_unlocks_at TIMESTAMPTZ,  -- entry_paid_at + 120 days
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE IF NOT EXISTS dq_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL CHECK (task_type IN ('watch_video','answer_quiz','share','follow','survey','refer')),
  reward_ugx INTEGER NOT NULL,
  min_level TEXT DEFAULT 'starter',  -- minimum level required
  url TEXT,                          -- YouTube link, etc.
  quiz_question TEXT,
  quiz_options JSONB,                -- ["A","B","C","D"]
  quiz_answer TEXT,
  is_active BOOLEAN DEFAULT true,
  daily_limit INTEGER DEFAULT 5,     -- max completions per user per day
  total_completions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task completions
CREATE TABLE IF NOT EXISTS dq_completions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES dq_users(id) NOT NULL,
  task_id UUID REFERENCES dq_tasks(id) NOT NULL,
  reward_ugx INTEGER NOT NULL,
  proof TEXT,  -- screenshot URL or answer
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending','completed','rejected')),
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE IF NOT EXISTS dq_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES dq_users(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('entry_fee','task_reward','referral_bonus','withdrawal','refund')),
  amount_ugx INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reference TEXT,
  description TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Withdrawals
CREATE TABLE IF NOT EXISTS dq_withdrawals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES dq_users(id) NOT NULL,
  amount_ugx INTEGER NOT NULL,
  phone_number TEXT NOT NULL,
  network TEXT NOT NULL,  -- 'MTN' or 'Airtel'
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  marzpay_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Owner revenue tracking
CREATE TABLE IF NOT EXISTS dq_revenue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  entry_fees_collected INTEGER DEFAULT 0,
  owner_cut INTEGER DEFAULT 0,
  referral_bonuses_paid INTEGER DEFAULT 0,
  task_rewards_paid INTEGER DEFAULT 0,
  withdrawals_processed INTEGER DEFAULT 0,
  net_profit INTEGER DEFAULT 0
);

-- RLS
ALTER TABLE dq_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dq_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dq_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dq_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE dq_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE dq_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dq_users_own" ON dq_users FOR ALL USING (auth.uid() = id);
CREATE POLICY "dq_completions_own" ON dq_completions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "dq_transactions_own" ON dq_transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "dq_withdrawals_own" ON dq_withdrawals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "dq_tasks_public" ON dq_tasks FOR SELECT USING (is_active = true);
CREATE POLICY "dq_levels_public" ON dq_levels FOR SELECT USING (is_active = true);
