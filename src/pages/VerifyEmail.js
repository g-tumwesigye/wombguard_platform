import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader, Heart } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); 
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
  const verifyEmail = async () => {
  try {
  const token = searchParams.get('token');

  if (!token) {
  setStatus('error');
  setMessage('No verification token provided. Please check your email link.');
  return;
  }

  // Call the verify-email endpoint
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const response = await fetch(`${API_BASE_URL}/verify-email`, {
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
  },
  body: JSON.stringify({ token }),
  });

  const data = await response.json();

  if (response.ok) {
  setStatus('success');
  setMessage(data.message || 'Email verified successfully! You can now log in.');
  setEmail(data.email || '');

  // No auto-redirect, user clicks button to go to login
  } else {
  setStatus('error');
  setMessage(data.detail || 'Email verification failed. Please try again.');
  }
  } catch (error) {
  setStatus('error');
  setMessage('An error occurred during verification. Please try again.');
  console.error('Verification error:', error);
  }
  };

  verifyEmail();
  }, [searchParams, navigate]);

  return (
  <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div className="w-full max-w-md">
  <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
  {/* Header */}
  <div className="text-center mb-8">
  <div className="bg-gradient-to-r from-primary-500 to-secondary-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
  <Heart className="h-8 w-8 text-white" />
  </div>
  <h1 className="text-3xl font-bold text-neutral-900 mb-2">Email Verification</h1>
  <p className="text-neutral-600">Verifying your email address...</p>
  </div>

  {/* Loading State */}
  {status === 'loading' && (
  <div className="text-center py-8">
  <Loader className="h-12 w-12 text-primary-500 mx-auto animate-spin mb-4" />
  <p className="text-neutral-600">Please wait while we verify your email...</p>
  </div>
  )}

  {/* Success State */}
  {status === 'success' && (
  <div className="text-center py-8">
  <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
  <h2 className="text-xl font-bold text-green-900 mb-2">Email Verified!</h2>
  <p className="text-green-700 mb-4">{message}</p>
  {email && (
  <p className="text-sm text-green-600">
  Email: <strong>{email}</strong>
  </p>
  )}
  </div>
  <Link
  to="/login"
  className="inline-block bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold py-3 px-8 rounded-lg hover:shadow-lg transition-all"
  >
  Go to Login
  </Link>
  </div>
  )}

  {/* Error State */}
  {status === 'error' && (
  <div className="text-center py-8">
  <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
  <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
  <h2 className="text-xl font-bold text-red-900 mb-2">Verification Failed</h2>
  <p className="text-red-700 mb-4">{message}</p>
  </div>
  <div className="space-y-3">
  <p className="text-neutral-600 text-sm">
  The verification link may have expired or is invalid.
  </p>
  <div className="flex gap-3 justify-center">
  <Link
  to="/register"
  className="inline-block bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold py-2 px-6 rounded-lg hover:shadow-lg transition-all"
  >
  Register Again
  </Link>
  <Link
  to="/login"
  className="inline-block bg-neutral-200 text-neutral-900 font-semibold py-2 px-6 rounded-lg hover:bg-neutral-300 transition-all"
  >
  Go to Login
  </Link>
  </div>
  </div>
  </div>
  )}

  {/* Footer */}
  <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
  <p className="text-sm text-neutral-600">
  Need help?{' '}
  <Link to="/contact" className="text-primary-600 hover:text-primary-700 font-semibold">
  Contact us
  </Link>
  </p>
  </div>
  </div>
  </div>
  </div>
  );
};

export default VerifyEmail;

