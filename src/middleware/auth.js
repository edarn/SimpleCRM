/**
 * Authentication middleware
 */

const db = require('../database');

// Require authentication for protected routes.
// Re-validates that user still exists and refreshes team_id on every request
// to prevent stale sessions after team membership changes.
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Re-check user exists and refresh team membership from DB
  const user = db.prepare('SELECT id, team_id FROM users WHERE id = ?').get(req.session.userId);
  if (!user) {
    req.session.destroy(() => {});
    return res.status(401).json({ error: 'User not found' });
  }

  // Store fresh team_id on the request for downstream use
  req.userTeamId = user.team_id;

  next();
}

// Optional: Get current user info (doesn't block if not authenticated)
function loadUser(req, res, next) {
  next();
}

module.exports = {
  requireAuth,
  loadUser
};
