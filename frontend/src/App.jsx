import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import CompareBar from './components/CompareBar';
import { useAuth } from './context/AuthContext.jsx';

// Лёгкие страницы — грузятся сразу
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Тяжёлые страницы — грузятся по требованию
const ProfilePage    = lazy(() => import('./pages/ProfilePage'));
const TestPage       = lazy(() => import('./pages/TestPage'));
const ResultsPage    = lazy(() => import('./pages/ResultsPage'));
const Institutions   = lazy(() => import('./pages/Institutions'));
const AdminPage      = lazy(() => import('./pages/AdminPage'));
const FavoritesPage  = lazy(() => import('./pages/FavoritesPage'));
const ComparePage    = lazy(() => import('./pages/ComparePage'));

function PageLoader() {
  return (
    <main className="page">
      <div className="panel" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
        Загрузка…
      </div>
    </main>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/profile" /> : <LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/profile" /> : <LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/test"
            element={
              <ProtectedRoute>
                <TestPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <ResultsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/institutions"
            element={
              <ProtectedRoute>
                <Institutions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/compare"
            element={
              <ProtectedRoute>
                <ComparePage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      {user && <CompareBar />}
    </>
  );
}