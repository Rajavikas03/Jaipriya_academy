import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Public Pages
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import AboutPage from './pages/AboutPage';
import Contact from './pages/Contact';

// Auth Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Progress from './pages/Progress';
import Docs from './pages/Docs';

// Tests Hub & Abacus Pages
import Tests from './pages/Tests';
import AbacusTestView from './pages/abacus/AbacusTestView';
import AbacusResults from './pages/abacus/AbacusResults';

// Spoken English Pages (Batch 6)
import SpokenEnglishHome from './pages/spokenEnglish/SpokenEnglishHome';
import SpokenEnglishTopicView from './pages/spokenEnglish/SpokenEnglishTopicView';
import SpokenEnglishTheoryView from './pages/spokenEnglish/SpokenEnglishTheoryView';
import SpokenEnglishPractice from './pages/spokenEnglish/SpokenEnglishPractice';
import SpokenEnglishTestView from './pages/spokenEnglish/SpokenEnglishTestView';
import SpokenEnglishTestResult from './pages/spokenEnglish/SpokenEnglishTestResult';
import SpokenEnglishResults from './pages/spokenEnglish/SpokenEnglishResults';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-slate-800 font-sans selection:bg-amber-100 selection:text-amber-900 overflow-x-hidden">
          {/* Header Navigation */}
          <Navbar />

          {/* Dynamic Page Routes */}
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:courseId" element={<CourseDetail />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<Contact />} />

              {/* Auth Route */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Navigate to="/login" replace />} />

              {/* Student Dashboard */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Subject Tests Hub */}
              <Route 
                path="/tests" 
                element={
                  <ProtectedRoute>
                    <Tests />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/progress" 
                element={
                  <ProtectedRoute>
                    <Progress />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/docs" 
                element={
                  <ProtectedRoute>
                    <Docs />
                  </ProtectedRoute>
                } 
              />

              {/* Abacus Routes */}
              <Route 
                path="/dashboard/abacus" 
                element={
                  <ProtectedRoute>
                    <Tests />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/abacus/attempt/:attemptId" 
                element={
                  <ProtectedRoute>
                    <AbacusTestView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/abacus/results/:attemptId" 
                element={
                  <ProtectedRoute>
                    <AbacusResults />
                  </ProtectedRoute>
                } 
              />

              {/* Spoken English Routes (Batch 6) */}
              <Route 
                path="/tests/spoken-english" 
                element={
                  <ProtectedRoute>
                    <SpokenEnglishHome />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tests/spoken-english/theory" 
                element={
                  <ProtectedRoute>
                    <SpokenEnglishTheoryView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tests/spoken-english/practice" 
                element={
                  <ProtectedRoute>
                    <SpokenEnglishPractice />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tests/spoken-english/test" 
                element={
                  <ProtectedRoute>
                    <SpokenEnglishTestView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tests/spoken-english/test/results/:attemptId" 
                element={
                  <ProtectedRoute>
                    <SpokenEnglishTestResult />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tests/spoken-english/results/:attemptId" 
                element={
                  <ProtectedRoute>
                    <SpokenEnglishTestResult />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tests/spoken-english/:topicId" 
                element={
                  <ProtectedRoute>
                    <SpokenEnglishTopicView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tests/spoken-english/:topicId/theory" 
                element={
                  <ProtectedRoute>
                    <SpokenEnglishTheoryView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tests/spoken-english/:topicId/practice" 
                element={
                  <ProtectedRoute>
                    <SpokenEnglishPractice />
                  </ProtectedRoute>
                } 
              />

              {/* Academy Admin Dashboard */}
              <Route 
                path="/admin-dashboard" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />

              {/* Fallback route */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>

          {/* Global Footer */}
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
