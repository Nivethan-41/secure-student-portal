import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import validator from 'validator';
import { toast } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validate = () => {
    if (validator.isEmpty(formData.name.trim())) return 'Full Name is required';
    if (!validator.isLength(formData.name.trim(), { min: 2, max: 50 })) return 'Name must be between 2 and 50 characters';
    if (validator.isEmpty(formData.email)) return 'Email is required';
    if (!validator.isEmail(formData.email)) return 'Invalid email address format';
    if (validator.isEmpty(formData.password)) return 'Password is required';
    if (!validator.isStrongPassword(formData.password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })) {
      return 'Password must be at least 8 characters long and contain 1 uppercase letter and 1 number';
    }
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorMsg = validate();
    if (errorMsg) return toast.error(errorMsg);

    setLoading(true);
    try {
      const response = await fetch(`${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow-sm">
          <div className="card-header bg-dark text-white text-center">
            <h4 className="mb-0">Create Account</h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Confirm Password</label>
                <input type="password" name="confirmPassword" className="form-control" value={formData.confirmPassword} onChange={handleChange} />
              </div>
              <button type="submit" className="btn btn-primary w-100 hover-btn mt-4 mb-3" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
            <div className="mt-3 text-center">
              <Link to="/login">Already have an account? Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
