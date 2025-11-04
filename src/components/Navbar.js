import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Heart, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
  logout();
  navigate('/');
  setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children, onClick }) => (
  <Link
  to={to}
  onClick={onClick}
  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
  isActive(to)
  ? 'bg-primary-100 text-primary-700'
  : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
  }`}
  >
  {children}
  </Link>
  );

  return (
  <nav className="bg-white shadow-lg border-b border-neutral-100 sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="flex justify-between items-center h-16">
  {/* Logo */}
  <Link to="/" className="flex items-center space-x-2">
  <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-2 rounded-xl">
  <Heart className="h-6 w-6 text-white" />
  </div>
  <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
  WombGuard
  </span>
  </Link>

  {/* Desktop Navigation */}
  <div className="hidden md:flex items-center space-x-2">
  {user ? (
  <>
  {user.role === 'pregnant_woman' && (
  <>
  <NavLink to="/pregnant-dashboard">Dashboard</NavLink>
  <NavLink to="/prediction">Health Check</NavLink>
  <NavLink to="/history">History</NavLink>
  </>
  )}
  {user.role === 'admin' && (
  <>
  <NavLink to="/admin-dashboard">Dashboard</NavLink>
  </>
  )}
  {user.role === 'healthcare_provider' && (
  <>
  <NavLink to="/healthcare-dashboard">Healthcare Provider Dashboard</NavLink>
  </>
  )}
  <NavLink to="/chat">WombGuardBot</NavLink>
  <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-neutral-200">
  <div className="text-right">
  <p className="text-sm font-semibold text-neutral-900">{user.name}</p>
  <p className="text-xs text-neutral-500 capitalize">{user.role === 'pregnant_woman' ? 'Pregnant Woman' : user.role}</p>
  </div>
  <button
  onClick={handleLogout}
  className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
  title="Logout"
  >
  <LogOut className="h-4 w-4" />
  </button>
  </div>
  </>
  ) : (
  <>
  <NavLink to="/">Home</NavLink>
  <NavLink to="/about">About</NavLink>
  <NavLink to="/contact">Contact</NavLink>
  <NavLink to="/login">Login</NavLink>
  <Link to="/register" className="btn-primary">
  Get Started
  </Link>
  </>
  )}
  </div>

  {/* Mobile menu button */}
  <button
  onClick={() => setIsOpen(!isOpen)}
  className="md:hidden p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
  >
  {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
  </button>
  </div>

  {/* Mobile Navigation */}
  {isOpen && (
  <div className="md:hidden py-4 border-t border-neutral-100 animate-fade-in">
  <div className="flex flex-col space-y-2">
  {user ? (
  <>
  {user.role === 'pregnant_woman' && (
  <>
  <NavLink to="/pregnant-dashboard" onClick={() => setIsOpen(false)}>Dashboard</NavLink>
  <NavLink to="/prediction" onClick={() => setIsOpen(false)}>Health Check</NavLink>
  <NavLink to="/history" onClick={() => setIsOpen(false)}>History</NavLink>
  </>
  )}
  {user.role === 'admin' && (
  <>
  <NavLink to="/admin-dashboard" onClick={() => setIsOpen(false)}>Dashboard</NavLink>
  </>
  )}
  {user.role === 'healthcare_provider' && (
  <>
  <NavLink to="/healthcare-dashboard" onClick={() => setIsOpen(false)}>Healthcare Provider Dashboard</NavLink>
  </>
  )}
  <NavLink to="/chat" onClick={() => setIsOpen(false)}>WombGuardBot</NavLink>
  <div className="flex flex-col items-start pt-4 mt-4 border-t border-neutral-200">
  <div className="mb-3">
  <p className="text-sm font-semibold text-neutral-900">{user.name}</p>
  <p className="text-xs text-neutral-500 capitalize">{user.role === 'pregnant_woman' ? 'Pregnant Woman' : user.role}</p>
  </div>
  <button
  onClick={handleLogout}
  className="flex items-center space-x-2 p-2 text-neutral-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
  >
  <LogOut className="h-4 w-4" />
  <span className="text-sm">Logout</span>
  </button>
  </div>
  </>
  ) : (
  <>
  <NavLink to="/" onClick={() => setIsOpen(false)}>Home</NavLink>
  <NavLink to="/about" onClick={() => setIsOpen(false)}>About</NavLink>
  <NavLink to="/contact" onClick={() => setIsOpen(false)}>Contact</NavLink>
  <NavLink to="/login" onClick={() => setIsOpen(false)}>Login</NavLink>
  <Link
  to="/register"
  onClick={() => setIsOpen(false)}
  className="btn-primary text-center mt-2"
  >
  Get Started
  </Link>
  </>
  )}
  </div>
  </div>
  )}
  </div>
  </nav>
  );
};

export default Navbar;