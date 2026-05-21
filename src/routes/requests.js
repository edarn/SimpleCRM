const express = require('express');
const router = express.Router();
const data = require('../data');

// GET /api/requests - List all consultant requests
router.get('/', (req, res) => {
  try {
    const requests = data.getAllConsultantRequests(req.session.userId);
    res.json(requests);
  } catch (err) {
    console.error('Error fetching requests:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/requests/:id - Get single request with match details
router.get('/:id', (req, res) => {
  try {
    const request = data.getConsultantRequestById(req.params.id, req.session.userId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Enrich matched candidates with their full names
    if (request.matchedCandidates && request.matchedCandidates.length > 0) {
      request.matchedCandidates = request.matchedCandidates.map(match => {
        const candidate = data.getCandidateById(match.candidateId, req.session.userId);
        return {
          ...match,
          candidateName: candidate ? candidate.name : 'Unknown',
          candidateRole: candidate ? candidate.role : '',
          candidateSkills: candidate ? candidate.skills : ''
        };
      });
    }

    res.json(request);
  } catch (err) {
    console.error('Error fetching request:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/requests/:id - Update request status
router.put('/:id', (req, res) => {
  try {
    const updated = data.updateConsultantRequest(req.params.id, req.body, req.session.userId);
    if (!updated) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error('Error updating request:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/requests/:id - Delete a request
router.delete('/:id', (req, res) => {
  try {
    const result = data.deleteConsultantRequest(req.params.id, req.session.userId);
    if (result.error) {
      return res.status(result.error === 'Permission denied' ? 403 : 404).json({ error: result.error });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting request:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
