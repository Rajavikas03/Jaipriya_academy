import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  LogIn, 
  AlertCircle, 
  Loader2, 
  Lock, 
  Phone, 
  ShieldCheck, 
  UserCheck, 
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function Login() {
  const [activeTab, setActiveTab] = useState('student'); // 'student' | 'admin'
  const [studentMobile, setStudentMobile] = useState('');
  const [adminMobile, setAdminMobile] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { studentLogin, adminLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanMobile = studentMobile.trim().replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 7) {
      setError('Please enter a valid mobile number (at least 7 digits).');
      return;
    }

    setIsSubmitting(true);
    try {
      await studentLogin(studentMobile.trim());
      navigate(from || '/dashboard', { replace: true });
    } catch (err) {
      if (err.data?.detail) {
        setError(err.data.detail);
      } else {
        setError('Your account has not been added yet. Please contact JaiPriya Academy.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!adminMobile.trim() || !adminPassword.trim()) {
      setError('Please enter both your mobile number and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminLogin(adminMobile.trim(), adminPassword);
      navigate('/admin-dashboard', { replace: true });
    } catch (err) {
      if (err.data?.detail) {
        setError(err.data.detail);
      } else {
        setError('Invalid admin credentials. Please check your mobile number and password.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 md:py-20 bg-[#FBFBFA] min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-800 mx-auto mb-3 shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            JaiPriya Academy
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-light">
            Portal access for enrolled students & academy administration.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-200/70 p-1.5 rounded-2xl flex items-center mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('student');
              setError('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'student'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-amber-600" />
            <span>Student Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setError('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'admin'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-800" />
            <span>Admin Login</span>
          </button>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-card">
          
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STUDENT LOGIN TAB */}
          {activeTab === 'student' && (
            <form onSubmit={handleStudentSubmit} className="space-y-5">
              
              <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="font-light leading-relaxed">
                  Students log in using only their <strong>registered mobile number</strong>. No password is required.
                </p>
              </div>

              {/* Mobile Number Field */}
              <div>
                <label 
                  htmlFor="studentMobile"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
                >
                  Student Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    id="studentMobile"
                    name="studentMobile"
                    autoComplete="tel"
                    autoFocus
                    value={studentMobile}
                    onChange={(e) => setStudentMobile(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-slate-900 font-mono"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Verifying Mobile Number...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Student Portal</span>
                      <LogIn className="w-4 h-4 text-amber-400" />
                    </>
                  )}
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-400 font-light flex items-center justify-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Not enrolled yet? Please contact the academy office.</span>
                </p>
              </div>

            </form>
          )}

          {/* ADMIN LOGIN TAB */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-5">
              
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-700 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <p className="font-light leading-relaxed">
                  Administrator access for student registration, test publishing, and class score reviews.
                </p>
              </div>

              {/* Mobile / Username */}
              <div>
                <label 
                  htmlFor="adminMobile"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
                >
                  Admin Mobile Number / Username
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="adminMobile"
                    name="adminMobile"
                    autoFocus
                    value={adminMobile}
                    onChange={(e) => setAdminMobile(e.target.value)}
                    placeholder="e.g. 9999999999"
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-slate-900 font-mono"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label 
                  htmlFor="adminPassword"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    id="adminPassword"
                    name="adminPassword"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-slate-900"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Login as Academy Admin</span>
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
