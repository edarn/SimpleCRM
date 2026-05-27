const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const data = require('../data');
const { logSecurity } = require('../lib/security-logger');

const SALT_ROUNDS = 10;

// POST /api/auth/register - Create new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'Username is required' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Input length limits
    if (username.length > 50) {
      return res.status(400).json({ error: 'Username must be 50 characters or less' });
    }
    if (email.length > 255) {
      return res.status(400).json({ error: 'Email must be 255 characters or less' });
    }
    if (password.length > 128) {
      return res.status(400).json({ error: 'Password must be 128 characters or less' });
    }

    // Check if username or email already exists — generic error to prevent enumeration
    const existingUsername = data.getUserByUsername(username.trim().toLowerCase());
    const existingEmail = data.getUserByEmail(email.trim().toLowerCase());
    if (existingUsername || existingEmail) {
      logSecurity('register_conflict', { username: username.trim().toLowerCase(), ip: req.ip });
      return res.status(400).json({ error: 'Username or email already in use' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user (may fail on UNIQUE constraint race)
    const user = data.createUser({
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      passwordHash
    });

    if (user.error) {
      logSecurity('register_conflict', { username: username.trim().toLowerCase(), ip: req.ip });
      return res.status(400).json({ error: user.error });
    }

    // Regenerate session to prevent session fixation
    const oldSession = req.session;
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
      }
      req.session.userId = user.id;
      req.session.username = user.username;

      const role = data.getUserRole(user.id);
      const team = data.getTeamByUserId(user.id);
      const invitations = data.getInvitationsByEmail(user.email);

      logSecurity('register_success', { userId: user.id, username: user.username, ip: req.ip });

      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        role,
        team,
        hasPendingInvitations: invitations.length > 0
      });
    });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login - Authenticate user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user by username (case-insensitive)
    const user = data.getUserByUsername(username.trim().toLowerCase());

    if (!user) {
      logSecurity('login_failed', { username: username.trim().toLowerCase(), reason: 'unknown_user', ip: req.ip });
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      logSecurity('login_failed', { username: username.trim().toLowerCase(), reason: 'wrong_password', ip: req.ip });
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Regenerate session to prevent session fixation
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
      }
      req.session.userId = user.id;
      req.session.username = user.username;

      const role = data.getUserRole(user.id);
      const team = data.getTeamByUserId(user.id);
      const invitations = data.getInvitationsByEmail(user.email);

      logSecurity('login_success', { userId: user.id, username: user.username, ip: req.ip });

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role,
        team,
        hasPendingInvitations: invitations.length > 0
      });
    });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout - Destroy session
router.post('/logout', (req, res) => {
  const userId = req.session?.userId;
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('connect.sid');
    if (userId) logSecurity('logout', { userId, ip: req.ip });
    res.json({ message: 'Logged out successfully' });
  });
});

// GET /api/auth/me - Get current user
router.get('/me', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = data.getUserById(req.session.userId);

  if (!user) {
    req.session.destroy(() => {});
    return res.status(401).json({ error: 'User not found' });
  }

  const role = data.getUserRole(user.id);
  const team = data.getTeamByUserId(user.id);
  const invitations = data.getInvitationsByEmail(user.email);

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role,
    team,
    hasPendingInvitations: invitations.length > 0
  });
});

// POST /api/auth/change-password - Change password for logged-in user
router.post('/change-password', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    if (newPassword.length > 128) {
      return res.status(400).json({ error: 'New password must be 128 characters or less' });
    }

    const user = data.getUserById(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      logSecurity('password_change_failed', { userId: user.id, reason: 'wrong_current', ip: req.ip });
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    data.updateUserPassword(user.id, newHash);

    logSecurity('password_changed', { userId: user.id, ip: req.ip });

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
