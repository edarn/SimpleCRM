const fs = require('fs');
const path = require('path');

const logDir = process.env.DATABASE_PATH
  ? path.dirname(process.env.DATABASE_PATH)
  : path.join(__dirname, '..', '..', 'data');

function logSecurity(event, details = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    ...details
  };

  const line = JSON.stringify(entry);

  // Always log to console
  console.log(`[SECURITY] ${line}`);

  // Also append to security log file
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(path.join(logDir, 'security.log'), line + '\n');
  } catch (err) {
    console.error('Failed to write security log:', err.message);
  }
}

module.exports = { logSecurity };
