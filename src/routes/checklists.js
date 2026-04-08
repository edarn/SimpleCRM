const express = require('express');
const router = express.Router();
const data = require('../data');

// GET /api/checklists - List all checklists
router.get('/', (req, res) => {
  try {
    const userId = req.session.userId;
    const checklists = data.getAllChecklists(userId);
    res.json(checklists);
  } catch (err) {
    console.error('Error fetching checklists:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/checklists/:id - Get single checklist
router.get('/:id', (req, res) => {
  try {
    const userId = req.session.userId;
    const checklist = data.getChecklistById(req.params.id, userId);

    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }

    res.json(checklist);
  } catch (err) {
    console.error('Error fetching checklist:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/checklists - Create new checklist
router.post('/', (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, items } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Checklist name is required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one checklist item is required' });
    }

    const newChecklist = data.createChecklist({
      name: name.trim(),
      items: items.map(i => i.trim()).filter(i => i)
    }, userId);

    res.status(201).json(newChecklist);
  } catch (err) {
    console.error('Error creating checklist:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/checklists/:id - Update checklist
router.put('/:id', (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, items } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Checklist name is required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one checklist item is required' });
    }

    const result = data.updateChecklist(req.params.id, {
      name: name.trim(),
      items: items.map(i => i.trim()).filter(i => i)
    }, userId);

    if (result.error) {
      if (result.error === 'Checklist not found') {
        return res.status(404).json({ error: result.error });
      }
      return res.status(403).json({ error: result.error });
    }

    res.json(result);
  } catch (err) {
    console.error('Error updating checklist:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/checklists/:id - Delete checklist
router.delete('/:id', (req, res) => {
  try {
    const userId = req.session.userId;
    const result = data.deleteChecklist(req.params.id, userId);

    if (result.error) {
      if (result.error === 'Checklist not found') {
        return res.status(404).json({ error: result.error });
      }
      return res.status(403).json({ error: result.error });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting checklist:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
