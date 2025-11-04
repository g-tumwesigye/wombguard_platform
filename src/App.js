import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import PregnantDashboard from './pages/PregnantDashboard';
import HealthcareWorkerDashboard from './pages/HealthcareWorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PredictionInput from './pages/PredictionInput';
import HealthCheckResult from './pages/HealthCheckResult';
import Chatbot from './pages/Chatbot';
import History from './pages/History';
import About from './pages/About';
import Contact from './pages/Contact';

function App() {
  return (
  <AuthProvider>
  <Router>
  <div className="min-h-screen gradient-bg">
  <Navbar />
  <Routes>
  <Route path="/" element={<Landing />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/verify-email" element={<VerifyEmail />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/pregnant-dashboard" element={<PregnantDashboard />} />
  <Route path="/healthcare-dashboard" element={<HealthcareWorkerDashboard />} />
  <Route path="/admin-dashboard" element={<AdminDashboard />} />
  <Route path="/prediction" element={<PredictionInput />} />
  <Route path="/health-check-result" element={<HealthCheckResult />} />
  <Route path="/chat" element={<Chatbot />} />
  <Route path="/history" element={<History />} />
  <Route path="/about" element={<About />} />
  <Route path="/contact" element={<Contact />} />
  </Routes>
  </div>
  </Router>
  </AuthProvider>
  );
}

export default App;