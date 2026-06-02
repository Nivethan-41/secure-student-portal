const sql = require('../config/db');
const passwordService = require('../services/passwordService');
const validator = require('validator');
const { sanitizeOutput } = require('../utils/sanitize');

const getSecurityLogs = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch the 10 most recent security logs for this user
    const logs = await sql`
      SELECT id, event_type, ip_address, created_at as timestamp 
      FROM security_logs 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC 
      LIMIT 10
    `;

    res.status(200).json(sanitizeOutput({ logs }));
  } catch (error) {
    console.error('Error fetching security logs:', error);
    res.status(500).json({ error: 'Internal server error while fetching logs' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    if (validator.isEmpty(name.trim())) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }
    
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if the new email is already taken by another user
    const existingUser = await sql`SELECT id FROM users WHERE email = ${email} AND id != ${userId}`;
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email is already in use by another account' });
    }

    // Split the name for the DB
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Update the user profile
    const updatedUsers = await sql`
      UPDATE users 
      SET first_name = ${firstName}, last_name = ${lastName}, email = ${email} 
      WHERE id = ${userId} 
      RETURNING id, first_name, last_name, email, role
    `;

    if (updatedUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = updatedUsers[0];
    updatedUser.name = (updatedUser.first_name + ' ' + (updatedUser.last_name || '')).trim();

    // Log the profile update
    await sql`
      INSERT INTO security_logs (event_type, user_id, ip_address, description)
      VALUES ('PROFILE_UPDATED', ${userId}, ${req.ip}, ${'Updated email to: ' + email})
    `;

    res.status(200).json(sanitizeOutput({ 
      message: 'Profile updated successfully', 
      user: updatedUser 
    }));
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error while updating profile' });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    if (!validator.isStrongPassword(newPassword, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long and contain 1 uppercase letter and 1 number' });
    }

    // Get the user's current hash and email
    const users = await sql`SELECT email, password_hash FROM users WHERE id = ${userId}`;
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = users[0];

    // Verify current password
    const isValid = await passwordService.verifyPassword(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    // Hash the new password
    const newHash = await passwordService.hashPassword(newPassword);

    // Update the database
    await sql`UPDATE users SET password_hash = ${newHash} WHERE id = ${userId}`;

    // Log the security event
    await sql`
      INSERT INTO security_logs (event_type, user_id, ip_address, description)
      VALUES ('PASSWORD_CHANGED', ${userId}, ${req.ip}, ${'Email: ' + user.email})
    `;

    res.status(200).json(sanitizeOutput({ message: 'Password changed successfully' }));
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal server error while changing password' });
  }
};

module.exports = {
  getSecurityLogs,
  updateProfile,
  changePassword
};
