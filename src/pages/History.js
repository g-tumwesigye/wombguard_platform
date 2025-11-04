import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  Heart,
  Search,
  MessageSquare,
  Activity,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const History = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('assessments');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data from backend (Supabase via FastAPI)
  useEffect(() => {
  const fetchData = async () => {
  try {
  setLoading(true);
  setError(null);

  // Fetch risk assessments from backend
  const assessmentResponse = await fetch(
  `http://localhost:8000/risk-assessments?user_email=${encodeURIComponent(user.email)}`
  );

  if (assessmentResponse.ok) {
  const assessmentData = await assessmentResponse.json();
  if (assessmentData.status === 'success') {
  setHistory(assessmentData.data || []);
  }
  } else {
  console.warn('Failed to fetch assessments from backend, using localStorage fallback');
  const localHistory = JSON.parse(localStorage.getItem('wombguard_history') || '[]');
  setHistory(localHistory);
  }

  // Fetch chat history from backend (Supabase via FastAPI)
  try {
  const chatResponse = await fetch(
  `http://localhost:8000/chat-history?user_id=${encodeURIComponent(user.id)}`
  );

  if (chatResponse.ok) {
  const chatData = await chatResponse.json();
  if (chatData.status === 'success' && chatData.data) {
  // Group chat messages by conversation_id
  const conversationMap = {};

  chatData.data.forEach(message => {
  const convId = message.conversation_id || 'default';
  if (!conversationMap[convId]) {
  conversationMap[convId] = {
  id: convId,
  messages: [],
  startTime: new Date(message.created_at),
  lastMessage: new Date(message.created_at),
  preview: message.user_message
  };
  }
  conversationMap[convId].messages.push(message);
  const msgTime = new Date(message.created_at);
  if (msgTime < conversationMap[convId].startTime) {
  conversationMap[convId].startTime = msgTime;
  conversationMap[convId].preview = message.user_message;
  }
  if (msgTime > conversationMap[convId].lastMessage) {
  conversationMap[convId].lastMessage = msgTime;
  }
  });

  // Convert to array and add message count
  const chatSessions = Object.values(conversationMap).map(session => ({
  ...session,
  messageCount: session.messages.length,
  preview: session.preview.slice(0, 100) + (session.preview.length > 100 ? '...' : '')
  }));

  // Sort by most recent first
  chatSessions.sort((a, b) => b.lastMessage - a.lastMessage);

  setChatHistory(chatSessions);
  } else {
  setChatHistory([]);
  }
  } else {
  console.warn('Failed to fetch chat history from backend');
  setChatHistory([]);
  }
  } catch (chatErr) {
  console.error('Error fetching chat history:', chatErr);
  setChatHistory([]);
  }
  } catch (err) {
  console.error('Error fetching history:', err);
  setError(err.message);
  // Fallback to localStorage
  const localHistory = JSON.parse(localStorage.getItem('wombguard_history') || '[]');
  setHistory(localHistory);
  } finally {
  setLoading(false);
  }
  };

  if (user?.email) {
  fetchData();
  }
  }, [user?.email, user?.id]);

  // Show loading state while auth is initializing
  if (authLoading) {
  return (
  <div className="min-h-screen flex items-center justify-center py-12 px-4">
  <div className="text-center">
  <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-600 border-t-transparent mx-auto mb-4"></div>
  <p className="text-neutral-600">Loading...</p>
  </div>
  </div>
  );
  }

  // Restrict access to pregnant women accounts
  if (!user || user.role !== 'pregnant_woman') {
  return (
  <div className="min-h-screen flex items-center justify-center py-12 px-4">
  <div className="card p-8 text-center max-w-md w-full">
  <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
  <h2 className="text-2xl font-bold text-neutral-900 mb-4">Access Restricted</h2>
  <p className="text-neutral-600 mb-6">
  History is only available for pregnant women accounts.
  </p>
  <button onClick={() => navigate('/')} className="btn-primary w-full">
  Go Home
  </button>
  </div>
  </div>
  );
  }

  // Risk utilities
  const getRiskColor = (risk) => {
  switch (risk?.toLowerCase()) {
  case 'high': return 'bg-red-100 text-red-700 border-red-200';
  case 'moderate': return 'bg-amber-100 text-amber-700 border-amber-200';
  case 'low': return 'bg-green-100 text-green-700 border-green-200';
  default: return 'bg-neutral-100 text-neutral-700 border-neutral-200';
  }
  };

  const getRiskIcon = (risk) => {
  switch (risk?.toLowerCase()) {
  case 'high': return AlertTriangle;
  case 'moderate': return Heart;
  case 'low': return CheckCircle;
  default: return Activity;
  }
  };

  const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
  }).format(date);
  };

  // Safe, academically clear filtering logic
  const filteredHistory = history.filter(item => {
  const recs = item.recommendations || [];
  const matchesSearch = item.riskLevel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  recs.some(rec => rec.toLowerCase().includes(searchTerm.toLowerCase()));
  const matchesRisk = filterRisk === 'all' || item.riskLevel === filterRisk;
  const matchesDate = filterDate === 'all' || (() => {
  const itemDate = new Date(item.timestamp);
  const now = new Date();
  const daysDiff = (now - itemDate) / (1000 * 60 * 60 * 24);
  switch (filterDate) {
  case 'today': return daysDiff < 1;
  case 'week': return daysDiff < 7;
  case 'month': return daysDiff < 30;
  default: return true;
  }
  })();
  return matchesSearch && matchesRisk && matchesDate;
  });

  // Controlled data clearing
  const clearHistory = (type) => {
  if (window.confirm(`Are you sure you want to clear your ${type} history? This action cannot be undone.`)) {
  if (type === 'assessments') {
  localStorage.removeItem('wombguard_history');
  setHistory([]);
  } else {
  localStorage.removeItem('wombguard_chat_history');
  setChatHistory([]);
  }
  }
  };

  return (
  <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
  <div className="max-w-6xl mx-auto">
    {/* Header */}
  <div className="mb-8 animate-fade-in">
  <h1 className="text-3xl font-bold text-neutral-900 mb-2">Your Health History</h1>
  <p className="text-neutral-600">
  Track your pregnancy health journey with assessment results and chat sessions.
  </p>
  </div>

  {/* Tabs */}
  <div className="flex space-x-1 bg-neutral-100 p-1 rounded-xl mb-8">
  <button
  onClick={() => setActiveTab('assessments')}
  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
  activeTab === 'assessments'
  ? 'bg-white text-primary-600 shadow-md'
  : 'text-neutral-600 hover:text-neutral-800'
  }`}
  >
  <Activity className="h-4 w-4 inline mr-2" />
  Risk Assessments ({history.length})
  </button>
  <button
  onClick={() => setActiveTab('chats')}
  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
  activeTab === 'chats'
  ? 'bg-white text-primary-600 shadow-md'
  : 'text-neutral-600 hover:text-neutral-800'
  }`}
  >
  <MessageSquare className="h-4 w-4 inline mr-2" />
  Chat Sessions ({chatHistory.length})
  </button>
  </div>

  {/* ============================= */}
  {/* === Risk Assessment Section === */}
  {/* ============================= */}
  {activeTab === 'assessments' && (
  <>
  {/* Loading State */}
  {loading && (
  <div className="card p-12 text-center">
  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
  <p className="text-neutral-600">Loading your risk assessments...</p>
  </div>
  )}

  {/* Error State */}
  {error && !loading && (
  <div className="card p-6 mb-6 bg-amber-50 border border-amber-200">
  <p className="text-amber-800">
  <strong>Note:</strong> Could not load from backend. Showing local data if available.
  </p>
  </div>
  )}

  {/* Filters */}
  {!loading && (
  <div className="card p-6 mb-6 animate-slide-up">
  <div className="grid md:grid-cols-4 gap-4">
  {/* Search */}
  <div>
  <label className="block text-sm font-medium text-neutral-700 mb-2">Search</label>
  <div className="relative">
  <Search className="h-4 w-4 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
  <input
  type="text"
  placeholder="Search assessments..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="input-field pl-10"
  />
  </div>
  </div>

  {/* Risk Filter */}
  <div>
  <label className="block text-sm font-medium text-neutral-700 mb-2">Risk Level</label>
  <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)} className="input-field">
  <option value="all">All Levels</option>
  <option value="low">Low Risk</option>
  <option value="moderate">Moderate Risk</option>
  <option value="high">High Risk</option>
  </select>
  </div>

  {/* Date Filter */}
  <div>
  <label className="block text-sm font-medium text-neutral-700 mb-2">Date Range</label>
  <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="input-field">
  <option value="all">All Time</option>
  <option value="today">Today</option>
  <option value="week">This Week</option>
  <option value="month">This Month</option>
  </select>
  </div>

  {/* Clear History */}
  <div className="flex items-end">
  <button
  onClick={() => clearHistory('assessments')}
  className="btn-secondary flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
  disabled={history.length === 0}
  >
  <Trash2 className="h-4 w-4" />
  <span>Clear History</span>
  </button>
  </div>
  </div>
  </div>
  )}

  {/* Assessment Cards */}
  {!loading && (
  <div className="space-y-6">
  {filteredHistory.length === 0 ? (
  <div className="card p-12 text-center">
  <Activity className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
  {history.length === 0 ? 'No Assessments Yet' : 'No Matching Results'}
  </h3>
  <p className="text-neutral-600 mb-6">
  {history.length === 0 
  ? 'Take your first health risk assessment to start tracking your pregnancy journey.'
  : 'Try adjusting your search filters to find what you’re looking for.'}
  </p>
  <button onClick={() => navigate('/prediction')} className="btn-primary">
  Take Assessment
  </button>
  </div>
  ) : (
  filteredHistory.map((assessment, index) => {
  const RiskIcon = getRiskIcon(assessment.riskLevel);
  const recs = assessment.recommendations || []; // Safeguard here
    return (
  <div key={index} className="card p-6 hover:shadow-xl transition-shadow duration-300">
  {/* Header */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
  <div className="flex items-center space-x-4 mb-4 md:mb-0">
  <div className={`p-3 rounded-xl ${getRiskColor(assessment.riskLevel)}`}>
  <RiskIcon className="h-6 w-6" />
  </div>
  <div>
  <h3 className="text-xl font-semibold text-neutral-900">
  {assessment.riskLevel.charAt(0).toUpperCase() + assessment.riskLevel.slice(1)} Risk Assessment
  </h3>
  <div className="flex items-center space-x-2 text-neutral-600">
  <Clock className="h-4 w-4" />
  <span>{formatDate(assessment.timestamp)}</span>
  </div>
  </div>
  </div>
    <div className="text-right">
  <div className="text-2xl font-bold text-neutral-900">
  {assessment.riskScore}/{assessment.maxScore}
  </div>
  <div className="text-sm text-neutral-600">Risk Score</div>
  </div>
  </div>

  {/* Progress Bar */}
  <div className="mb-6">
  <div className="flex justify-between text-sm text-neutral-600 mb-2">
  <span>Risk Level</span>
  <span>{Math.round((assessment.riskScore / assessment.maxScore) * 100)}%</span>
  </div>
  <div className="w-full bg-neutral-200 rounded-full h-3">
  <div
  className={`h-3 rounded-full transition-all duration-1000 ${
  assessment.riskLevel === 'high' ? 'bg-red-500' :
  assessment.riskLevel === 'moderate' ? 'bg-amber-500' : 'bg-green-500'
  }`}
  style={{ width: `${(assessment.riskScore / assessment.maxScore) * 100}%` }}
  ></div>
  </div>
  </div>

  {/* Recommendations */}
  <div>
  <h4 className="font-semibold text-neutral-900 mb-3">Recommendations:</h4>
  <div className="grid gap-2">
  {recs.slice(0, 3).map((rec, recIndex) => (
  <div key={recIndex} className="flex items-start space-x-2">
  <CheckCircle className="h-4 w-4 text-primary-500 mt-0.5 flex-shrink-0" />
  <span className="text-sm text-neutral-700">{rec}</span>
  </div>
  ))}
  {recs.length > 3 && (
  <div className="text-sm text-neutral-500 pl-6">
  +{recs.length - 3} more recommendations
  </div>
  )}
  </div>
  </div>
  </div>
  );
  })
  )}
  </div>
  )}
  </>
  )}

  {/* ======================= */}
  {/* === Chat History Tab === */}
  {/* ======================= */}
  {activeTab === 'chats' && (
  <>
  <div className="flex justify-end mb-6">
  <button
  onClick={() => clearHistory('chats')}
  className="btn-secondary flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
  disabled={chatHistory.length === 0}
  >
  <Trash2 className="h-4 w-4" />
  <span>Clear Chat History</span>
  </button>
  </div>

  <div className="space-y-4">
  {chatHistory.length === 0 ? (
  <div className="card p-12 text-center">
  <MessageSquare className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
  <h3 className="text-xl font-semibold text-neutral-900 mb-2">No Chat Sessions</h3>
  <p className="text-neutral-600 mb-6">
  Start a conversation with our AI assistant to get pregnancy support and guidance.
  </p>
  <button onClick={() => navigate('/chat')} className="btn-primary">
  Start Chatting
  </button>
  </div>
  ) : (
  chatHistory.map((session, index) => (
  <div key={session.id} className="card p-6 hover:shadow-lg transition-shadow duration-200">
  <div className="flex items-center justify-between">
  <div className="flex items-center space-x-4">
  <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-3 rounded-xl">
  <MessageSquare className="h-6 w-6 text-white" />
  </div>
  <div>
  <h3 className="text-lg font-semibold text-neutral-900">
  Chat Session #{chatHistory.length - index}
  </h3>
  <div className="flex items-center space-x-4 text-sm text-neutral-600">
  <div className="flex items-center space-x-1">
  <Clock className="h-4 w-4" />
  <span>{formatDate(session.startTime)}</span>
  </div>
  <span>{session.messageCount} messages</span>
  </div>
  </div>
  </div>
  <button onClick={() => navigate('/chat')} className="btn-secondary text-sm">
  Continue Chat
  </button>
  </div>
  <div className="mt-4 p-4 bg-neutral-50 rounded-xl">
  <p className="text-sm text-neutral-600 italic">"{session.preview}"</p>
  </div>
  </div>
  ))
  )}
  </div>
  </>
  )}
  </div>
  </div>
  );
};

export default History;
