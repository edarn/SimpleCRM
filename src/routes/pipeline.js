// Client screening pipeline routes (the "Apple" tab).
//
// Everything derived — outcome, progress, next action, sort order — is
// computed here and shipped with each row, so the browser never has to
// reimplement the rules and the two can never drift apart.

const express = require('express');
const data = require('../data');
const pipeline = require('../lib/pipeline');

const router = express.Router({ mergeParams: true });

// Attach the derived view of every row and put them in the order the UI wants:
// klara överst, pågående därefter (längst i processen högst), avslag sist.
function decorate(rows) {
  const decorated = rows.map((row) => ({
    ...row,
    ...pipeline.deriveRow(row, { name: row.candidateName, isSubcontractor: row.isSubcontractor }),
  }));
  return pipeline.sortRows(decorated);
}

// GET /api/pipeline/:client — the whole board in one call.
router.get('/:client', (req, res) => {
  try {
    const client = pipeline.normalizeClient(req.params.client);
    const rows = decorate(data.getPipeline(client, req.session.userId));
    res.json({
      client,
      clientLabel: pipeline.clientLabel(client),
      teams: pipeline.TEAMS,
      steps: pipeline.stepsFor(client, false),
      stepsSubcontractor: pipeline.stepsFor(client, true),
      // Shipped so the browser never has to keep its own copy of the wording.
      statusLabels: pipeline.STEP_KEYS.reduce((acc, key) => {
        acc[key] = {};
        for (const st of pipeline.STATUSES) {
          acc[key][st] = { no: pipeline.statusLabel(key, st, false), sub: pipeline.statusLabel(key, st, true) };
        }
        return acc;
      }, {}),
      rows,
      summary: pipeline.summarize(rows),
    });
  } catch (err) {
    console.error('Error loading pipeline:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/pipeline/:client/candidates/:candidateId — one row, for the
// Apple section on the candidate page. 204 when the candidate is not in the
// flow, so the caller can tell "not in it" from "cannot see it".
router.get('/:client/candidates/:candidateId', (req, res) => {
  try {
    const client = pipeline.normalizeClient(req.params.client);
    const row = data.getPipelineForCandidate(client, req.params.candidateId, req.session.userId);
    if (!row) return res.status(204).end();
    res.json(decorate([row])[0]);
  } catch (err) {
    console.error('Error loading pipeline row:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/pipeline/:client/candidate-ids — just the ids, so candidate lists
// can show the flow badge without pulling the whole board.
router.get('/:client/candidate-ids', (req, res) => {
  try {
    const client = pipeline.normalizeClient(req.params.client);
    res.json({ client, ids: data.getPipelineCandidateIds(client, req.session.userId) });
  } catch (err) {
    console.error('Error loading pipeline ids:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/pipeline/:client/candidates — add one or many. Adding someone
// already in the flow is a no-op rather than an error: the picker, the
// candidate page and the CV import all lean on that.
router.post('/:client/candidates', (req, res) => {
  try {
    const client = pipeline.normalizeClient(req.params.client);
    const body = req.body || {};
    const ids = Array.isArray(body.candidateIds)
      ? body.candidateIds
      : body.candidateId ? [body.candidateId] : [];
    if (!ids.length) return res.status(400).json({ error: 'No candidates given' });
    if (ids.length > 200) return res.status(400).json({ error: 'Too many candidates in one call' });

    const result = data.addToPipeline(client, ids, body.team, req.session.userId);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error adding to pipeline:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/pipeline/:client/rows/:id/steps/:stepKey — status, date, note.
router.put('/:client/rows/:id/steps/:stepKey', (req, res) => {
  try {
    const body = req.body || {};
    const result = data.updatePipelineStep(req.params.id, req.params.stepKey, {
      status: body.status,
      date: body.date,
      note: body.note,
    }, req.session.userId);
    if (result.error) {
      return res.status(result.error === 'Pipeline row not found' ? 404 : 400).json({ error: result.error });
    }
    res.json(decorate([result])[0]);
  } catch (err) {
    console.error('Error updating pipeline step:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/pipeline/:client/rows/:id — team, start date, feedback tick,
// ended assignment, free note.
router.patch('/:client/rows/:id', (req, res) => {
  try {
    const body = req.body || {};
    const patch = {};
    for (const key of ['team', 'startDate', 'note', 'endedAt', 'feedbackStatus', 'feedbackDate']) {
      if (body[key] !== undefined) patch[key] = body[key];
    }
    const result = data.updatePipelineRow(req.params.id, patch, req.session.userId);
    if (result.error) {
      return res.status(result.error === 'Pipeline row not found' ? 404 : 400).json({ error: result.error });
    }
    res.json(decorate([result])[0]);
  } catch (err) {
    console.error('Error updating pipeline row:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/pipeline/:client/rows/:id
router.delete('/:client/rows/:id', (req, res) => {
  try {
    const result = data.removeFromPipeline(req.params.id, req.session.userId);
    if (result.error) {
      return res.status(result.error === 'Pipeline row not found' ? 404 : 403).json({ error: result.error });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error removing from pipeline:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
