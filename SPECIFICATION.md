# Simple CRM System - Specification

## Overview

A lightweight, multi-user CRM system for managing companies, contacts, job candidates, and associated notes/tasks. Designed for personal or small team use with cloud deployment support.

## Core Requirements

### Functional Requirements

1. **Authentication**
   - User registration with username, email, password
   - User login with session management
   - Protected routes requiring authentication
   - Logout functionality

2. **Multi-Tenancy & Team Collaboration**
   - Each user has isolated data by default (solo mode)
   - Users can create a team by inviting others via email
   - Team members share all data with full view/edit access
   - Three user roles:
     - **Solo**: Using own isolated data, no team
     - **Owner**: Has a team, full control, can manage members
     - **Member**: Part of a team, can edit all data, can only delete own creations
   - All entities track who created them (created_by field)
   - Team invitation flow:
     - Owner invites by email
     - Invitation appears for users on login (banner + settings)
     - Invited user can accept (with merge/fresh start option) or decline
   - Team management (owner only):
     - View team members
     - Send/cancel invitations
     - Remove members (their data stays with team)
     - Transfer ownership to another member
   - Members can leave a team voluntarily (data stays with team)
   - Owner cannot delete account while team has members

3. **Contact Management**
   - Main view: list of all contacts across all companies
   - Contact fields: name, role, department, description, email, phone
   - Add new contacts linked to a company
   - Edit existing contacts
   - Archive contacts (soft delete - can be restored from Archive view)
   - Search/filter contacts by name, company, or any field
   - Sort contact list by name, company, or last note date
   - **Email-driven auto-fill (Add Contact form)**: When an email is entered,
     if the Name field is empty, it is populated from the local part (e.g.
     `firstname.lastname@...` → `Firstname Lastname`). Additionally, if no
     Company is selected yet, the Company dropdown is matched against the
     email domain (e.g. `@acme.com` → `Acme Corp`). Free-email providers
     (gmail, outlook, etc.) are ignored for company matching.

4. **Company Management**
   - Add new companies with name, organization number, address, and technologies
   - Edit existing companies
   - Archive companies (soft delete - archives all contacts too, can be restored)
   - View list of all companies
   - View all contacts for a specific company

5. **Candidate Management**
   - Separate tab for managing job candidates (independent from contacts)
   - Candidate fields: name, email, phone, role, skills
   - **Duplicate prevention (email)**: Creating a candidate whose email already
     belongs to another candidate in scope (the whole team for team users, the
     user's own candidates for solo users; case-insensitive) is blocked with a
     409 and a pointer to the existing profile — the Add form offers to open it.
     Editing a candidate's email to one another candidate already uses is
     likewise blocked. Candidates without an email are never deduped.
   - **Employment offers** (see section 11)
   - Resume file upload (PDF, DOC, DOCX, max 10MB)
   - Resume download functionality
   - Comments & ToDos: unified list on the candidate detail page (same pattern as Contacts and Companies), sortable by date or type, showing comments (rose) and linked ToDos (emerald) inline with inline checklist/complete controls
   - "Make this a ToDo" checkbox when adding a comment: if checked, creates a ToDo linked to the candidate (using comment text as title) instead of a comment; the ToDo appears in the candidate's Comments & ToDos list and in the global ToDos list
   - Full-text search across all candidate fields
     - Search returns matches in two groups: first, candidates that match the currently active owner + category filter (primary results); then, after a subtle separator row, additional matches from across all owners and all categories that don't fit the active filter (secondary results). When the active filter is already "All Candidates (Team) / All Categories" the secondary group is empty.
   - Sort candidates by name, role, or skills
   - **Owner filter (team users)**: On the candidates list, a dropdown lets a team user choose whose candidates to view — their own (default), any other team member's, or all team candidates. An "Added By" column is shown for team users. Solo users see their own candidates with no dropdown.
   - **Status column**: A two-line "Status" column on the candidates list shows the row's owner label on top ("My Candidates" if owned by the current user, otherwise the owner's username) and the category label below (e.g. "In Progress"). This makes it obvious which rows came from the active filter vs. the secondary "all candidates" search results.
   - **Transfer between team members**: On the candidate detail page, team users see a "Transfer" button that opens a modal with a dropdown of other team members. Transferring reassigns the candidate's owner (`created_by`) so it appears in the new owner's list. Only the current candidate owner or the team owner can transfer; the target must be a member of the same team.

6. **Notes & ToDos Management**
   - Notes and ToDos are displayed in a unified "Notes & ToDos" list
   - Each item shows a type label: "Note" (blue) or "ToDo" (green)
   - List sortable by date (default, newest first) or by type
   - When adding a new item, checkbox to "Make this a ToDo"
     - Unchecked: creates a regular note
     - Checked: creates a ToDo with the content as title
   - Notes: timestamped text entries linked to contacts
   - ToDos: actionable items with completion checkbox
   - Edit and delete functionality for both types

