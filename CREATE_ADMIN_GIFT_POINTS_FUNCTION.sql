-- =============================================
-- CREATE ADMIN GIFT POINTS FUNCTION
-- =============================================

-- Function to allow admins to gift points to users
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
  -- Get current account details
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

  -- Check if account exists
  IF v_account_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Hub account not found'
    );
  END IF;

  -- Calculate new balances
  v_new_balance := v_old_balance + p_amount;
  v_new_earned := v_old_earned + p_amount;

  -- Update account
  UPDATE hub_accounts
  SET 
    points_balance = v_new_balance,
    total_earned = v_new_earned,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Create transaction record
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

  -- Return success
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION add_hub_points_admin(UUID, DECIMAL, TEXT) TO authenticated;

-- Verification
SELECT '✅ Function created: add_hub_points_admin' as status;
SELECT '✅ Admins can now gift points to users' as status;
