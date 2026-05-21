const express = require('express');
const router = express.Router();
const data = require('../data');

// GET /api/user-emails - List authorized email addresses for current user
router.get('/', (req, res) => {
  try {
    const emails = data.getUserEmails(req.session.userId);
    res.json(emails);
  } catch (err) {
    console.error('Error fetching user emails:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/user-emails - Add a new authorized email
router.post('/', (req, res) => {
  try {
    const { email, label } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const result = data.addUserEmail(req.session.userId, email.trim(), label || '');
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.status(201).json(result);
  } catch (err) {
    console.error('Error adding user email:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/user-emails/:id - Remove an authorized email
router.delete('/:id', (req, res) => {
  try {
    const result = data.removeUserEmail(req.params.id, req.session.userId);
    if (result.error) {
      return res.status(404).json({ error: result.error });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error removing user email:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
