const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Database path from environment or default
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'crm.db');

// Ensure directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database connection
const db = new Database(DB_PATH, { timeout: 10000 }); // 10s busy timeout for write contention

// Enable WAL mode for concurrent reads during writes
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');

// Create tables
function initializeDatabase() {
  // Users table (with team_id for team membership)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      team_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Teams table
  db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (owner_id) REFERENCES users(id)
    )
  `);

  // Team members table
  db.exec(`
    CREATE TABLE IF NOT EXISTS team_members (
      team_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      joined_at TEXT NOT NULL,
      PRIMARY KEY (team_id, user_id),
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Team invitations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS team_invitations (
      id TEXT PRIMARY KEY,
      team_id TEXT,
      inviter_id TEXT NOT NULL,
      email TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
      created_at TEXT NOT NULL,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (inviter_id) REFERENCES users(id)
    )
  `);

  // Companies table (with team_id and created_by for multi-tenancy)
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      technologies TEXT DEFAULT '',
      organization_number TEXT DEFAULT '',
      address TEXT DEFAULT '',
      team_id TEXT,
      created_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Contacts table (with team_id and created_by for multi-tenancy)
  db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT '',
      department TEXT DEFAULT '',
      description TEXT DEFAULT '',
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      team_id TEXT,
      created_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Notes table (with team_id and created_by for multi-tenancy)
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      contact_id TEXT NOT NULL,
      content TEXT NOT NULL,
      team_id TEXT,
      created_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Todos table (with team_id and created_by for multi-tenancy)
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      due_date TEXT,
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      linked_type TEXT NOT NULL CHECK (linked_type IN ('contact', 'company')),
      linked_id TEXT NOT NULL,
      team_id TEXT,
      created_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Sessions table (for connect-sqlite3)
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      sid TEXT PRIMARY KEY,
      sess TEXT NOT NULL,
      expired INTEGER NOT NULL
    )
  `);

  // Candidates table (with team_id and created_by for multi-tenancy)
  db.exec(`
    CREATE TABLE IF NOT EXISTS candidates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      role TEXT DEFAULT '',
      skills TEXT DEFAULT '',
      resume_filename TEXT DEFAULT '',
      resume_original_name TEXT DEFAULT '',
      team_id TEXT,
      created_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Candidate comments table (with team_id and created_by for multi-tenancy)
  db.exec(`
    CREATE TABLE IF NOT EXISTS candidate_comments (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      content TEXT NOT NULL,
      team_id TEXT,
      created_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Create basic indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
    CREATE INDEX IF NOT EXISTS idx_notes_contact_id ON notes(contact_id);
    CREATE INDEX IF NOT EXISTS idx_todos_linked ON todos(linked_type, linked_id);
    CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
    CREATE INDEX IF NOT EXISTS idx_sessions_expired ON sessions(expired);
    CREATE INDEX IF NOT EXISTS idx_candidate_comments_candidate_id ON candidate_comments(candidate_id);
  `);

  // Run migration for existing data (must happen before creating indexes on new columns)
  migrateExistingData();

  // Create indexes for new multi-tenancy columns (after migration adds the columns)
  try {
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_companies_team_id ON companies(team_id);
      CREATE INDEX IF NOT EXISTS idx_companies_created_by ON companies(created_by);
      CREATE INDEX IF NOT EXISTS idx_contacts_team_id ON contacts(team_id);
      CREATE INDEX IF NOT EXISTS idx_contacts_created_by ON contacts(created_by);
      CREATE INDEX IF NOT EXISTS idx_notes_team_id ON notes(team_id);
      CREATE INDEX IF NOT EXISTS idx_notes_created_by ON notes(created_by);
      CREATE INDEX IF NOT EXISTS idx_todos_team_id ON todos(team_id);
      CREATE INDEX IF NOT EXISTS idx_todos_created_by ON todos(created_by);
      CREATE INDEX IF NOT EXISTS idx_candidates_team_id ON candidates(team_id);
      CREATE INDEX IF NOT EXISTS idx_candidates_created_by ON candidates(created_by);
      CREATE INDEX IF NOT EXISTS idx_candidate_comments_team_id ON candidate_comments(team_id);
      CREATE INDEX IF NOT EXISTS idx_candidate_comments_created_by ON candidate_comments(created_by);
      CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
      CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);
      CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);
      CREATE INDEX IF NOT EXISTS idx_candidate_files_candidate_id ON candidate_files(candidate_id);
      CREATE INDEX IF NOT EXISTS idx_candidates_archived_at ON candidates(archived_at);
      CREATE INDEX IF NOT EXISTS idx_checklists_team_id ON checklists(team_id);
      CREATE INDEX IF NOT EXISTS idx_checklists_created_by ON checklists(created_by);
      CREATE INDEX IF NOT EXISTS idx_todos_checklist_id ON todos(checklist_id);
    `);
  } catch (err) {
    console.log('Some indexes already exist or columns not yet migrated:', err.message);
  }

  console.log('Database initialized successfully');
}

