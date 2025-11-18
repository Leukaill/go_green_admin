'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { loginAdmin, signupSuperAdmin, cacheAdminRole } from '@/lib/auth';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [hasSuperAdmin, setHasSuperAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Check if super admin exists and load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    // Check if super admin exists
    fetch('/api/admin/check-super-admin')
      .then(res => res.json())
      .then(data => {
        setHasSuperAdmin(data.hasSuperAdmin || false);
        setCheckingAdmin(false);
      })
      .catch(err => {
        console.error('Error checking super admin:', err);
        setCheckingAdmin(false);
      });
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !signupName) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    
    try {
      // Call API to create super admin with service role key
      const response = await fetch('/api/admin/signup-super-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name: signupName,
          phone: signupPhone || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Signup error:', data);
        throw new Error(data.error || 'Failed to create super admin account');
      }

      toast.success('✅ Super admin account created successfully!');
      toast.success('You can now login with your credentials');
      
      // Reset form and switch to login
      setShowSignup(false);
      setSignupName('');
      setSignupPhone('');
      setEmail('');
      setPassword('');
      setIsLoading(false);
      
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'An error occurred during signup');
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      toast.error('Login timeout. Please check your connection and try again.');
    }, 15000); // 15 second timeout
    
    try {
      // Authenticate with Supabase
      const result = await loginAdmin(email, password);
      
      clearTimeout(timeoutId); // Clear timeout if login completes
      
      if (!result.success) {
        toast.error(result.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      // Cache the admin role for synchronous access
      if (result.user) {
        cacheAdminRole(result.user.role);
        
        // Save email if remember me is checked
        if (rememberMe) {
          localStorage.setItem('remembered_email', email);
        } else {
          localStorage.removeItem('remembered_email');
        }
        
        // Show success message based on role
        if (result.user.role === 'super_admin') {
          toast.success(`Welcome, Super Admin ${result.user.name}! 👑`);
        } else if (result.user.role === 'admin') {
          toast.success(`Welcome, Admin ${result.user.name}! 🎯`);
        } else if (result.user.role === 'moderator') {
          toast.success(`Welcome, Moderator ${result.user.name}! ⭐`);
        } else {
          toast.success(`Welcome back, ${result.user.name}! 🎉`);
        }
        
        // Small delay to allow session to be established, then redirect
        console.log('Redirecting to dashboard...');
        await new Promise(resolve => setTimeout(resolve, 300));
        window.location.href = '/'; // Force full page reload to ensure session is loaded
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('Login error:', error);
      toast.error(error.message || 'An error occurred during login');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-5 mb-16">
            <Image
              src="/go-green-logo-no-background.png"
              alt="Go Green Rwanda"
              width={100}
              height={100}
              className="object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold text-white">Go Green Rwanda</h1>
              <p className="text-white/90 text-base">Admin Dashboard</p>
            </div>
          </div>

          {/* Main Message */}
          <div className="space-y-6">
            <h2 className="text-5xl font-bold text-white leading-tight">
              Manage Your
              <br />
              Sustainable
              <br />
              Business
            </h2>
            <p className="text-xl text-white/90 leading-relaxed max-w-md">
              Powerful tools to manage products, orders, customers, and grow your agricultural platform.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/60 text-sm">© 2025 Go Green Rwanda. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="h-12 w-12">
              <Image
                src="/go-green-logo-no-background.jpg"
                alt="Go Green Rwanda"
                width={48}
                height={48}
                className="object-contain"
                unoptimized
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Go Green Rwanda</h1>
              <p className="text-gray-600 text-sm">Admin Dashboard</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="relative bg-white border-2 border-emerald-800 shadow-2xl shadow-emerald-800/20 p-8">
            {/* Admin Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="bg-gradient-to-r from-emerald-800 to-green-700 text-white px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span className="font-bold">Admin Access</span>
              </div>
            </div>

            <div className="mb-8 mt-4">
              <h3 className="text-2xl font-bold mb-2 text-emerald-900 text-center">
                {showSignup ? 'Create Super Admin Account' : 'Admin Portal Login'}
              </h3>
              <p className="text-emerald-700 text-center font-medium">
                {showSignup ? 'Initial system setup - First time configuration' : 'For Super Admins, Admins, and Moderators'}
              </p>
            </div>

            <form onSubmit={showSignup ? handleSignup : handleLogin} className="space-y-6">
              {/* Show signup fields if in signup mode */}
              {showSignup && (
                <div>
                  <label className="block text-sm font-semibold mb-2 text-emerald-800">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Your full name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="h-12 border-2 border-emerald-200 focus:border-emerald-800 focus:ring-4 focus:ring-emerald-800/20"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-emerald-800">
                  {showSignup ? 'Email Address' : 'Admin Email'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                  <Input
                    type="email"
                    placeholder="admin@gogreen.rw"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-2 border-emerald-200 focus:border-emerald-800 focus:ring-4 focus:ring-emerald-800/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-emerald-800">
                  Password {showSignup && <span className="text-xs text-gray-500">(min 8 characters)</span>}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={showSignup ? "Create a secure password" : "Enter your secure password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 border-2 border-emerald-200 focus:border-emerald-800 focus:ring-4 focus:ring-emerald-800/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-800"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Phone (optional, signup only) */}
              {showSignup && (
                <div>
                  <label className="block text-sm font-semibold mb-2 text-emerald-800">
                    Phone Number <span className="text-xs text-gray-500">(optional)</span>
                  </label>
                  <Input
                    type="tel"
                    placeholder="+250 787 399 228"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    className="h-12 border-2 border-emerald-200 focus:border-emerald-800 focus:ring-4 focus:ring-emerald-800/20"
                  />
                </div>
              )}

              {/* Remember & Forgot - Only show for login */}
              {!showSignup && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 border-emerald-300 text-emerald-800 focus:ring-emerald-800"
                    />
                    <span className="text-sm text-emerald-700">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-sm font-semibold text-emerald-800 hover:text-emerald-900"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 font-semibold bg-gradient-to-r from-emerald-800 to-green-700 hover:from-emerald-900 hover:to-green-800 shadow-lg shadow-emerald-800/30"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{showSignup ? 'Creating Account...' : 'Authenticating...'}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    <span>{showSignup ? 'Create Super Admin Account' : 'Admin Sign In'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>

              {/* Toggle between signup and login */}
              <div className="text-center mt-4">
                {!checkingAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowSignup(!showSignup)}
                      disabled={hasSuperAdmin && !showSignup}
                      className={`text-sm font-semibold underline ${
                        hasSuperAdmin && !showSignup
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-emerald-800 hover:text-emerald-900'
                      }`}
                      title={hasSuperAdmin && !showSignup ? 'Super admin already exists' : ''}
                    >
                      {showSignup ? '← Back to Sign In' : 'First time? Create Super Admin Account'}
                    </button>
                    {hasSuperAdmin && !showSignup && (
                      <p className="text-xs text-gray-500 mt-2">
                        Super admin account already exists. Please sign in.
                      </p>
                    )}
                  </>
                )}
              </div>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-emerald-200 text-center">
              {showSignup ? (
                <>
                  <p className="text-sm text-emerald-700 font-semibold">
                    Initial Setup - Create Your Super Admin Account
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-emerald-700">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Restricted Access - Authorized Admins Only
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Super Admins create admin accounts. Regular admins cannot self-register.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
