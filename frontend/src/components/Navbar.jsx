import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, 
  X, 
  User, 
  GraduationCap, 
  ChevronRight, 
  LogOut, 
  LayoutDashboard, 
  ChevronDown,
  ShieldCheck,
  FileSpreadsheet,
  Layers,
  TrendingUp,
  FileText
} from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const { user, isAuthenticated, isStudent, isAdmin, logout } = useAuth();
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer and profile dropdown on route change
  useEffect(() => {
    setIsOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  // Click outside listener for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const baseNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  // Role-specific nav links
  const navLinks = [...baseNavLinks];
  if (isAuthenticated && isStudent) {
    navLinks.push({ name: 'Tests', path: '/tests' });
    navLinks.push({ name: 'Progress', path: '/progress' });
    navLinks.push({ name: 'Docs', path: '/docs' });
  } else if (isAuthenticated && isAdmin) {
    navLinks.push({ name: 'Admin Portal', path: '/admin-dashboard' });
  }

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    setIsOpen(false);
    logout();
  };

  const displayName = user?.full_name || user?.first_name || user?.username || 'User';

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#FBFBFA]/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3.5' 
          : 'bg-[#FBFBFA]/85 backdrop-blur-sm border-b border-transparent py-4 md:py-5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand / Logo Text */}
          <Link 
            to="/" 
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg"
            aria-label="JaiPriya Academy Home"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-800 transition-transform group-hover:scale-105">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg sm:text-xl text-slate-900 tracking-tight leading-none group-hover:text-amber-800 transition-colors">
                JaiPriya
              </span>
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 mt-0.5">
                Academy
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-amber-900 bg-amber-100/60 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            {/* Desktop Auth / Profile Section */}
            <div className="ml-3 pl-3 border-l border-slate-200 flex items-center relative" ref={dropdownRef}>
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-800 bg-amber-50/80 border border-amber-200 rounded-full shadow-xs hover:bg-amber-100/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                    aria-expanded={profileDropdownOpen}
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs">
                      {displayName ? displayName[0].toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 max-w-[120px] truncate">
                      {displayName}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-soft-lg py-1.5 z-50 animate-in fade-in duration-150">
                      <div className="px-3.5 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {displayName}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono truncate">
                          {isAdmin ? 'Academy Admin' : (user?.abacus_level_display ? `Abacus: ${user.abacus_level_display}` : 'Student')}
                        </p>
                      </div>

                      {isAdmin ? (
                        <Link
                          to="/admin-dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                          <span>Admin Dashboard</span>
                        </Link>
                      ) : (
                        <>
                          <Link
                            to="/dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-amber-700" />
                            <span>Student Dashboard</span>
                          </Link>
                          <Link
                            to="/tests"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-700" />
                            <span>My Level Tests</span>
                          </Link>
                          <Link
                            to="/progress"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                          >
                            <TrendingUp className="w-3.5 h-3.5 text-amber-700" />
                            <span>Progress</span>
                          </Link>
                          <Link
                            to="/docs"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-700" />
                            <span>Docs</span>
                          </Link>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-full shadow-xs hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  <User className="w-3.5 h-3.5 text-amber-800" />
                  <span>Portal Login</span>
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Quick Portal Button */}
            <Link
              to={isAuthenticated ? (isAdmin ? '/admin-dashboard' : '/dashboard') : '/login'}
              aria-label="User Portal"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <User className="w-5 h-5 text-amber-800" />
            </Link>

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-expanded={isOpen}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[30rem] opacity-100 border-b border-slate-200/80 bg-[#FBFBFA]' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-4 pt-3 pb-6 space-y-1.5 max-w-6xl mx-auto">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 text-base font-medium rounded-xl transition-colors ${
                  isActive
                    ? 'bg-amber-100/70 text-amber-900 font-semibold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
                }`
              }
            >
              <span>{link.name}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </NavLink>
          ))}
          
          <div className="pt-3 mt-2 border-t border-slate-200 space-y-2">
            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <Link
                    to="/admin-dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-amber-900 bg-amber-50/80 border border-amber-200 rounded-xl"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-800" />
                      Admin Portal
                    </span>
                    <ChevronRight className="w-4 h-4 text-amber-600" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl"
                    >
                      <span className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4 text-amber-700" />
                        Dashboard ({displayName})
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>

                    <Link
                      to="/progress"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-amber-900 bg-amber-50 border border-amber-200 rounded-xl"
                    >
                      <span className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-amber-700" />
                        Progress
                      </span>
                      <ChevronRight className="w-4 h-4 text-amber-600" />
                    </Link>

                    <Link
                      to="/docs"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-amber-900 bg-amber-50 border border-amber-200 rounded-xl"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-700" />
                        Docs
                      </span>
                      <ChevronRight className="w-4 h-4 text-amber-600" />
                    </Link>

                    <Link
                      to="/tests"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-amber-900 bg-amber-50 border border-amber-200 rounded-xl"
                    >
                      <span className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-amber-700" />
                        My Tests ({user?.abacus_level_display || 'Abacus'})
                      </span>
                      <ChevronRight className="w-4 h-4 text-amber-600" />
                    </Link>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-rose-600 bg-rose-50/70 rounded-xl"
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl shadow-xs"
              >
                <User className="w-3.5 h-3.5" />
                <span>Portal Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
