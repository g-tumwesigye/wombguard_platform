import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Users, Award, Target, Shield, Lightbulb } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  const team = [
  {
  name: "Ms. Samiratu Ntohsi",
  role: "Project Supervisor",
  image: null,
  initials: "SN",
  description: "Machine Learning Engineer with expertise in artificial intelligence and building optimized predictive models."
  },
  {
  name: "Geofrey Tumwesigye",
  role: "Lead Developer",
  image: "/images/geoffrey.jpg",
  description: "Machine Learning Engineer and full-stack developer specializing in advanced AI systems architecture and scalable intelligent solutions."
  },
  {
  name: "Dr. Festus BIZIMANA",
  role: "Clinical Advisor",
  image: "/images/festus.jpg",
  description: "Obstetrician with expertise in high-risk pregnancies and maternal-fetal medicine."
  }
  ];

  const features = [
  {
  icon: Shield,
  title: "Advanced Risk Assessment",
  description: "Our AI-powered algorithms analyze multiple health parameters to provide accurate pregnancy risk predictions."
  },
  {
  icon: Heart,
  title: "Personalized Care",
  description: "Tailored recommendations and monitoring based on individual health profiles and risk factors."
  },
  {
  icon: Users,
  title: "Healthcare Integration",
  description: "Seamless collaboration between patients and healthcare providers for comprehensive care."
  },
  {
  icon: Lightbulb,
  title: "AI-Powered Support",
  description: "24/7 intelligent chatbot assistance for pregnancy questions and concerns."
  }
  ];

  const mission = [
  {
  icon: Target,
  title: "Our Mission",
  content: "To revolutionize pregnancy care through innovative technology, providing expecting mothers and healthcare providers with the tools they need to ensure safer pregnancies and healthier outcomes."
  },
  {
  icon: Award,
  title: "Our Vision",
  content: "A world where every pregnancy is monitored, supported, and celebrated with the best technology and medical expertise available, reducing maternal and infant mortality rates globally."
  }
  ];

  return (
  <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
  <div className="max-w-7xl mx-auto">
  {/* Hero Section */}
  <section className="text-center mb-16 animate-fade-in">
  <div className="bg-gradient-to-r from-primary-500 to-secondary-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
  <Heart className="h-10 w-10 text-white" />
  </div>
  <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
  About <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">WombGuard</span>
  </h1>
  <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
  WombGuard is an innovative pregnancy health monitoring platform that combines artificial intelligence, 
  medical expertise, and user-friendly technology to provide comprehensive care for expecting mothers.
  </p>
  <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-8 rounded-2xl max-w-4xl mx-auto">
  <p className="text-lg text-neutral-700">
  Developed as part of a research initiative to improve maternal healthcare outcomes, 
  WombGuard represents the cutting edge of prenatal care technology.
  </p>
  </div>
  </section>

  {/* Mission & Vision */}
  <section className="grid md:grid-cols-2 gap-8 mb-16 animate-slide-up">
  {mission.map((item, index) => (
  <div key={index} className="card p-8">
  <div className="bg-gradient-to-r from-primary-500 to-secondary-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
  <item.icon className="h-8 w-8 text-white" />
  </div>
  <h2 className="text-2xl font-bold text-neutral-900 mb-4">{item.title}</h2>
  <p className="text-neutral-600 leading-relaxed">{item.content}</p>
  </div>
  ))}
  </section>

  {/* Features */}
  <section className="mb-16">
  <div className="text-center mb-12">
  <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
  Platform Features
  </h2>
  <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
  Comprehensive tools designed to support every aspect of pregnancy health monitoring and care.
  </p>
  </div>
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
  {features.map((feature, index) => (
  <div key={index} className="card p-6 text-center group hover:scale-105 transition-transform duration-300">
  <div className="bg-gradient-to-r from-primary-500 to-secondary-500 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
  <feature.icon className="h-6 w-6 text-white" />
  </div>
  <h3 className="text-xl font-semibold text-neutral-900 mb-3">
  {feature.title}
  </h3>
  <p className="text-neutral-600">
  {feature.description}
  </p>
  </div>
  ))}
  </div>
  </section>

  {/* Team */}
  <section className="mb-16">
  <div className="text-center mb-12">
  <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
  Meet Our Team
  </h2>
  <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
  Dedicated professionals combining medical expertise with cutting-edge technology.
  </p>
  </div>
    <div className="grid md:grid-cols-3 gap-8">
  {team.map((member, index) => (
  <div key={index} className="card p-6 text-center group hover:shadow-xl transition-shadow duration-300">
  {member.image ? (
  <img
  src={member.image}
  alt={member.name}
  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
  onError={(e) => {
  e.target.style.display = 'none';
  e.target.nextElementSibling.style.display = 'flex';
  }}
  />
  ) : null}
  <div
  style={{ display: member.image ? 'none' : 'flex' }}
  className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg"
  >
  {member.initials || member.name.split(' ').map(n => n[0]).join('')}
  </div>
  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
  {member.name}
  </h3>
  <p className="text-primary-600 font-medium mb-3">{member.role}</p>
  <p className="text-neutral-600 text-sm">{member.description}</p>
  </div>
  ))}
  </div>
  </section>

  {/* Research & Development */}
  <section className="mb-16">
  <div className="card p-8 md:p-12">
  <div className="grid md:grid-cols-2 gap-8 items-center">
  <div>
  <h2 className="text-3xl font-bold text-neutral-900 mb-6">
  Research & Development
  </h2>
  <div className="space-y-4 text-neutral-600">
  <p>
  WombGuard is built on extensive research in maternal health, artificial intelligence, 
  and prenatal care best practices. Our algorithms are trained on anonymized data 
  from thousands of pregnancy cases to provide accurate risk assessments.
  </p>
  <p>
  The platform undergoes continuous improvement through collaboration with healthcare 
  professionals, feedback from users, and integration of the latest medical research findings.
  </p>
  <p>
  We are committed to maintaining the highest standards of data privacy, security, 
  and medical accuracy in all aspects of our platform.
  </p>
  </div>
    <div className="mt-8 grid grid-cols-2 gap-6">
  <div className="text-center p-4 bg-primary-50 rounded-xl">
  <div className="text-2xl font-bold text-primary-600">95%</div>
  <div className="text-sm text-neutral-600">Accuracy Rate</div>
  </div>
  <div className="text-center p-4 bg-secondary-50 rounded-xl">
  <div className="text-2xl font-bold text-secondary-600">10k+</div>
  <div className="text-sm text-neutral-600">Cases Analyzed</div>
  </div>
  </div>
  </div>
    <div className="relative">
  <img
  src="/images/virus.jpg"
  alt="Medical research - Virus pathogen visualization"
  className="rounded-2xl shadow-2xl"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-primary-500/20 to-transparent rounded-2xl"></div>
  </div>
  </div>
  </div>
  </section>

  {/* Call to Action */}
  <section className="text-center py-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl text-white">
  <h2 className="text-3xl md:text-4xl font-bold mb-6">
  Ready to Transform Pregnancy Care?
  </h2>
  <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
  Join thousands of healthcare providers and expecting mothers who trust WombGuard 
  for comprehensive pregnancy health monitoring.
  </p>
  <div className="flex flex-col sm:flex-row gap-4 justify-center">
  <button className="bg-white text-primary-600 px-8 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
  Learn More
  </button>
  <button
  onClick={() => navigate('/contact')}
  className="border-2 border-white text-white px-8 py-4 rounded-xl font-medium hover:bg-white hover:text-primary-600 transition-all duration-300"
  >
  Contact Research Team
  </button>
  </div>
  </section>
  </div>
  </div>
  );
};

export default About;