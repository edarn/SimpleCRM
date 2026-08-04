const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const multer = require('multer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const { requireAuth } = require('./src/middleware/auth');
const { enforceFieldLimits } = require('./src/middleware/validate');

// Validate session secret in production
if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  console.error('FATAL: SESSION_SECRET environment variable is required in production');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists (use volume path on Railway if available)
const uploadsDir = process.env.DATABASE_PATH
  ? path.join(path.dirname(process.env.DATABASE_PATH), 'uploads')
  : path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  console.log('Uploads directory:', uploadsDir);
} catch (err) {
  console.error('Warning: Could not create uploads directory:', err.message);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'candidate-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Configure multer for logo uploads (images — no SVG to prevent XSS)
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'logo-' + uniqueSuffix + ext);
  }
});

const logoFilter = (req, file, cb) => {
  const allowedTypes = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (PNG, JPG, GIF, WebP) are allowed'), false);
  }
};

const logoUpload = multer({
  storage: logoStorage,
  fileFilter: logoFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit for logos
});

// Ensure data directory exists for sessions
const sessionDir = process.env.DATABASE_PATH ? path.dirname(process.env.DATABASE_PATH) : path.join(__dirname, 'data');
if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
}

// Session configuration
const sessionConfig = {
  store: new SQLiteStore({
    db: 'sessions.db',
    dir: sessionDir
  }),
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
};

// Trust proxy in production (needed for secure cookies behind load balancer)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security headers via helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.tailwindcss.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      scriptSrcAttr: ["'unsafe-inline'"],
    }
  },
  crossOriginEmbedderPolicy: false // needed for CDN resources
}));

// Rate limiting — strict on auth, general on API
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 minutes
  message: { error: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

// Keyed on the logged-in user, not the IP. A whole team commonly shares one
// office egress IP, so an IP-keyed budget makes colleagues throttle each other
// — and the inbox/candidate status pollers spend a real share of it. Falls back
// to IP for unauthenticated calls.
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 240, // per user per minute
  message: { error: 'Too many requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
  // ipKeyGenerator takes the IP *string* (it normalises IPv6 to a /56 subnet).
  // Passing the request object instead returns the object, which every
  // unauthenticated caller would then share as a single key.
  keyGenerator: (req) => req.session?.userId || ipKeyGenerator(req.ip),
  // Status polling is cheap and read-only; excluding it means a long-running
  // AI job can never exhaust the caller's budget for real work. Anchored so it
  // covers ONLY the two poll endpoints — notably not /candidates/:id/resume,
  // which serves files and must stay limited.
  skip: (req) => req.method === 'GET' && (
    /^\/inbox\/[^/]+$/.test(req.path) ||
    /^\/candidates\/[^/]+\/match-requests$/.test(req.path)
  )
});

// Limit request body size
app.use(express.json({ limit: '1mb' }));
app.use(session(sessionConfig));
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint (for Railway/Render)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes (no authentication required, but rate-limited)
app.use('/api/auth', authLimiter, require('./src/routes/auth'));

// Apply general rate limit and input validation to all API routes
app.use('/api/', apiLimiter);
app.use('/api/', enforceFieldLimits);

// Protected API routes (authentication required)
app.use('/api/companies', requireAuth, require('./src/routes/companies'));
app.use('/api/contacts', requireAuth, require('./src/routes/contacts'));
app.use('/api/contacts', requireAuth, require('./src/routes/notes'));
app.use('/api/search', requireAuth, require('./src/routes/search'));
app.use('/api/todos', requireAuth, require('./src/routes/todos'));
app.use('/api/checklists', requireAuth, require('./src/routes/checklists'));

// Candidates routes with file upload middleware
app.use('/api/candidates', requireAuth, require('./src/routes/candidates')(upload, uploadsDir));

// Candidate employment offer routes (mounted under candidates)
app.use('/api/candidates/:candidateId/offers', requireAuth, require('./src/routes/offers')(uploadsDir));

// Team management routes (with logo upload support)
app.use('/api/team', requireAuth, require('./src/routes/team')(logoUpload, uploadsDir));
app.use('/api/invitations', requireAuth, require('./src/routes/invitations'));

// Serve uploaded files with security headers (no MIME sniffing, no caching of sensitive files)
app.use('/uploads', (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Allow PDF viewer to render but block scripts and other active content
  res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:");
  res.setHeader('Cache-Control', 'private, no-cache');
  next();
}, express.static(uploadsDir));

// User emails (authorized sender addresses)
app.use('/api/user-emails', requireAuth, require('./src/routes/user-emails'));

// AI Email Inbox
app.use('/api/inbox', requireAuth, require('./src/routes/inbox')(uploadsDir));

// Consultant Requests
app.use('/api/requests', requireAuth, require('./src/routes/requests')(uploadsDir));

// Archive routes
app.use('/api/archive', requireAuth, require('./src/routes/archive'));

// Backup routes (export/import)
app.use('/api/backup', requireAuth, require('./src/routes/backup')(uploadsDir));

// Handle multer and other errors as JSON instead of HTML
app.use((err, req, res, next) => {
  if (err) {
    console.error('Express error:', err.message);
    const status = err.status || err.statusCode || 500;
    return res.status(status).json({ error: err.message || 'Internal server error' });
  }
  next();
});

// Serve index.html for SPA routes
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server (bind to 0.0.0.0 for container compatibility)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`CRM running on port ${PORT}`);
});

// Graceful shutdown handling for Railway/container environments
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
