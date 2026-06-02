import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ErrorBoundary } from 'react-error-boundary';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import Admin from './pages/Admin';

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="container mt-5 text-center">
    <div className="alert alert-danger d-inline-block">
      <h4>Something went wrong!</h4>
      <p>{error.message}</p>
      <button className="btn btn-outline-danger" onClick={resetErrorBoundary}>Try again</button>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AuthProvider>
        <Router>
          <Navbar />
          <div className="container mt-5">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/dashboard" 
                element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
              />
              <Route 
                path="/profile" 
                element={<ProtectedRoute><Profile /></ProtectedRoute>} 
              />
              <Route 
                path="/change-password" 
                element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} 
              />
              <Route 
                path="/admin" 
                element={<ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>} 
              />
            </Routes>
          </div>
        </Router>
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