7. **ToDo Management**
   - ToDos view accessible from main navigation
   - Add ToDos optionally linked to a Company, Contact, or Candidate
   - **Default unlinked**: In the Add/Edit ToDo modal the "Link to" field
     defaults to **None (no link)** — a ToDo is not tied to any person,
     company, or candidate unless one is explicitly chosen. Unlinked ToDos are
     stored with `linked_type = 'general'` and shown as "(No link)" in the list.
   - **Quick add (inline)**: The top row of the ToDos list is an always-present
     empty input. Type a title there and press Enter to create an unlinked ToDo
     instantly, without opening the Add ToDo modal. Focus returns to the input
     so several ToDos can be added in a row.
   - ToDos can be added from:
     - The ToDos list view (Add ToDo modal or the inline quick-add row)
     - Contact detail view (via "Make this a ToDo" checkbox)
     - Company detail view
   - ToDo fields: title, description, dueDate, completed status, linked entity, optional checklist
   - Checkbox to mark ToDo as completed
   - Completed ToDos shown greyed out with strikethrough
   - View all ToDos in a central list with filters (All / Active / Completed)
   - **Checklists**: Reusable step-by-step checklist templates that can be attached to ToDos
     - When creating a ToDo, optionally select a checklist from a dropdown
     - Default is "No checklist" (ToDo behaves as before)
     - Selected checklist copies items into the ToDo (no ongoing link to template)
     - Each checklist item can be individually checked/unchecked
     - Progress shown as "Checklist (X/Y)" counter
     - Click any checklist item text to edit it inline (saves on blur/Enter)
     - Click + to add custom ad-hoc steps directly in the ToDo (inline input, no popup)
     - Click x to remove individual items (visible on hover)
     - Multi-column layout on larger screens (1/2/3 columns responsive)
     - Checklist management: create, edit, and delete checklist templates
     - Only the creator or team owner/admin can edit or delete a checklist
   - **Full Edit**: Edit modal supports all fields (title, linked entity, checklist, due date, description)
   - **Owner scoping**: The ToDos list defaults to the current user's own ToDos. Team users see an "Owner" dropdown to switch to another member or "All ToDos (Team)". On contact/company/candidate detail pages, all linked team ToDos are shown regardless of owner (so teammates see each other's work on shared entities). Checklist templates remain team-shared and usable by all members.

8. **Archive & Data Protection**
   - Companies and contacts are archived instead of permanently deleted
   - Archive view accessible from user menu to view and restore items
   - Restoring a company also restores all its associated contacts
   - Notes use soft delete (deleted_at timestamp) - hidden but recoverable in database
   - Permissions: owner can archive any, member only own creations

