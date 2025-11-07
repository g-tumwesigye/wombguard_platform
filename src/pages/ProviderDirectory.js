import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { providerService } from '../services/apiService';
import {
  Stethoscope,
  Phone,
  Mail,
  Users,
  Clock,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const ProviderDirectory = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  const canRequestConsultation = useMemo(() => {
    if (authLoading) {
      return false;
    }
    const role = user?.role?.toLowerCase?.();
    return role === 'pregnant_woman';
  }, [authLoading, user]);

  const formatResponseTime = (hours) => {
    if (hours === null || hours === undefined) {
      return 'No data yet';
    }
    if (hours <= 0) {
      return 'Under an hour';
    }
    if (hours < 1) {
      const minutes = Math.max(1, Math.round(hours * 60));
      return `${minutes} min${minutes === 1 ? '' : 's'}`;
    }
    if (hours >= 24) {
      const rawDays = hours / 24;
      const days = rawDays >= 3 ? Math.round(rawDays) : parseFloat(rawDays.toFixed(1));
      return `${days} day${days === 1 ? '' : 's'}`;
    }
    const rounded = hours >= 10 ? Math.round(hours) : parseFloat(hours.toFixed(1));
    return `${rounded} hr${rounded === 1 ? '' : 's'}`;
  };

  const renderAvailabilityChip = (status) => {
    const normalized = (status || '').toLowerCase();
    let label = 'Available';
    let styles = 'bg-emerald-50 text-emerald-700 border border-emerald-100';

    if (normalized.includes('high')) {
      label = 'High demand';
      styles = 'bg-amber-50 text-amber-700 border border-amber-200';
    } else if (normalized.includes('respond')) {
      label = 'Responding';
      styles = 'bg-sky-50 text-sky-700 border border-sky-200';
    }

    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${styles}`}>
        {label}
      </span>
    );
  };

  const fetchProviders = useCallback(async () => {
    if (!user?.email) {
      setLoadingProviders(false);
      setProviders([]);
      return;
    }

    try {
      setLoadingProviders(true);
      setError(null);

      const directoryResponse = await providerService.list(user.email);
      if (directoryResponse?.status !== 'success') {
        throw new Error(directoryResponse?.detail || 'Failed to load providers');
      }

      const directory = Array.isArray(directoryResponse.data) ? directoryResponse.data : [];
      setProviders(directory);
    } catch (fetchError) {
      console.error('Failed to load providers', fetchError);
      setError(fetchError.message || 'Failed to load providers. Please try again.');
      setProviders([]);
    } finally {
      setLoadingProviders(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!authLoading && user?.email) {
      fetchProviders();
    } else if (!authLoading && !user) {
      setLoadingProviders(false);
      setError('Sign in to view the provider directory.');
    }
  }, [authLoading, user, fetchProviders]);

  const filteredProviders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return providers.filter((provider) => {
      const matchesTerm =
        !term ||
        (provider.name && provider.name.toLowerCase().includes(term)) ||
        (provider.email && provider.email.toLowerCase().includes(term)) ||
        (provider.phone && provider.phone.toLowerCase().includes(term));

      const availability = (provider.availability_status || '').toLowerCase();
      const matchesAvailability =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && availability.includes('available')) ||
        (availabilityFilter === 'responding' && availability.includes('respond')) ||
        (availabilityFilter === 'high demand' && availability.includes('high'));

      return matchesTerm && matchesAvailability;
    });
  }, [providers, searchTerm, availabilityFilter]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-sky-50">
        <div className="flex flex-col items-center text-neutral-500">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
          <p>Validating your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-sky-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white shadow-lg rounded-3xl border border-neutral-100 overflow-hidden">
          <div className="px-6 sm:px-10 py-10 bg-gradient-to-r from-primary-50 via-white to-blue-50">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-primary-600 rounded-2xl shadow-md">
                    <Stethoscope className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-primary-500 font-semibold">Find Your Care Team</p>
                    <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight">Healthcare Provider Directory</h1>
                  </div>
                </div>
                <p className="text-neutral-600 text-base sm:text-lg max-w-3xl">
                  Browse trusted healthcare professionals ready to assist you through your maternal health journey. Compare response times, consultation activity, and reach out directly when you need support.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <button
                  onClick={fetchProviders}
                  disabled={loadingProviders}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white border border-neutral-200 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loadingProviders ? 'animate-spin' : ''}`} />
                  {loadingProviders ? 'Refreshing...' : 'Refresh'}
                </button>
                {canRequestConsultation && (
                  <button
                    onClick={() => navigate('/pregnant-dashboard')}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold shadow-md hover:bg-primary-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    View My Dashboard
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 sm:px-10 pb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="relative md:col-span-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by provider name, email, or phone"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-400 focus:ring focus:ring-primary-100 transition-all"
                />
              </div>
              <div>
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <select
                    value={availabilityFilter}
                    onChange={(event) => setAvailabilityFilter(event.target.value)}
                    className="w-full appearance-none pl-11 pr-10 py-3 rounded-xl border border-neutral-200 bg-white focus:border-primary-400 focus:ring focus:ring-primary-100 transition-all"
                  >
                    <option value="all">All availability</option>
                    <option value="available">Available</option>
                    <option value="responding">Responding</option>
                    <option value="high demand">High demand</option>
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            {loadingProviders ? (
              <div className="py-20 flex flex-col items-center justify-center text-neutral-500">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
                <p>Loading healthcare providers...</p>
              </div>
            ) : filteredProviders.length === 0 ? (
              <div className="py-16 text-center bg-white border border-dashed border-neutral-200 rounded-2xl">
                <Stethoscope className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-neutral-800">No providers match your filters yet</h3>
                <p className="text-neutral-500 mt-2">
                  Try adjusting your search or availability filter. If you need urgent support, please reach out through the consultation request form on your dashboard.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProviders.map((provider) => (
                  <div
                    key={provider.id || provider.email}
                    className="bg-white border border-neutral-200 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-200 p-6 flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-2xl bg-primary-100 text-primary-600">
                          <Stethoscope className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-neutral-900">{provider.name || 'Healthcare Provider'}</h3>
                          <p className="text-sm text-neutral-500">Maternal health specialist</p>
                        </div>
                      </div>
                      {renderAvailabilityChip(provider.availability_status)}
                    </div>

                    <div className="space-y-3 text-sm text-neutral-600">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-primary-500" />
                        <a href={`mailto:${provider.email}`} className="text-primary-600 hover:underline break-all">
                          {provider.email}
                        </a>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-primary-500" />
                        {provider.phone && provider.phone !== 'N/A' ? (
                          <a href={`tel:${provider.phone}`} className="text-primary-600 hover:underline">
                            {provider.phone}
                          </a>
                        ) : (
                          <span className="text-neutral-400">Phone not available</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4 text-xs">
                      <div className="rounded-xl bg-primary-50 text-primary-700 p-4">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span className="font-semibold text-sm">{provider.patients_supported}</span>
                        </div>
                        <p className="mt-1 text-neutral-600">Patients supported</p>
                      </div>
                      <div className="rounded-xl bg-blue-50 text-blue-700 p-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span className="font-semibold text-sm">{formatResponseTime(provider.average_response_hours)}</span>
                        </div>
                        <p className="mt-1 text-neutral-600">Average response</p>
                      </div>
                      <div className="rounded-xl bg-amber-50 text-amber-700 p-4">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-semibold text-sm">{provider.pending_consultations}</span>
                        </div>
                        <p className="mt-1 text-neutral-600">Pending consultations</p>
                      </div>
                      <div className="rounded-xl bg-emerald-50 text-emerald-700 p-4">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-semibold text-sm">{provider.accepted_consultations}</span>
                        </div>
                        <p className="mt-1 text-neutral-600">Accepted consultations</p>
                      </div>
                    </div>

                    {canRequestConsultation && provider.email && (
                      <div className="mt-6 pt-4 border-t border-neutral-200">
                        <button
                          onClick={() =>
                            navigate('/pregnant-dashboard', {
                              state: { selectedProviderEmail: provider.email }
                            })
                          }
                          className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold shadow-md hover:bg-primary-700 transition-colors"
                        >
                          Start consultation request
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDirectory;