// Helper to check if a column exists in a table
function columnExists(tableName, columnName) {
  const tableInfo = db.prepare(`PRAGMA table_info(${tableName})`).all();
  return tableInfo.some(col => col.name === columnName);
}

// Helper to safely add a column if it doesn't exist
function addColumnIfNotExists(tableName, columnName, columnDef) {
  if (!columnExists(tableName, columnName)) {
    try {
      db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`);
      console.log(`Added column ${columnName} to ${tableName}`);
      return true;
    } catch (err) {
      console.error(`Error adding column ${columnName} to ${tableName}:`, err.message);
      return false;
    }
  }
  return false;
}

// Migrate todos table to allow 'candidate' in linked_type CHECK constraint
function migrateTodosLinkedType() {
  // Check if the current CHECK constraint already allows 'candidate'
  const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='todos'").get();
  if (!tableInfo || !tableInfo.sql) return;
  if (tableInfo.sql.includes("'candidate'")) return; // Already migrated

  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS todos_new (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        due_date TEXT,
        completed INTEGER DEFAULT 0,
        completed_at TEXT,
        linked_type TEXT NOT NULL CHECK (linked_type IN ('contact', 'company', 'candidate')),
        linked_id TEXT NOT NULL,
        checklist_id TEXT,
        checklist_items_state TEXT DEFAULT '[]',
        team_id TEXT,
        created_by TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);
    db.exec(`INSERT INTO todos_new SELECT id, title, description, due_date, completed, completed_at, linked_type, linked_id, checklist_id, checklist_items_state, team_id, created_by, created_at, updated_at FROM todos`);
    db.exec(`DROP TABLE todos`);
    db.exec(`ALTER TABLE todos_new RENAME TO todos`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_todos_linked ON todos(linked_type, linked_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed)`);
    console.log('Migrated todos table to support candidate linked_type');
  } catch (err) {
    console.error('Error migrating todos linked_type:', err.message);
  }
}

