import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = 'http://localhost:8000'; 

const PredictionInput = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
  Age: '',
  Systolic_BP: '',
  Diastolic: '',
  BS: '',
  Body_Temp: '',
  BMI: '',
  Heart_Rate: ''
  });

  const healthParams = [
  { name: 'Age', label: 'Age', type: 'number', placeholder: 'Enter your age', required: true },
  { name: 'Systolic_BP', label: 'Systolic Blood Pressure', type: 'number', placeholder: 'e.g., 120', required: true },
  { name: 'Diastolic', label: 'Diastolic Blood Pressure', type: 'number', placeholder: 'e.g., 80', required: true },
  { name: 'BS', label: 'Blood Sugar Level', type: 'number', placeholder: 'e.g., 5.6', required: false },
  { name: 'Body_Temp', label: 'Body Temperature (°C)', type: 'number', placeholder: 'e.g., 36.5', required: false, step: 0.1 },
  { name: 'BMI', label: 'Body Mass Index (BMI)', type: 'number', placeholder: 'e.g., 23.5', required: false, step: 0.1 },
  { name: 'Heart_Rate', label: 'Heart Rate (bpm)', type: 'number', placeholder: 'e.g., 80', required: false }
  ];

  const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validation rules for health parameters
  const validateHealthData = (data) => {
  const errors = [];

  // Age validation: 10-60 years
  if (data.Age < 10 || data.Age > 60) {
  errors.push('Age must be between 10 and 60 years');
  }

  // Systolic BP: 70-200 mmHg
  if (data.Systolic_BP < 70 || data.Systolic_BP > 200) {
  errors.push('Systolic BP must be between 70 and 200 mmHg');
  }

  // Diastolic BP: 40-130 mmHg
  if (data.Diastolic < 40 || data.Diastolic > 130) {
  errors.push('Diastolic BP must be between 40 and 130 mmHg');
  }

  // Blood Sugar: 2.5-20 mmol/L (45-360 mg/dL)
  if (data.BS > 0 && (data.BS < 2.5 || data.BS > 20)) {
  errors.push('Blood Sugar must be between 2.5 and 20 mmol/L');
  }

  // Body Temperature: 35-40°C
  if (data.Body_Temp > 0 && (data.Body_Temp < 35 || data.Body_Temp > 40)) {
  errors.push('Body Temperature must be between 35 and 40°C');
  }

  // BMI: 10-50 kg/m²
  if (data.BMI > 0 && (data.BMI < 10 || data.BMI > 50)) {
  errors.push('BMI must be between 10 and 50 kg/m²');
  }

  // Heart Rate: 40-150 bpm
  if (data.Heart_Rate > 0 && (data.Heart_Rate < 40 || data.Heart_Rate > 150)) {
  errors.push('Heart Rate must be between 40 and 150 bpm');
  }

  return errors;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
  // Convert form data to proper format - convert empty strings to 0 for optional fields
  const submitData = {
  Age: parseFloat(formData.Age) || 0,
  Systolic_BP: parseFloat(formData.Systolic_BP) || 0,
  Diastolic: parseFloat(formData.Diastolic) || 0,
  BS: formData.BS ? parseFloat(formData.BS) : 0,
  Body_Temp: formData.Body_Temp ? parseFloat(formData.Body_Temp) : 0,
  BMI: formData.BMI ? parseFloat(formData.BMI) : 0,
  Heart_Rate: formData.Heart_Rate ? parseFloat(formData.Heart_Rate) : 0
  };

  // Validate health data
  const validationErrors = validateHealthData(submitData);
  if (validationErrors.length > 0) {
  setError(validationErrors.join('\n'));
  setLoading(false);
  return;
  }

  console.log('Submitting prediction data:', submitData);

  const res = await fetch(`${API_BASE}/predict?user_email=${encodeURIComponent(user.email)}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(submitData)
  });

  if (!res.ok) {
  const errData = await res.json().catch(() => ({}));
  console.error('Backend error:', errData);
  throw new Error(errData.detail || errData.message || `Error ${res.status}`);
  }

  const data = await res.json();
  console.log('Prediction response:', data);

  const apiResult = {
  prediction: data.prediction,
  explanation: data.explanation,
  ...submitData,
  timestamp: new Date().toISOString(),
  };

  // Save to history 
  const history = JSON.parse(localStorage.getItem('wombguard_history') || '[]');
  history.unshift(apiResult);
  localStorage.setItem('wombguard_history', JSON.stringify(history.slice(0, 50)));

  // Navigate to detailed result page
  navigate('/health-check-result', { state: { result: apiResult } });

  } catch (err) {
  console.error('Prediction error:', err);
  setError(err.message || 'Failed to connect to the prediction service.');
  } finally {
  setLoading(false);
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

  if (!user || user.role !== 'pregnant_woman') {
  return (
  <div className="min-h-screen flex items-center justify-center py-12 px-4">
  <div className="card p-8 text-center max-w-md w-full">
  <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
  <h2 className="text-2xl font-bold text-neutral-900 mb-4">Access Restricted</h2>
  <p className="text-neutral-600 mb-6">
  This feature is only available for pregnant women accounts.
  </p>
  <button onClick={() => navigate('/')} className="btn-primary w-full">Go Home</button>
  </div>
  </div>
  );
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
  <div className="max-w-3xl mx-auto">
  <div className="card p-8 animate-fade-in">
  <div className="text-center mb-8">
  <div className="bg-gradient-to-r from-primary-500 to-secondary-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
  <Calculator className="h-8 w-8 text-white" />
  </div>
  <h1 className="text-3xl font-bold text-neutral-900 mb-2">Health Risk Assessment</h1>
  <p className="text-neutral-600 max-w-2xl mx-auto">
  Enter your current health information for an AI-powered pregnancy risk assessment. This assessment takes about 2 minutes.
  </p>
  </div>

  {error && (
  <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 border border-red-300">
  <p className="font-semibold"> Validation Error</p>
  <div className="mt-2 whitespace-pre-wrap text-sm">
  {error.split('\n').map((line, idx) => (
  <p key={idx}>• {line}</p>
  ))}
  </div>
  </div>
  )}

  <form onSubmit={handleSubmit} className="space-y-6">
  <div className="grid md:grid-cols-2 gap-6">
  {healthParams.map(param => (
  <div key={param.name}>
  <label className="flex items-center text-sm font-medium text-neutral-700 mb-2">
  {param.label}{param.required && <span className="text-red-500 ml-1">*</span>}
  </label>
  <input
  name={param.name}
  type={param.type}
  placeholder={param.placeholder}
  required={param.required}
  step={param.step}
  value={formData[param.name]}
  onChange={handleChange}
  className="input-field"
  />
  </div>
  ))}
  </div>

  <button
  type="submit"
  disabled={loading}
  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
  >
  {loading ? (
  <>
  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
  Analyzing your health data...
  </>
  ) : (
  'Run AI Risk Prediction'
  )}
  </button>
  </form>

  <p className="text-xs text-neutral-500 text-center mt-4">
  Your data is securely stored and encrypted. We never share your information with third parties.
  </p>
  </div>
  </div>
  </div>
  );
};

export default PredictionInput;

