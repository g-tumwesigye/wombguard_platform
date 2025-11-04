import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
  name: '',
  email: '',
  subject: '',
  message: '',
  userType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const contactInfo = [
  {
  icon: Mail,
  title: "Email",
  content: "contact@wombguard.com",
  description: "Get in touch with our team"
  },
  {
  icon: Phone,
  title: "Phone",
  content: "+250 78..................",
  description: "Monday to Friday, 9 AM - 6 PM EST"
  },
  {
  icon: MapPin,
  title: "Address",
  content: "African Leadership University",
  description: "Kigali, Rwanda"
  }
  ];

  const userTypes = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'patient', label: 'Patient/Expecting Mother' },
  { value: 'healthcare', label: 'Healthcare Provider' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'press', label: 'Press/Media' },
  { value: 'support', label: 'Technical Support' }
  ];

  const handleChange = (e) => {
  setFormData({
  ...formData,
  [e.target.name]: e.target.value
  });
  if (submitStatus) {
  setSubmitStatus(null);
  }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
  // Send message to backend
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const response = await fetch(`${API_BASE_URL}/contact/send-message`, {
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
  },
  body: JSON.stringify({
  name: formData.name,
  email: formData.email,
  subject: formData.subject,
  message: formData.message,
  userType: formData.userType
  })
  });

  if (response.ok) {
  setSubmitStatus('success');

  // Reset form
  setFormData({
  name: '',
  email: '',
  subject: '',
  message: '',
  userType: 'general'
  });

  // Hide success message after 5 seconds
  setTimeout(() => setSubmitStatus(null), 5000);
  } else {
  setSubmitStatus('error');
  setTimeout(() => setSubmitStatus(null), 5000);
  }
  } catch (error) {
  console.error('Error sending message:', error);
  setSubmitStatus('error');
  setTimeout(() => setSubmitStatus(null), 5000);
  } finally {
  setIsSubmitting(false);
  }
  };

  return (
  <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
  <div className="max-w-7xl mx-auto">
  {/* Header */}
  <section className="text-center mb-16 animate-fade-in">
  <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
  Get in <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Touch</span>
  </h1>
  <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
  Have questions about WombGuard? Want to learn more about our research? 
  We'd love to hear from you. Reach out to our team today.
  </p>
  </section>

  <div className="grid lg:grid-cols-3 gap-8">
  {/* Contact Information */}
  <div className="lg:col-span-1 space-y-8">
  <div className="card p-8 animate-slide-up">
  <h2 className="text-2xl font-bold text-neutral-900 mb-6">Contact Information</h2>
    <div className="space-y-6">
  {contactInfo.map((info, index) => (
  <div key={index} className="flex items-start space-x-4">
  <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-3 rounded-xl">
  <info.icon className="h-5 w-5 text-white" />
  </div>
  <div>
  <h3 className="font-semibold text-neutral-900">{info.title}</h3>
  <p className="text-neutral-800">{info.content}</p>
  <p className="text-sm text-neutral-600">{info.description}</p>
  </div>
  </div>
  ))}
  </div>
  </div>

  {/* Quick Links */}
  <div className="card p-8">
  <h3 className="text-xl font-semibold text-neutral-900 mb-4">Quick Links</h3>
  <div className="space-y-3">
  <a href="/about" className="block text-primary-600 hover:text-primary-700 font-medium">
  About WombGuard →
  </a>
  <button className="block text-primary-600 hover:text-primary-700 font-medium cursor-pointer">
  Research Publications →
  </button>
  <button className="block text-primary-600 hover:text-primary-700 font-medium cursor-pointer">
  Privacy Policy →
  </button>
  <button className="block text-primary-600 hover:text-primary-700 font-medium cursor-pointer">
  Terms of Service →
  </button>
  </div>
  </div>
  </div>

  {/* Contact Form */}
  <div className="lg:col-span-2">
  <div className="card p-8 animate-fade-in">
  <h2 className="text-2xl font-bold text-neutral-900 mb-6">Send us a Message</h2>
    {/* Success Message */}
  {submitStatus === 'success' && (
  <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl mb-6 flex items-center space-x-3 animate-fade-in">
  <CheckCircle className="h-5 w-5" />
  <span>Thank you! Your message has been sent successfully. We'll get back to you within 24 hours.</span>
  </div>
  )}

  {/* Error Message */}
  {submitStatus === 'error' && (
  <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-6 flex items-center space-x-3 animate-fade-in">
  <AlertCircle className="h-5 w-5" />
  <span>Sorry, there was an error sending your message. Please try again.</span>
  </div>
  )}

  <form onSubmit={handleSubmit} className="space-y-6">
  <div className="grid md:grid-cols-2 gap-6">
  <div>
  <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
  Full Name *
  </label>
  <input
  id="name"
  name="name"
  type="text"
  required
  value={formData.name}
  onChange={handleChange}
  className="input-field"
  placeholder="Enter your full name"
  />
  </div>

  <div>
  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
  Email Address *
  </label>
  <input
  id="email"
  name="email"
  type="email"
  required
  value={formData.email}
  onChange={handleChange}
  className="input-field"
  placeholder="Enter your email"
  />
  </div>
  </div>

  <div className="grid md:grid-cols-2 gap-6">
  <div>
  <label htmlFor="userType" className="block text-sm font-medium text-neutral-700 mb-2">
  I am a...
  </label>
  <select
  id="userType"
  name="userType"
  value={formData.userType}
  onChange={handleChange}
  className="input-field"
  >
  {userTypes.map((type) => (
  <option key={type.value} value={type.value}>
  {type.label}
  </option>
  ))}
  </select>
  </div>

  <div>
  <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 mb-2">
  Subject *
  </label>
  <input
  id="subject"
  name="subject"
  type="text"
  required
  value={formData.subject}
  onChange={handleChange}
  className="input-field"
  placeholder="What is this about?"
  />
  </div>
  </div>

  <div>
  <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-2">
  Message *
  </label>
  <textarea
  id="message"
  name="message"
  rows={6}
  required
  value={formData.message}
  onChange={handleChange}
  className="input-field resize-none"
  placeholder="Please describe your inquiry in detail..."
  />
  </div>

  <button
  type="submit"
  disabled={isSubmitting}
  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
  >
  {isSubmitting ? (
  <>
  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
  Sending Message...
  </>
  ) : (
  <>
  <Send className="h-5 w-5 mr-2" />
  Send Message
  </>
  )}
  </button>
  </form>

  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
  <p className="text-amber-800 text-sm">
  <strong>Note:</strong> For urgent medical concerns, please contact your healthcare provider 
  directly or call emergency services. This contact form is for general inquiries about WombGuard only.
  </p>
  </div>
  </div>
  </div>
  </div>

  {/* FAQ Section */}
  <section className="mt-16">
  <div className="text-center mb-12">
  <h2 className="text-3xl font-bold text-neutral-900 mb-4">Frequently Asked Questions</h2>
  <p className="text-neutral-600">Quick answers to common questions about WombGuard</p>
  </div>

  <div className="grid md:grid-cols-2 gap-8">
  <div className="card p-6">
  <h3 className="text-lg font-semibold text-neutral-900 mb-3">
  Is WombGuard a replacement for regular prenatal care?
  </h3>
  <p className="text-neutral-600">
  No, WombGuard is designed to complement, not replace, regular prenatal care. 
  It provides additional monitoring and support between doctor visits.
  </p>
  </div>

  <div className="card p-6">
  <h3 className="text-lg font-semibold text-neutral-900 mb-3">
  How accurate are the risk assessments?
  </h3>
  <p className="text-neutral-600">
  Our AI models achieve 95% accuracy based on clinical validation studies. 
  However, results should always be discussed with your healthcare provider.
  </p>
  </div>

  <div className="card p-6">
  <h3 className="text-lg font-semibold text-neutral-900 mb-3">
  Is my health data secure and private?
  </h3>
  <p className="text-neutral-600">
  Yes, we use enterprise-grade encryption and comply with HIPAA regulations 
  to ensure your health information remains secure and confidential.
  </p>
  </div>

  <div className="card p-6">
  <h3 className="text-lg font-semibold text-neutral-900 mb-3">
  Can healthcare providers access the platform?
  </h3>
  <p className="text-neutral-600">
  Yes, we offer specialized dashboards for healthcare providers to monitor 
  their patients' progress and receive alerts for high-risk cases.
  </p>
  </div>
  </div>
  </section>
  </div>
  </div>
  );
};

export default Contact;