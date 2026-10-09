import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, UserPlus, AlertCircle, Loader2, Lock, User, Mail, Phone } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required.';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required.';
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required.';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone_number: formData.phoneNumber.trim(),
        password: formData.password,
      });

      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.data) {
        // DRF field errors
        const fieldErrors = {};
        Object.entries(err.data).forEach(([key, val]) => {
          const message = Array.isArray(val) ? val.join(' ') : String(val);
          if (key === 'username') fieldErrors.username = message;
          else if (key === 'email') fieldErrors.email = message;
          else if (key === 'password') fieldErrors.password = message;
          else if (key === 'first_name') fieldErrors.firstName = message;
          else if (key === 'last_name') fieldErrors.lastName = message;
          else setServerError(message);
        });
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      } else {
        setServerError(err.message || 'Registration failed. Please check your information.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 md:py-20 bg-[#FBFBFA] min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-800 mx-auto mb-3 shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Create Student Account
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 font-light">
            Join JaiPriya Academy to access your student learning profile.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 md:p-10 shadow-card">
          
          {serverError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            
            {/* Row 1: First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label 
                  htmlFor="firstName"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g. Aarav"
                  className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border transition-all ${
                    errors.firstName 
                      ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:ring-rose-500' 
                      : 'border-slate-200 bg-slate-50/60 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-rose-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label 
                  htmlFor="lastName"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Sharma"
                  className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border transition-all ${
                    errors.lastName 
                      ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:ring-rose-500' 
                      : 'border-slate-200 bg-slate-50/60 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-rose-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Row 2: Username & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label 
                  htmlFor="regUsername"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="regUsername"
                    name="username"
                    autoComplete="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="e.g. aarav_s"
                    className={`w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border transition-all ${
                      errors.username 
                        ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:ring-rose-500' 
                        : 'border-slate-200 bg-slate-50/60 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
                    }`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-xs text-rose-600">{errors.username}</p>
                )}
              </div>

              <div>
                <label 
                  htmlFor="regEmail"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    id="regEmail"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. student@example.com"
                    className={`w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border transition-all ${
                      errors.email 
                        ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:ring-rose-500' 
                        : 'border-slate-200 bg-slate-50/60 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
                    }`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Row 3: Mobile Number */}
            <div>
              <label 
                htmlFor="phoneNumber"
                className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
              >
                Mobile Number <span className="text-slate-400 font-normal">(for quick login)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Row 4: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label 
                  htmlFor="regPassword"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    id="regPassword"
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className={`w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border transition-all ${
                      errors.password 
                        ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:ring-rose-500' 
                        : 'border-slate-200 bg-slate-50/60 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
                    }`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-rose-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label 
                  htmlFor="confirmPassword"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    className={`w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border transition-all ${
                      errors.confirmPassword 
                        ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:ring-rose-500' 
                        : 'border-slate-200 bg-slate-50/60 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
                    }`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Student Account</span>
                    <UserPlus className="w-4 h-4 text-amber-400" />
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Login Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs sm:text-sm text-slate-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-amber-800 hover:text-amber-900 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
