import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use anon key for this check (safe for client-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // Check if any super admin exists in the system
    const { data, error } = await supabase
      .from('admins')
      .select('id')
      .eq('role', 'super_admin')
      .limit(1);

    if (error) {
      console.error('Error checking super admin:', error);
      return NextResponse.json(
        { error: 'Failed to check super admin status' },
        { status: 500 }
      );
    }

    // Return whether a super admin exists
    return NextResponse.json({
      hasSuperAdmin: data && data.length > 0,
      count: data?.length || 0,
    });

  } catch (error: any) {
    console.error('Error in check-super-admin:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
