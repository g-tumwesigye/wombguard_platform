import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, MessageSquare, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Landing = () => {
  const { user } = useAuth();

  // Static content 
  const features = [
  { icon: Heart, title: 'Health Monitoring', description: 'Advanced algorithms to assess pregnancy health risks and provide personalized insights.' },
  { icon: Shield, title: 'Risk Prediction', description: 'Early detection of potential complications to ensure better outcomes for mother and baby.' },
  { icon: MessageSquare, title: 'WombGuardBot Support', description: '24/7 intelligent chatbot assistance for pregnancy-related questions and concerns.' },
  { icon: TrendingUp, title: 'Progress Tracking', description: 'Monitor your pregnancy journey with detailed analytics and historical data.' }
  ];

  const benefits = [
  'Personalized health recommendations',
  'Early risk detection and prevention',
  'Expert-backed medical insights',
  'Secure and private data handling',
  'Healthcare provider collaboration',
  'Comprehensive pregnancy tracking'
  ];

  // Static stats for landing page 
  const stats = [
  { number: '24/7', label: 'Support Available' }
  ];

  return (
  <div className="min-h-screen">
  {/* Hero Section */}
  <section className="relative overflow-hidden py-20 lg:py-32">
  <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50"></div>
  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="text-center animate-fade-in">
  <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
  Protecting Every
  <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"> Pregnancy Journey</span>
  </h1>
  <p className="text-xl md:text-2xl text-neutral-600 mb-8 max-w-3xl mx-auto">
  Advanced AI-powered health monitoring and risk assessment platform designed to ensure safer pregnancies for mothers and babies.
  </p>
  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
  {user ? (
  user.role === 'pregnant_woman' ? (
  <>
  <Link to="/prediction" className="btn-primary">Start Health Check</Link>
  <Link to="/chat" className="btn-secondary">Meet WombGuardBot</Link>
  </>
  ) : (
  <>
  <Link to="/dashboard" className="btn-primary">View Dashboard</Link>
  <Link to="/chat" className="btn-secondary">WombGuardBot Assistant</Link>
  </>
  )
  ) : (
  <>
  <Link to="/register" className="btn-primary">Get Started Free</Link>
  <Link to="/chat" className="btn-secondary">Try WombGuardBot</Link>
  </>
  )}
  </div>
  </div>

  {/* Stats Section */}
  <div className="flex justify-center mt-16 animate-slide-up">
  {stats.map((stat, index) => (
  <div key={index} className="text-center">
  <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">{stat.number}</div>
  <div className="text-neutral-600">{stat.label}</div>
  </div>
  ))}
  </div>
  </div>
  </section>

  {/* Features Section */}
  <section className="py-20 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="text-center mb-16">
  <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Comprehensive Pregnancy Care</h2>
  <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
  Our platform combines cutting-edge technology with medical expertise to provide the best care for expecting mothers.
  </p>
  </div>

  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
  {features.map((feature, index) => (
  <div key={index} className="card p-6 text-center group hover:scale-105 transition-transform duration-300">
  <div className="bg-gradient-to-r from-primary-500 to-secondary-500 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
  <feature.icon className="h-6 w-6 text-white" />
  </div>
  <h3 className="text-xl font-semibold text-neutral-900 mb-3">{feature.title}</h3>
  <p className="text-neutral-600">{feature.description}</p>
  </div>
  ))}
  </div>
  </div>
  </section>

  {/* Mission Section */}
  <section className="py-20 gradient-bg">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="grid lg:grid-cols-2 gap-12 items-center">
  <div>
  <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">Our Mission: Safer Pregnancies Through Technology</h2>
  <p className="text-lg text-neutral-600 mb-8">
  WombGuard leverages advanced machine learning algorithms and medical expertise to identify potential pregnancy complications early, enabling proactive care and better outcomes for both mothers and babies.
  </p>
  <div className="grid gap-4">
  {benefits.map((benefit, index) => (
  <div key={index} className="flex items-center space-x-3">
  <CheckCircle className="h-5 w-5 text-accent-500 flex-shrink-0" />
  <span className="text-neutral-700">{benefit}</span>
  </div>
  ))}
  </div>
  </div>
  <div className="relative">
  <img
  src="/images/preg.jpg"
  alt="Pregnancy care"
  className="rounded-2xl shadow-2xl"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-primary-500/20 to-transparent rounded-2xl"></div>
  </div>
  </div>
  </div>
  </section>

  {/* CTA Section */}
  <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
  <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Journey with WombGuard?</h2>
  <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
  Join thousands of expecting mothers who trust WombGuard for their pregnancy health monitoring and care guidance.
  </p>

  {!user && (
  <div className="flex flex-col sm:flex-row gap-4 justify-center">
  <Link to="/register" className="bg-white text-primary-600 px-8 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center">
  Create Free Account
  <ArrowRight className="ml-2 h-5 w-5" />
  </Link>
  <Link to="/contact" className="border-2 border-white text-white px-8 py-4 rounded-xl font-medium hover:bg-white hover:text-primary-600 transition-all duration-300">
  Contact Us
  </Link>
  </div>
  )}
  </div>
  </section>
  </div>
  );
};

export default Landing;
