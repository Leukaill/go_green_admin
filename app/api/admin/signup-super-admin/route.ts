import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for creating the first super admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: Request) {
  try {
    console.log('=== SIGNUP API CALLED ===');
    console.log('Environment check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    });

    // First, check if a super admin already exists
    console.log('Checking for existing super admin...');
    const { data: existingSuperAdmin, error: checkError } = await supabaseAdmin
      .from('admins')
      .select('id')
      .eq('role', 'super_admin')
      .limit(1);

    if (checkError) {
      console.error('Error checking existing admin:', checkError);
      return NextResponse.json(
        { error: 'Database error: ' + checkError.message },
        { status: 400 }
      );
    }

    console.log('Existing super admin check result:', existingSuperAdmin);

    if (existingSuperAdmin && existingSuperAdmin.length > 0) {
      return NextResponse.json(
        { error: 'A super admin already exists. Signup is disabled.' },
        { status: 403 }
      );
    }

    // Get signup data from request
    const body = await request.json();
    const { email, password, name, phone } = body;

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Create the super admin auth user
    console.log('Creating auth user for:', email);
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm
      user_metadata: {
        name,
        role: 'super_admin',
      },
      app_metadata: {
        provider: 'email',
        is_admin: true,
      },
    });

    if (createError) {
      console.error('Auth user creation error:', createError);
      return NextResponse.json(
        { error: 'Auth error: ' + createError.message },
        { status: 400 }
      );
    }

    console.log('Auth user created successfully:', newUser.user?.id);

    if (!newUser.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Insert into admins table as super_admin
    console.log('Inserting into admins table...');
    const { error: insertError } = await supabaseAdmin
      .from('admins')
      .insert({
        id: newUser.user.id,
        email,
        name,
        role: 'super_admin',
        phone: phone || null,
        status: 'active',
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      // Rollback: delete the auth user if admin insert fails
      console.log('Rolling back auth user creation...');
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      
      return NextResponse.json(
        { error: `Database insert failed: ${insertError.message}` },
        { status: 400 }
      );
    }

    console.log('Admin record created successfully!');

    // Return success
    return NextResponse.json({
      success: true,
      message: 'Super admin account created successfully',
      admin: {
        id: newUser.user.id,
        email,
        name,
        role: 'super_admin',
      },
    });

  } catch (error: any) {
    console.error('Error creating super admin:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        details: error.toString(),
        hint: 'Check server console for full error details'
      },
      { status: 500 }
    );
  }
}
