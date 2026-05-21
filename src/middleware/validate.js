// Field length limits for all user-supplied text fields
const FIELD_LIMITS = {
  name: 200,
  username: 50,
  email: 255,
  phone: 50,
  role: 200,
  title: 500,
  department: 200,
  description: 5000,
  content: 10000,
  skills: 1000,
  technologies: 1000,
  address: 500,
  organizationNumber: 50,
  label: 100,
  subject: 500,
  body: 50000,
  password: 128,
  personalNumber: 20,
  workLocation: 200,
  signLocation: 200,
  signerName: 200,
  signerTitle: 200,
  category: 50
};

// Validate that no string field in the body exceeds its limit.
// Returns null if OK, or an error string if a field is too long.
function validateFieldLengths(body) {
  if (!body || typeof body !== 'object') return null;
  for (const [key, value] of Object.entries(body)) {
    if (typeof value !== 'string') continue;
    // Convert camelCase to find matching limit
    const limit = FIELD_LIMITS[key];
    if (limit && value.length > limit) {
      return `${key} must be ${limit} characters or less`;
    }
  }
  return null;
}

// Express middleware version — rejects with 400 if any field too long
function enforceFieldLimits(req, res, next) {
  const error = validateFieldLengths(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  next();
}

module.exports = { validateFieldLengths, enforceFieldLimits, FIELD_LIMITS };
