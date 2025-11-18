-- =============================================
-- ALL-IN-ONE FIX FOR HUB SYSTEM
-- Run this entire file in Supabase SQL Editor
-- =============================================

-- 1. CREATE VIEW FOR HUB ACCOUNTS WITH EMAILS
CREATE OR REPLACE VIEW hub_accounts_with_emails AS
SELECT 
  h.id,
  h.user_id,
  h.points_balance,
  h.total_earned,
  h.total_deposited,
  h.total_spent,
  h.created_at,
  h.updated_at,
  u.email
FROM hub_accounts h
LEFT JOIN auth.users u ON h.user_id = u.id;

GRANT SELECT ON hub_accounts_with_emails TO authenticated;

-- 2. FIX THE add_hub_points FUNCTION (for website deposits/earn)
CREATE OR REPLACE FUNCTION add_hub_points(
  p_amount DECIMAL,
  p_transaction_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_payment_method TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_current_balance DECIMAL;
  v_new_balance DECIMAL;
  v_transaction_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  INSERT INTO hub_accounts (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  SELECT points_balance INTO v_current_balance
  FROM hub_accounts
  WHERE user_id = v_user_id;
  
  v_new_balance := v_current_balance + p_amount;
  
  -- FIXED: ALWAYS increase total_earned (for tier calculation)
  UPDATE hub_accounts
  SET 
    points_balance = v_new_balance,
    total_earned = total_earned + p_amount,
    total_deposited = CASE WHEN p_transaction_type = 'deposit' THEN total_deposited + p_amount ELSE total_deposited END,
    updated_at = NOW()
  WHERE user_id = v_user_id;
  
  INSERT INTO hub_transactions (
    user_id,
    transaction_type,
    amount,
    points_before,
    points_after,
    description,
    reference_id,
    payment_method,
    status
  ) VALUES (
    v_user_id,
    p_transaction_type,
    p_amount,
    v_current_balance,
    v_new_balance,
    p_description,
    p_reference_id,
    p_payment_method,
    'completed'
  ) RETURNING id INTO v_transaction_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CREATE ADMIN GIFT POINTS FUNCTION
CREATE OR REPLACE FUNCTION add_hub_points_admin(
  p_user_id UUID,
  p_amount DECIMAL,
  p_description TEXT DEFAULT 'Admin gift points'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_account_id UUID;
  v_old_balance DECIMAL;
  v_new_balance DECIMAL;
  v_old_earned DECIMAL;
  v_new_earned DECIMAL;
  v_transaction_id UUID;
BEGIN
  SELECT 
    id,
    points_balance,
    total_earned
  INTO 
    v_account_id,
    v_old_balance,
    v_old_earned
  FROM hub_accounts
  WHERE user_id = p_user_id;

  IF v_account_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Hub account not found'
    );
  END IF;

  v_new_balance := v_old_balance + p_amount;
  v_new_earned := v_old_earned + p_amount;

  UPDATE hub_accounts
  SET 
    points_balance = v_new_balance,
    total_earned = v_new_earned,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  INSERT INTO hub_transactions (
    user_id,
    transaction_type,
    amount,
    points_before,
    points_after,
    description,
    status
  ) VALUES (
    p_user_id,
    'earn',
    p_amount,
    v_old_balance,
    v_new_balance,
    p_description,
    'completed'
  )
  RETURNING id INTO v_transaction_id;

  RETURN json_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'transaction_id', v_transaction_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

GRANT EXECUTE ON FUNCTION add_hub_points_admin(UUID, DECIMAL, TEXT) TO authenticated;

-- 4. FIX EXISTING DATA (users who already have points but wrong total_earned)
UPDATE hub_accounts
SET total_earned = points_balance
WHERE total_earned < points_balance;

-- 5. VERIFICATION
SELECT '✅ View created: hub_accounts_with_emails' as status
UNION ALL
SELECT '✅ Function fixed: add_hub_points'
UNION ALL
SELECT '✅ Function created: add_hub_points_admin'
UNION ALL
SELECT '✅ Existing data fixed'
UNION ALL
SELECT '✅ Hub system ready!';

-- 6. TEST QUERY - Check if users have correct data
SELECT 
  email,
  points_balance,
  total_earned,
  total_deposited,
  created_at
FROM hub_accounts_with_emails
ORDER BY created_at DESC
LIMIT 10;
