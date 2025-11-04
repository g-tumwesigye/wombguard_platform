import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Heart, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
  email: '',
  password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login, user } = useAuth();
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

  const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
  ...prev,
  [name]: value
  }));
  if (error) setError('');
  };

  const validateForm = () => {
  if (!formData.email.trim()) {
  setError('Email is required');
  return false;
  }
  if (!formData.password) {
  setError('Password is required');
  return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
  setError('Please enter a valid email address');
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
  const loggedInUser = await login(formData.email, formData.password);
  setSuccess('Login successful! Redirecting...');

  // Redirect based on user role
  let redirectPath = '/dashboard';
  if (loggedInUser.role === 'admin') {
  redirectPath = '/admin-dashboard';
  } else if (loggedInUser.role === 'healthcare_provider') {
  redirectPath = '/healthcare-dashboard';
  }

  setTimeout(() => navigate(redirectPath), 1500);
  } catch (err) {
  const message = err?.message || 'Invalid email or password';
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
  <h1 className="text-3xl font-bold text-neutral-900 mb-2">Welcome Back</h1>
  <p className="text-neutral-600">Sign in to your WombGuard account</p>
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
  <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 flex items-start gap-3 animate-fade-in">
  <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
  <span className="text-sm">{success}</span>
  </div>
  )}

  {/* Login Form */}
  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
  {/* Email Field */}
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

  {/* Password Field */}
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
  autoComplete="current-password"
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
  </div>

  {/* Submit Button */}
  <button
  type="submit"
  disabled={loading}
  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
  >
  {loading ? (
  <>
  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
  <span>Signing in...</span>
  </>
  ) : (
  'Sign In'
  )}
  </button>
  </form>

  {/* Divider */}
  <div className="my-6 flex items-center gap-4">
  <div className="flex-1 h-px bg-neutral-200"></div>
  <span className="text-sm text-neutral-500">or</span>
  <div className="flex-1 h-px bg-neutral-200"></div>
  </div>

  {/* Sign Up Link */}
  <div className="text-center">
  <p className="text-neutral-600 text-sm">
  Don't have an account?{' '}
  <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
  Create one now
  </Link>
  </p>
  </div>

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

export default Login;
