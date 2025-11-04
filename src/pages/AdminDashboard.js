import React, { useState, useEffect } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, AlertTriangle, MessageSquare, RefreshCw, Activity, Trash2, Edit2, Lock, Unlock, Plus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', role: 'pregnant_woman' });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showMetricDetail, setShowMetricDetail] = useState(false);
  const [animatingMetrics, setAnimatingMetrics] = useState({});
  const [consultationStats, setConsultationStats] = useState(null);

  // Redirect if not admin
  useEffect(() => {
  if (user && user.role !== 'admin') {
  navigate('/dashboard');
  }
  }, [user, navigate]);

  // Fetching admin dashboard data
  const fetchDashboardData = async () => {
  try {
  setError(null);
  // SECURITY FIX: Including user_email parameter for authorization
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const url = `${API_BASE_URL}/admin-dashboard?user_email=${encodeURIComponent(user?.email || '')}`;
  const response = await fetch(url);
  if (!response.ok) {
  if (response.status === 403) {
  throw new Error('Access denied. Admin role required.');
  }
  throw new Error('Failed to fetch dashboard data');
  }

  const data = await response.json();
  if (data.status === 'success') {
  setDashboardData(data.data);
  }

  // Fetch consultation statistics
  await fetchConsultationStats();
  } catch (err) {
  console.error('Error fetching dashboard:', err);
  setError(err.message);
  } finally {
  setLoading(false);
  setRefreshing(false);
  }
  };

  // Fetch consultation statistics
  const fetchConsultationStats = async () => {
  try {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const response = await fetch(`${API_BASE_URL}/admin/consultation-stats`);
  const data = await response.json();
  if (data.status === 'success') {
  setConsultationStats(data.data);
  }
  } catch (err) {
  console.error('Error fetching consultation stats:', err);
  setConsultationStats(null);
  }
  };

  useEffect(() => {
  if (user?.role === 'admin') {
  fetchDashboardData();
  // Auto-refresh every 30 seconds
  const interval = setInterval(fetchDashboardData, 30000);
  return () => clearInterval(interval);
  }
  }, [user]);

  const handleRefresh = () => {
  setRefreshing(true);
  fetchDashboardData();
  };

  // Handle metric card click for drill-down
  const handleMetricClick = (metricName, metricValue) => {
    setSelectedMetric({ name: metricName, value: metricValue });
    setShowMetricDetail(true);
    // Trigger animation
    setAnimatingMetrics(prev => ({ ...prev, [metricName]: true }));
    setTimeout(() => {
      setAnimatingMetrics(prev => ({ ...prev, [metricName]: false }));
    }, 600);
  };

  // Close metric detail modal
  const closeMetricDetail = () => {
    setShowMetricDetail(false);
    setTimeout(() => setSelectedMetric(null), 300);
  };

  // Add User
  const handleAddUser = async () => {
  if (!formData.name || !formData.email || !formData.password || !formData.phone) {
  setActionMessage({ type: 'error', text: 'Please fill all fields' });
  return;
  }

  setActionLoading(true);
  try {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
  });

  const data = await response.json();
  if (response.ok) {
  setActionMessage({ type: 'success', text: 'User created successfully' });
  setShowAddModal(false);
  setFormData({ name: '', email: '', password: '', phone: '', role: 'pregnant_woman' });
  setTimeout(() => fetchDashboardData(), 1000);
  } else {
  // Handling both string and array error details from FastAPI
  let errorText = 'Failed to create user';
  if (data.detail) {
    if (Array.isArray(data.detail)) {
      // If detail is an array of validation errors, extract messages
      errorText = data.detail.map(err => err.msg || err).join(', ');
    } else if (typeof data.detail === 'string') {
      errorText = data.detail;
    }
  }
  setActionMessage({ type: 'error', text: errorText });
  }
  } catch (err) {
  setActionMessage({ type: 'error', text: err.message });
  } finally {
  setActionLoading(false);
  }
  };

  // Updating User
  const handleUpdateUser = async () => {
  if (!formData.name || !formData.role) {
  setActionMessage({ type: 'error', text: 'Please fill all fields' });
  return;
  }

  setActionLoading(true);
  try {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const response = await fetch(`${API_BASE_URL}/admin/users/${selectedUser.id}?name=${encodeURIComponent(formData.name)}&role=${encodeURIComponent(formData.role)}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' }
  });

  const data = await response.json();
  if (response.ok) {
  setActionMessage({ type: 'success', text: 'User updated successfully' });
  setShowEditModal(false);
  setSelectedUser(null);
  setTimeout(() => fetchDashboardData(), 1000);
  } else {
  // Handling both string and array error details from FastAPI
  let errorText = 'Failed to update user';
  if (data.detail) {
    if (Array.isArray(data.detail)) {
      errorText = data.detail.map(err => err.msg || err).join(', ');
    } else if (typeof data.detail === 'string') {
      errorText = data.detail;
    }
  }
  setActionMessage({ type: 'error', text: errorText });
  }
  } catch (err) {
  setActionMessage({ type: 'error', text: err.message });
  } finally {
  setActionLoading(false);
  }
  };

  // Deleting User
  const handleDeleteUser = async () => {
  setActionLoading(true);
  try {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const response = await fetch(`${API_BASE_URL}/admin/users/${selectedUser.id}`, {
  method: 'DELETE'
  });

  const data = await response.json();
  if (response.ok) {
  setActionMessage({ type: 'success', text: 'User deleted successfully' });
  setShowDeleteModal(false);
  setSelectedUser(null);
  setTimeout(() => fetchDashboardData(), 1000);
  } else {
  // Handling both string and array error details from FastAPI
  let errorText = 'Failed to delete user';
  if (data.detail) {
    if (Array.isArray(data.detail)) {
      errorText = data.detail.map(err => err.msg || err).join(', ');
    } else if (typeof data.detail === 'string') {
      errorText = data.detail;
    }
  }
  setActionMessage({ type: 'error', text: errorText });
  }
  } catch (err) {
  setActionMessage({ type: 'error', text: err.message });
  } finally {
  setActionLoading(false);
  }
  };

  // Block/Unblock User
  const handleToggleBlock = async (userId, currentBlockStatus) => {
  try {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/block?blocked=${!currentBlockStatus}`, {
  method: 'PUT'
  });

  const data = await response.json();
  if (response.ok) {
  setActionMessage({ type: 'success', text: `User ${!currentBlockStatus ? 'blocked' : 'unblocked'} successfully` });
  setTimeout(() => fetchDashboardData(), 1000);
  } else {
  setActionMessage({ type: 'error', text: data.detail || 'Failed to toggle block status' });
  }
  } catch (err) {
  setActionMessage({ type: 'error', text: err.message });
  }
  };

  const openEditModal = (user) => {
  setSelectedUser(user);
  setFormData({ name: user.name, email: user.email, role: user.role });
  setShowEditModal(true);
  };

  const openDeleteModal = (user) => {
  setSelectedUser(user);
  setShowDeleteModal(true);
  };

  // Show loading state while auth is initializing
  if (authLoading) {
  return (
  <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
  <div className="text-center">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
  <p className="text-neutral-600">Loading...</p>
  </div>
  </div>
  );
  }

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
  return (
  <div className="min-h-screen flex items-center justify-center py-12 px-4">
  <div className="card p-8 text-center max-w-md w-full">
  <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
  <h2 className="text-2xl font-bold text-neutral-900 mb-4">Access Restricted</h2>
  <p className="text-neutral-600 mb-6">
  This dashboard is only available for administrators.
  </p>
  <button onClick={() => navigate('/')} className="btn-primary w-full">
  Go Home
  </button>
  </div>
  </div>
  );
  }

  if (loading) {
  return (
  <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
  <div className="text-center">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
  <p className="text-neutral-600">Loading dashboard...</p>
  </div>
  </div>
  );
  }

  if (error) {
  return (
  <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-8">
  <div className="max-w-7xl mx-auto">
  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
  <p className="text-red-800">Error: {error}</p>
  </div>
  </div>
  </div>
  );
  }

  const stats = dashboardData?.statistics || {};
  const users = dashboardData?.all_users || [];
  const assessments = dashboardData?.recent_assessments || [];

  // Helper function to format last updated time
  const getLastUpdatedText = () => {
    const now = new Date();
    const lastRefresh = new Date(now.getTime() - 30000); 
    const diffMinutes = Math.floor((now - lastRefresh) / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return 'Today';
  };

  // Helper function to get status based on metric with trend detection
  const getMetricStatus = (metric, value) => {
    if (value === 0) return { text: 'No data', color: 'text-neutral-500', icon: '' };

    // Trend detection logic
    const getTrendIndicator = () => {
      // Simulating trend data 
      const trends = {
        total_users: { current: value, previous: Math.max(0, value - 2) },
        total_assessments: { current: value, previous: Math.max(0, value - 3) },
        high_risk_cases: { current: value, previous: Math.max(0, value + 1) },
        chat_sessions: { current: value, previous: Math.max(0, value - 4) }
      };

      const trend = trends[metric];
      if (!trend) return { direction: 'stable', percent: 0 };

      const change = trend.current - trend.previous;
      const percent = trend.previous > 0 ? Math.round((change / trend.previous) * 100) : 0;

      if (change > 0) return { direction: 'up', percent: Math.abs(percent) };
      if (change < 0) return { direction: 'down', percent: Math.abs(percent) };
      return { direction: 'stable', percent: 0 };
    };

    const trend = getTrendIndicator();

    // Status logic based on metric type
    if (metric === 'high_risk_cases') {
      if (value > 5) return {
        text: `High alert - ${value} cases`,
        color: 'text-red-600',
        icon: '',
        trend: trend
      };
      if (value > 0) return {
        text: `${value} case${value > 1 ? 's' : ''} monitored`,
        color: 'text-orange-600',
        icon: '',
        trend: trend
      };
      return {
        text: 'All clear',
        color: 'text-green-600',
        icon: '',
        trend: trend
      };
    }

    // For other metrics
    if (trend.direction === 'up') {
      return {
        text: 'Growth',
        color: 'text-green-600',
        icon: '',
        trend: trend
      };
    }
    if (trend.direction === 'down') {
      return {
        text: 'Decline',
        color: 'text-orange-600',
        icon: '',
        trend: trend
      };
    }

    return {
      text: 'Stable',
      color: 'text-blue-600',
      icon: '',
      trend: trend
    };
  };

    // Prepare chart data
  const monthlyTrends = Object.entries(dashboardData?.monthly_trends || {}).map(([month, count]) => ({
  name: month,
  assessments: count
  }));

  const userDistribution = [
  { name: 'Pregnant Women', value: stats.pregnant_women || 0, fill: '#ec4899' },
  { name: 'Healthcare Providers', value: stats.healthcare_providers || 0, fill: '#06b6d4' },
  { name: 'Admins', value: stats.admins || 0, fill: '#8b5cf6' }
  ];

  return (
  <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
  {/* Header */}
  <div className="bg-white shadow-sm border-b border-neutral-200 sticky top-16 z-40">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
  <div className="flex justify-between items-start">
  <div>
  <h1 className="text-3xl font-bold text-neutral-900">System Dashboard</h1>
  <p className="text-neutral-600 mt-1">Monitor system performance and user analytics</p>
  </div>
  <div className="flex gap-3">
  <button
  onClick={() => setShowAddModal(true)}
  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
  >
  <Plus className="h-4 w-4" />
  <span>Add User</span>
  </button>
  <button
  onClick={handleRefresh}
  disabled={refreshing}
  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
  >
  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
  <span>Refresh</span>
  </button>
  </div>
  </div>
  </div>
  </div>

  {/* Action Message */}
  {actionMessage && (
  <div className={`fixed top-20 right-4 p-4 rounded-lg text-white z-50 ${actionMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
  {actionMessage.text}
  </div>
  )}

  {/* Main Content */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {/* Statistics Cards */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
  <div
    onClick={() => handleMetricClick('total_users', stats.total_users)}
    className={`bg-white rounded-lg shadow p-6 border-l-4 border-primary-500 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
      animatingMetrics.total_users ? 'animate-pulse' : ''
    }`}
  >
  <div className="flex justify-between items-start">
  <div>
  <p className="text-neutral-600 text-sm font-medium">Total Users</p>
  <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.total_users || 0}</p>
  <p className={`text-xs mt-2 ${getMetricStatus('total_users', stats.total_users).color}`}>
    {getMetricStatus('total_users', stats.total_users).text}
  </p>
  </div>
  <Users className="h-8 w-8 text-primary-500 opacity-20" />
  </div>
  </div>

  <div
    onClick={() => handleMetricClick('total_assessments', stats.total_assessments)}
    className={`bg-white rounded-lg shadow p-6 border-l-4 border-blue-500 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
      animatingMetrics.total_assessments ? 'animate-pulse' : ''
    }`}
  >
  <div className="flex justify-between items-start">
  <div>
  <p className="text-neutral-600 text-sm font-medium">Risk Assessments</p>
  <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.total_assessments || 0}</p>
  <p className={`text-xs mt-2 ${getMetricStatus('total_assessments', stats.total_assessments).color}`}>
    Updated {getLastUpdatedText()}
  </p>
  </div>
  <Activity className="h-8 w-8 text-blue-500 opacity-20" />
  </div>
  </div>

  <div
    onClick={() => handleMetricClick('high_risk_cases', stats.high_risk_cases)}
    className={`bg-white rounded-lg shadow p-6 border-l-4 border-red-500 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
      animatingMetrics.high_risk_cases ? 'animate-pulse' : ''
    }`}
  >
  <div className="flex justify-between items-start">
  <div>
  <p className="text-neutral-600 text-sm font-medium">High Risk Cases</p>
  <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.high_risk_cases || 0}</p>
  <p className={`text-xs mt-2 ${getMetricStatus('high_risk_cases', stats.high_risk_cases).color}`}>
    {getMetricStatus('high_risk_cases', stats.high_risk_cases).text}
  </p>
  </div>
  <AlertTriangle className="h-8 w-8 text-red-500 opacity-20" />
  </div>
  </div>

  <div
    onClick={() => handleMetricClick('chat_sessions', stats.chat_sessions)}
    className={`bg-white rounded-lg shadow p-6 border-l-4 border-green-500 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
      animatingMetrics.chat_sessions ? 'animate-pulse' : ''
    }`}
  >
  <div className="flex justify-between items-start">
  <div>
  <p className="text-neutral-600 text-sm font-medium">Chat Sessions</p>
  <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.chat_sessions || 0}</p>
  <p className={`text-xs mt-2 ${getMetricStatus('chat_sessions', stats.chat_sessions).color}`}>
    {getMetricStatus('chat_sessions', stats.chat_sessions).text}
  </p>
  </div>
  <MessageSquare className="h-8 w-8 text-green-500 opacity-20" />
  </div>
  </div>

  <div
    onClick={() => handleMetricClick('consultations', consultationStats?.total)}
    className={`bg-white rounded-lg shadow p-6 border-l-4 border-purple-500 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
      animatingMetrics.consultations ? 'animate-pulse' : ''
    }`}
  >
  <div className="flex justify-between items-start">
  <div>
  <p className="text-neutral-600 text-sm font-medium">Consultations</p>
  <p className="text-3xl font-bold text-neutral-900 mt-2">{consultationStats?.total || 0}</p>
  <p className="text-xs mt-2 text-purple-600">
    {consultationStats?.pending || 0} pending
  </p>
  </div>
  <MessageSquare className="h-8 w-8 text-purple-500 opacity-20" />
  </div>
  </div>
  </div>

  {/* Healthcare Summary - System Health Overview */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  {/* Current High Risk */}
  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow p-6 border-l-4 border-red-600">
  <div className="flex items-center justify-between mb-4">
  <h3 className="text-lg font-bold text-red-900">Current High Risk</h3>
  <span className="text-3xl font-bold text-red-600">{stats.high_risk_cases || 0}</span>
  </div>
  <p className="text-sm text-red-700">Patients requiring immediate attention</p>
  </div>

  {/* Recently Improved */}
  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6 border-l-4 border-green-600">
  <div className="flex items-center justify-between mb-4">
  <h3 className="text-lg font-bold text-green-900">Recently Improved</h3>
  <span className="text-3xl font-bold text-green-600">{dashboardData?.statistics?.recently_improved_count || 0}</span>
  </div>
  <p className="text-sm text-green-700">Patients showing positive progress</p>
  </div>

  {/* At-Risk Alerts */}
  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow p-6 border-l-4 border-orange-600">
  <div className="flex items-center justify-between mb-4">
  <h3 className="text-lg font-bold text-orange-900">Worsening Trends</h3>
  <span className="text-3xl font-bold text-orange-600">{dashboardData?.statistics?.at_risk_alerts_count || 0}</span>
  </div>
  <p className="text-sm text-orange-700">Patients with increasing risk</p>
  </div>
  </div>

  {/* Charts */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
  {/* Risk Assessment Trends */}
  <div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-lg font-semibold text-neutral-900 mb-4">Risk Assessment Trends</h2>
  <ResponsiveContainer width="100%" height={300}>
  <LineChart data={monthlyTrends}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Line type="monotone" dataKey="assessments" stroke="#3b82f6" strokeWidth={2} />
  </LineChart>
  </ResponsiveContainer>
  </div>

  {/* User Distribution */}
  <div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-lg font-semibold text-neutral-900 mb-4">User Distribution</h2>
  <ResponsiveContainer width="100%" height={300}>
  <PieChart>
  <Pie
  data={userDistribution}
  cx="50%"
  cy="50%"
  labelLine={false}
  label={({ name, value, percent }) => `${name} ${value} (${(percent * 100).toFixed(0)}%)`}
  outerRadius={80}
  fill="#8884d8"
  dataKey="value"
  >
  {userDistribution.map((entry, index) => (
  <Cell key={`cell-${index}`} fill={entry.fill} />
  ))}
  </Pie>
  <Tooltip />
  </PieChart>
  </ResponsiveContainer>
  </div>
  </div>

  {/* All Users Table */}
  <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
  <div className="px-6 py-4 border-b border-neutral-200">
  <h2 className="text-lg font-semibold text-neutral-900">All Users</h2>
  </div>
  <div className="overflow-x-auto">
  <table className="w-full">
  <thead className="bg-neutral-50 border-b border-neutral-200">
  <tr>
  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Name</th>
  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Email</th>
  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Phone</th>
  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Role</th>
  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Assessments</th>
  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">High Risk</th>
  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Last Assessment</th>
  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Actions</th>
  </tr>
  </thead>
  <tbody className="divide-y divide-neutral-200">
  {users.map((user) => (
  <tr key={user.id} className="hover:bg-neutral-50">
  <td className="px-6 py-4 text-sm text-neutral-900">{user.name}</td>
  <td className="px-6 py-4 text-sm text-neutral-600">{user.email}</td>
  <td className="px-6 py-4 text-sm">
  <a href={`tel:${user.phone}`} className="text-blue-600 hover:text-blue-800 font-semibold">
  {user.phone || 'N/A'}
  </a>
  </td>
  <td className="px-6 py-4 text-sm">
  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
  user.role === 'pregnant_woman' ? 'bg-pink-100 text-pink-800' :
  user.role === 'healthcare_provider' ? 'bg-blue-100 text-blue-800' :
  'bg-purple-100 text-purple-800'
  }`}>
  {user.role === 'pregnant_woman' ? 'Pregnant Woman' : user.role}
  </span>
  </td>
  <td className="px-6 py-4 text-sm text-neutral-900">{user.assessment_count}</td>
  <td className="px-6 py-4 text-sm">
  <span className={user.high_risk_count > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
  {user.high_risk_count}
  </span>
  </td>
  <td className="px-6 py-4 text-sm text-neutral-600">
  {user.last_assessment ? new Date(user.last_assessment).toLocaleDateString() : 'N/A'}
  </td>
  <td className="px-6 py-4 text-sm">
  <div className="flex gap-2">
  <button
  onClick={() => openEditModal(user)}
  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
  title="Edit"
  >
  <Edit2 className="h-4 w-4" />
  </button>
  <button
  onClick={() => handleToggleBlock(user.id, user.is_blocked)}
  className={`p-2 rounded transition-colors ${user.is_blocked ? 'text-green-600 hover:bg-green-50' : 'text-orange-600 hover:bg-orange-50'}`}
  title={user.is_blocked ? 'Unblock' : 'Block'}
  >
  {user.is_blocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
  </button>
  <button
  onClick={() => openDeleteModal(user)}
  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
  title="Delete"
  >
  <Trash2 className="h-4 w-4" />
  </button>
  </div>
  </td>
  </tr>
  ))}
  </tbody>
  </table>
  </div>
  </div>
  </div>

  {/* Consultation Management Section */}
  {consultationStats && (
  <div className="bg-white rounded-lg shadow p-6 mb-8">
  <h2 className="text-xl font-bold text-neutral-900 mb-6">Consultation Management</h2>

  {/* Consultation Stats Grid */}
  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
  <p className="text-sm text-neutral-600 mb-1">Total Requests</p>
  <p className="text-2xl font-bold text-blue-600">{consultationStats.total || 0}</p>
  </div>
  <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
  <p className="text-sm text-neutral-600 mb-1">Pending</p>
  <p className="text-2xl font-bold text-yellow-600">{consultationStats.pending || 0}</p>
  </div>
  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
  <p className="text-sm text-neutral-600 mb-1">Accepted</p>
  <p className="text-2xl font-bold text-green-600">{consultationStats.accepted || 0}</p>
  </div>
  <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
  <p className="text-sm text-neutral-600 mb-1">Declined</p>
  <p className="text-2xl font-bold text-red-600">{consultationStats.declined || 0}</p>
  </div>
  <div className="bg-neutral-50 p-4 rounded-lg border-l-4 border-neutral-500">
  <p className="text-sm text-neutral-600 mb-1">Closed</p>
  <p className="text-2xl font-bold text-neutral-600">{consultationStats.closed || 0}</p>
  </div>
  </div>

  {/* Consultation Activity Summary */}
  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
  <div className="flex items-center justify-between">
  <div>
  <p className="text-sm text-neutral-600 mb-1">System Activity</p>
  <p className="text-lg font-semibold text-neutral-900">
    {consultationStats.pending > 0
      ? `${consultationStats.pending} consultation${consultationStats.pending > 1 ? 's' : ''} awaiting provider response`
      : 'All consultations have been addressed'}
  </p>
  </div>
  <MessageSquare className="h-10 w-10 text-purple-500 opacity-30" />
  </div>
  </div>
  </div>
  )}

  {/* Adding User Modal */}
  {showAddModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
  <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
  <div className="flex justify-between items-center mb-4">
  <h3 className="text-xl font-bold text-neutral-900">Add New User</h3>
  <button onClick={() => setShowAddModal(false)} className="text-neutral-500 hover:text-neutral-700">
  <X className="h-5 w-5" />
  </button>
  </div>
  <div className="space-y-4">
  <input
  type="text"
  placeholder="Full Name"
  value={formData.name}
  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
  />
  <input
  type="email"
  placeholder="Email"
  value={formData.email}
  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
  />
  <input
  type="password"
  placeholder="Password"
  value={formData.password}
  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
  />
  <input
  type="tel"
  placeholder="Phone Number"
  value={formData.phone}
  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
  />
  <select
  value={formData.role}
  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
  >
  <option value="pregnant_woman">Pregnant Woman</option>
  <option value="healthcare_provider">Healthcare Provider</option>
  <option value="admin">Admin</option>
  </select>
  </div>
  <div className="flex gap-3 mt-6">
  <button
  onClick={() => setShowAddModal(false)}
  className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
  >
  Cancel
  </button>
  <button
  onClick={handleAddUser}
  disabled={actionLoading}
  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
  >
  {actionLoading ? 'Creating...' : 'Create User'}
  </button>
  </div>
  </div>
  </div>
  )}

  {/* Edit User Modal */}
  {showEditModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
  <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
  <div className="flex justify-between items-center mb-4">
  <h3 className="text-xl font-bold text-neutral-900">Edit User</h3>
  <button onClick={() => setShowEditModal(false)} className="text-neutral-500 hover:text-neutral-700">
  <X className="h-5 w-5" />
  </button>
  </div>
  <div className="space-y-4">
  <div>
  <label className="text-sm text-neutral-600">Email</label>
  <input
  type="email"
  value={formData.email}
  disabled
  className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-600"
  />
  </div>
  <input
  type="text"
  placeholder="Full Name"
  value={formData.name}
  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
  />
  <select
  value={formData.role}
  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
  >
  <option value="pregnant_woman">Pregnant Woman</option>
  <option value="healthcare_provider">Healthcare Provider</option>
  <option value="admin">Admin</option>
  </select>
  </div>
  <div className="flex gap-3 mt-6">
  <button
  onClick={() => setShowEditModal(false)}
  className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
  >
  Cancel
  </button>
  <button
  onClick={handleUpdateUser}
  disabled={actionLoading}
  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
  >
  {actionLoading ? 'Updating...' : 'Update User'}
  </button>
  </div>
  </div>
  </div>
  )}

  {/* Delete User Modal */}
  {showDeleteModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
  <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
  <div className="flex justify-between items-center mb-4">
  <h3 className="text-xl font-bold text-neutral-900">Delete User</h3>
  <button onClick={() => setShowDeleteModal(false)} className="text-neutral-500 hover:text-neutral-700">
  <X className="h-5 w-5" />
  </button>
  </div>
  <p className="text-neutral-600 mb-6">
  Are you sure you want to delete <strong>{selectedUser?.name}</strong> ({selectedUser?.email})? This action cannot be undone and will delete all their data.
  </p>
  <div className="flex gap-3">
  <button
  onClick={() => setShowDeleteModal(false)}
  className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
  >
  Cancel
  </button>
  <button
  onClick={handleDeleteUser}
  disabled={actionLoading}
  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
  >
  {actionLoading ? 'Deleting...' : 'Delete User'}
  </button>
  </div>
  </div>
  </div>
  )}

  {/* Metric Detail Modal */}
  {showMetricDetail && selectedMetric && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
  <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-slideUp">
  <div className="flex justify-between items-center mb-4">
  <h3 className="text-xl font-bold text-neutral-900">
    {selectedMetric.name.replace(/_/g, ' ').toUpperCase()}
  </h3>
  <button
    onClick={closeMetricDetail}
    className="text-neutral-500 hover:text-neutral-700 transition-colors"
  >
    <X className="h-5 w-5" />
  </button>
  </div>

  <div className="space-y-4">
  {/* Current Value */}
  <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4">
  <p className="text-sm text-neutral-600 mb-1">Current Value</p>
  <p className="text-4xl font-bold text-primary-600">{selectedMetric.value}</p>
  </div>

  {/* Status */}
  <div className="bg-neutral-50 rounded-lg p-4">
  <p className="text-sm text-neutral-600 mb-2">Status</p>
  <p className={`text-lg font-semibold ${getMetricStatus(selectedMetric.name, selectedMetric.value).color}`}>
    {getMetricStatus(selectedMetric.name, selectedMetric.value).text}
  </p>
  </div>

  {/* Trend Information */}
  <div className="bg-blue-50 rounded-lg p-4">
  <p className="text-sm text-neutral-600 mb-2">Trend</p>
  <div className="flex items-center space-x-2">
    <span className="text-2xl">{getMetricStatus(selectedMetric.name, selectedMetric.value).icon}</span>
    <p className="text-sm text-neutral-700">
      {getMetricStatus(selectedMetric.name, selectedMetric.value).trend?.direction === 'up' &&
        `Increasing by ${getMetricStatus(selectedMetric.name, selectedMetric.value).trend?.percent}%`}
      {getMetricStatus(selectedMetric.name, selectedMetric.value).trend?.direction === 'down' &&
        `Decreasing by ${getMetricStatus(selectedMetric.name, selectedMetric.value).trend?.percent}%`}
      {getMetricStatus(selectedMetric.name, selectedMetric.value).trend?.direction === 'stable' &&
        'Stable - No significant change'}
    </p>
  </div>
  </div>

  {/* Last Updated */}
  <div className="bg-green-50 rounded-lg p-4">
  <p className="text-sm text-neutral-600 mb-1">Last Updated</p>
  <p className="text-sm text-green-700">{getLastUpdatedText()}</p>
  </div>

  {/* Action Button */}
  <button
    onClick={closeMetricDetail}
    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
  >
    Close
  </button>
  </div>
  </div>
  </div>
  )}
  </div>
  );
};

export default AdminDashboard;

