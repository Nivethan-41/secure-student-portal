const passwordService = require('../services/passwordService');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const sql = require('../config/db');
const { sanitizeOutput } = require('../utils/sanitize');

const register = async (req, res) => {
  try {
    const { name, email, password, role = 'student' } = req.body;

    // 1. Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }
    
    if (validator.isEmpty(name.trim())) {
      return res.status(400).json({ error: 'Full name cannot be empty' });
    } else if (!validator.isLength(name.trim(), { min: 2, max: 50 })) {
      return res.status(400).json({ error: 'Name must be between 2 and 50 characters' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    if (!validator.isStrongPassword(password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long and contain 1 uppercase letter and 1 number' });
    }

    // 2. Check if user already exists
    const existingUsers = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // 3. Hash password using the service
    const passwordHash = await passwordService.hashPassword(password);

    // 4. Split name and Insert into database
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    const newUsers = await sql`
      INSERT INTO users (first_name, last_name, email, password_hash, role)
      VALUES (${firstName}, ${lastName}, ${email}, ${passwordHash}, ${role})
      RETURNING id, first_name, last_name, email, role, created_at
    `;
    const newUser = newUsers[0];
    newUser.name = (newUser.first_name + ' ' + (newUser.last_name || '')).trim();

    // Log security event
    await sql`
      INSERT INTO security_logs (event_type, user_id, ip_address, description)
      VALUES ('REGISTER_SUCCESS', ${newUser.id}, ${req.ip}, ${'Email: ' + email})
    `;

    res.status(201).json(sanitizeOutput({
      message: 'User registered successfully',
      user: newUser
    }));
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // 1. Find user
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    const user = users[0];

    if (!user) {
      // Log failed attempt but do not lock (we only lock existing accounts)
      await sql`
        INSERT INTO security_logs (event_type, user_id, ip_address, description)
        VALUES ('LOGIN_FAILED_USER_NOT_FOUND', null, ${req.ip}, ${'Attempted Email: ' + email})
      `;
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 2. Check if account is temporarily locked
    if (user.account_locked_until && new Date() < new Date(user.account_locked_until)) {
      const remainingMinutes = Math.ceil((new Date(user.account_locked_until) - new Date()) / 60000);
      return res.status(403).json({ 
        error: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${remainingMinutes} minutes.` 
      });
    }

    // 3. Verify password using the service
    const isValidPassword = await passwordService.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      // Calculate new failed attempts
      const attempts = (user.failed_login_attempts || 0) + 1;
      let lockedUntil = null;

      // Log failed attempt
      await sql`
        INSERT INTO security_logs (event_type, user_id, ip_address, description)
        VALUES ('LOGIN_FAILED_WRONG_PASSWORD', ${user.id}, ${req.ip}, ${'Email: ' + email})
      `;

      // If 5 or more attempts, lock the account for 15 minutes
      if (attempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins from now
        await sql`
          INSERT INTO security_logs (event_type, user_id, ip_address, description)
          VALUES ('ACCOUNT_LOCKED', ${user.id}, ${req.ip}, ${'Email: ' + email})
        `;
      }

      // Update database with failed attempts and lock status
      await sql`
        UPDATE users 
        SET failed_login_attempts = ${attempts}, account_locked_until = ${lockedUntil} 
        WHERE id = ${user.id}
      `;

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 4. If password is correct, reset failed attempts if necessary
    if (user.failed_login_attempts > 0 || user.account_locked_until) {
      await sql`
        UPDATE users 
        SET failed_login_attempts = 0, account_locked_until = NULL 
        WHERE id = ${user.id}
      `;
    }

    // 5. Generate JWT
    const payload = {
      userId: user.id,
      role: user.role
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });

    // Log success
    await sql`
      INSERT INTO security_logs (event_type, user_id, ip_address, description)
      VALUES ('LOGIN_SUCCESS', ${user.id}, ${req.ip}, ${'Email: ' + email})
    `;

    // 4. Send token in HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true, // Forces HTTPS only transmission
      sameSite: 'strict', // Mitigates CSRF
      maxAge: 3600000 // 1 hour in ms
    });

    res.status(200).json(sanitizeOutput({
      message: 'Login successful',
      user: {
        id: user.id,
        name: (user.first_name + ' ' + (user.last_name || '')).trim(),
        email: user.email,
        role: user.role
      }
    }));
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.cookies.token;
    let email = 'UNKNOWN_USER';
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
        const users = await sql`SELECT email FROM users WHERE id = ${decoded.userId}`;
        if (users.length > 0) {
          email = users[0].email;
        }
      } catch (err) {
        // Token might be expired or invalid, proceed with logout anyway
      }
    }

    // Log the security event
    await sql`
      INSERT INTO security_logs (event_type, user_id, ip_address, description)
      VALUES ('LOGOUT', ${userId}, ${req.ip}, ${'Email: ' + email})
    `;

    res.clearCookie('token', {
      httpOnly: true,
      secure: true, // Forces HTTPS only transmission
      sameSite: 'strict' // Mitigates CSRF
    });

    res.status(200).json(sanitizeOutput({ message: 'Logout successful' }));
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error during logout' });
  }
};

module.exports = {
  register,
  login,
  logout
};
