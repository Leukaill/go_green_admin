import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

// Use service role key for admin operations (server-side only!)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // This key has elevated privileges
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    console.log('=== CREATE ADMIN API CALLED ===');
    
    // Get the current user's session
    const authHeader = request.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.log('No auth header - returning 401');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the requesting user is a super admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Check if user is super admin
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('role, status')
      .eq('id', user.id)
      .single();

    console.log('Admin check:', { userId: user.id, admin, adminError });

    if (adminError || !admin || admin.role !== 'super_admin' || admin.status !== 'active') {
      return NextResponse.json(
        { 
          error: 'Only active super admins can create admin accounts',
          debug: {
            userId: user.id,
            adminFound: !!admin,
            role: admin?.role,
            status: admin?.status,
            errorCode: adminError?.code,
            errorMessage: adminError?.message
          }
        },
        { status: 403 }
      );
    }

    // Get the new admin data from request
    console.log('Getting request body...');
    const body = await request.json();
    console.log('Request body:', body);
    const { email, password, name, role, phone } = body;

    // Validate input
    console.log('Validating input...');
    if (!email || !password || !name || !role) {
      console.log('Validation failed - missing fields');
      return NextResponse.json(
        { error: 'Email, password, name, and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    console.log('Validating role:', role);
    if (!['super_admin', 'admin', 'moderator'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be super_admin, admin, or moderator' },
        { status: 400 }
      );
    }

    // Validate password strength
    console.log('Validating password length:', password.length);
    if (password.length < 8) {
      console.log('Password too short');
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Create the auth user (with service role key, no email confirmation needed)
    console.log('Creating auth user...');
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        name,
        role,
      },
    });

    console.log('Auth user creation result:', { userId: newUser?.user?.id, error: createError });

    if (createError) {
      console.log('Auth user creation failed:', createError);
      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      );
    }

    if (!newUser.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Insert into admins table
    console.log('Inserting admin record:', {
      id: newUser.user.id,
      email,
      name,
      role,
      phone: phone || null,
      status: body.status || 'active',
    });

    const { error: insertError } = await supabaseAdmin
      .from('admins')
      .insert({
        id: newUser.user.id,
        email,
        name,
        role,
        phone: phone || null,
        status: body.status || 'active',
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      console.error('Full error details:', JSON.stringify(insertError, null, 2));
      
      // If admin insert fails, delete the auth user to maintain consistency
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      
      return NextResponse.json(
        { 
          error: `Database error: ${insertError.message}`,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint
        },
        { status: 500 }
      );
    }

    // Return success (don't send password back!)
    return NextResponse.json({
      success: true,
      admin: {
        id: newUser.user.id,
        email,
        name,
        role,
        status: 'active',
      },
    });

  } catch (error: any) {
    console.error('=== CATCH BLOCK ERROR ===');
    console.error('Error creating admin:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Internal server error', stack: error.stack },
      { status: 500 }
    );
  }
}
