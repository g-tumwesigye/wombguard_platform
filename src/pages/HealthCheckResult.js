import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Heart, TrendingUp, ArrowRight } from 'lucide-react';

const HealthCheckResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
    const result = location.state?.result || null;

  if (!result) {
  return (
  <div className="min-h-screen flex items-center justify-center py-12 px-4">
  <div className="card p-8 text-center max-w-md w-full">
  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
  <p className="text-red-500 font-bold text-xl mb-4">No Assessment Data</p>
  <button
  onClick={() => navigate('/prediction')}
  className="btn-primary w-full"
  >
  Take a New Assessment
  </button>
  </div>
  </div>
  );
  }

  const isLowRisk = result.prediction?.Predicted_Risk_Level === 'Low Risk';
  const riskColor = isLowRisk ? 'text-green-600' : 'text-red-600';
  const borderColor = isLowRisk ? 'border-green-600' : 'border-red-600';

  const getEmpathyMessage = () => {
  if (isLowRisk) {
  return "Great news! Your current health assessment shows a low risk profile. Keep maintaining your healthy habits and continue regular check-ups.";
  } else {
  return "Your assessment indicates a higher risk level. Please contact your healthcare provider within 24 hours for an urgent review and monitor symptoms closely.";
  }
  };

  const getFeatureExplanation = (feature, value) => {
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
  return `${feature}: Data not available`;
  }

  const explanations = {
  'Heart_Rate': `Your heart rate of ${numValue.toFixed(1)} bpm is ${numValue > 100 ? 'elevated' : 'normal'} for pregnancy. Regular monitoring is important.`,
  'Systolic_BP': `Your systolic blood pressure of ${numValue.toFixed(1)} mmHg is ${numValue > 140 ? 'elevated' : 'within normal range'}.`,
  'Diastolic': `Your diastolic blood pressure of ${numValue.toFixed(1)} mmHg is ${numValue > 90 ? 'elevated' : 'within normal range'}.`,
  'BS': `Your blood sugar level of ${numValue.toFixed(1)} mg/dL is ${numValue > 140 ? 'elevated' : 'normal'}.`,
  'BMI': `Your BMI of ${numValue.toFixed(1)} is ${numValue > 30 ? 'in the overweight range' : 'within a healthy range'}.`,
  'Body_Temp': `Your body temperature of ${numValue.toFixed(1)}°C is ${numValue > 37.5 ? 'slightly elevated' : 'normal'}.`,
  'Age': `At ${numValue.toFixed(0)} years old, age-related factors are being considered in your assessment.`
  };
  return explanations[feature] || `${feature}: ${numValue.toFixed(2)}`;
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8 px-4 sm:px-6 lg:px-8">
  <div className="max-w-4xl mx-auto">
  {/* Header */}
  <div className="text-center mb-8">
  <h1 className="text-4xl font-bold text-neutral-900 mb-2">AI Risk Assessment Result</h1>
  <p className="text-neutral-600">Your personalized pregnancy health analysis</p>
  </div>

  {/* Main Result Card */}
  <div className={`card p-8 mb-8 border-l-8 ${borderColor}`}>
  <div className="flex items-start space-x-6">
  <div className={`flex-shrink-0 ${isLowRisk ? 'text-green-600' : 'text-red-600'}`}>
  {isLowRisk ? (
  <CheckCircle className="h-16 w-16" />
  ) : (
  <AlertCircle className="h-16 w-16" />
  )}
  </div>
  <div className="flex-1">
  <h2 className={`text-3xl font-bold ${riskColor} mb-2`}>
  {result.prediction?.Predicted_Risk_Level}
  </h2>
  <p className="text-neutral-700 mb-4 leading-relaxed">
  {getEmpathyMessage()}
  </p>
  <div className="grid grid-cols-2 gap-4">
  <div>
  <p className="text-sm text-neutral-600">Confidence Score</p>
  <p className="text-2xl font-bold text-neutral-900">
  {result.prediction?.Confidence_Score
  ? (parseFloat(result.prediction.Confidence_Score) * 100).toFixed(1)
  : 'N/A'}%
  </p>
  </div>
  <div>
  <p className="text-sm text-neutral-600">High Risk Probability</p>
  <p className="text-2xl font-bold text-neutral-900">
  {result.prediction?.Probability_High_Risk
  ? (parseFloat(result.prediction.Probability_High_Risk) * 100).toFixed(1)
  : 'N/A'}%
  </p>
  </div>
  </div>
  </div>
  </div>
  </div>

  {/* Key Insights - SHAP Explanations */}
  <div className="card p-8 mb-8">
  <div className="flex items-center justify-between mb-6">
  <h2 className="text-2xl font-bold text-neutral-900">Key Insights</h2>
  <button
  onClick={() => setShowDetails(!showDetails)}
  className="text-primary-600 hover:text-primary-700 font-semibold flex items-center space-x-2"
  >
  <span>{showDetails ? 'Hide' : 'Show'} Details</span>
  <ArrowRight className={`h-4 w-4 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
  </button>
  </div>

  <p className="text-neutral-700 mb-6">
  These are the health factors that most influenced your risk assessment. Understanding these factors can help you make informed decisions about your pregnancy care.
  </p>

  {result.explanation?.feature_importance && (
  <div className="space-y-4">
  {Object.entries(result.explanation.feature_importance)
  .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
  .slice(0, 5)
  .map(([feature, importance], index) => (
  <div key={index} className="border-l-4 border-primary-600 pl-4 py-2">
  <div className="flex items-center justify-between mb-2">
  <h3 className="font-semibold text-neutral-900">{feature}</h3>
  <span className={`text-sm font-bold ${importance > 0 ? 'text-red-600' : 'text-green-600'}`}>
  {importance > 0 ? '+' : ''}{importance.toFixed(3)}
  </span>
  </div>
  {showDetails && (
  <p className="text-sm text-neutral-700 leading-relaxed">
  {getFeatureExplanation(feature, result[feature])}
  </p>
  )}
  <div className="mt-2 bg-neutral-100 rounded-full h-2 overflow-hidden">
  <div
  className={`h-full ${importance > 0 ? 'bg-red-500' : 'bg-green-500'}`}
  style={{ width: `${Math.min(Math.abs(importance) * 100, 100)}%` }}
  />
  </div>
  </div>
  ))}
  </div>
  )}

  {result.explanation?.summary && (
  <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
  <p className="text-sm text-neutral-700">
  <span className="font-semibold text-primary-900">Summary: </span>
  {result.explanation.summary}
  </p>
  </div>
  )}
  </div>

  {/* Vital Signs Summary */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
  <div className="card p-6">
  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Your Vital Signs</h3>
  <div className="space-y-3">
  <div className="flex justify-between items-center pb-3 border-b">
  <span className="text-neutral-600">Heart Rate</span>
  <span className="font-semibold text-neutral-900">
  {parseFloat(result.Heart_Rate)?.toFixed(0) || 'N/A'} bpm
  </span>
  </div>
  <div className="flex justify-between items-center pb-3 border-b">
  <span className="text-neutral-600">Blood Pressure</span>
  <span className="font-semibold text-neutral-900">
  {parseFloat(result.Systolic_BP)?.toFixed(0) || 'N/A'}/{parseFloat(result.Diastolic)?.toFixed(0) || 'N/A'} mmHg
  </span>
  </div>
  <div className="flex justify-between items-center pb-3 border-b">
  <span className="text-neutral-600">Blood Sugar</span>
  <span className="font-semibold text-neutral-900">
  {parseFloat(result.BS)?.toFixed(0) || 'N/A'} mg/dL
  </span>
  </div>
  <div className="flex justify-between items-center pb-3 border-b">
  <span className="text-neutral-600">Body Temperature</span>
  <span className="font-semibold text-neutral-900">
  {parseFloat(result.Body_Temp)?.toFixed(1) || 'N/A'}°C
  </span>
  </div>
  <div className="flex justify-between items-center">
  <span className="text-neutral-600">BMI</span>
  <span className="font-semibold text-neutral-900">
  {parseFloat(result.BMI)?.toFixed(1) || 'N/A'}
  </span>
  </div>
  </div>
  </div>

  <div className="card p-6 bg-gradient-to-br from-accent-50 to-primary-50">
  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Next Steps</h3>
  <ul className="space-y-3">
  <li className="flex items-start space-x-3">
  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
  <span className="text-sm text-neutral-700">Schedule a follow-up with your healthcare provider</span>
  </li>
  <li className="flex items-start space-x-3">
  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
  <span className="text-sm text-neutral-700">Keep a daily log of your vital signs</span>
  </li>
  <li className="flex items-start space-x-3">
  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
  <span className="text-sm text-neutral-700">Maintain a balanced diet and regular exercise</span>
  </li>
  <li className="flex items-start space-x-3">
  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
  <span className="text-sm text-neutral-700">Chat with WombGuardBot for personalized advice</span>
  </li>
  </ul>
  </div>
  </div>

  {/* Action Buttons */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <button
  onClick={() => navigate('/dashboard')}
  className="card p-4 text-center hover:shadow-lg transition-all duration-200 group"
  >
  <TrendingUp className="h-6 w-6 text-primary-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
  <p className="font-semibold text-neutral-900">Back to Dashboard</p>
  </button>
  <button
  onClick={() => navigate('/chat')}
  className="card p-4 text-center hover:shadow-lg transition-all duration-200 group"
  >
  <Heart className="h-6 w-6 text-accent-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
  <p className="font-semibold text-neutral-900">Ask WombGuardBot</p>
  </button>
  <button
  onClick={() => navigate('/prediction')}
  className="card p-4 text-center hover:shadow-lg transition-all duration-200 group"
  >
  <TrendingUp className="h-6 w-6 text-secondary-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
  <p className="font-semibold text-neutral-900">New Assessment</p>
  </button>
  </div>
  </div>
  </div>
  );
};

export default HealthCheckResult;

