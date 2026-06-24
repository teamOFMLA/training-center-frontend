import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query';
import { useAuthStore } from './features/auth/authStore';
import { ToastContainer } from './components/Toast';
import { ThemeProvider } from './components/ThemeProvider';

// Layout and Views
import DashboardLayout from './components/DashboardLayout';
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import InstructorsPage from './features/instructors/InstructorsPage';
import StudentsPage from './features/students/StudentsPage';
import CoursesPage from './features/courses/CoursesPage';
import EnrollmentsPage from './features/enrollments/EnrollmentsPage';

// Protected Route Guard
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Application Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructors"
              element={
                <ProtectedRoute>
                  <InstructorsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students"
              element={
                <ProtectedRoute>
                  <StudentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <CoursesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/enrollments"
              element={
                <ProtectedRoute>
                  <EnrollmentsPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all Fallback Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>

        {/* Global Slide-In Toast Notification Overlay */}
        <ToastContainer />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
