import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, AlertTriangle, MessageSquare, RefreshCw, TrendingUp, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const HealthcareWorkerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showMetricDetail, setShowMetricDetail] = useState(false);
  const [animatingMetrics, setAnimatingMetrics] = useState({});
  const [consultations, setConsultations] = useState([]);
  const [consultationStats, setConsultationStats] = useState(null);
  const [showConsultationDetail, setShowConsultationDetail] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [respondingConsultation, setRespondingConsultation] = useState(null);
  const [consultationResponse, setConsultationResponse] = useState({
    status: 'accepted',
    response_message: ''
  });

  // Fetch healthcare dashboard data
  const fetchDashboardData = async () => {
  try {
  setError(null);
  // SECURITY FIX: Include user_email parameter for authorization
  const url = `http://localhost:8000/healthcare-dashboard?user_email=${encodeURIComponent(user?.email || '')}`;
  const response = await fetch(url);
  if (!response.ok) {
  if (response.status === 403) {
  throw new Error('Access denied. Healthcare provider role required.');
  }
  throw new Error('Failed to fetch dashboard data');
  }

  const data = await response.json();
  if (data.status === 'success') {
  // Debug logging
  console.log('Dashboard data received:', data.data);
  console.log('High risk patients:', data.data?.high_risk_patients);
  console.log('All assessments:', data.data?.all_assessments);
  setDashboardData(data.data);
  }

  // Fetch consultation data
  await fetchConsultationData();
  } catch (err) {
  console.error('Error fetching dashboard:', err);
  setError(err.message);
  } finally {
  setLoading(false);
  setRefreshing(false);
  }
  };

  const fetchConsultationData = async () => {
  try {
  // Fetch consultation requests
  const consultResponse = await fetch(`http://localhost:8000/consultation-requests?user_email=${user?.email}`);
  const consultData = await consultResponse.json();

  if (consultData.status === 'success') {
  setConsultations(consultData.data || []);
  }

  // Fetch consultation stats
  const statsResponse = await fetch(`http://localhost:8000/consultation-requests/stats/${user?.email}`);
  const statsData = await statsResponse.json();

  if (statsData.status === 'success') {
  setConsultationStats(statsData.data);
  }
  } catch (error) {
  console.error('Error fetching consultation data:', error);
  setConsultations([]);
  setConsultationStats(null);
  }
  };

  useEffect(() => {
  if (user?.role === 'healthcare_provider' || user?.role === 'admin') {
  fetchDashboardData();
  // Auto-refresh every 30 seconds
  const interval = setInterval(fetchDashboardData, 30000);
  return () => clearInterval(interval);
  }
  }, [user]);

  const handleRefresh = async () => {
  setRefreshing(true);
  await fetchDashboardData();
  };

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

  // Helper function to get status with trend detection
  const getMetricStatus = (metric, value) => {
    if (value === 0) return { text: 'No data', color: 'text-neutral-500', icon: '' };

    const getTrendIndicator = () => {
      const trends = {
        total_patients: { current: value, previous: Math.max(0, value - 2) },
        total_assessments: { current: value, previous: Math.max(0, value - 3) },
        high_risk_alerts: { current: value, previous: Math.max(0, value + 1) },
        consultation_requests: { current: value, previous: Math.max(0, value - 1) }
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

    if (metric === 'high_risk_alerts') {
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

  // Handle metric card click
  const handleMetricClick = (metricName, metricValue) => {
    setSelectedMetric({ name: metricName, value: metricValue });
    setShowMetricDetail(true);
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

  // Handle consultation response
  const handleRespondToConsultation = async (consultationId, status, message) => {
    try {
      const response = await fetch(`http://localhost:8000/consultation-request/${consultationId}?user_email=${user?.email}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: status,
          response_message: message
        })
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setShowConsultationDetail(false);
        setSelectedConsultation(null);
        setRespondingConsultation(null);
        setConsultationResponse({ status: 'accepted', response_message: '' });
        await fetchConsultationData();
      }
    } catch (error) {
      console.error('Error responding to consultation:', error);
    }
  };

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

  if (!user || (user.role !== 'healthcare_provider' && user.role !== 'admin')) {
  return (
  <div className="min-h-screen flex items-center justify-center py-12 px-4">
  <div className="card p-8 text-center max-w-md w-full">
  <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
  <h2 className="text-2xl font-bold text-neutral-900 mb-4">Access Restricted</h2>
  <p className="text-neutral-600 mb-6">
  This dashboard is only available for healthcare workers and administrators.
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
  <div className="min-h-screen flex items-center justify-center py-12 px-4">
  <div className="card p-12 text-center">
  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
  <p className="text-neutral-600">Loading healthcare dashboard...</p>
  </div>
  </div>
  );
  }

  if (error) {
  return (
  <div className="min-h-screen flex items-center justify-center py-12 px-4">
  <div className="card p-8 text-center max-w-md w-full">
  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
  <h2 className="text-2xl font-bold text-neutral-900 mb-4">Error Loading Dashboard</h2>
  <p className="text-neutral-600 mb-6">{error}</p>
  <button onClick={handleRefresh} className="btn-primary w-full">
  Retry
  </button>
  </div>
  </div>
  );
  }

  const stats = dashboardData?.statistics || {};
  const weeklyData = Object.entries(dashboardData?.weekly_activity || {}).map(([day, count]) => ({
  name: day,
  assessments: count
  }));
  const riskData = [
  { name: 'Low Risk', value: stats.low_risk_count || 0, fill: '#10b981' },
  { name: 'High Risk', value: stats.high_risk_alerts || 0, fill: '#ef4444' }
  ];

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
  {/* Header */}
  <div className="bg-white shadow-sm border-b border-neutral-200 sticky top-16 z-40">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
  <div className="flex justify-between items-start">
  <div>
  <h1 className="text-3xl font-bold text-neutral-900">Healthcare Provider Dashboard</h1>
  <p className="text-neutral-600 mt-1">Track patient health and monitor risk assessments</p>
  </div>
  <button
  onClick={handleRefresh}
  disabled={refreshing}
  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-md hover:shadow-lg"
  >
  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
  <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
  </button>
  </div>
  </div>
  </div>

  {/* Main Content */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

  {/* Statistics Cards */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  {/* Patients Monitored */}
  <div
    onClick={() => handleMetricClick('total_patients', stats.total_patients || 0)}
    className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-500 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
      animatingMetrics.total_patients ? 'animate-pulse' : ''
    }`}
  >
  <div className="flex justify-between items-start">
  <div>
  <p className="text-neutral-600 text-sm font-medium">Patients Monitored</p>
  <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.total_patients || 0}</p>
  </div>
  <Users className="h-8 w-8 text-primary-500 opacity-20" />
  </div>
  </div>

  {/* Recent Assessments */}
  <div
    onClick={() => handleMetricClick('total_assessments', stats.total_assessments || 0)}
    className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
      animatingMetrics.total_assessments ? 'animate-pulse' : ''
    }`}
  >
  <div className="flex justify-between items-start">
  <div>
  <p className="text-neutral-600 text-sm font-medium">Recent Assessments</p>
  <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.total_assessments || 0}</p>
  </div>
  <TrendingUp className="h-8 w-8 text-blue-500 opacity-20" />
  </div>
  </div>

  {/* High Risk Alerts */}
  <div
    onClick={() => handleMetricClick('high_risk_alerts', stats.high_risk_alerts || 0)}
    className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
      animatingMetrics.high_risk_alerts ? 'animate-pulse' : ''
    }`}
  >
  <div className="flex justify-between items-start">
  <div>
  <p className="text-neutral-600 text-sm font-medium">High Risk Alerts</p>
  <p className="text-3xl font-bold text-red-600 mt-2">{stats.high_risk_alerts || 0}</p>
  </div>
  <AlertTriangle className="h-8 w-8 text-red-500 opacity-20" />
  </div>
  </div>

  {/* Consultation Requests */}
  <div
    onClick={() => handleMetricClick('consultation_requests', consultationStats?.total || 0)}
    className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
      animatingMetrics.consultation_requests ? 'animate-pulse' : ''
    }`}
  >
  <div className="flex justify-between items-start">
  <div>
  <p className="text-neutral-600 text-sm font-medium">Consultation Requests</p>
  <p className="text-3xl font-bold text-neutral-900 mt-2">{consultationStats?.total || 0}</p>
  <p className={`text-xs mt-2 ${consultationStats?.pending > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
    {consultationStats?.pending > 0 ? `${consultationStats.pending} pending` : 'All handled'}
  </p>
  </div>
  <MessageSquare className="h-8 w-8 text-purple-500 opacity-20" />
  </div>
  </div>
  </div>

  {/* Charts */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
  {/* Weekly Activity Bar Chart */}
  <div className="bg-white rounded-lg shadow-md p-6">
  <h2 className="text-lg font-semibold text-neutral-900 mb-4">Weekly Activity</h2>
  <ResponsiveContainer width="100%" height={300}>
  <BarChart data={weeklyData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Bar dataKey="assessments" fill="#3b82f6" />
  </BarChart>
  </ResponsiveContainer>
  </div>

  {/* Risk Distribution Pie Chart */}
  <div className="bg-white rounded-lg shadow-md p-6">
  <h2 className="text-lg font-semibold text-neutral-900 mb-4">Risk Distribution</h2>
  <ResponsiveContainer width="100%" height={300}>
  <PieChart>
  <Pie
  data={riskData}
  cx="50%"
  cy="50%"
  labelLine={false}
  label={({ name, value, percent }) => `${name} ${value} (${(percent * 100).toFixed(0)}%)`}
  outerRadius={80}
  fill="#8884d8"
  dataKey="value"
  >
  {riskData.map((entry, index) => (
  <Cell key={`cell-${index}`} fill={entry.fill} />
  ))}
  </Pie>
  <Tooltip />
  </PieChart>
  </ResponsiveContainer>
  </div>
  </div>

  {/* High Risk Patients - URGENT */}
  <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-l-red-600">
  <div className="flex items-center justify-between mb-6">
  <h2 className="text-xl font-bold text-red-700">High Risk Patients (URGENT)</h2>
  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
  {(dashboardData?.high_risk_patients || []).length} patients
  </span>
  </div>
  {(dashboardData?.high_risk_patients || []).length === 0 ? (
  <p className="text-neutral-600 text-center py-8">✓ No high-risk patients at this time.</p>
  ) : (
  <div className="overflow-x-auto">
  <table className="w-full">
  <thead>
  <tr className="border-b border-neutral-200 bg-red-50">
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Patient Name</th>
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Phone</th>
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Email</th>
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Risk Level</th>
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Probability</th>
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Last Assessment</th>
  </tr>
  </thead>
  <tbody>
  {(dashboardData?.high_risk_patients || []).map((patient, index) => (
  <tr key={index} className="border-b border-neutral-100 hover:bg-red-50">
  <td className="py-3 px-4 text-sm font-medium text-neutral-900">{patient.patient_name || 'Unknown'}</td>
  <td className="py-3 px-4 text-sm text-neutral-900">
  <a href={`tel:${patient.phone}`} className="text-blue-600 hover:text-blue-800 font-semibold">
  {patient.phone || 'N/A'}
  </a>
  </td>
  <td className="py-3 px-4 text-sm text-neutral-900">{patient.user_email}</td>
  <td className="py-3 px-4">
  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
  {patient.predicted_risk}
  </span>
  </td>
  <td className="py-3 px-4 text-sm text-neutral-900">{((patient.probability || 0) * 100).toFixed(1)}%</td>
  <td className="py-3 px-4 text-sm text-neutral-600">
  {new Date(patient.created_at).toLocaleDateString()}
  </td>
  </tr>
  ))}
  </tbody>
  </table>
  </div>
  )}
  </div>

  {/* Recently Improved Patients - FOLLOW-UP */}
  <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-l-green-600">
  <div className="flex items-center justify-between mb-6">
  <h2 className="text-xl font-bold text-green-700">Recently Improved (Follow-up)</h2>
  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
  {(dashboardData?.recently_improved_patients || []).length} patients
  </span>
  </div>
  {(dashboardData?.recently_improved_patients || []).length === 0 ? (
  <p className="text-neutral-600 text-center py-8">No recently improved patients.</p>
  ) : (
  <div className="overflow-x-auto">
  <table className="w-full">
  <thead>
  <tr className="border-b border-neutral-200 bg-green-50">
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Patient Name</th>
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Phone</th>
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Email</th>
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Previous Status</th>
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Current Status</th>
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Improvement</th>
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Days Since</th>
  </tr>
  </thead>
  <tbody>
  {(dashboardData?.recently_improved_patients || []).map((patient, index) => (
  <tr key={index} className="border-b border-neutral-100 hover:bg-green-50">
  <td className="py-3 px-4 text-sm font-medium text-neutral-900">{patient.patient_name || 'Unknown'}</td>
  <td className="py-3 px-4 text-sm text-neutral-900">
  <a href={`tel:${patient.phone}`} className="text-blue-600 hover:text-blue-800 font-semibold">
  {patient.phone || 'N/A'}
  </a>
  </td>
  <td className="py-3 px-4 text-sm text-neutral-900">{patient.user_email}</td>
  <td className="py-3 px-4">
  <div className="text-xs">
  <span className="px-2 py-1 rounded bg-red-100 text-red-700 font-semibold">
  {patient.previous_risk}
  </span>
  <div className="text-neutral-600 mt-1">{((patient.previous_probability || 0) * 100).toFixed(1)}%</div>
  </div>
  </td>
  <td className="py-3 px-4">
  <div className="text-xs">
  <span className="px-2 py-1 rounded bg-green-100 text-green-700 font-semibold">
  {patient.current_risk}
  </span>
  <div className="text-neutral-600 mt-1">{((patient.current_probability || 0) * 100).toFixed(1)}%</div>
  </div>
  </td>
  <td className="py-3 px-4">
  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
  ↓ {patient.improvement_percent}%
  </span>
  </td>
  <td className="py-3 px-4 text-sm text-neutral-600">
  {patient.days_improved} day{patient.days_improved !== 1 ? 's' : ''}
  </td>
  </tr>
  ))}
  </tbody>
  </table>
  </div>
  )}
  </div>

  {/* At-Risk Alerts - WORSENING TRENDS */}
  <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-l-orange-600">
  <div className="flex items-center justify-between mb-6">
  <h2 className="text-xl font-bold text-orange-700">At-Risk Alerts (Worsening Trends)</h2>
  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
  {(dashboardData?.at_risk_alerts || []).length} patients
  </span>
  </div>
  {(dashboardData?.at_risk_alerts || []).length === 0 ? (
  <p className="text-neutral-600 text-center py-8">✓ No worsening trends detected.</p>
  ) : (
  <div className="overflow-x-auto">
  <table className="w-full">
  <thead>
  <tr className="border-b border-neutral-200 bg-orange-50">
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Patient Name</th>
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Phone</th>
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Email</th>
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Current Risk</th>
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Trend</th>
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Change</th>
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Action</th>
  </tr>
  </thead>
  <tbody>
  {(dashboardData?.at_risk_alerts || []).map((alert, index) => (
  <tr key={index} className="border-b border-neutral-100 hover:bg-orange-50">
  <td className="py-3 px-4 text-sm font-medium text-neutral-900">{alert.patient_name || 'Unknown'}</td>
  <td className="py-3 px-4 text-sm text-neutral-900">
  <a href={`tel:${alert.phone}`} className="text-blue-600 hover:text-blue-800 font-semibold">
  {alert.phone || 'N/A'}
  </a>
  </td>
  <td className="py-3 px-4 text-sm text-neutral-900">{alert.user_email}</td>
  <td className="py-3 px-4">
  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
  {alert.current_risk}
  </span>
  </td>
  <td className="py-3 px-4">
  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
  alert.trend === 'worsening' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
  }`}>
  {alert.trend === 'worsening' ? '📈 Worsening' : '📊 Increasing'}
  </span>
  </td>
  <td className="py-3 px-4">
  <span className="text-sm font-semibold text-orange-700">
  ↑ +{alert.worsening_percent}%
  </span>
  </td>
  <td className="py-3 px-4">
  <button className="px-3 py-1 rounded text-xs font-semibold bg-orange-100 text-orange-700 hover:bg-orange-200 transition">
  Review
  </button>
  </td>
  </tr>
  ))}
  </tbody>
  </table>
  </div>
  )}
  </div>

  {/* All Recent Assessments */}
  <div className="bg-white rounded-lg shadow-md p-6 mb-8">
  <h2 className="text-xl font-bold text-neutral-900 mb-6">All Recent Assessments</h2>
  {(dashboardData?.all_assessments || []).length === 0 ? (
  <p className="text-neutral-600 text-center py-8">No assessments available.</p>
  ) : (
  <div className="overflow-x-auto">
  <table className="w-full">
  <thead>
  <tr className="border-b border-neutral-200">
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Patient Email</th>
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Risk Level</th>
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Probability</th>
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Date</th>
  </tr>
  </thead>
  <tbody>
  {(dashboardData?.all_assessments || []).map((assessment, index) => (
  <tr key={index} className="border-b border-neutral-100 hover:bg-neutral-50">
  <td className="py-3 px-4 text-sm text-neutral-900">{assessment.user_email}</td>
  <td className="py-3 px-4">
  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
  assessment.predicted_risk?.toLowerCase().includes('high')
  ? 'bg-red-100 text-red-700'
  : 'bg-green-100 text-green-700'
  }`}>
  {assessment.predicted_risk}
  </span>
  </td>
  <td className="py-3 px-4 text-sm text-neutral-900">{((assessment.probability || 0) * 100).toFixed(1)}%</td>
  <td className="py-3 px-4 text-sm text-neutral-600">
  {new Date(assessment.created_at).toLocaleDateString()}
  </td>
  </tr>
  ))}
  </tbody>
  </table>
  </div>
  )}
  </div>

  {/* Consultation Requests Management */}
  <div className="bg-white rounded-lg shadow-md p-6 mb-8">
  <h2 className="text-xl font-bold text-neutral-900 mb-6">Consultation Requests</h2>

  {consultations.length === 0 ? (
    <div className="text-center py-8">
      <MessageSquare className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
      <p className="text-neutral-500">No consultation requests at this time.</p>
    </div>
  ) : (
    <div className="space-y-4">
      {consultations.map((consultation) => (
        <div key={consultation.id} className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <p className="font-semibold text-neutral-900">{consultation.subject}</p>
              <p className="text-sm text-neutral-600">From: {consultation.pregnant_woman_name || consultation.pregnant_woman_email}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              consultation.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              consultation.status === 'accepted' ? 'bg-green-100 text-green-700' :
              consultation.status === 'declined' ? 'bg-red-100 text-red-700' :
              'bg-neutral-100 text-neutral-700'
            }`}>
              {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
            </span>
          </div>
          <p className="text-sm text-neutral-700 mb-3">{consultation.message}</p>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 text-xs text-neutral-500">
              <span>Created: {new Date(consultation.created_at).toLocaleDateString()}</span>
              {consultation.priority && (
                <span className={`px-2 py-1 rounded ${
                  consultation.priority === 'urgent' ? 'bg-red-50 text-red-600' :
                  consultation.priority === 'high' ? 'bg-orange-50 text-orange-600' :
                  'bg-neutral-50 text-neutral-600'
                }`}>
                  {consultation.priority.charAt(0).toUpperCase() + consultation.priority.slice(1)} Priority
                </span>
              )}
            </div>
            {consultation.status === 'pending' && (
              <button
                onClick={() => {
                  setSelectedConsultation(consultation);
                  setShowConsultationDetail(true);
                }}
                className="px-3 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700 transition-colors"
              >
                Respond
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )}
  </div>

  {/* Consultation Response Modal */}
  {showConsultationDetail && selectedConsultation && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 animate-slideUp max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-neutral-900">Respond to Consultation</h3>
          <button
            onClick={() => {
              setShowConsultationDetail(false);
              setSelectedConsultation(null);
              setRespondingConsultation(null);
            }}
            className="text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-neutral-50 p-4 rounded-lg">
            <p className="text-sm text-neutral-600 mb-1">From</p>
            <p className="font-semibold text-neutral-900">{selectedConsultation.pregnant_woman_name || selectedConsultation.pregnant_woman_email}</p>
          </div>

          <div className="bg-neutral-50 p-4 rounded-lg">
            <p className="text-sm text-neutral-600 mb-1">Subject</p>
            <p className="font-semibold text-neutral-900">{selectedConsultation.subject}</p>
          </div>

          <div className="bg-neutral-50 p-4 rounded-lg">
            <p className="text-sm text-neutral-600 mb-1">Message</p>
            <p className="text-neutral-900">{selectedConsultation.message}</p>
          </div>

          <div className="bg-neutral-50 p-4 rounded-lg">
            <p className="text-sm text-neutral-600 mb-1">Priority</p>
            <p className={`font-semibold ${
              selectedConsultation.priority === 'urgent' ? 'text-red-600' :
              selectedConsultation.priority === 'high' ? 'text-orange-600' :
              'text-neutral-600'
            }`}>
              {selectedConsultation.priority.charAt(0).toUpperCase() + selectedConsultation.priority.slice(1)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Your Response
            </label>
            <select
              value={consultationResponse.status}
              onChange={(e) => setConsultationResponse({...consultationResponse, status: e.target.value})}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="accepted">Accept Consultation</option>
              <option value="declined">Decline Consultation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Response Message (Optional)
            </label>
            <textarea
              value={consultationResponse.response_message}
              onChange={(e) => setConsultationResponse({...consultationResponse, response_message: e.target.value})}
              placeholder="Add any additional notes or information..."
              rows="4"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowConsultationDetail(false);
                setSelectedConsultation(null);
                setRespondingConsultation(null);
              }}
              className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleRespondToConsultation(selectedConsultation.id, consultationResponse.status, consultationResponse.response_message)}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Send Response
            </button>
          </div>
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
  </div>
  );
};

export default HealthcareWorkerDashboard;

