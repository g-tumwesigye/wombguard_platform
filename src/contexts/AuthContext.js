import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { userService } from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
  throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initializing auth state on mount
  useEffect(() => {
  const initializeAuth = async () => {
  try {
  console.log('[AuthContext] Initializing auth...');
  // First, check localStorage for persisted user (FastAPI login)
  const storedUser = localStorage.getItem('wombguard_user');
  console.log('[AuthContext] localStorage check:', storedUser ? 'User found' : 'No user');
  if (storedUser) {
  try {
  const user = JSON.parse(storedUser);
  setUser(user);
  console.log('[AuthContext] User restored from localStorage:', user.email, 'Role:', user.role);
  setLoading(false);
  return; // Exit early if user found in localStorage
  } catch (err) {
  console.error('[AuthContext] Error parsing stored user:', err);
  localStorage.removeItem('wombguard_user');
  }
  } else {
  console.log('[AuthContext] No stored user in localStorage');
  }

  // If no localStorage user, check Supabase session
  console.log('[AuthContext] Checking Supabase session...');
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
  console.log('[AuthContext] Supabase session found:', session.user.email);
  // Fetching user profile from Supabase
  const { data: profile } = await supabase
  .from('users')
  .select('*')
  .eq('id', session.user.id)
  .single();

  if (profile) {
  setUser({
  id: session.user.id,
  email: session.user.email,
  ...profile,
  });
  console.log('[AuthContext] User set from Supabase:', session.user.email);
  }
  } else {
  console.log('[AuthContext] No Supabase session found');
  }
  } catch (err) {
  console.error('[AuthContext] Auth initialization error:', err);
  } finally {
  console.log('[AuthContext] Auth initialization complete. Loading = false');
  setLoading(false);
  }
  };

  initializeAuth();
  }, []);

  // LOGIN with FastAPI backend
  const login = async (email, password) => {
  try {
  setError(null);
  const response = await userService.login({ email, password });

  if (response.user) {
  setUser(response.user);
  localStorage.setItem('wombguard_user', JSON.stringify(response.user));

  // Store JWT token if provided
  if (response.access_token) {
  localStorage.setItem('wombguard_token', response.access_token);
  console.log(' JWT token stored in localStorage');
  }

  return response.user;
  }
  throw new Error('Login failed: No user data returned');
  } catch (err) {
  const errorMessage = err.message || 'Login failed';
  setError(errorMessage);
  throw new Error(errorMessage);
  }
  };

  // REGISTERING with FastAPI backend
  const register = async (userData) => {
  try {
  setError(null);
  const response = await userService.register(userData);

  if (response.user) {
  // Don't automatically log in, user must verify email first
  // Just return the user data and verification link for display
  console.log(' Registration successful. User must verify email.');
  return {
  user: response.user,
  verification_link: response.verification_link,
  verification_token: response.verification_token
  };
  }
  throw new Error('Registration failed: No user data returned');
  } catch (err) {
  const errorMessage = err.message || 'Registration failed';
  setError(errorMessage);
  throw new Error(errorMessage);
  }
  };

  // LOGOUT
  const logout = async () => {
  try {
  await supabase.auth.signOut();
  setUser(null);
  localStorage.removeItem('wombguard_user');
  localStorage.removeItem('wombguard_token'); 
  setError(null);
  } catch (err) {
  console.error('Logout error:', err);
  }
  };

  const value = {
  user,
  loading,
  error,
  login,
  register,
  logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