9. **Data Backup** (owner/solo users only; in Team Settings)
   - **Download Backup (ZIP, portable export, version 3)**: exports the team's
     (or solo user's) business data and re-homes it to the importing account on
     restore. Includes: companies, contacts, notes, todos, checklists,
     candidates, candidate comments, candidate files, **consultant requests +
     their candidate matchings**, **AI inbox emails**, **authorized sender
     addresses (user_emails)**, **employment offers** — plus all uploaded files
     (resumes, contract .docx, salary .pdf) inside the ZIP.
   - **Import** (JSON or ZIP) adds to existing data (doesn't replace) inside a
     single transaction. Cross-entity references are remapped to the new ids:
     `matched_candidates` candidate ids, offer/comment/file candidate ids,
     todo/note links, checklist links, and request→inbox links. Backup versions
     1, 2 and 3 are all accepted (older versions simply lack the newer sections).
   - **Download Full Database (disaster recovery)**: a one-click, consistent
     snapshot of the *entire* SQLite database (every table — users, teams,
     sessions, all of the above) via better-sqlite3's online backup. Restoring it
     is an ops step (replace the server's `data/crm.db` and restart). Contains all
     teams' data and password hashes, so it is restricted to owner/solo users.

10. **Data Storage**
   - SQLite database for structured data storage
   - File system storage for uploaded resumes
   - Support for persistent volumes on cloud platforms (Railway)

11. **Employment Offers (Candidates)**
   - On the candidate detail page, "Skapa erbjudande" opens a full-screen modal
     with a contract form and an embedded variable-salary calculator (port of
     Sigma Technology Group's "Rörligtmål" model).
   - **Contract form**: contract type (probationary / permanent), candidate name,
     personal number, start date, work location, department, sign location, sign
     date, signer name, signer title, salary year. Defaults are sensible
     (Karlskrona / 2402 / Thomas Hermansson / Vice President, Sigma Technology
     Software Solution); the company name and org. nr are baked into the .docx
     template and cannot be changed per-offer.
   - **Salary calculator**: fast lön (netto), arvode (kr/tim), %-sats. Editable
     monthly hours and vacation days. Live 12-month breakdown table (totalt
     antal timmar, arvode, lönekostnad, rörlig brutto/netto, semestertillägg,
     fast + rörlig). Summary cards for årslön fast/rörlig/total and snittlön/mån.
   - **Live preview** of the contract text with the live numbers folded in.
   - **Submit** generates two artefacts: the contract `.docx` (filled-in copy of
     `templates/contract-template.docx`) and a salary-attachment `.pdf` (the
     monthly table + summary cards). Both files are persisted under `uploads/`
     and tracked on a `candidate_offers` row that snapshots all inputs and the
     full computed `ModelResult` as JSON.
   - **Outlook integration**: after submit, the browser auto-downloads an `.eml`
     file with `X-Unsent: 1`, the candidate's email pre-filled, and both
     artefacts as base64 attachments. On Windows the file opens in Outlook as a
     draft message with the attachments already in place.
   - **Revisions**: each submit creates a *new* offer row (with new files), so
     prior versions stay around for traceability. The "Revidera" button on a
     listed offer pre-fills the modal with that offer's values to make it easy
     to iterate on numbers and produce a new revision.
   - **Permissions**: solo users can manage their own offers; team members can
     create offers for any candidate they can see and can delete their own;
     the team owner can delete any offer.

12. **AI Email Inbox**
   - Emails sent to the system are classified by Claude AI and trigger automatic
     CRM actions based on content. A single email can produce **multiple actions**
     (e.g. create a contact AND a consultant request AND a todo).
   - **Authorized sender addresses**: Each user registers their email addresses
     (work, personal, etc.) in Settings. Only emails from registered addresses
     are processed; unrecognized senders are silently discarded.
   - **Email classification**: Each incoming email is sent to Claude AI
     (claude-sonnet-4-6) which classifies it into one or more of:
     - `new_contact` — extract name, email, phone, title, company, department
       and create a contact (and company if needed). Duplicates detected by email
       match. The AI always creates contacts for external parties in conversations.
     - `consultant_request` — extract request details (title, description,
       required skills, role, client info, urgency) and create a consultant
       request entry. AI-powered candidate matching ranks all candidates with
       resumes against the request.
     - `todo` — extract a task summary and create a ToDo. If the sender matches
       a known contact, the ToDo is linked to that contact; otherwise linked as
       `general` type.
   - **Paste email UI**: A single textarea where raw email content is pasted
     (headers, body, conversation threads). The AI parses sender, subject, and
     content automatically. Will be replaced by a webhook endpoint once an
     inbound email provider is configured.
   - **Confidence threshold**: classifications with confidence < 70% are marked
     for manual review instead of auto-executing.
   - **Inbox detail**: Shows original email, extracted data, and all actions taken.
     Each action has a type badge, view link, and delete button (for unwanted
     contacts created from long conversation threads).
   - **New dependencies**: `@anthropic-ai/sdk`, `pdf-parse`, `mammoth`
   - **New env var**: `ANTHROPIC_API_KEY`

13. **Consultant Requests**
   - Requests tab lists all consultant requests with client, required skills,
     match count, status, and date.
   - **Search + keyboard navigation**: a search box filters requests by title,
     role, client, skills, description, or status. While a query is active the
     top match is highlighted; ↓/↑ move through the filtered rows and Enter opens
     the highlighted request — without leaving the search box (same pattern as
     the candidates list).
   - **Status lifecycle**: open → in_progress → filled/closed. Active requests
     (open/in_progress) sort first; closed/filled requests are grayed out.
   - **Editable skills**: Required skills displayed as interactive tags.
     Click = toggle priority (bold = critical, weighs more in scoring).
     Double-click = edit text inline. x = remove. + = add new.
   - **Editable description**: Free-text description field.
   - **Save & Re-match**: Saves skill/description changes and triggers fresh
     AI candidate matching in one click.
   - **Candidate matching scoring** (0–100):
     - Skills match: 50 points (all skills equal weight)
     - Priority bonus: 15 points (separate pool for **bold** skills only —
       marking a skill as priority never lowers candidates who have it)
     - Role/seniority: 20 points
     - Overall fit: 15 points
   - **Semantic matching**: version numbers (Angular 14+ = any Angular),
     technology ecosystems (S3/Lambda/DynamoDB = AWS experience),
     and related tools (Jenkins/GitHub Actions = CI/CD).
   - **Match results**: Each candidate shows score, strengths (green), and
     gaps (red) separately. Category badge shows availability status.
   - **Send via Outlook**: Select candidates with checkboxes, click "Send
     Selected via Outlook" to generate an .eml draft with HTML-formatted
     candidate presentations (strengths/gaps) and CV files attached. Sent
     candidates are marked (status "sent", blue), and a note
     ("Skickad till uppdrag: \<title\> (\<client\>)") is added to each sent
     candidate's history (Comments & ToDos list).
   - **Client-response status (sent candidates)**: Each sent candidate row in
     the match list has a status dropdown on the right to record the client's
     response: **Sent** (default on send, blue), **Declined** (faint red),
     **Interview** (amber), **Accepted** (green). Changing it recolors the row
     and persists on the request's `matched_candidates` entry. The status is
     preserved across re-matches (a fresh match updates the score but keeps the
     status). Only candidates that have been sent get the dropdown.
   - **Matching uses simple numeric IDs** (not UUIDs) for reliable AI
     round-trips. Results cached in DB and sorted by score descending.

14. **CV Bulk Import**
   - "Import CVs" button on the Candidates tab opens a modal to upload
     multiple PDF/DOCX files (up to 20).
   - User chooses category: new candidate (In Progress) or existing
     employee (Anställd utan uppdrag).
   - Claude AI extracts name, email, phone, role, and skills from each CV.
   - Each auto-created profile gets a comment "Automatiskt skapad via CV import".
   - Resume text is cached for AI matching. File is stored as candidate's resume.
   - **Email dedup / merge**: If an imported CV's email matches an existing
     candidate in scope, the import does **not** create a duplicate — it merges
     into the existing profile instead: attaches the new CV, refreshes the
     cached resume text, fills in only previously-empty fields (never overwrites
     existing data), adds a "CV uppdaterat via import" comment, and re-matches
     the profile against open requests. The progress UI shows these as "merged"
     and the summary reports `N created, M merged`.

15. **Candidate-to-Request Matching**
   - When viewing a candidate, cached matches against open consultant requests
     are shown instantly (no AI delay on page load).
   - Matches scoring >50% displayed as clickable cards with score, title,
     role, and reasoning. Click navigates to the request.
   - Cache invalidated when CV is uploaded (re-matches automatically in
     background). Manual "Refresh" button for on-demand re-matching.
   - File uploads auto-extract resume text for AI matching.
   - **Auto-match on add**: Creating a candidate (single Add Candidate form or
     bulk CV import) automatically runs matching against the open requests in
     the background — no manual step needed.
   - **Two-way sync into the request's matched list**: Whenever a candidate is
     matched/re-matched, the candidate is inserted into each matching request's
     `matched_candidates` list, **sorted by score**, so the request detail page
     shows the newly added candidate correctly placed among the previously
     matched candidates. Re-matching reconciles the request side: a candidate is
     upserted where it now matches and removed where it no longer does (a
     candidate already marked "Sent" is kept so the Sent history is preserved).
     The write is an atomic read-modify-write, so concurrent matches (e.g. a
     bulk import) can't clobber each other.
   - **Empty match result never wipes the list**: If a request-side (re)match
     returns zero candidates (almost always a transient AI/parse failure, not a
     real "nobody matches"), the existing `matched_candidates` list is preserved
     rather than cleared. This prevents a failed "Save & Re-match" from emptying
     a previously full list.
   - **Request-side matching merges, never blind-overwrites**: When a request is
     (re)matched against all candidates (AI email import, the "Save & Re-match"
     button), the fresh full ranking is **merged** into `matched_candidates`
     rather than replacing it. Entries for the candidates actually scored in this
     run are refreshed; entries for any candidate NOT in this run's snapshot
     (e.g. a profile added concurrently that already self-inserted) are
     preserved. This fixes a race where adding a candidate while an email-import
     was matching a request could wipe the new candidate from the request's list
     even though the candidate's own profile showed it as a top match.
   - **AI concurrency gate (`src/lib/ai-client.js`)**: Every Anthropic call in the
     app (email classification, candidate matching, CV parsing) runs server-side
     under one API key, so all users/tabs share one rate limit. All calls go
     through a single shared `createMessage()` that caps in-flight requests to
     `AI_MAX_CONCURRENCY` (default 4); excess calls queue FIFO and run as slots
     free. This prevents bursts of simultaneous email simulations from firing too
     many parallel calls at once (which trip 429/529 → slow SDK retries → an inbox
     email stuck at "processing"). The shared client also sets bounded SDK retries
     (`AI_MAX_RETRIES`, default 3; respects `retry-after`) and a per-attempt
     `timeout` (`AI_REQUEST_TIMEOUT_MS`, default 120000) so a dead connection
     releases its gate slot instead of blocking the queue. Tune the concurrency
     cap to your Anthropic tier.
   - **Startup recovery of orphaned work**: Background AI processing runs in
     fire-and-forget promises, so a server restart/crash loses any in-flight job
     while its DB row stays mid-flight forever. On boot (`src/database.js`) any
     `email_inbox` row left in `processing`/`pending` is flipped to `failed` (with
     a "interrupted by a server restart" message, so it can be reprocessed), and
     any candidate stuck in `match_status = 'pending'` is reset to `done`.
   - **Idempotent email reprocessing**: Reprocessing an email no longer creates a
     duplicate consultant request. `handleConsultantRequest` looks up the existing
     request by `email_inbox_id` (`getConsultantRequestByEmailInboxId`) and updates
     it in place — preserving the request id, its `matched_candidates`, and any
     "Sent" history — instead of inserting a new one.
   - **Candidate auto-match runs in the background, UI polls**: After a candidate
     is created/imported, request matching runs asynchronously (it includes an AI
     call). The candidate carries a `match_status` (`pending` → `done`); the
     `GET /api/candidates/:id/match-requests` response includes it, and the detail
     view shows a "Matching against open requests…" spinner and polls until `done`
     rather than showing an empty list that needs a manual Refresh. The candidate
     side and request side stay linked: a completed candidate match upserts the
     candidate into each open request's `matched_candidates` (so the same
     candidate↔request pair isn't scored twice).

16. **Resume Text Search**
   - Candidate search in the list view now matches against the full extracted
     CV text in addition to name, email, phone, role, and skills.

17. **Browser History Support**
   - Every navigation pushes to browser history with hash URLs
     (e.g. #contacts, #candidate-detail/uuid, #request-detail/uuid).
   - Back/forward buttons navigate between views correctly.
   - Deep-linking and bookmarking URLs works — reload restores the view.
   - Split-view contact clicks use replaceState to avoid history flooding.

### Non-Functional Requirements

- Multi-user support with authentication
- Deployable to cloud platforms (Railway, Render)
- Accessible via web browser
- Light, modern user interface
- Fast startup time
- Minimal dependencies

---

## Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Runtime | Node.js 18+ | Widely available, excellent ecosystem |
| Backend | Express.js 5 | Simple, minimal, well-documented |
| Database | SQLite (better-sqlite3) | Lightweight, no separate server needed |
| Sessions | express-session + connect-sqlite3 | Persistent sessions in SQLite |
| File Upload | Multer | Standard multipart/form-data handling |
| Authentication | bcryptjs | Secure password hashing |
| Frontend | HTML + Vanilla JS | No build step, easy to modify |
| Styling | Tailwind CSS (CDN) | Modern light theme, minimal effort |
| DOCX templating | unzipper + archiver | Read/write .docx as zip; placeholder substitution in `word/document.xml` |
| PDF generation | pdfkit | Generates the variable-salary attachment PDF |
| AI Classification | @anthropic-ai/sdk | Claude AI email classification & candidate matching |
| PDF text extraction | pdf-parse | Extract text from PDF resumes for AI matching |
| DOCX text extraction | mammoth | Extract text from DOCX resumes for AI matching |
| Security headers | helmet | CSP, HSTS, X-Frame-Options, nosniff |
| Rate limiting | express-rate-limit | Auth (20/15min) and API (120/min) rate limits |

---

## Data Model

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  team_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id)
)
```

#### Teams Table
```sql
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES users(id)
)
```

#### Team Members Table
```sql
CREATE TABLE team_members (
  team_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  joined_at TEXT NOT NULL,
  PRIMARY KEY (team_id, user_id),
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

#### Team Invitations Table
```sql
CREATE TABLE team_invitations (
  id TEXT PRIMARY KEY,
  team_id TEXT,
  inviter_id TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  created_at TEXT NOT NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (inviter_id) REFERENCES users(id)
)
```

#### Companies Table
```sql
CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  technologies TEXT DEFAULT '',
  organization_number TEXT DEFAULT '',
  address TEXT DEFAULT '',
  archived_at TEXT,
  team_id TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
)
```

#### Contacts Table
```sql
CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT '',
  department TEXT DEFAULT '',
  description TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  archived_at TEXT,
  team_id TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
)
```

#### Notes Table
```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL,
  content TEXT NOT NULL,
  deleted_at TEXT,
  team_id TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
)
```

#### ToDos Table
```sql
CREATE TABLE todos (
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
```

#### Checklists Table
```sql
CREATE TABLE checklists (
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
```

#### Candidates Table
```sql
CREATE TABLE candidates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  role TEXT DEFAULT '',
  skills TEXT DEFAULT '',
  resume_filename TEXT DEFAULT '',
  resume_original_name TEXT DEFAULT '',
  resume_text TEXT DEFAULT '',
  request_matches TEXT DEFAULT '[]',
  team_id TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
)
```

#### Candidate Offers Table
```sql
CREATE TABLE candidate_offers (
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
```

#### Candidate Comments Table
```sql
CREATE TABLE candidate_comments (
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
```

#### User Emails Table
```sql
CREATE TABLE user_emails (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  label TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

#### Email Inbox Table
```sql
CREATE TABLE email_inbox (
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
```

#### Consultant Requests Table
```sql
CREATE TABLE consultant_requests (
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
```

### Field Descriptions

#### User Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | TEXT (UUID) | Yes | Unique identifier |
| username | TEXT | Yes | Unique username for login |
| email | TEXT | Yes | Unique email address |
| password_hash | TEXT | Yes | Bcrypt hashed password |
| created_at | TEXT (ISO) | Yes | When user was created |
| updated_at | TEXT (ISO) | Yes | Last modification time |

#### Company Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | TEXT (UUID) | Yes | Unique identifier |
| name | TEXT | Yes | Company name |
| organization_number | TEXT | No | Organization number |
| address | TEXT | No | Company address |
| technologies | TEXT | No | Technical stacks used |
| created_at | TEXT (ISO) | Yes | When company was created |
| updated_at | TEXT (ISO) | Yes | Last modification time |

#### Contact Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | TEXT (UUID) | Yes | Unique identifier |
| company_id | TEXT | Yes | Foreign key to company |
| name | TEXT | Yes | Contact's full name |
| role | TEXT | No | Job title/role |
| department | TEXT | No | Department within company |
| description | TEXT | No | Additional information |
| email | TEXT | No | Email address |
| phone | TEXT | No | Phone number |
| created_at | TEXT (ISO) | Yes | When contact was created |
| updated_at | TEXT (ISO) | Yes | Last modification time |

#### Candidate Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | TEXT (UUID) | Yes | Unique identifier |
| name | TEXT | Yes | Candidate's full name |
| email | TEXT | No | Email address |
| phone | TEXT | No | Phone number |
| role | TEXT | No | Target role/position |
| skills | TEXT | No | Skills (comma-separated) |
| resume_filename | TEXT | No | Stored filename on disk |
| resume_original_name | TEXT | No | Original uploaded filename |
| created_at | TEXT (ISO) | Yes | When candidate was created |
| updated_at | TEXT (ISO) | Yes | Last modification time |

#### Candidate Comment Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | TEXT (UUID) | Yes | Unique identifier |
| candidate_id | TEXT | Yes | Foreign key to candidate |
| content | TEXT | Yes | Comment text |
| created_at | TEXT (ISO) | Yes | When comment was created |
| updated_at | TEXT (ISO) | Yes | Last modification time |

---

## User Interface

### Input Focus Behavior

Every view/modal that presents a text input auto-focuses the topmost relevant field on open so the user can start typing immediately (login username, register username, list search boxes, form name fields, invite email, modal title fields, etc.). Detail pages that are primarily for viewing (contact/company/candidate detail) do not auto-focus their secondary note/comment inputs.

### Theme

- Light, modern design with colorful accents
- Gradient navigation bar (blue to indigo)
- Color-coded sections: sky blue (contacts), violet (companies), rose/pink (candidates), emerald (todos), amber (archive)
- Clean white/gray backgrounds
- Good contrast for readability
- Subtle shadows and rounded corners

### Navigation

Main navigation tabs: **Contacts | Companies | Candidates | ToDos | Inbox | Requests**

### Pages/Views

1. **Login/Register**
   - Login form: username, password
   - Register form: username, email, password
   - Toggle between login and register

2. **Contact List (Default after login)**
   - Table: Contact Name, Company Name, Last Note Date
   - Sortable columns
   - Search box for filtering
   - "Add Contact" button
   - Click row to view details

3. **Contact Detail**
   - Contact information display
   - Company link
   - Edit/Delete buttons
   - Combined "Notes & ToDos" list
   - Add note/todo form with checkbox

4. **Company List**
   - Table: Company Name, Technologies, Contact Count
   - "Add Company" button
   - Click row to view details

5. **Company Detail**
   - Company information display
   - Edit/Delete buttons
   - List of contacts at company
   - "Add Contact" button
   - Company-level ToDos section

6. **Candidates List**
   - Table: Name, Role, Category, Skills, Added By (team only), Status (owner + category, two lines)
   - Sortable columns
   - Full-text search across all fields, with primary (filter-matching) and secondary (all-team / all-categories) result groups separated by a divider row
   - **Keyboard navigation from the search box**: while a query is active the top
     match is highlighted; ↓/↑ move the highlight through the filtered rows
     (scrolling into view) and Enter opens the highlighted candidate — without
     leaving the search input.
   - "Add Candidate" button
   - Click row to view details

7. **Candidate Detail**
   - Candidate information display
   - Resume download link (if uploaded)
   - Edit/Delete buttons
   - Comments section with add/edit/delete

8. **Candidate Form (Add/Edit)**
   - Fields: name, email, phone, role, skills
   - File input for resume upload
   - Shows current resume if editing

9. **ToDos List**
   - All ToDos across contacts and companies
   - Inline quick-add row at the top: type a title + Enter to create an
     unlinked ToDo without opening the modal
   - Filters: All / Active / Completed
   - Checkbox to toggle completion
   - "Add ToDo" button (link to entity is optional, defaults to None)
   - Click to navigate to linked entity (unlinked ToDos have no "View" link)

10. **Archive View**
    - Accessible from user dropdown menu
    - Lists archived companies with contact count and archive date
    - Lists archived contacts with company name and archive date
    - "Restore" button for each item
    - Restoring company also restores its contacts

11. **Team Settings / Data Backup**
    - Export data section (download JSON backup)
    - Import data section (upload JSON to add data)
    - Team management (invitations, members, ownership transfer)

---

## File Structure

```
VibeCodingProject/
├── server.js              # Main application entry point
├── package.json           # Dependencies and scripts
├── SPECIFICATION.md       # This file
├── data/
│   ├── crm.db             # SQLite database
│   └── sessions.db        # Session storage
├── uploads/               # Resume file storage
│   └── .gitkeep
├── public/
│   ├── index.html         # Main HTML file
│   └── app.js             # Frontend JavaScript
├── templates/
│   └── contract-template.docx # Employment contract docx with {{PLACEHOLDER}}s
├── src/
│   ├── database.js        # Database initialization
│   ├── data.js            # Data layer functions
│   ├── lib/
│   │   ├── salary-model.js       # Variable-salary model (port of Rörligtmål)
│   │   ├── contract-template.js  # Fills the contract docx template
│   │   ├── offer-pdf.js          # Renders the salary attachment PDF (pdfkit)
│   │   ├── eml-builder.js        # Builds Outlook-draft .eml with attachments
│   │   ├── ai-client.js        # Shared Anthropic client + concurrency gate (see below)
│   │   ├── email-classifier.js  # Claude AI email classification & extraction
│   │   ├── resume-parser.js     # PDF/DOCX text extraction for resumes
│   │   ├── candidate-matcher.js # AI-powered candidate-to-request matching
│   │   ├── cv-parser.js         # AI-powered CV field extraction for bulk import
│   │   └── security-logger.js   # Security event logging
│   ├── middleware/
│   │   ├── auth.js              # Authentication + team revalidation
│   │   ├── validate.js          # Input field length limits
│   │   └── file-validate.js     # Magic byte file validation
│   ├── middleware/
│   │   └── auth.js        # Authentication middleware
│   └── routes/
│       ├── auth.js        # Authentication routes
│       ├── companies.js   # Company API routes
│       ├── contacts.js    # Contact API routes
│       ├── notes.js       # Notes API routes
│       ├── search.js      # Search API routes
│       ├── todos.js       # ToDo API routes
│       ├── checklists.js  # Checklist API routes
│       ├── candidates.js  # Candidate API routes
│       ├── offers.js      # Employment offer routes
│       ├── team.js        # Team management routes
│       ├── invitations.js # Invitation routes
│       ├── archive.js     # Archive viewing routes
│       ├── backup.js      # Export/Import routes
│       ├── inbox.js       # AI Email Inbox routes
│       ├── requests.js    # Consultant request routes
│       └── user-emails.js # User email management routes
└── scripts/
    ├── build-contract-template.js # One-shot: build templates/contract-template.docx
    ├── migrate-json-to-sqlite.js  # Migration script
    └── seed-test-data.js          # Test data seeder
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user (returns role and team info) |
| POST | /api/auth/login | Login user (returns role and team info) |
| POST | /api/auth/logout | Logout user |
| GET | /api/auth/me | Get current user with role and team info |

### Team Management (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/team | Get current user's team info (or null if solo) |
| GET | /api/team/members | List team members (owner only) |
| POST | /api/team/invite | Send invitation by email (owner only) |
| DELETE | /api/team/invite/:id | Cancel pending invitation (owner only) |
| POST | /api/team/transfer | Transfer ownership to member (owner only) |
| POST | /api/team/leave | Leave team (member only) |
| DELETE | /api/team/members/:id | Remove member from team (owner only) |

### Invitations (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/invitations | Get pending invitations for current user |
| POST | /api/invitations/:id/accept | Accept invitation (with mergeData option) |
| POST | /api/invitations/:id/decline | Decline invitation |

### Companies (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/companies | List all companies (excludes archived) |
| GET | /api/companies/:id | Get single company with contacts |
| POST | /api/companies | Create new company |
| PUT | /api/companies/:id | Update company |
| DELETE | /api/companies/:id | Archive company and all contacts |
| POST | /api/companies/:id/restore | Restore archived company |

### Contacts (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/contacts | List all contacts (excludes archived) |
| GET | /api/contacts?sort=name\|company\|lastNote | Sort contacts |
| GET | /api/contacts/:id | Get single contact with notes |
| POST | /api/contacts | Create new contact |
| PUT | /api/contacts/:id | Update contact |
| DELETE | /api/contacts/:id | Archive contact |
| POST | /api/contacts/:id/restore | Restore archived contact |

### Archive (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/archive/companies | List archived companies |
| GET | /api/archive/contacts | List archived contacts |

### Backup (Protected - Owner/Solo only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/backup/export | Export business data + files as a ZIP (version 3) |
| GET | /api/backup/db-snapshot | Download a full SQLite database snapshot (disaster recovery) |
| POST | /api/backup/import | Import data from a JSON backup |
| POST | /api/backup/import-zip | Import data + files from a ZIP backup |

### Notes (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/contacts/:contactId/notes | Add note to contact |
| PUT | /api/contacts/:contactId/notes/:id | Update note |
| DELETE | /api/contacts/:contactId/notes/:id | Soft delete note (sets deleted_at) |

### ToDos (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/todos | List ToDos (default: current user's; `?createdBy=<userId>` for a specific member, `?createdBy=all` for all team) |
| GET | /api/todos?filter=active\|completed | Filter ToDos |
| GET | /api/todos/:id | Get single ToDo |
| POST | /api/todos | Create new ToDo |
| PUT | /api/todos/:id | Update ToDo |
| DELETE | /api/todos/:id | Delete ToDo |

### Checklists (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/checklists | List all checklists |
| GET | /api/checklists/:id | Get single checklist |
| POST | /api/checklists | Create new checklist |
| PUT | /api/checklists/:id | Update checklist |
| DELETE | /api/checklists/:id | Delete checklist |

### Candidates (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/candidates | List candidates (default: current user's; `?createdBy=<userId>` for a specific member, `?createdBy=all` for all team) |
| GET | /api/candidates/:id | Get candidate with comments |
| POST | /api/candidates | Create candidate (multipart/form-data) |
| PUT | /api/candidates/:id | Update candidate (multipart/form-data) |
| DELETE | /api/candidates/:id | Delete candidate |
| POST | /api/candidates/:id/transfer | Transfer candidate ownership to another team member (`{ newOwnerId }`) |
| GET | /api/candidates/:id/resume | Download resume file |
| POST | /api/candidates/:id/comments | Add comment |
| PUT | /api/candidates/:id/comments/:commentId | Update comment |
| DELETE | /api/candidates/:id/comments/:commentId | Delete comment |
| GET | /api/candidates/:id/match-requests | Get cached request matches for candidate |
| POST | /api/candidates/:id/match-requests | Run fresh AI matching against open requests |
| POST | /api/candidates/import-cvs | Bulk import candidates from CV files (multipart) |

### Candidate Offers (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/candidates/:candidateId/offers | List employment offers for the candidate (newest first) |
| POST | /api/candidates/:candidateId/offers | Create a new offer; renders contract.docx + attachment.pdf |
| GET | /api/candidates/:candidateId/offers/:offerId/contract | Download the filled contract .docx |
| GET | /api/candidates/:candidateId/offers/:offerId/attachment | Download the salary attachment .pdf |
| GET | /api/candidates/:candidateId/offers/:offerId/eml | Download an Outlook-draft .eml with both attachments |
| DELETE | /api/candidates/:candidateId/offers/:offerId | Delete the offer (creator / team owner only) |

### Search (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/search?q=term | Search companies and contacts |

### User Emails (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/user-emails | List current user's registered email addresses |
| POST | /api/user-emails | Add a new authorized email address |
| DELETE | /api/user-emails/:id | Remove an authorized email address |

### AI Email Inbox (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/inbox | List all inbox emails |
| GET | /api/inbox/:id | Get single inbox email with details |
| POST | /api/inbox/simulate | Simulate receiving an email (temp dev UI) |
| POST | /api/inbox/:id/reprocess | Reprocess a failed/review email |
| DELETE | /api/inbox/:id | Delete an inbox email |
| POST | /api/inbox/extract-resumes | Extract text from all candidate resumes |

### Consultant Requests (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/requests | List all consultant requests |
| GET | /api/requests/:id | Get single request with enriched match details |
| PUT | /api/requests/:id | Update request (status, skills, description) |
| POST | /api/requests/:id/rematch | Re-run AI candidate matching |
| POST | /api/requests/:id/send-eml | Generate Outlook draft with selected candidates |
| PUT | /api/requests/:id/candidates/:candidateId/status | Set a sent candidate's client-response status (sent/declined/interview/accepted) |
| DELETE | /api/requests/:id | Delete a request |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check (no auth required) |

---

## Deployment

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment (production/development) | development |
| DATABASE_PATH | Path to SQLite database | ./data/crm.db |
| SESSION_SECRET | Secret for session encryption | dev-secret-change-in-production |
| ANTHROPIC_API_KEY | API key for Claude AI (email classification & matching) | (required for AI Inbox) |

### Railway Deployment

1. Connect GitHub repository to Railway
2. Add a volume mounted at `/data`
3. Set environment variables:
   - `DATABASE_PATH=/data/crm.db`
   - `SESSION_SECRET=<random-secure-string>`
   - `NODE_ENV=production`
4. Deploy

Resume uploads are stored in the same volume directory (`/data/uploads`).

---

## Future Enhancements (Out of Scope)

- [ ] Tags/categories for companies and contacts
- [ ] Import/export to CSV
- [ ] Dark mode toggle
- [ ] Contact photo/avatar
- [ ] Activity timeline across all contacts
- [ ] Favorite/pin important contacts
- [ ] Company-level notes
- [ ] Candidate status tracking (pipeline stages)
- [x] ~~Email integration~~ (Implemented — AI Email Inbox with classification)
- [ ] Calendar integration for ToDos
- [x] ~~JSON data backup and restore~~ (Implemented)
- [x] ~~Archive/soft delete for companies and contacts~~ (Implemented)

---

## Decisions Made

- **Database:** SQLite for simplicity and portability
- **Authentication:** Session-based with bcrypt password hashing
- **File Storage:** Local filesystem with volume support for cloud
- **Candidates:** Separate entity from Contacts (not linked to companies)
- **Resume Upload:** PDF, DOC, DOCX up to 10MB
- **Navigation:** Four main tabs - Contacts, Companies, Candidates, ToDos
- **Search:** Client-side filtering for candidates, server-side for contacts/companies
