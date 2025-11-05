import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Activity, AlertTriangle, CheckCircle, TrendingUp, MessageSquare, Calendar, Clock, ArrowRight, User, Mail, Briefcase, Zap, RefreshCw, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

const PregnantDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showMetricDetail, setShowMetricDetail] = useState(false);
  const [animatingMetrics, setAnimatingMetrics] = useState({});
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [consultations, setConsultations] = useState([]);
  const [consultationStats, setConsultationStats] = useState(null);
  const [consultationForm, setConsultationForm] = useState({
    healthcare_provider_email: '',
    subject: '',
    message: '',
    priority: 'normal'
  });
  const [submittingConsultation, setSubmittingConsultation] = useState(false);
  const [consultationError, setConsultationError] = useState(null);
  const [consultationSuccess, setConsultationSuccess] = useState(null);

  useEffect(() => {
  // Only fetch data if user is available
  if (user?.email) {
  fetchDashboardData();

  // Auto-refresh dashboard every 30 seconds
  const interval = setInterval(fetchDashboardData, 30000);

  return () => clearInterval(interval);
  }
  }, [user]);

  const fetchDashboardData = async () => {
  try {
  // Guard clause: Don't fetch if user email is not available
  if (!user?.email) {
  console.error('[PregnantDashboard] Cannot fetch data: user email is not available');
  setLoading(false);
  return;
  }

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  console.log('[PregnantDashboard] Fetching dashboard stats for:', user.email);

  // Fetch dashboard stats
  const statsResponse = await fetch(`${API_BASE_URL}/dashboard-stats?user_email=${user.email}`);
  const statsData = await statsResponse.json();
  console.log('[PregnantDashboard] Dashboard stats response:', statsData);

  if (statsData.status === 'success') {
  setDashboardStats(statsData.stats);
  setRecentAssessments(statsData.recent_assessments || []);
  console.log('[PregnantDashboard] Dashboard stats set:', statsData.stats);
  } else {
  console.error('[PregnantDashboard] Failed to fetch dashboard stats:', statsData.message);
  }

  // Fetch user profile
  console.log('[PregnantDashboard] Fetching user profile for:', user.email);
  const profileResponse = await fetch(`${API_BASE_URL}/user-profile?user_email=${user.email}`);
  const profileData = await profileResponse.json();
  console.log('[PregnantDashboard] User profile response:', profileData);

  if (profileData.status === 'success' && profileData.user) {
  setUserProfile(profileData.user);
  console.log('[PregnantDashboard] User profile set:', profileData.user.name);
  } else {
  // Use user from context if profile fetch fails
  setUserProfile(user);
  console.log('[PregnantDashboard] Using user from context as fallback');
  }

  // Fetch consultation data
  await fetchConsultationData();
  } catch (error) {
  console.error('Error fetching dashboard data:', error);
  // Set default values for new users
  setDashboardStats({
  completed_assessments: 0,
  upcoming_checkups: 0,
  high_risk_alerts: 0,
  last_assessment: null
  });
  setRecentAssessments([]);
  // Use user from context as fallback
  setUserProfile(user);
  } finally {
  setLoading(false);
  setRefreshing(false);
  }
  };

  const fetchConsultationData = async () => {
  try {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  console.log('🔍 [PregnantDashboard] Fetching consultation data for:', user?.email);

  // Fetch consultation requests
  const consultResponse = await fetch(`${API_BASE_URL}/consultation-requests?user_email=${user?.email}`);
  const consultData = await consultResponse.json();
  console.log('[PregnantDashboard] Consultation requests response:', consultData);

  if (consultData.status === 'success') {
  setConsultations(consultData.data || []);
  console.log('[PregnantDashboard] Set consultations:', consultData.data?.length || 0, 'items');
  }

  // Fetch consultation stats
  const statsResponse = await fetch(`${API_BASE_URL}/consultation-requests/stats/${user?.email}`);
  const statsData = await statsResponse.json();
  console.log('[PregnantDashboard] Consultation stats response:', statsData);

  if (statsData.status === 'success') {
  setConsultationStats(statsData.data);
  console.log('[PregnantDashboard] Set consultation stats:', statsData.data);
  }
  } catch (error) {
  console.error('[PregnantDashboard] Error fetching consultation data:', error);
  setConsultations([]);
  setConsultationStats(null);
  }
  };

  const handleManualRefresh = async () => {
  setRefreshing(true);
  await fetchDashboardData();
  };

  const handleSubmitConsultation = async (e) => {
  e.preventDefault();
  setSubmittingConsultation(true);
  setConsultationError(null);
  setConsultationSuccess(null);

  try {
  if (!consultationForm.healthcare_provider_email || !consultationForm.subject || !consultationForm.message) {
    setConsultationError('Please fill in all required fields');
    setSubmittingConsultation(false);
    return;
  }

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const response = await fetch(`${API_BASE_URL}/consultation-request?user_email=${user?.email}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(consultationForm)
  });

  const data = await response.json();

  if (response.ok && data.status === 'success') {
    setConsultationSuccess('Consultation request sent successfully!');
    setConsultationForm({
      healthcare_provider_email: '',
      subject: '',
      message: '',
      priority: 'normal'
    });
    setTimeout(() => {
      setShowConsultationModal(false);
      fetchConsultationData();
    }, 1500);
  } else {
    setConsultationError(data.detail || 'Failed to send consultation request');
  }
  } catch (error) {
  console.error('Error submitting consultation:', error);
  setConsultationError('Error sending consultation request. Please try again.');
  } finally {
  setSubmittingConsultation(false);
  }
  };

  const getRiskColor = (risk) => {
  if (!risk) return 'text-neutral-600 bg-neutral-50';
  switch (risk.toLowerCase()) {
  case 'high risk': return 'text-red-600 bg-red-50 border-l-4 border-red-600';
  case 'low risk': return 'text-green-600 bg-green-50 border-l-4 border-green-600';
  default: return 'text-neutral-600 bg-neutral-50';
  }
  };

  const getRiskBadgeColor = (risk) => {
  if (!risk) return 'bg-neutral-100 text-neutral-700';
  switch (risk.toLowerCase()) {
  case 'high risk': return 'bg-red-100 text-red-700';
  case 'low risk': return 'bg-green-100 text-green-700';
  default: return 'bg-neutral-100 text-neutral-700';
  }
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
    if (value === 0) return { text: 'No data', color: 'text-neutral-500', icon: '○' };

    const getTrendIndicator = () => {
      const trends = {
        completed_assessments: { current: value, previous: Math.max(0, value - 2) },
        upcoming_checkups: { current: value, previous: Math.max(0, value - 1) },
        high_risk_alerts: { current: value, previous: Math.max(0, value + 1) }
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
      if (value > 0) return {
        text: '',
        color: 'text-red-600',
        icon: '↑',
        trend: trend
      };
      return {
        text: '',
        color: 'text-green-600',
        icon: '✓',
        trend: trend
      };
    }

    if (trend.direction === 'up') {
      return {
        text: '',
        color: 'text-green-600',
        icon: '↑',
        trend: trend
      };
    }
    if (trend.direction === 'down') {
      return {
        text: '',
        color: 'text-orange-600',
        icon: '↓',
        trend: trend
      };
    }

    return {
      text: '',
      color: 'text-blue-600',
      icon: '→',
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

  if (!user || user.role !== 'pregnant_woman') {
  return (
  <div className="min-h-screen flex items-center justify-center py-12 px-4">
  <div className="card p-8 text-center max-w-md w-full">
  <p className="text-red-500 font-bold text-xl mb-4">Access Denied</p>
  <button
  onClick={() => navigate('/')}
  className="btn-primary w-full"
  >
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
  <p className="text-neutral-600">Loading your pregnancy dashboard...</p>
  </div>
  </div>
  );
  }

  return (
  <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
  <div className="max-w-6xl mx-auto">
  {/* Header Section */}
  <div className="mb-8">
  <h1 className="text-4xl font-bold text-neutral-900 mb-2">My Pregnancy Dashboard</h1>
  <p className="text-neutral-600">View your personal pregnancy health stats and recommendations</p>
  </div>

  {/* Stats Cards Grid - Clean Layout */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
  {/* Left Column - Stats */}
  <div className="space-y-6">
  {/* Completed Assessments */}
  <div
    onClick={() => handleMetricClick('completed_assessments', dashboardStats?.completed_assessments || 0)}
    className={`bg-white p-6 rounded-lg border border-neutral-200 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
      animatingMetrics.completed_assessments ? 'animate-pulse' : ''
    }`}
  >
  <p className="text-sm font-semibold text-neutral-600 mb-2">Completed Assessments</p>
  <p className="text-5xl font-bold text-neutral-900 mb-1">{dashboardStats?.completed_assessments || 0}</p>
  <p className={`text-sm ${getMetricStatus('completed_assessments', dashboardStats?.completed_assessments || 0).color}`}>
    {getMetricStatus('completed_assessments', dashboardStats?.completed_assessments || 0).text}
  </p>
  </div>

  {/* Upcoming Check-ups */}
  <div
    onClick={() => handleMetricClick('upcoming_checkups', dashboardStats?.upcoming_checkups || 0)}
    className={`bg-white p-6 rounded-lg border border-neutral-200 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
      animatingMetrics.upcoming_checkups ? 'animate-pulse' : ''
    }`}
  >
  <p className="text-sm font-semibold text-neutral-600 mb-2">Upcoming Check-ups</p>
  <p className="text-5xl font-bold text-neutral-900 mb-1">{dashboardStats?.upcoming_checkups || 0}</p>
  <p className={`text-sm ${getMetricStatus('upcoming_checkups', dashboardStats?.upcoming_checkups || 0).color}`}>
    {getMetricStatus('upcoming_checkups', dashboardStats?.upcoming_checkups || 0).text}
  </p>
  </div>

  {/* High Risk Alerts */}
  <div
    onClick={() => handleMetricClick('high_risk_alerts', dashboardStats?.high_risk_alerts || 0)}
    className={`bg-white p-6 rounded-lg border border-neutral-200 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
      animatingMetrics.high_risk_alerts ? 'animate-pulse' : ''
    }`}
  >
  <p className="text-sm font-semibold text-neutral-600 mb-2">High Risk Alerts</p>
  <p className="text-5xl font-bold text-red-600 mb-1">{dashboardStats?.high_risk_alerts || 0}</p>
  <p className={`text-sm ${getMetricStatus('high_risk_alerts', dashboardStats?.high_risk_alerts || 0).color}`}>
    {getMetricStatus('high_risk_alerts', dashboardStats?.high_risk_alerts || 0).text}
  </p>
  </div>
  </div>

  {/* Right Column - Recent Assessments */}
  <div className="bg-white p-6 rounded-lg border border-neutral-200">
  <h2 className="text-xl font-bold text-neutral-900 mb-6">Recent Risk Assessments</h2>

  {recentAssessments.length === 0 ? (
  <div className="text-center py-8">
  <p className="text-neutral-500">No assessments yet. Complete your first health check to see results here.</p>
  </div>
  ) : (
  <div className="space-y-4">
  {recentAssessments.slice(0, 5).map((assessment, index) => (
  <div key={index} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-b-0">
  <div className="flex-1">
  <p className="text-sm font-medium text-neutral-900">
  {new Date(assessment.created_at).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
  </p>
  </div>
  <div className="flex items-center space-x-4">
  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
  assessment.predicted_risk?.toLowerCase() === 'high risk'
  ? 'bg-red-100 text-red-700'
  : 'bg-green-100 text-green-700'
  }`}>
  {assessment.predicted_risk || 'Unknown'}
  </span>
  <span className="text-sm font-medium text-neutral-600">
  Score: {(assessment.probability * 100).toFixed(0)}%
  </span>
  </div>
  </div>
  ))}
  </div>
  )}
  </div>
  </div>

  {/* CONSULTATION SECTION - REQUEST HEALTHCARE PROVIDER CONSULTATION */}
  <div className="bg-white p-6 rounded-lg border-2 border-primary-200 shadow-md mb-8">
  {console.log('[PregnantDashboard] Rendering consultation section. Consultations:', consultations.length, 'Stats:', consultationStats)}
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-2xl font-bold text-primary-900">Request Healthcare Consultation</h2>
    <button
      onClick={() => setShowConsultationModal(true)}
      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-bold flex items-center space-x-2 shadow-lg hover:shadow-xl"
    >
      <MessageSquare className="h-5 w-5" />
      <span>Request Consultation</span>
    </button>
  </div>

  {/* Consultation Stats */}
  {consultationStats && (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-neutral-600">Total Requests</p>
        <p className="text-2xl font-bold text-blue-600">{consultationStats.total}</p>
      </div>
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-sm text-neutral-600">Pending</p>
        <p className="text-2xl font-bold text-yellow-600">{consultationStats.pending}</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-sm text-neutral-600">Accepted</p>
        <p className="text-2xl font-bold text-green-600">{consultationStats.accepted}</p>
      </div>
      <div className="bg-neutral-50 p-4 rounded-lg">
        <p className="text-sm text-neutral-600">Closed</p>
        <p className="text-2xl font-bold text-neutral-600">{consultationStats.closed}</p>
      </div>
    </div>
  )}

  {/* Consultation Requests List */}
  {consultations.length === 0 ? (
    <div className="text-center py-8">
      <MessageSquare className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
      <p className="text-neutral-500">No consultation requests yet. Request a consultation with a healthcare provider.</p>
    </div>
  ) : (
    <div className="space-y-4">
      {consultations.map((consultation) => (
        <div key={consultation.id} className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <p className="font-semibold text-neutral-900">{consultation.subject}</p>
              <p className="text-sm text-neutral-600">To: {consultation.healthcare_provider_name || consultation.healthcare_provider_email}</p>
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
          <div className="flex justify-between items-center text-xs text-neutral-500">
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
        </div>
      ))}
    </div>
  )}
  </div>

  {/* Risk Assessment History & Trends */}
  <div className="bg-white p-6 rounded-lg border border-neutral-200">
  <h2 className="text-xl font-bold text-neutral-900 mb-6">Your Risk Assessment History</h2>
  {recentAssessments && recentAssessments.length > 0 ? (
  <div className="space-y-4">
  {/* Timeline visualization */}
  <div className="relative">
  {recentAssessments.map((assessment, index) => {
  const isHighRisk = assessment.predicted_risk?.toLowerCase().includes('high');
  const probability = (assessment.probability * 100).toFixed(1);

  return (
  <div key={index} className="flex gap-4 pb-6 relative">
  {/* Timeline dot */}
  <div className="flex flex-col items-center">
  <div className={`w-4 h-4 rounded-full ${isHighRisk ? 'bg-red-500' : 'bg-green-500'} ring-4 ${isHighRisk ? 'ring-red-100' : 'ring-green-100'}`}></div>
  {index < recentAssessments.length - 1 && (
  <div className="w-1 h-12 bg-neutral-200 mt-2"></div>
  )}
  </div>

  {/* Assessment card */}
  <div className={`flex-1 p-4 rounded-lg border-l-4 ${isHighRisk ? 'bg-red-50 border-l-red-500' : 'bg-green-50 border-l-green-500'}`}>
  <div className="flex justify-between items-start mb-2">
  <div>
  <p className="font-semibold text-neutral-900">
  {new Date(assessment.created_at).toLocaleDateString('en-US', {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric'
  })}
  </p>
  <p className="text-sm text-neutral-600">
  {new Date(assessment.created_at).toLocaleTimeString('en-US', {
  hour: '2-digit',
  minute: '2-digit'
  })}
  </p>
  </div>
  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isHighRisk ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
  {assessment.predicted_risk}
  </span>
  </div>

  <div className="grid grid-cols-2 gap-4 mt-3">
  <div>
  <p className="text-xs text-neutral-600">Risk Probability</p>
  <p className="text-lg font-bold text-neutral-900">{probability}%</p>
  </div>
  <div>
  <p className="text-xs text-neutral-600">Confidence</p>
  <p className="text-lg font-bold text-neutral-900">{(assessment.confidence_score * 100).toFixed(0)}%</p>
  </div>
  </div>
  </div>
  </div>
  );
  })}
  </div>
  </div>
  ) : (
  <p className="text-neutral-600 text-center py-8">No assessments yet. Complete your first assessment to see your history.</p>
  )}
  </div>

  {/* Recommended Actions */}
  <div className="bg-white p-6 rounded-lg border border-neutral-200">
  <h2 className="text-xl font-bold text-neutral-900 mb-6">Recommended Actions</h2>
  <ul className="space-y-3">
  <li className="flex items-start space-x-3">
  <span className="text-neutral-400 mt-1">•</span>
  <span className="text-neutral-700">Attend scheduled prenatal check-ups</span>
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

  {/* Consultation Request Modal */}
  {showConsultationModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 animate-slideUp max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-neutral-900">Request Healthcare Consultation</h3>
          <button
            onClick={() => setShowConsultationModal(false)}
            className="text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {consultationError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {consultationError}
          </div>
        )}

        {consultationSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {consultationSuccess}
          </div>
        )}

        <form onSubmit={handleSubmitConsultation} className="space-y-4">
          {/* Healthcare Provider Email */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Healthcare Provider Email *
            </label>
            <input
              type="email"
              required
              value={consultationForm.healthcare_provider_email}
              onChange={(e) => setConsultationForm({...consultationForm, healthcare_provider_email: e.target.value})}
              placeholder="provider@example.com"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-neutral-500 mt-1">Enter the email of the healthcare provider you want to consult</p>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Subject *
            </label>
            <input
              type="text"
              required
              value={consultationForm.subject}
              onChange={(e) => setConsultationForm({...consultationForm, subject: e.target.value})}
              placeholder="e.g., Questions about blood pressure readings"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Message *
            </label>
            <textarea
              required
              value={consultationForm.message}
              onChange={(e) => setConsultationForm({...consultationForm, message: e.target.value})}
              placeholder="Describe your concern or question..."
              rows="5"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Priority
            </label>
            <select
              value={consultationForm.priority}
              onChange={(e) => setConsultationForm({...consultationForm, priority: e.target.value})}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowConsultationModal(false)}
              className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingConsultation}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors font-medium"
            >
              {submittingConsultation ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
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

export default PregnantDashboard;

