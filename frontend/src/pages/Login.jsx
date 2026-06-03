import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import validator from 'validator';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validator.isEmpty(formData.email) || validator.isEmpty(formData.password)) {
      return toast.error('Email and password are required');
    }
    if (!validator.isEmail(formData.email)) {
      return toast.error('Invalid email format');
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.user);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <div className="card shadow-sm">
          <div className="card-header bg-dark text-white text-center">
            <h4 className="mb-0">Secure Login</h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  className="form-control" 
                  value={formData.email} 
                  onChange={handleChange} 
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  name="password" 
                  className="form-control" 
                  value={formData.password} 
                  onChange={handleChange} 
                />
              </div>
              <button type="submit" className="btn btn-primary w-100 hover-btn mt-4 mb-3" disabled={loading}>
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Authenticating...</>
                ) : 'Login'}
              </button>
            </form>
            <div className="mt-3 text-center">
              <Link to="/register">Create an account</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
