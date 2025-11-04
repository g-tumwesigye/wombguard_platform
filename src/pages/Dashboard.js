import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Clock, RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState(null);

  // Debug logging
  useEffect(() => {
  console.log('[Dashboard] Render - authLoading:', authLoading, 'user:', user?.email, 'role:', user?.role);
  }, [authLoading, user]);

  useEffect(() => {
  // Only fetch data if user is authenticated
  if (user) {
  fetchDashboardData();
  // Auto-refresh every 30 seconds
  const interval = setInterval(fetchDashboardData, 30000);
  return () => clearInterval(interval);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchDashboardData = async () => {
  try {
  // Build URL with role and user_email (for pregnant women)
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  let url = `${API_BASE_URL}/dashboard?role=${user?.role}`;
  if (user?.role === 'pregnant_woman' && user?.email) {
  url += `&user_email=${encodeURIComponent(user.email)}`;
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch dashboard data');
  const data = await response.json();

  if (data.status === 'success' && Array.isArray(data.data)) {
  setPredictions(data.data);
  }
  } catch (err) {
  console.error('Error fetching dashboard:', err);
  setError(err.message);
  } finally {
  setLoading(false);
  setRefreshing(false);
  }
  };

  const handleManualRefresh = async () => {
  setRefreshing(true);
  await fetchDashboardData();
  };

  const getRiskColor = (risk) => {
  if (!risk) return 'text-neutral-600';
  const riskStr = risk.toLowerCase();
  if (riskStr.includes('high')) return 'text-red-600';
  if (riskStr.includes('low')) return 'text-green-600';
  return 'text-neutral-600';
  };

  const getRiskBgColor = (risk) => {
  if (!risk) return 'bg-neutral-100';
  const riskStr = risk.toLowerCase();
  if (riskStr.includes('high')) return 'bg-red-100';
  if (riskStr.includes('low')) return 'bg-green-100';
  return 'bg-neutral-100';
  };

  const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
  });
  };

  // Show loading state while auth is initializing or if user is not yet set
  if (authLoading || !user) {
  return (
  <div className="min-h-screen flex items-center justify-center py-12 px-4">
  <div className="text-center">
  <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-600 border-t-transparent mx-auto mb-4"></div>
  <p className="text-neutral-600">Loading...</p>
  </div>
  </div>
  );
  }

  // Redirect pregnant women to their dedicated dashboard
  if (user.role === 'pregnant_woman') {
  navigate('/pregnant-dashboard', { replace: true });
  return null;
  }

  // Unauthorized role (only check this after we're sure user is loaded)
  if (!['admin', 'healthcare_provider'].includes(user.role)) {
  return (
  <div className="min-h-screen flex items-center justify-center py-12 px-4">
  <div className="card p-8 text-center max-w-md w-full">
  <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
  <h2 className="text-2xl font-bold text-neutral-900 mb-4">Access Restricted</h2>
  <p className="text-neutral-600 mb-6">
  Dashboard access is only available for authorized users.
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
  <div className="min-h-screen flex items-center justify-center">
  <div className="text-center">
  <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-600 border-t-transparent mx-auto mb-4"></div>
  <p className="text-neutral-600">Loading dashboard...</p>
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
  <button onClick={() => window.location.reload()} className="btn-primary w-full">
  Retry
  </button>
  </div>
  </div>
  );
  }

  // Calculate statistics
  const completedAssessments = predictions.length;
  const highRiskAlerts = predictions.filter(p => p.predicted_risk?.toLowerCase().includes('high')).length;
  const lowRiskAssessments = predictions.filter(p => p.predicted_risk?.toLowerCase().includes('low')).length;

  return (
  <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
  <div className="max-w-7xl mx-auto">
  {/* Header */}
  <div className="mb-8 flex justify-between items-start">
  <div>
  <h1 className="text-4xl font-bold text-neutral-900 mb-2">
  {user.role === 'pregnant_woman' ? 'My Pregnancy Dashboard' : 'Dashboard'}
  </h1>
  <p className="text-neutral-600">
  {user.role === 'pregnant_woman'
  ? 'View your personal pregnancy health stats and all your assessments'
  : 'View all health assessments and predictions'}
  </p>
  </div>
  <button
  onClick={handleManualRefresh}
  disabled={refreshing}
  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
  >
  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
  <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
  </button>
  </div>

  {/* Pregnant Woman Dashboard */}
  {user.role === 'pregnant_woman' && (
  <div className="space-y-8">
  {/* Stats Cards */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* Completed Assessments */}
  <div className="bg-white p-6 rounded-lg border border-neutral-200 hover:shadow-lg transition-shadow">
  <p className="text-sm font-semibold text-neutral-600 mb-2">Completed Assessments</p>
  <p className="text-5xl font-bold text-neutral-900 mb-1">{completedAssessments}</p>
  <p className="text-sm text-neutral-500">Total health checks completed</p>
  </div>

  {/* Low Risk Assessments */}
  <div className="bg-white p-6 rounded-lg border border-neutral-200 hover:shadow-lg transition-shadow">
  <p className="text-sm font-semibold text-neutral-600 mb-2">Low Risk Assessments</p>
  <p className="text-5xl font-bold text-green-600 mb-1">{lowRiskAssessments}</p>
  <p className="text-sm text-neutral-500">Healthy pregnancy indicators</p>
  </div>

  {/* High Risk Alerts */}
  <div className="bg-white p-6 rounded-lg border border-neutral-200 hover:shadow-lg transition-shadow">
  <p className="text-sm font-semibold text-neutral-600 mb-2">High Risk Alerts</p>
  <p className="text-5xl font-bold text-red-600 mb-1">{highRiskAlerts}</p>
  <p className="text-sm text-neutral-500">Requires attention</p>
  </div>
  </div>

  {/* All Assessments */}
  <div className="bg-white p-6 rounded-lg border border-neutral-200">
  <h2 className="text-2xl font-bold text-neutral-900 mb-6">All Health Assessments</h2>

  {predictions.length === 0 ? (
  <div className="text-center py-12">
  <AlertTriangle className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
  <p className="text-neutral-600">No assessments yet. Complete your first health check to see results here.</p>
  </div>
  ) : (
  <div className="space-y-4">
  {predictions.map((prediction, index) => (
  <div key={prediction.id || index} className="border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow">
  {/* Header with Date and Risk */}
  <div className="flex justify-between items-start mb-4">
  <div>
  <p className="text-sm text-neutral-500 flex items-center space-x-2">
  <Clock className="h-4 w-4" />
  <span>{formatDate(prediction.created_at)}</span>
  </p>
  </div>
  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getRiskBgColor(prediction.predicted_risk)} ${getRiskColor(prediction.predicted_risk)}`}>
  {prediction.predicted_risk || 'Unknown'}
  </span>
  </div>

  {/* Risk Score */}
  <div className="mb-4">
  <p className="text-sm text-neutral-600 mb-1">Risk Score</p>
  <div className="flex items-center space-x-3">
  <div className="flex-1 bg-neutral-200 rounded-full h-2">
  <div
  className={`h-2 rounded-full ${
  prediction.predicted_risk?.toLowerCase().includes('high')
  ? 'bg-red-600'
  : 'bg-green-600'
  }`}
  style={{ width: `${(prediction.probability || 0) * 100}%` }}
  />
  </div>
  <span className="text-sm font-semibold text-neutral-900">
  {((prediction.probability || 0) * 100).toFixed(1)}%
  </span>
  </div>
  </div>

  {/* Vital Signs Grid */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {prediction.age && (
  <div className="bg-neutral-50 p-3 rounded-lg">
  <p className="text-xs text-neutral-600 mb-1">Age</p>
  <p className="text-lg font-semibold text-neutral-900">{prediction.age} yrs</p>
  </div>
  )}
  {prediction.systolic_bp && (
  <div className="bg-neutral-50 p-3 rounded-lg">
  <p className="text-xs text-neutral-600 mb-1">Systolic BP</p>
  <p className="text-lg font-semibold text-neutral-900">{prediction.systolic_bp} mmHg</p>
  </div>
  )}
  {prediction.diastolic && (
  <div className="bg-neutral-50 p-3 rounded-lg">
  <p className="text-xs text-neutral-600 mb-1">Diastolic BP</p>
  <p className="text-lg font-semibold text-neutral-900">{prediction.diastolic} mmHg</p>
  </div>
  )}
  {prediction.bs && (
  <div className="bg-neutral-50 p-3 rounded-lg">
  <p className="text-xs text-neutral-600 mb-1">Blood Sugar</p>
  <p className="text-lg font-semibold text-neutral-900">{prediction.bs} mg/dL</p>
  </div>
  )}
  {prediction.body_temp && (
  <div className="bg-neutral-50 p-3 rounded-lg">
  <p className="text-xs text-neutral-600 mb-1">Body Temp</p>
  <p className="text-lg font-semibold text-neutral-900">{prediction.body_temp}°C</p>
  </div>
  )}
  {prediction.bmi && (
  <div className="bg-neutral-50 p-3 rounded-lg">
  <p className="text-xs text-neutral-600 mb-1">BMI</p>
  <p className="text-lg font-semibold text-neutral-900">{prediction.bmi}</p>
  </div>
  )}
  {prediction.heart_rate && (
  <div className="bg-neutral-50 p-3 rounded-lg">
  <p className="text-xs text-neutral-600 mb-1">Heart Rate</p>
  <p className="text-lg font-semibold text-neutral-900">{prediction.heart_rate} bpm</p>
  </div>
  )}
  </div>

  {/* Explanation */}
  {prediction.explanation && (
  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
  <p className="text-sm text-blue-900">{prediction.explanation}</p>
  </div>
  )}
  </div>
  ))}
  </div>
  )}
  </div>

  {/* Recommended Actions */}
  <div className="bg-white p-6 rounded-lg border border-neutral-200">
  <h2 className="text-xl font-bold text-neutral-900 mb-4">Recommended Actions</h2>
  <ul className="space-y-3">
  <li className="flex items-start space-x-3">
  <span className="text-neutral-400 mt-1">•</span>
  <span className="text-neutral-700">Attend scheduled prenatal check-ups regularly</span>
  </li>
  <li className="flex items-start space-x-3">
  <span className="text-neutral-400 mt-1">•</span>
  <span className="text-neutral-700">Monitor blood pressure and blood sugar regularly</span>
  </li>
  <li className="flex items-start space-x-3">
  <span className="text-neutral-400 mt-1">•</span>
  <span className="text-neutral-700">Maintain a healthy diet and exercise routine</span>
  </li>
  <li className="flex items-start space-x-3">
  <span className="text-neutral-400 mt-1">•</span>
  <span className="text-neutral-700">Report any unusual symptoms immediately</span>
  </li>
  </ul>
  </div>
  </div>
  )}

  {/* Admin & Healthcare Provider Dashboards */}
  {(user.role === 'admin' || user.role === 'healthcare_provider') && (
  <div className="space-y-8">
  {/* Stats */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div className="bg-white p-6 rounded-lg border border-neutral-200">
  <p className="text-sm font-semibold text-neutral-600 mb-2">Total Assessments</p>
  <p className="text-5xl font-bold text-neutral-900">{completedAssessments}</p>
  </div>
  <div className="bg-white p-6 rounded-lg border border-neutral-200">
  <p className="text-sm font-semibold text-neutral-600 mb-2">Low Risk</p>
  <p className="text-5xl font-bold text-green-600">{lowRiskAssessments}</p>
  </div>
  <div className="bg-white p-6 rounded-lg border border-neutral-200">
  <p className="text-sm font-semibold text-neutral-600 mb-2">High Risk</p>
  <p className="text-5xl font-bold text-red-600">{highRiskAlerts}</p>
  </div>
  </div>

  {/* All Predictions */}
  <div className="bg-white p-6 rounded-lg border border-neutral-200">
  <h2 className="text-2xl font-bold text-neutral-900 mb-6">All Predictions</h2>

  {predictions.length === 0 ? (
  <p className="text-neutral-600 text-center py-8">No predictions available.</p>
  ) : (
  <div className="overflow-x-auto">
  <table className="w-full">
  <thead>
  <tr className="border-b border-neutral-200">
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Email</th>
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Risk</th>
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Probability</th>
  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Date</th>
  </tr>
  </thead>
  <tbody>
  {predictions.map((prediction, index) => (
  <tr key={prediction.id || index} className="border-b border-neutral-100 hover:bg-neutral-50">
  <td className="py-3 px-4 text-sm text-neutral-900">{prediction.user_email}</td>
  <td className="py-3 px-4">
  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskBgColor(prediction.predicted_risk)} ${getRiskColor(prediction.predicted_risk)}`}>
  {prediction.predicted_risk}
  </span>
  </td>
  <td className="py-3 px-4 text-sm text-neutral-900">{((prediction.probability || 0) * 100).toFixed(1)}%</td>
  <td className="py-3 px-4 text-sm text-neutral-600">{formatDate(prediction.created_at)}</td>
  </tr>
  ))}
  </tbody>
  </table>
  </div>
  )}
  </div>
  </div>
  )}
  </div>
  </div>
  );
};

export default Dashboard;