// Migrate todos linked_type CHECK constraint to also allow 'general' (for email-generated unlinked todos)
function migrateTodosLinkedTypeGeneral() {
  const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='todos'").get();
  if (!tableInfo || !tableInfo.sql) return;
  if (tableInfo.sql.includes("'general'")) return; // Already migrated

  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS todos_new2 (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        due_date TEXT,
        completed INTEGER DEFAULT 0,
        completed_at TEXT,
        linked_type TEXT NOT NULL CHECK (linked_type IN ('contact', 'company', 'candidate', 'general')),
        linked_id TEXT NOT NULL,
        checklist_id TEXT,
        checklist_items_state TEXT DEFAULT '[]',
        team_id TEXT,
        created_by TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);
    db.exec(`INSERT INTO todos_new2 SELECT id, title, description, due_date, completed, completed_at, linked_type, linked_id, checklist_id, checklist_items_state, team_id, created_by, created_at, updated_at FROM todos`);
    db.exec(`DROP TABLE todos`);
    db.exec(`ALTER TABLE todos_new2 RENAME TO todos`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_todos_linked ON todos(linked_type, linked_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed)`);
    console.log('Migrated todos table to support general linked_type');
  } catch (err) {
    console.error('Error migrating todos linked_type for general:', err.message);
  }
}

// Migration function to add new columns to existing tables and assign existing data to the first user
function migrateExistingData() {
  // Add team_id column to users if it doesn't exist
  addColumnIfNotExists('users', 'team_id', 'TEXT');

  // Add team_id and created_by columns to all data tables
  const dataTables = ['companies', 'contacts', 'notes', 'todos', 'candidates', 'candidate_comments'];

  for (const table of dataTables) {
    addColumnIfNotExists(table, 'team_id', 'TEXT');
    addColumnIfNotExists(table, 'created_by', 'TEXT');
  }

  // Add archived_at column for companies and contacts (archive feature)
  addColumnIfNotExists('companies', 'archived_at', 'TEXT');
  addColumnIfNotExists('contacts', 'archived_at', 'TEXT');

  // Add deleted_at column for notes (soft delete feature)
  addColumnIfNotExists('notes', 'deleted_at', 'TEXT');

  // Add logo_filename column for teams (team logo feature)
  addColumnIfNotExists('teams', 'logo_filename', 'TEXT');

  // Add archive columns for candidates
  addColumnIfNotExists('candidates', 'archived_at', 'TEXT');
  addColumnIfNotExists('candidates', 'archive_category', 'TEXT');

  // Add category column for active candidates
  addColumnIfNotExists('candidates', 'category', "TEXT DEFAULT ''");

  // Create checklists table for todo checklist templates
  db.exec(`
    CREATE TABLE IF NOT EXISTS checklists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      items TEXT NOT NULL DEFAULT '[]',
      team_id TEXT,
      created_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Add checklist columns to todos
  addColumnIfNotExists('todos', 'checklist_id', 'TEXT');
  addColumnIfNotExists('todos', 'checklist_items_state', "TEXT DEFAULT '[]'");

  // Migrate todos linked_type CHECK constraint to allow 'candidate'
  migrateTodosLinkedType();

  // Migrate: unify archive categories into main category field
  // Move archive_category to category for archived candidates, then clear archived_at
  db.prepare(`
    UPDATE candidates SET category = archive_category, archived_at = NULL, archive_category = NULL
    WHERE archived_at IS NOT NULL AND archive_category IS NOT NULL AND archive_category != ''
  `).run();
  // Migrate old category values to new unified categories
  db.prepare(`UPDATE candidates SET category = 'in_progress' WHERE category IN ('new', 'interview', 'offer')`).run();
  db.prepare(`UPDATE candidates SET category = 'contact_later' WHERE category = 'on_hold'`).run();
  // Set default category for any candidates without one
  db.prepare(`
    UPDATE candidates SET category = 'in_progress'
    WHERE category IS NULL OR category = ''
  `).run();

  // Create candidate_files table for multi-file uploads
  db.exec(`
    CREATE TABLE IF NOT EXISTS candidate_files (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_size INTEGER DEFAULT 0,
      mime_type TEXT DEFAULT '',
      uploaded_at TEXT NOT NULL,
      uploaded_by TEXT,
      FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    )
  `);

  // Candidate employment offers (one candidate can have multiple revisions)
  db.exec(`
    CREATE TABLE IF NOT EXISTS candidate_offers (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      contract_type TEXT NOT NULL CHECK (contract_type IN ('probationary', 'permanent')),
      candidate_name TEXT NOT NULL,
      personal_number TEXT DEFAULT '',
      start_date TEXT DEFAULT '',
      work_location TEXT DEFAULT '',
      department TEXT DEFAULT '',
      sign_location TEXT DEFAULT '',
      sign_date TEXT DEFAULT '',
      signer_name TEXT DEFAULT '',
      signer_title TEXT DEFAULT '',
      fixed_salary INTEGER NOT NULL DEFAULT 0,
      expected_rate INTEGER NOT NULL DEFAULT 0,
      variable_percentage REAL NOT NULL DEFAULT 0,
      salary_year INTEGER NOT NULL DEFAULT 0,
      calculation_json TEXT NOT NULL DEFAULT '{}',
      contract_filename TEXT DEFAULT '',
      contract_original_name TEXT DEFAULT '',
      attachment_filename TEXT DEFAULT '',
      attachment_original_name TEXT DEFAULT '',
      email_subject TEXT DEFAULT '',
      email_body TEXT DEFAULT '',
      team_id TEXT,
      created_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);
  try {
    db.exec(`CREATE INDEX IF NOT EXISTS idx_candidate_offers_candidate_id ON candidate_offers(candidate_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_candidate_offers_team_id ON candidate_offers(team_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_candidate_offers_created_by ON candidate_offers(created_by)`);
  } catch (err) {
    console.log('candidate_offers index error:', err.message);
  }

  // Migrate existing resume data from candidates table to candidate_files table
  const candidatesWithResumes = db.prepare(`
    SELECT id, resume_filename, resume_original_name, created_by, created_at
    FROM candidates
    WHERE resume_filename IS NOT NULL AND resume_filename != ''
  `).all();

  const existingFiles = db.prepare('SELECT candidate_id FROM candidate_files').all();
  const existingCandidateIds = new Set(existingFiles.map(f => f.candidate_id));

  for (const c of candidatesWithResumes) {
    if (!existingCandidateIds.has(c.id)) {
      const fileId = require('crypto').randomUUID().replace(/-/g, '').slice(0, 20);
      const ext = require('path').extname(c.resume_original_name || '').toLowerCase();
      const mimeType = ext === '.pdf' ? 'application/pdf' : ext === '.doc' ? 'application/msword' : ext === '.docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : '';
      db.prepare(`
        INSERT INTO candidate_files (id, candidate_id, filename, original_name, file_size, mime_type, uploaded_at, uploaded_by)
        VALUES (?, ?, ?, ?, 0, ?, ?, ?)
      `).run(fileId, c.id, c.resume_filename, c.resume_original_name, mimeType, c.created_at, c.created_by);
    }
  }

  // User emails table (authorized sender addresses for AI inbox)
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_emails (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      email TEXT NOT NULL,
      label TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  try {
    db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_emails_email ON user_emails(email)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_user_emails_user_id ON user_emails(user_id)`);
  } catch (err) {
    console.log('user_emails index error:', err.message);
  }

  // Email inbox table (received/simulated emails and their processing status)
  db.exec(`
    CREATE TABLE IF NOT EXISTS email_inbox (
      id TEXT PRIMARY KEY,
      from_email TEXT NOT NULL,
      from_name TEXT DEFAULT '',
      subject TEXT DEFAULT '',
      body TEXT NOT NULL,
      classification TEXT DEFAULT 'pending',
      confidence REAL DEFAULT 0,
      extracted_data TEXT DEFAULT '{}',
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'review')),
      action_type TEXT,
      action_id TEXT,
      action_summary TEXT DEFAULT '',
      error_message TEXT DEFAULT '',
      user_id TEXT,
      team_id TEXT,
      created_at TEXT NOT NULL,
      processed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    )
  `);
  try {
    db.exec(`CREATE INDEX IF NOT EXISTS idx_email_inbox_user_id ON email_inbox(user_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_email_inbox_team_id ON email_inbox(team_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_email_inbox_status ON email_inbox(status)`);
  } catch (err) {
    console.log('email_inbox index error:', err.message);
  }

  // Consultant requests table (extracted from emails, with candidate matching)
  db.exec(`
    CREATE TABLE IF NOT EXISTS consultant_requests (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      required_skills TEXT DEFAULT '',
      role TEXT DEFAULT '',
      client_name TEXT DEFAULT '',
      client_email TEXT DEFAULT '',
      urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
      status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'filled', 'closed')),
      matched_candidates TEXT DEFAULT '[]',
      email_inbox_id TEXT,
      team_id TEXT,
      created_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (email_inbox_id) REFERENCES email_inbox(id),
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);
  try {
    db.exec(`CREATE INDEX IF NOT EXISTS idx_consultant_requests_team_id ON consultant_requests(team_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_consultant_requests_status ON consultant_requests(status)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_consultant_requests_created_by ON consultant_requests(created_by)`);
  } catch (err) {
    console.log('consultant_requests index error:', err.message);
  }

  // Add expires_at column to team_invitations for expiration
  addColumnIfNotExists('team_invitations', 'expires_at', 'TEXT');

  // Add request_matches column to candidates for caching AI match results
  addColumnIfNotExists('candidates', 'request_matches', "TEXT DEFAULT '[]'");

  // Track background candidate→request auto-match progress ('pending'/'done'/NULL)
  // so the UI can poll instead of showing an empty list before matching finishes.
  addColumnIfNotExists('candidates', 'match_status', 'TEXT DEFAULT NULL');

  // Add resume_text column to candidates for caching extracted text
  addColumnIfNotExists('candidates', 'resume_text', "TEXT DEFAULT ''");

  // Migrate todos linked_type to also allow 'general' for email-generated todos
  migrateTodosLinkedTypeGeneral();

  // Recover work orphaned by a server restart/crash. Background AI processing
  // runs in-memory (fire-and-forget promises); a restart loses those promises
  // while the DB row stays mid-flight forever. Flip stuck rows to a terminal
  // state on boot so they surface in the UI (and can be reprocessed) instead of
  // appearing to hang indefinitely.
  try {
    const recovered = db.prepare(`
      UPDATE email_inbox
      SET status = 'failed',
          error_message = 'Processing was interrupted by a server restart. Please reprocess this email.',
          processed_at = ?
      WHERE status IN ('processing', 'pending')
    `).run(new Date().toISOString());
    if (recovered.changes > 0) {
      console.log(`Recovered ${recovered.changes} inbox email(s) stuck in processing/pending after restart`);
    }
  } catch (err) {
    console.log('Inbox recovery error:', err.message);
  }
  try {
    // Candidates whose auto-match was interrupted: clear the 'pending' flag so
    // the UI stops waiting and shows whatever matches were already cached.
    const fixed = db.prepare("UPDATE candidates SET match_status = 'done' WHERE match_status = 'pending'").run();
    if (fixed.changes > 0) {
      console.log(`Cleared ${fixed.changes} candidate(s) stuck in 'pending' match status after restart`);
    }
  } catch (err) {
    console.log('Candidate match-status recovery error:', err.message);
  }

  // Find the first user to assign orphaned data to
  const firstUser = db.prepare('SELECT id FROM users ORDER BY created_at ASC LIMIT 1').get();

  if (firstUser) {
    const userId = firstUser.id;

    // Assign all data without created_by to the first user
    for (const table of dataTables) {
      const result = db.prepare(`UPDATE ${table} SET created_by = ? WHERE created_by IS NULL`).run(userId);
      if (result.changes > 0) {
        console.log(`Migrated ${result.changes} rows in ${table} to user ${userId}`);
      }
    }
  }
}

// Initialize on module load
initializeDatabase();

module.exports = db;
