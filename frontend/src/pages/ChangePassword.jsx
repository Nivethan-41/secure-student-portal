import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import validator from 'validator';
import { toast } from 'react-toastify';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validate = () => {
    if (validator.isEmpty(formData.currentPassword)) return 'Current password is required';
    if (validator.isEmpty(formData.newPassword)) return 'New password is required';
    if (!validator.isStrongPassword(formData.newPassword, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })) {
      return 'New password must be at least 8 characters long and contain 1 uppercase letter and 1 number';
    }
    if (formData.newPassword !== formData.confirmPassword) return 'New passwords do not match';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorMsg = validate();
    if (errorMsg) return toast.error(errorMsg);

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/user/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword: formData.currentPassword, newPassword: formData.newPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to change password');

      toast.success('Password changed successfully!');
      navigate('/profile');
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
          <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Change Password</h4>
            <Link to="/profile" className="btn btn-outline-light btn-sm">Back to Profile</Link>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Current Password</label>
                <input type="password" name="currentPassword" className="form-control" value={formData.currentPassword} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input type="password" name="newPassword" className="form-control" value={formData.newPassword} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Confirm New Password</label>
                <input type="password" name="confirmPassword" className="form-control" value={formData.confirmPassword} onChange={handleChange} />
              </div>
              <button type="submit" className="btn btn-danger w-100" disabled={loading}>
                {loading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
