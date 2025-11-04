import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://tbpvwccscohkpelfswxo.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicHZ3Y2NzY29oa3BlbGZzd3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTAwODUsImV4cCI6MjA3NTQ2NjA4NX0.4ufvPtt1q7sZ7jTOxbnnJ6UGxvvB5ws3nHquos8s2c4';

// Initializing Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper functions for common operations
export const supabaseHelpers = {
  // User operations
  async getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
  },

  async getUserProfile(userId) {
  const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();
  return { data, error };
  },

  async updateUserProfile(userId, updates) {
  const { data, error } = await supabase
  .from('users')
  .update(updates)
  .eq('id', userId)
  .select();
  return { data, error };
  },

  // Prediction operations
  async savePrediction(predictionData) {
  const { data, error } = await supabase
  .from('predictions')
  .insert([predictionData]);
  return { data, error };
  },

  async getUserPredictions(userId, limit = 20) {
  const { data, error } = await supabase
  .from('predictions')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(limit);
  return { data, error };
  },

  async getPredictionById(predictionId) {
  const { data, error } = await supabase
  .from('predictions')
  .select('*')
  .eq('id', predictionId)
  .single();
  return { data, error };
  },

  // Chat history operations
  async saveChatMessage(chatData) {
  const { data, error } = await supabase
  .from('chat_history')
  .insert([chatData]);
  return { data, error };
  },

  async getUserChatHistory(userId, limit = 50) {
  const { data, error } = await supabase
  .from('chat_history')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(limit);
  return { data, error };
  },

  // Dashboard stats
  async getDashboardStats(role) {
  const { data, error } = await supabase
  .from('predictions')
  .select('*')
  .eq('role', role)
  .order('created_at', { ascending: false })
  .limit(20);
  return { data, error };
  },
};

export default supabase;

