import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import validator from 'validator';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ name: user.name, email: user.email });
  const [updating, setUpdating] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validator.isEmpty(formData.name.trim())) return toast.error('Name cannot be empty');
    if (!validator.isEmail(formData.email)) return toast.error('Please provide a valid email address');

    setUpdating(true);
    try {
      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update profile');

      login(data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow-sm">
          <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Profile Settings</h4>
            <Link to="/change-password" className="btn btn-outline-light btn-sm">Change Password</Link>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} />
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={updating}>
                {updating ? 'Saving Changes...' : 'Save Profile'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
