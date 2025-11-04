import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Heart, Mail, Lock, User, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: 'pregnant_woman'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationLink, setVerificationLink] = useState('');

  const { register, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in (role-based)
  useEffect(() => {
  if (user) {
  // Admins go to admin dashboard
  if (user.role === 'admin') {
  navigate('/admin-dashboard');
  } else if (user.role === 'healthcare_provider') {
  // Healthcare workers go to healthcare dashboard
  navigate('/healthcare-dashboard');
  } else {
  // Pregnant women go to regular dashboard
  navigate('/dashboard');
  }
  }
  }, [user, navigate]);

  // Only pregnant women can self-register
  // Healthcare providers and admins are created by admins only

  const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
  ...prev,
  [name]: value
  }));
  if (error) setError('');
  };

  const validateForm = () => {
  if (!formData.name.trim()) {
  setError('Full name is required');
  return false;
  }
  if (!formData.email.trim()) {
  setError('Email is required');
  return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
  setError('Please enter a valid email address');
  return false;
  }
  if (!formData.phone.trim()) {
  setError('Phone number is required');
  return false;
  }
  if (!/^[\d\s\-+()]+$/.test(formData.phone)) {
  setError('Please enter a valid phone number');
  return false;
  }
  if (!formData.password) {
  setError('Password is required');
  return false;
  }
  if (formData.password.length < 8) {
  setError('Password must be at least 8 characters long');
  return false;
  }
  if (formData.password !== formData.confirmPassword) {
  setError('Passwords do not match');
  return false;
  }
  return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  setLoading(true);
  setError('');
  setSuccess('');

  try {
  const result = await register({
  name: formData.name,
  email: formData.email,
  phone: formData.phone,
  password: formData.password,
  role: formData.role
  });

  // Store verification link for display
  if (result.verification_link) {
  setVerificationLink(result.verification_link);
  }

  setSuccess('Account created successfully! Please check your email to verify your account.');

  // UPDATED: No auto-redirect - user clicks button to go to login
  // User must verify email first before accessing dashboard
  } catch (err) {
  const message = err?.message || 'Registration failed. Please try again.';
  setError(message);
  } finally {
  setLoading(false);
  }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div className="w-full max-w-md">
  <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
  {/* Header */}
  <div className="text-center mb-8">
  <div className="bg-gradient-to-r from-primary-500 to-secondary-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
  <Heart className="h-8 w-8 text-white" />
  </div>
  <h1 className="text-3xl font-bold text-neutral-900 mb-2">Join WombGuard</h1>
  <p className="text-neutral-600">Create your account to get started</p>
  </div>

  {/* Error Alert */}
  {error && (
  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-start gap-3 animate-fade-in">
  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
  <span className="text-sm">{error}</span>
  </div>
  )}

  {/* Success Alert */}
  {success && (
  <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-xl mb-6 flex flex-col gap-4 animate-fade-in">
  <div className="flex items-start gap-3">
  <CheckCircle className="h-6 w-6 flex-shrink-0 mt-0.5 text-green-600" />
  <div>
  <p className="text-sm font-semibold text-green-800">Account Created Successfully!</p>
  <p className="text-sm text-green-700 mt-1">A verification email has been sent to your email address. Please check your inbox and click the verification link to complete your registration.</p>
  </div>
  </div>

  {/* Button to go to login - stays visible */}
  <button
  onClick={() => navigate('/login')}
  className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
  >
  Go to Login
  </button>
  </div>
  )}

  {/* Registration Form - Hidden when success */}
  {!success && (
  <form onSubmit={handleSubmit} className="space-y-4">
  {/* Full Name */}
  <div>
  <label htmlFor="name" className="block text-sm font-semibold text-neutral-700 mb-2">
  Full Name
  </label>
  <div className="relative">
  <User className="h-5 w-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
  <input
  id="name"
  name="name"
  type="text"
  autoComplete="name"
  required
  value={formData.name}
  onChange={handleChange}
  className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
  placeholder="Jane Doe"
  />
  </div>
  </div>

  {/* Email */}
  <div>
  <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">
  Email Address
  </label>
  <div className="relative">
  <Mail className="h-5 w-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
  <input
  id="email"
  name="email"
  type="email"
  autoComplete="email"
  required
  value={formData.email}
  onChange={handleChange}
  className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
  placeholder="you@example.com"
  />
  </div>
  </div>

  {/* Phone Number - NEW */}
  <div>
  <label htmlFor="phone" className="block text-sm font-semibold text-neutral-700 mb-2">
  Phone Number
  </label>
  <div className="relative">
  <span className="h-5 w-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"></span>
  <input
  id="phone"
  name="phone"
  type="tel"
  autoComplete="tel"
  required
  value={formData.phone}
  onChange={handleChange}
  className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
  placeholder="+250 78 123 4567"
  />
  </div>
  <p className="text-xs text-neutral-500 mt-1">Healthcare providers will use this to contact you</p>
  </div>

  {/* Account Type - Fixed to Pregnant Woman */}
  <div>
  <label htmlFor="role" className="block text-sm font-semibold text-neutral-700 mb-2">
  Account Type
  </label>
  <div className="relative">
  <UserCheck className="h-5 w-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
  <div className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-700 flex items-center">
  Pregnant Woman
  </div>
  </div>
  <p className="text-xs text-neutral-500 mt-2">
  Expecting mother seeking health monitoring
  </p>
  <p className="text-xs text-neutral-400 mt-1">
  ℹ Healthcare providers and admins are created by system administrators
  </p>
  </div>

  {/* Password */}
  <div>
  <label htmlFor="password" className="block text-sm font-semibold text-neutral-700 mb-2">
  Password
  </label>
  <div className="relative">
  <Lock className="h-5 w-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
  <input
  id="password"
  name="password"
  type={showPassword ? 'text' : 'password'}
  autoComplete="new-password"
  required
  value={formData.password}
  onChange={handleChange}
  className="w-full pl-10 pr-10 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
  placeholder="••••••••"
  />
  <button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
  aria-label={showPassword ? 'Hide password' : 'Show password'}
  >
  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
  </button>
  </div>
  <p className="text-xs text-neutral-500 mt-1">At least 8 characters</p>
  </div>

  {/* Confirm Password */}
  <div>
  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-neutral-700 mb-2">
  Confirm Password
  </label>
  <div className="relative">
  <Lock className="h-5 w-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
  <input
  id="confirmPassword"
  name="confirmPassword"
  type={showConfirmPassword ? 'text' : 'password'}
  autoComplete="new-password"
  required
  value={formData.confirmPassword}
  onChange={handleChange}
  className="w-full pl-10 pr-10 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
  placeholder="••••••••"
  />
  <button
  type="button"
  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
  >
  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
  </button>
  </div>
  </div>

  {/* Submit Button */}
  <button
  type="submit"
  disabled={loading}
  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
  >
  {loading ? (
  <>
  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
  <span>Creating account...</span>
  </>
  ) : (
  'Create Account'
  )}
  </button>
  </form>
  )}

  {/* Divider - Hidden when success */}
  {!success && (
  <div className="my-6 flex items-center gap-4">
  <div className="flex-1 h-px bg-neutral-200"></div>
  <span className="text-sm text-neutral-500">or</span>
  <div className="flex-1 h-px bg-neutral-200"></div>
  </div>
  )}

  {/* Sign In Link - Hidden when success */}
  {!success && (
  <div className="text-center">
  <p className="text-neutral-600 text-sm">
  Already have an account?{' '}
  <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
  Sign in
  </Link>
  </p>
  </div>
  )}

  {/* Footer */}
  <div className="mt-6 pt-6 border-t border-neutral-200 text-center">
  <Link to="/" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
  ← Back to Home
  </Link>
  </div>
  </div>

  {/* Trust Badge */}
  <div className="mt-6 text-center text-sm text-neutral-600">
  <p> Your data is secure and encrypted</p>
  </div>
  </div>
  </div>
  );
};

export default Register;
