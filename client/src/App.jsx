import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Profile from './pages/Profile/Profile';
import Achievements from './pages/Profile/Achievements';
import TestList from './pages/Test/TestList';
import TestPage from './pages/Test/TestPage';
import TestResult from './pages/Test/TestResult';
import Recommendations from './pages/Results/Recommendations';
import Dashboard from './pages/Admin/Dashboard';
import { useAuthStore } from './store/index';

function PrivateRoute({ children }) {
  const user = useAuthStore(s => s.user);
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/profile/achievements" element={<PrivateRoute><Achievements /></PrivateRoute>} />
        <Route path="/test" element={<PrivateRoute><TestList /></PrivateRoute>} />
        <Route path="/test/:id" element={<PrivateRoute><TestPage /></PrivateRoute>} />
        <Route path="/test/results/:id" element={<PrivateRoute><TestResult /></PrivateRoute>} />
        <Route path="/recommendations" element={<PrivateRoute><Recommendations /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
