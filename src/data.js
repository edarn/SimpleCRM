const crypto = require('crypto');
const db = require('./database');

// Generate UUID
function generateId() {
  return crypto.randomUUID();
}

// Get current ISO timestamp
function getTimestamp() {
  return new Date().toISOString();
}

// Convert snake_case row to camelCase object
function toCamelCase(row) {
  if (!row) return null;
  const result = {};
  for (const key of Object.keys(row)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = row[key];
  }
  return result;
}

// ============ Team & Access Control Functions ============

// Get user's effective team_id (their own team if owner, or the team they belong to)
function getUserTeamId(userId) {
  const user = db.prepare('SELECT team_id FROM users WHERE id = ?').get(userId);
  return user?.team_id || null;
}

// Get user's role: 'solo', 'owner', or 'member'
function getUserRole(userId) {
  const user = db.prepare('SELECT team_id FROM users WHERE id = ?').get(userId);
  if (!user || !user.team_id) return 'solo';

  const team = db.prepare('SELECT owner_id FROM teams WHERE id = ?').get(user.team_id);
  if (!team) return 'solo';

  return team.owner_id === userId ? 'owner' : 'member';
}

// Check if user is team owner
function isTeamOwner(userId) {
  return getUserRole(userId) === 'owner';
}

// Check if user is team member (not owner)
function isTeamMember(userId) {
  return getUserRole(userId) === 'member';
}

// Check if user can delete an entity (owner can delete any, member only their own)
function canDeleteEntity(userId, entity) {
  const role = getUserRole(userId);
  if (role === 'owner' || role === 'solo') return true;
  return entity.created_by === userId || entity.createdBy === userId;
}

// Get the team info for a user
function getTeamByUserId(userId) {
  const user = db.prepare('SELECT team_id FROM users WHERE id = ?').get(userId);
  if (!user || !user.team_id) return null;

  const team = db.prepare(`
    SELECT t.*, u.username as owner_username, u.email as owner_email
    FROM teams t
    JOIN users u ON u.id = t.owner_id
    WHERE t.id = ?
  `).get(user.team_id);

  if (!team) return null;

  return {
    id: team.id,
    ownerId: team.owner_id,
    ownerUsername: team.owner_username,
    ownerEmail: team.owner_email,
    logoFilename: team.logo_filename,
    createdAt: team.created_at
  };
}

// Update team logo (owner only)
function updateTeamLogo(teamId, logoFilename, userId) {
  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(teamId);
  if (!team) return { error: 'Team not found' };
  if (team.owner_id !== userId) return { error: 'Only team owner can update logo' };

  db.prepare('UPDATE teams SET logo_filename = ? WHERE id = ?').run(logoFilename, teamId);
  return { success: true, logoFilename };
}

// Get team logo filename for a user (works for any team member)
function getTeamLogo(userId) {
  const user = db.prepare('SELECT team_id FROM users WHERE id = ?').get(userId);
  if (!user || !user.team_id) return null;

  const team = db.prepare('SELECT logo_filename FROM teams WHERE id = ?').get(user.team_id);
  return team?.logo_filename || null;
}

// Create a new team (user becomes owner) — atomic transaction
const createTeamTx = db.transaction((ownerId) => {
  const id = generateId();
  const now = getTimestamp();

  db.prepare(`INSERT INTO teams (id, owner_id, created_at) VALUES (?, ?, ?)`).run(id, ownerId, now);
  db.prepare('UPDATE users SET team_id = ?, updated_at = ? WHERE id = ?').run(id, now, ownerId);
  db.prepare(`INSERT INTO team_members (team_id, user_id, joined_at) VALUES (?, ?, ?)`).run(id, ownerId, now);

  const tables = ['companies', 'contacts', 'notes', 'todos', 'candidates', 'candidate_comments'];
  for (const table of tables) {
    db.prepare(`UPDATE ${table} SET team_id = ? WHERE created_by = ? AND team_id IS NULL`).run(id, ownerId);
  }

  return { id, ownerId, createdAt: now };
});

function createTeam(ownerId) {
  return createTeamTx(ownerId);
}

// Get team members
function getTeamMembers(teamId) {
  const rows = db.prepare(`
    SELECT u.id, u.username, u.email, tm.joined_at,
           CASE WHEN t.owner_id = u.id THEN 1 ELSE 0 END as is_owner
    FROM team_members tm
    JOIN users u ON u.id = tm.user_id
    JOIN teams t ON t.id = tm.team_id
    WHERE tm.team_id = ?
    ORDER BY tm.joined_at ASC
  `).all(teamId);

  return rows.map(row => ({
    id: row.id,
    username: row.username,
    email: row.email,
    joinedAt: row.joined_at,
    isOwner: row.is_owner === 1
  }));
}

// Add a user to a team
function addTeamMember(teamId, userId) {
  const now = getTimestamp();

  // Add to team_members
  db.prepare(`
    INSERT OR IGNORE INTO team_members (team_id, user_id, joined_at)
    VALUES (?, ?, ?)
  `).run(teamId, userId, now);

  // Update user's team_id
  db.prepare('UPDATE users SET team_id = ?, updated_at = ? WHERE id = ?').run(teamId, now, userId);

  return true;
}

// Remove a user from a team (their data stays with the team) — atomic
const removeTeamMemberTx = db.transaction((teamId, userId) => {
  const now = getTimestamp();
  db.prepare('DELETE FROM team_members WHERE team_id = ? AND user_id = ?').run(teamId, userId);
  db.prepare('UPDATE users SET team_id = NULL, updated_at = ? WHERE id = ?').run(now, userId);
  return true;
});

function removeTeamMember(teamId, userId) {
  return removeTeamMemberTx(teamId, userId);
}

// Transfer ownership to another member — atomic with verification
const transferOwnershipTx = db.transaction((teamId, newOwnerId) => {
  // Verify new owner is still a member inside the transaction
  const member = db.prepare('SELECT * FROM team_members WHERE team_id = ? AND user_id = ?').get(teamId, newOwnerId);
  if (!member) return false;
  db.prepare('UPDATE teams SET owner_id = ? WHERE id = ?').run(newOwnerId, teamId);
  return true;
});

function transferOwnership(teamId, newOwnerId) {
  return transferOwnershipTx(teamId, newOwnerId);
}

// Merge user's solo data into a team — atomic
const mergeUserDataIntoTeamTx = db.transaction((userId, teamId) => {
  const tables = ['companies', 'contacts', 'notes', 'todos', 'candidates', 'candidate_comments'];
  for (const table of tables) {
    db.prepare(`UPDATE ${table} SET team_id = ? WHERE created_by = ? AND team_id IS NULL`).run(teamId, userId);
  }
});

function mergeUserDataIntoTeam(userId, teamId) {
  mergeUserDataIntoTeamTx(userId, teamId);
}

// Delete all solo data for a user (when they choose "start fresh" on joining) — atomic
const deleteUserSoloDataTx = db.transaction((userId) => {
  db.prepare('DELETE FROM candidate_comments WHERE created_by = ? AND team_id IS NULL').run(userId);
  db.prepare('DELETE FROM candidates WHERE created_by = ? AND team_id IS NULL').run(userId);
  db.prepare('DELETE FROM notes WHERE created_by = ? AND team_id IS NULL').run(userId);
  db.prepare('DELETE FROM todos WHERE created_by = ? AND team_id IS NULL').run(userId);
  db.prepare('DELETE FROM contacts WHERE created_by = ? AND team_id IS NULL').run(userId);
  db.prepare('DELETE FROM companies WHERE created_by = ? AND team_id IS NULL').run(userId);
});

function deleteUserSoloData(userId) {
  deleteUserSoloDataTx(userId);
}

// Check if user has any solo data
function userHasSoloData(userId) {
  const tables = ['companies', 'contacts', 'candidates', 'todos'];
  for (const table of tables) {
    const row = db.prepare(`SELECT COUNT(*) as count FROM ${table} WHERE created_by = ? AND team_id IS NULL`).get(userId);
    if (row.count > 0) return true;
  }
  return false;
}

// ============ Invitation Functions ============

// Create invitation — atomic transaction to prevent duplicate invitations
const createInvitationTx = db.transaction((inviterId, email) => {
  const id = generateId();
  const now = getTimestamp();

  let user = db.prepare('SELECT team_id FROM users WHERE id = ?').get(inviterId);
  let teamId = user?.team_id;

  if (!teamId) {
    const team = createTeamTx(inviterId);
    teamId = team.id;
  }

  // Check inside transaction to prevent duplicates
  const existing = db.prepare(`
    SELECT * FROM team_invitations WHERE team_id = ? AND email = ? AND status = 'pending'
  `).get(teamId, email);
  if (existing) {
    return { error: 'Invitation already sent to this email' };
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare(`
    INSERT INTO team_invitations (id, team_id, inviter_id, email, status, created_at, expires_at)
    VALUES (?, ?, ?, ?, 'pending', ?, ?)
  `).run(id, teamId, inviterId, email, now, expiresAt);

  return { id, teamId, inviterId, email, status: 'pending', createdAt: now, expiresAt };
});

function createInvitation(inviterId, email) {
  return createInvitationTx(inviterId, email);
}

function getInvitationById(invitationId) {
  const row = db.prepare(`
    SELECT ti.*, u.username as inviter_username
    FROM team_invitations ti
    JOIN users u ON u.id = ti.inviter_id
    WHERE ti.id = ?
  `).get(invitationId);

  if (!row) return null;

  return {
    id: row.id,
    teamId: row.team_id,
    inviterId: row.inviter_id,
    inviterUsername: row.inviter_username,
    email: row.email,
    status: row.status,
    createdAt: row.created_at
  };
}

function getInvitationsByEmail(email) {
  const now = getTimestamp();
  // Auto-expire old invitations
  db.prepare(`DELETE FROM team_invitations WHERE status = 'pending' AND expires_at IS NOT NULL AND expires_at < ?`).run(now);

  const rows = db.prepare(`
    SELECT ti.*, u.username as inviter_username
    FROM team_invitations ti
    JOIN users u ON u.id = ti.inviter_id
    WHERE ti.email = ? AND ti.status = 'pending'
    ORDER BY ti.created_at DESC
  `).all(email);

  return rows.map(row => ({
    id: row.id,
    teamId: row.team_id,
    inviterId: row.inviter_id,
    inviterUsername: row.inviter_username,
    email: row.email,
    status: row.status,
    createdAt: row.created_at
  }));
}

function getInvitationsByTeam(teamId) {
  const now = getTimestamp();
  db.prepare(`DELETE FROM team_invitations WHERE status = 'pending' AND expires_at IS NOT NULL AND expires_at < ?`).run(now);

  const rows = db.prepare(`
    SELECT ti.*, u.username as inviter_username
    FROM team_invitations ti
    JOIN users u ON u.id = ti.inviter_id
    WHERE ti.team_id = ? AND ti.status = 'pending'
    ORDER BY ti.created_at DESC
  `).all(teamId);

  return rows.map(row => ({
    id: row.id,
    teamId: row.team_id,
    inviterId: row.inviter_id,
    inviterUsername: row.inviter_username,
    email: row.email,
    status: row.status,
    createdAt: row.created_at
  }));
}

// Accept invitation — atomic transaction for all checks + mutations
const acceptInvitationTx = db.transaction((invitationId, userId, mergeData) => {
  const invitation = getInvitationById(invitationId);
  if (!invitation || invitation.status !== 'pending') {
    return { error: 'Invalid or expired invitation' };
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user || user.email !== invitation.email) {
    return { error: 'This invitation is not for your account' };
  }

  // Re-check team_id inside transaction to prevent race
  if (user.team_id) {
    return { error: 'You are already in a team. Leave your current team first.' };
  }

  if (mergeData) {
    mergeUserDataIntoTeamTx(userId, invitation.teamId);
  } else {
    deleteUserSoloDataTx(userId);
  }

  const now = getTimestamp();
  db.prepare(`INSERT OR IGNORE INTO team_members (team_id, user_id, joined_at) VALUES (?, ?, ?)`).run(invitation.teamId, userId, now);
  db.prepare('UPDATE users SET team_id = ?, updated_at = ? WHERE id = ?').run(invitation.teamId, now, userId);
  db.prepare("UPDATE team_invitations SET status = 'accepted' WHERE id = ?").run(invitationId);

  return { success: true, teamId: invitation.teamId };
});

function acceptInvitation(invitationId, userId, mergeData = false) {
  return acceptInvitationTx(invitationId, userId, mergeData);
}

function declineInvitation(invitationId, userId) {
  const invitation = getInvitationById(invitationId);
  if (!invitation || invitation.status !== 'pending') {
    return { error: 'Invalid or expired invitation' };
  }

  const user = db.prepare('SELECT email FROM users WHERE id = ?').get(userId);
  if (!user || user.email !== invitation.email) {
    return { error: 'This invitation is not for your account' };
  }

  db.prepare("UPDATE team_invitations SET status = 'declined' WHERE id = ?").run(invitationId);

  return { success: true };
}

function cancelInvitation(invitationId, userId) {
  const invitation = getInvitationById(invitationId);
  if (!invitation) {
    return { error: 'Invitation not found' };
  }

  // Verify user is the team owner
  const team = db.prepare('SELECT owner_id FROM teams WHERE id = ?').get(invitation.teamId);
  if (!team || team.owner_id !== userId) {
    return { error: 'Only team owner can cancel invitations' };
  }

  db.prepare("UPDATE team_invitations SET status = 'cancelled' WHERE id = ?").run(invitationId);

  return { success: true };
}

// Get username by user ID (for displaying created_by info)
function getUsernameById(userId) {
  if (!userId) return null;
  const user = db.prepare('SELECT username FROM users WHERE id = ?').get(userId);
  return user?.username || null;
}

function updateUserPassword(userId, newPasswordHash) {
  const now = getTimestamp();
  db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(newPasswordHash, now, userId);
}

// ============ Company Functions ============

function getAllCompanies(userId) {
  const teamId = getUserTeamId(userId);

  let rows;
  if (teamId) {
    // User is in a team - get team data (exclude archived)
    rows = db.prepare(`
      SELECT c.*, COUNT(ct.id) as contact_count, u.username as created_by_username
      FROM companies c
      LEFT JOIN contacts ct ON ct.company_id = c.id AND ct.archived_at IS NULL
      LEFT JOIN users u ON u.id = c.created_by
      WHERE c.team_id = ? AND c.archived_at IS NULL
      GROUP BY c.id
      ORDER BY c.name
    `).all(teamId);
  } else {
    // Solo user - get only their data (exclude archived)
    rows = db.prepare(`
      SELECT c.*, COUNT(ct.id) as contact_count, u.username as created_by_username
      FROM companies c
      LEFT JOIN contacts ct ON ct.company_id = c.id AND ct.archived_at IS NULL
      LEFT JOIN users u ON u.id = c.created_by
      WHERE c.created_by = ? AND c.team_id IS NULL AND c.archived_at IS NULL
      GROUP BY c.id
      ORDER BY c.name
    `).all(userId);
  }

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    technologies: row.technologies,
    organizationNumber: row.organization_number,
    address: row.address,
    contactCount: row.contact_count,
    createdBy: row.created_by,
    createdByUsername: row.created_by_username,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

function getCompanyById(companyId, userId, includeArchived = false) {
  const teamId = getUserTeamId(userId);
  const archivedFilter = includeArchived ? '' : 'AND c.archived_at IS NULL';

  let company;
  if (teamId) {
    company = db.prepare(`
      SELECT c.*, u.username as created_by_username
      FROM companies c
      LEFT JOIN users u ON u.id = c.created_by
      WHERE c.id = ? AND c.team_id = ? ${archivedFilter}
    `).get(companyId, teamId);
  } else {
    company = db.prepare(`
      SELECT c.*, u.username as created_by_username
      FROM companies c
      LEFT JOIN users u ON u.id = c.created_by
      WHERE c.id = ? AND c.created_by = ? AND c.team_id IS NULL ${archivedFilter}
    `).get(companyId, userId);
  }

  if (!company) return null;

  // Get non-archived contacts for this company
  const contacts = db.prepare(`
    SELECT c.*, u.username as created_by_username
    FROM contacts c
    LEFT JOIN users u ON u.id = c.created_by
    WHERE c.company_id = ? AND c.archived_at IS NULL
    ORDER BY c.name
  `).all(companyId);

  return {
    id: company.id,
    name: company.name,
    technologies: company.technologies,
    organizationNumber: company.organization_number,
    address: company.address,
    archivedAt: company.archived_at,
    createdBy: company.created_by,
    createdByUsername: company.created_by_username,
    createdAt: company.created_at,
    updatedAt: company.updated_at,
    contacts: contacts.map(c => ({
      id: c.id,
      name: c.name,
      role: c.role,
      department: c.department,
      description: c.description,
      email: c.email,
      phone: c.phone,
      createdBy: c.created_by,
      createdByUsername: c.created_by_username,
      createdAt: c.created_at,
      updatedAt: c.updated_at
    }))
  };
}

function createCompany({ name, technologies, organizationNumber, address }, userId) {
  const id = generateId();
  const now = getTimestamp();
  const teamId = getUserTeamId(userId);

  db.prepare(`
    INSERT INTO companies (id, name, technologies, organization_number, address, team_id, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, technologies || '', organizationNumber || '', address || '', teamId, userId, now, now);

  const username = getUsernameById(userId);

  return {
    id,
    name,
    technologies: technologies || '',
    organizationNumber: organizationNumber || '',
    address: address || '',
    createdBy: userId,
    createdByUsername: username,
    createdAt: now,
    updatedAt: now,
    contacts: []
  };
}

function updateCompany(companyId, { name, technologies, organizationNumber, address }, userId) {
  const now = getTimestamp();

  // Verify access
  const company = getCompanyById(companyId, userId);
  if (!company) return null;

  const existing = db.prepare('SELECT * FROM companies WHERE id = ?').get(companyId);

  db.prepare(`
    UPDATE companies
    SET name = ?, technologies = ?, organization_number = ?, address = ?, updated_at = ?
    WHERE id = ?
  `).run(
    name !== undefined ? name : existing.name,
    technologies !== undefined ? technologies : existing.technologies,
    organizationNumber !== undefined ? organizationNumber : existing.organization_number,
    address !== undefined ? address : existing.address,
    now,
    companyId
  );

  return getCompanyById(companyId, userId);
}

function archiveCompany(companyId, userId) {
  // Verify access and permission
  const company = getCompanyById(companyId, userId);
  if (!company) return { error: 'Company not found' };

  const role = getUserRole(userId);
  if (role === 'member' && company.createdBy !== userId) {
    return { error: 'Permission denied. You can only archive companies you created.' };
  }

  const now = getTimestamp();

  // Archive the company
  db.prepare('UPDATE companies SET archived_at = ?, updated_at = ? WHERE id = ?').run(now, now, companyId);

  // Also archive all contacts of this company
  db.prepare('UPDATE contacts SET archived_at = ?, updated_at = ? WHERE company_id = ? AND archived_at IS NULL').run(now, now, companyId);

  return { success: true };
}

function restoreCompany(companyId, userId) {
  // Verify access - use includeArchived=true to find archived companies
  const company = getCompanyById(companyId, userId, true);
  if (!company) return { error: 'Company not found' };
  if (!company.archivedAt) return { error: 'Company is not archived' };

  const role = getUserRole(userId);
  if (role === 'member' && company.createdBy !== userId) {
    return { error: 'Permission denied. You can only restore companies you created.' };
  }

  const now = getTimestamp();

  // Restore the company
  db.prepare('UPDATE companies SET archived_at = NULL, updated_at = ? WHERE id = ?').run(now, companyId);

  // Also restore all contacts that were archived at the same time or later
  db.prepare(`
    UPDATE contacts SET archived_at = NULL, updated_at = ?
    WHERE company_id = ? AND archived_at IS NOT NULL
  `).run(now, companyId);

  return { success: true };
}

function getArchivedCompanies(userId) {
  const teamId = getUserTeamId(userId);

  let rows;
  if (teamId) {
    rows = db.prepare(`
      SELECT c.*, COUNT(ct.id) as contact_count, u.username as created_by_username
      FROM companies c
      LEFT JOIN contacts ct ON ct.company_id = c.id
      LEFT JOIN users u ON u.id = c.created_by
      WHERE c.team_id = ? AND c.archived_at IS NOT NULL
      GROUP BY c.id
      ORDER BY c.archived_at DESC
    `).all(teamId);
  } else {
    rows = db.prepare(`
      SELECT c.*, COUNT(ct.id) as contact_count, u.username as created_by_username
      FROM companies c
      LEFT JOIN contacts ct ON ct.company_id = c.id
      LEFT JOIN users u ON u.id = c.created_by
      WHERE c.created_by = ? AND c.team_id IS NULL AND c.archived_at IS NOT NULL
      GROUP BY c.id
      ORDER BY c.archived_at DESC
    `).all(userId);
  }

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    technologies: row.technologies,
    organizationNumber: row.organization_number,
    address: row.address,
    contactCount: row.contact_count,
    archivedAt: row.archived_at,
    createdBy: row.created_by,
    createdByUsername: row.created_by_username,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

// Legacy function name - now archives instead of deletes
function deleteCompany(companyId, userId) {
  return archiveCompany(companyId, userId);
}

// ============ Contact Functions ============

function getAllContacts(userId, sort = 'name') {
  const teamId = getUserTeamId(userId);

  let orderBy = 'c.name';
  if (sort === 'company') {
    orderBy = 'co.name, c.name';
  } else if (sort === 'lastNote') {
    orderBy = 'last_note_date DESC NULLS LAST, c.name';
  }

  let rows;
  if (teamId) {
    rows = db.prepare(`
      SELECT c.*, co.name as company_name, u.username as created_by_username,
             (SELECT MAX(n.created_at) FROM notes n WHERE n.contact_id = c.id AND n.deleted_at IS NULL) as last_note_date
      FROM contacts c
      JOIN companies co ON co.id = c.company_id
      LEFT JOIN users u ON u.id = c.created_by
      WHERE c.team_id = ? AND c.archived_at IS NULL AND co.archived_at IS NULL
      ORDER BY ${orderBy}
    `).all(teamId);
  } else {
    rows = db.prepare(`
      SELECT c.*, co.name as company_name, u.username as created_by_username,
             (SELECT MAX(n.created_at) FROM notes n WHERE n.contact_id = c.id AND n.deleted_at IS NULL) as last_note_date
      FROM contacts c
      JOIN companies co ON co.id = c.company_id
      LEFT JOIN users u ON u.id = c.created_by
      WHERE c.created_by = ? AND c.team_id IS NULL AND c.archived_at IS NULL AND co.archived_at IS NULL
      ORDER BY ${orderBy}
    `).all(userId);
  }

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    role: row.role,
    department: row.department,
    description: row.description,
    email: row.email,
    phone: row.phone,
    companyId: row.company_id,
    companyName: row.company_name,
    lastNoteDate: row.last_note_date,
    createdBy: row.created_by,
    createdByUsername: row.created_by_username,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

function getContactById(contactId, userId, includeArchived = false) {
  const teamId = getUserTeamId(userId);
  const archivedFilter = includeArchived ? '' : 'AND c.archived_at IS NULL';

  let row;
  if (teamId) {
    row = db.prepare(`
      SELECT c.*, co.name as company_name, u.username as created_by_username,
             (SELECT MAX(n.created_at) FROM notes n WHERE n.contact_id = c.id AND n.deleted_at IS NULL) as last_note_date
      FROM contacts c
      JOIN companies co ON co.id = c.company_id
      LEFT JOIN users u ON u.id = c.created_by
      WHERE c.id = ? AND c.team_id = ? ${archivedFilter}
    `).get(contactId, teamId);
  } else {
    row = db.prepare(`
      SELECT c.*, co.name as company_name, u.username as created_by_username,
             (SELECT MAX(n.created_at) FROM notes n WHERE n.contact_id = c.id AND n.deleted_at IS NULL) as last_note_date
      FROM contacts c
      JOIN companies co ON co.id = c.company_id
      LEFT JOIN users u ON u.id = c.created_by
      WHERE c.id = ? AND c.created_by = ? AND c.team_id IS NULL ${archivedFilter}
    `).get(contactId, userId);
  }

  if (!row) return null;

  // Get only non-deleted notes
  const notes = db.prepare(`
    SELECT n.*, u.username as created_by_username
    FROM notes n
    LEFT JOIN users u ON u.id = n.created_by
    WHERE n.contact_id = ? AND n.deleted_at IS NULL
    ORDER BY n.created_at DESC
  `).all(contactId);

  return {
    id: row.id,
    name: row.name,
    role: row.role,
    department: row.department,
    description: row.description,
    email: row.email,
    phone: row.phone,
    companyId: row.company_id,
    companyName: row.company_name,
    lastNoteDate: row.last_note_date,
    archivedAt: row.archived_at,
    createdBy: row.created_by,
    createdByUsername: row.created_by_username,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    notes: notes.map(n => ({
      id: n.id,
      content: n.content,
      createdBy: n.created_by,
      createdByUsername: n.created_by_username,
      createdAt: n.created_at,
      updatedAt: n.updated_at
    }))
  };
}

function createContact({ companyId, name, role, department, description, email, phone }, userId) {
  const teamId = getUserTeamId(userId);

  // Verify company exists and user has access
  const company = getCompanyById(companyId, userId);
  if (!company) return null;

  const id = generateId();
  const now = getTimestamp();
  const username = getUsernameById(userId);

  db.prepare(`
    INSERT INTO contacts (id, company_id, name, role, department, description, email, phone, team_id, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, companyId, name, role || '', department || '', description || '', email || '', phone || '', teamId, userId, now, now);

  // Update company updated_at
  db.prepare('UPDATE companies SET updated_at = ? WHERE id = ?').run(now, companyId);

  return {
    id,
    name,
    role: role || '',
    department: department || '',
    description: description || '',
    email: email || '',
    phone: phone || '',
    companyId,
    companyName: company.name,
    lastNoteDate: null,
    createdBy: userId,
    createdByUsername: username,
    createdAt: now,
    updatedAt: now,
    notes: []
  };
}

function updateContact(contactId, { name, role, department, description, email, phone, companyId }, userId) {
  const now = getTimestamp();

  // Verify access
  const contact = getContactById(contactId, userId);
  if (!contact) return null;

  const existing = db.prepare('SELECT * FROM contacts WHERE id = ?').get(contactId);

  // If moving to a different company, verify access to it
  let targetCompanyId = existing.company_id;
  if (companyId && companyId !== existing.company_id) {
    const newCompany = getCompanyById(companyId, userId);
    if (!newCompany) return null;
    targetCompanyId = companyId;

    // Update old company's updated_at
    db.prepare('UPDATE companies SET updated_at = ? WHERE id = ?').run(now, existing.company_id);
    // Update new company's updated_at
    db.prepare('UPDATE companies SET updated_at = ? WHERE id = ?').run(now, companyId);
  }

  db.prepare(`
    UPDATE contacts
    SET name = ?, role = ?, department = ?, description = ?, email = ?, phone = ?, company_id = ?, updated_at = ?
    WHERE id = ?
  `).run(
    name !== undefined ? name : existing.name,
    role !== undefined ? role : existing.role,
    department !== undefined ? department : existing.department,
    description !== undefined ? description : existing.description,
    email !== undefined ? email : existing.email,
    phone !== undefined ? phone : existing.phone,
    targetCompanyId,
    now,
    contactId
  );

  return getContactById(contactId, userId);
}

function archiveContact(contactId, userId) {
  // Verify access
  const contact = getContactById(contactId, userId);
  if (!contact) return { error: 'Contact not found' };

  const role = getUserRole(userId);
  if (role === 'member' && contact.createdBy !== userId) {
    return { error: 'Permission denied. You can only archive contacts you created.' };
  }

  const now = getTimestamp();

  // Archive the contact
  db.prepare('UPDATE contacts SET archived_at = ?, updated_at = ? WHERE id = ?').run(now, now, contactId);
  db.prepare('UPDATE companies SET updated_at = ? WHERE id = ?').run(now, contact.companyId);

  return { success: true };
}

function restoreContact(contactId, userId) {
  // Verify access - use includeArchived=true to find archived contacts
  const contact = getContactById(contactId, userId, true);
  if (!contact) return { error: 'Contact not found' };
  if (!contact.archivedAt) return { error: 'Contact is not archived' };

  const role = getUserRole(userId);
  if (role === 'member' && contact.createdBy !== userId) {
    return { error: 'Permission denied. You can only restore contacts you created.' };
  }

  const now = getTimestamp();

  // Restore the contact
  db.prepare('UPDATE contacts SET archived_at = NULL, updated_at = ? WHERE id = ?').run(now, contactId);
  db.prepare('UPDATE companies SET updated_at = ? WHERE id = ?').run(now, contact.companyId);

  return { success: true };
}

function getArchivedContacts(userId) {
  const teamId = getUserTeamId(userId);

  let rows;
  if (teamId) {
    rows = db.prepare(`
      SELECT c.*, co.name as company_name, u.username as created_by_username
      FROM contacts c
      JOIN companies co ON co.id = c.company_id
      LEFT JOIN users u ON u.id = c.created_by
      WHERE c.team_id = ? AND c.archived_at IS NOT NULL
      ORDER BY c.archived_at DESC
    `).all(teamId);
  } else {
    rows = db.prepare(`
      SELECT c.*, co.name as company_name, u.username as created_by_username
      FROM contacts c
      JOIN companies co ON co.id = c.company_id
      LEFT JOIN users u ON u.id = c.created_by
      WHERE c.created_by = ? AND c.team_id IS NULL AND c.archived_at IS NOT NULL
      ORDER BY c.archived_at DESC
    `).all(userId);
  }

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    role: row.role,
    department: row.department,
    description: row.description,
    email: row.email,
    phone: row.phone,
    companyId: row.company_id,
    companyName: row.company_name,
    archivedAt: row.archived_at,
    createdBy: row.created_by,
    createdByUsername: row.created_by_username,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

// Legacy function name - now archives instead of deletes
function deleteContact(contactId, userId) {
  return archiveContact(contactId, userId);
}

// ============ Note Functions ============

function createNote(contactId, content, userId) {
  // Verify access to contact
  const contact = getContactById(contactId, userId);
  if (!contact) return null;

  const teamId = getUserTeamId(userId);
  const id = generateId();
  const now = getTimestamp();
  const username = getUsernameById(userId);

  db.prepare(`
    INSERT INTO notes (id, contact_id, content, team_id, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, contactId, content, teamId, userId, now, now);

  // Update contact and company timestamps
  db.prepare('UPDATE contacts SET updated_at = ? WHERE id = ?').run(now, contactId);
  db.prepare('UPDATE companies SET updated_at = ? WHERE id = ?').run(now, contact.companyId);

  return {
    id,
    content,
    createdBy: userId,
    createdByUsername: username,
    createdAt: now,
    updatedAt: now
  };
}

function updateNote(contactId, noteId, content, userId) {
  // Verify access to contact
  const contact = getContactById(contactId, userId);
  if (!contact) return null;

  const note = db.prepare('SELECT * FROM notes WHERE id = ? AND contact_id = ?').get(noteId, contactId);
  if (!note) return null;

  const now = getTimestamp();
  const username = getUsernameById(note.created_by);

  db.prepare('UPDATE notes SET content = ?, updated_at = ? WHERE id = ?').run(content, now, noteId);
  db.prepare('UPDATE contacts SET updated_at = ? WHERE id = ?').run(now, contactId);
  db.prepare('UPDATE companies SET updated_at = ? WHERE id = ?').run(now, contact.companyId);

  return {
    id: noteId,
    content,
    createdBy: note.created_by,
    createdByUsername: username,
    createdAt: note.created_at,
    updatedAt: now
  };
}

function deleteNote(contactId, noteId, userId) {
  // Verify access to contact
  const contact = getContactById(contactId, userId);
  if (!contact) return { error: 'Contact not found' };

  const note = db.prepare('SELECT * FROM notes WHERE id = ? AND contact_id = ? AND deleted_at IS NULL').get(noteId, contactId);
  if (!note) return { error: 'Note not found' };

  const role = getUserRole(userId);
  if (role === 'member' && note.created_by !== userId) {
    return { error: 'Permission denied. You can only delete notes you created.' };
  }

  const now = getTimestamp();

  // Soft delete - set deleted_at instead of actually deleting
  db.prepare('UPDATE notes SET deleted_at = ?, updated_at = ? WHERE id = ?').run(now, now, noteId);
  db.prepare('UPDATE contacts SET updated_at = ? WHERE id = ?').run(now, contactId);
  db.prepare('UPDATE companies SET updated_at = ? WHERE id = ?').run(now, contact.companyId);

  return { success: true };
}

// ============ Todo Functions ============

function getAllTodos(userId, filter = 'all', ownerFilter) {
  const teamId = getUserTeamId(userId);

  let whereClause;
  let params;
  if (teamId) {
    // Owner filter: undefined/null => current user (default), 'all' => whole team, else specific user id
    if (!ownerFilter) {
      whereClause = 'WHERE t.team_id = ? AND t.created_by = ?';
      params = [teamId, userId];
    } else if (ownerFilter === 'all') {
      whereClause = 'WHERE t.team_id = ?';
      params = [teamId];
    } else {
      whereClause = 'WHERE t.team_id = ? AND t.created_by = ?';
      params = [teamId, ownerFilter];
    }
  } else {
    whereClause = 'WHERE t.created_by = ? AND t.team_id IS NULL';
    params = [userId];
  }

  if (filter === 'active') {
    whereClause += ' AND t.completed = 0';
  } else if (filter === 'completed') {
    whereClause += ' AND t.completed = 1';
  }

  const rows = db.prepare(`
    SELECT t.*, u.username as created_by_username
    FROM todos t
    LEFT JOIN users u ON u.id = t.created_by
    ${whereClause}
    ORDER BY t.created_at DESC
  `).all(...params);

  return rows.map(row => {
    const entityInfo = getLinkedEntityName(row.linked_type, row.linked_id);
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      dueDate: row.due_date,
      completed: row.completed === 1,
      completedAt: row.completed_at,
      linkedType: row.linked_type,
      linkedId: row.linked_id,
      linkedName: entityInfo?.name || 'Unknown',
      linkedCompanyName: entityInfo?.companyName || null,
      checklistId: row.checklist_id,
      checklistItemsState: row.checklist_items_state ? JSON.parse(row.checklist_items_state) : [],
      createdBy: row.created_by,
      createdByUsername: row.created_by_username,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  });
}

function getTodoById(todoId, userId) {
  const teamId = getUserTeamId(userId);

  let row;
  if (teamId) {
    row = db.prepare(`
      SELECT t.*, u.username as created_by_username
      FROM todos t
      LEFT JOIN users u ON u.id = t.created_by
      WHERE t.id = ? AND t.team_id = ?
    `).get(todoId, teamId);
  } else {
    row = db.prepare(`
      SELECT t.*, u.username as created_by_username
      FROM todos t
      LEFT JOIN users u ON u.id = t.created_by
      WHERE t.id = ? AND t.created_by = ? AND t.team_id IS NULL
    `).get(todoId, userId);
  }

  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    completed: row.completed === 1,
    completedAt: row.completed_at,
    linkedType: row.linked_type,
    linkedId: row.linked_id,
    checklistId: row.checklist_id,
    checklistItemsState: row.checklist_items_state ? JSON.parse(row.checklist_items_state) : [],
    createdBy: row.created_by,
    createdByUsername: row.created_by_username,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function createTodo({ title, description, dueDate, linkedType, linkedId, checklistId }, userId) {
  const teamId = getUserTeamId(userId);
  const id = generateId();
  const now = getTimestamp();
  const username = getUsernameById(userId);

  // Build initial checklist items state from the template
  let checklistItemsState = '[]';
  if (checklistId) {
    const checklist = db.prepare('SELECT items FROM checklists WHERE id = ?').get(checklistId);
    if (checklist) {
      const items = JSON.parse(checklist.items);
      checklistItemsState = JSON.stringify(items.map(item => ({ text: item, checked: false })));
    }
  }

  db.prepare(`
    INSERT INTO todos (id, title, description, due_date, completed, completed_at, linked_type, linked_id, checklist_id, checklist_items_state, team_id, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, 0, NULL, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, title, description || '', dueDate || now, linkedType, linkedId, checklistId || null, checklistItemsState, teamId, userId, now, now);

  return {
    id,
    title,
    description: description || '',
    dueDate: dueDate || now,
    completed: false,
    completedAt: null,
    linkedType,
    linkedId,
    checklistId: checklistId || null,
    checklistItemsState: JSON.parse(checklistItemsState),
    createdBy: userId,
    createdByUsername: username,
    createdAt: now,
    updatedAt: now
  };
}

function updateTodo(todoId, { title, description, dueDate, completed, checklistItemsState, linkedType, linkedId, checklistId }, userId) {
  // Verify access
  const todo = getTodoById(todoId, userId);
  if (!todo) return null;

  const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(todoId);
  const now = getTimestamp();

  let completedAt = existing.completed_at;
  let newCompleted = existing.completed;

  if (completed !== undefined) {
    const wasCompleted = existing.completed === 1;
    newCompleted = completed ? 1 : 0;

    if (completed && !wasCompleted) {
      completedAt = now;
    } else if (!completed && wasCompleted) {
      completedAt = null;
    }
  }

  // If changing checklist template, rebuild items state from template
  let newChecklistItemsState = checklistItemsState !== undefined ? JSON.stringify(checklistItemsState) : existing.checklist_items_state;
  if (checklistId !== undefined && checklistId !== existing.checklist_id) {
    if (checklistId) {
      const checklist = db.prepare('SELECT items FROM checklists WHERE id = ?').get(checklistId);
      if (checklist) {
        const items = JSON.parse(checklist.items);
        newChecklistItemsState = JSON.stringify(items.map(item => ({ text: item, checked: false })));
      }
    } else {
      newChecklistItemsState = '[]';
    }
  }

  db.prepare(`
    UPDATE todos
    SET title = ?, description = ?, due_date = ?, completed = ?, completed_at = ?,
        linked_type = ?, linked_id = ?, checklist_id = ?, checklist_items_state = ?, updated_at = ?
    WHERE id = ?
  `).run(
    title !== undefined ? title : existing.title,
    description !== undefined ? description : existing.description,
    dueDate !== undefined ? dueDate : existing.due_date,
    newCompleted,
    completedAt,
    linkedType !== undefined ? linkedType : existing.linked_type,
    linkedId !== undefined ? linkedId : existing.linked_id,
    checklistId !== undefined ? (checklistId || null) : existing.checklist_id,
    newChecklistItemsState,
    now,
    todoId
  );

  return getTodoById(todoId, userId);
}

function deleteTodo(todoId, userId) {
  // Verify access
  const todo = getTodoById(todoId, userId);
  if (!todo) return { error: 'Todo not found' };

  const role = getUserRole(userId);
  if (role === 'member' && todo.createdBy !== userId) {
    return { error: 'Permission denied. You can only delete todos you created.' };
  }

  const result = db.prepare('DELETE FROM todos WHERE id = ?').run(todoId);
  return result.changes > 0 ? { success: true } : { error: 'Delete failed' };
}

// ============ Checklist Functions ============

function getAllChecklists(userId) {
  const teamId = getUserTeamId(userId);

  let rows;
  if (teamId) {
    rows = db.prepare(`
      SELECT c.*, u.username as created_by_username
      FROM checklists c
      LEFT JOIN users u ON u.id = c.created_by
      WHERE c.team_id = ?
      ORDER BY c.name ASC
    `).all(teamId);
  } else {
    rows = db.prepare(`
      SELECT c.*, u.username as created_by_username
      FROM checklists c
      LEFT JOIN users u ON u.id = c.created_by
      WHERE c.created_by = ? AND c.team_id IS NULL
      ORDER BY c.name ASC
    `).all(userId);
  }

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    items: JSON.parse(row.items),
    createdBy: row.created_by,
    createdByUsername: row.created_by_username,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

function getChecklistById(checklistId, userId) {
  const teamId = getUserTeamId(userId);

  let row;
  if (teamId) {
    row = db.prepare(`
      SELECT c.*, u.username as created_by_username
      FROM checklists c
      LEFT JOIN users u ON u.id = c.created_by
      WHERE c.id = ? AND c.team_id = ?
    `).get(checklistId, teamId);
  } else {
    row = db.prepare(`
      SELECT c.*, u.username as created_by_username
      FROM checklists c
      LEFT JOIN users u ON u.id = c.created_by
      WHERE c.id = ? AND c.created_by = ? AND c.team_id IS NULL
    `).get(checklistId, userId);
  }

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    items: JSON.parse(row.items),
    createdBy: row.created_by,
    createdByUsername: row.created_by_username,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function createChecklist({ name, items }, userId) {
  const teamId = getUserTeamId(userId);
  const id = generateId();
  const now = getTimestamp();
  const username = getUsernameById(userId);

  db.prepare(`
    INSERT INTO checklists (id, name, items, team_id, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, JSON.stringify(items), teamId, userId, now, now);

  return {
    id,
    name,
    items,
    createdBy: userId,
    createdByUsername: username,
    createdAt: now,
    updatedAt: now
  };
}

function updateChecklist(checklistId, { name, items }, userId) {
  const checklist = getChecklistById(checklistId, userId);
  if (!checklist) return { error: 'Checklist not found' };

  // Only creator or admin/owner can edit
  const role = getUserRole(userId);
  if (role === 'member' && checklist.createdBy !== userId) {
    return { error: 'Permission denied. Only the creator or administrator can edit this checklist.' };
  }

  const now = getTimestamp();
  db.prepare(`
    UPDATE checklists SET name = ?, items = ?, updated_at = ? WHERE id = ?
  `).run(name, JSON.stringify(items), now, checklistId);

  return getChecklistById(checklistId, userId);
}

function deleteChecklist(checklistId, userId) {
  const checklist = getChecklistById(checklistId, userId);
  if (!checklist) return { error: 'Checklist not found' };

  // Only creator or admin/owner can delete
  const role = getUserRole(userId);
  if (role === 'member' && checklist.createdBy !== userId) {
    return { error: 'Permission denied. Only the creator or administrator can delete this checklist.' };
  }

  const result = db.prepare('DELETE FROM checklists WHERE id = ?').run(checklistId);
  return result.changes > 0 ? { success: true } : { error: 'Delete failed' };
}

// Get linked entity name helper
function getLinkedEntityName(linkedType, linkedId) {
  if (linkedType === 'company') {
    const company = db.prepare('SELECT name FROM companies WHERE id = ?').get(linkedId);
    return company ? { name: company.name, companyName: null } : null;
  } else if (linkedType === 'contact') {
    const result = db.prepare(`
      SELECT c.name, co.name as company_name
      FROM contacts c
      JOIN companies co ON co.id = c.company_id
      WHERE c.id = ?
    `).get(linkedId);
    return result ? { name: result.name, companyName: result.company_name } : null;
  } else if (linkedType === 'candidate') {
    const candidate = db.prepare('SELECT name FROM candidates WHERE id = ?').get(linkedId);
    return candidate ? { name: candidate.name, companyName: null } : null;
  } else if (linkedType === 'general') {
    return { name: 'General', companyName: null };
  }
  return null;
}

// ============ Search Functions ============

function search(query, userId) {
  const teamId = getUserTeamId(userId);
  const searchTerm = `%${query}%`;

  let contacts, companies;

  if (teamId) {
    contacts = db.prepare(`
      SELECT c.*, co.name as company_name, u.username as created_by_username,
             (SELECT MAX(n.created_at) FROM notes n WHERE n.contact_id = c.id) as last_note_date
      FROM contacts c
      JOIN companies co ON co.id = c.company_id
      LEFT JOIN users u ON u.id = c.created_by
      WHERE c.team_id = ? AND (c.name LIKE ? OR co.name LIKE ? OR c.role LIKE ?
         OR c.department LIKE ? OR c.description LIKE ? OR c.email LIKE ?)
    `).all(teamId, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);

    companies = db.prepare(`
      SELECT c.*, COUNT(ct.id) as contact_count, u.username as created_by_username
      FROM companies c
      LEFT JOIN contacts ct ON ct.company_id = c.id
      LEFT JOIN users u ON u.id = c.created_by
      WHERE c.team_id = ? AND (c.name LIKE ? OR c.technologies LIKE ?)
      GROUP BY c.id
    `).all(teamId, searchTerm, searchTerm);
  } else {
    contacts = db.prepare(`
      SELECT c.*, co.name as company_name, u.username as created_by_username,
             (SELECT MAX(n.created_at) FROM notes n WHERE n.contact_id = c.id) as last_note_date
      FROM contacts c
      JOIN companies co ON co.id = c.company_id
      LEFT JOIN users u ON u.id = c.created_by
      WHERE c.created_by = ? AND c.team_id IS NULL AND (c.name LIKE ? OR co.name LIKE ? OR c.role LIKE ?
         OR c.department LIKE ? OR c.description LIKE ? OR c.email LIKE ?)
    `).all(userId, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);

    companies = db.prepare(`
      SELECT c.*, COUNT(ct.id) as contact_count, u.username as created_by_username
      FROM companies c
      LEFT JOIN contacts ct ON ct.company_id = c.id
      LEFT JOIN users u ON u.id = c.created_by
      WHERE c.created_by = ? AND c.team_id IS NULL AND (c.name LIKE ? OR c.technologies LIKE ?)
      GROUP BY c.id
    `).all(userId, searchTerm, searchTerm);
  }

  return {
    contacts: contacts.map(row => ({
      id: row.id,
      name: row.name,
      role: row.role,
      department: row.department,
      description: row.description,
      email: row.email,
      phone: row.phone,
      companyId: row.company_id,
      companyName: row.company_name,
      lastNoteDate: row.last_note_date,
      createdBy: row.created_by,
      createdByUsername: row.created_by_username,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })),
    companies: companies.map(row => ({
      id: row.id,
      name: row.name,
      technologies: row.technologies,
      contactCount: row.contact_count,
      createdBy: row.created_by,
      createdByUsername: row.created_by_username
    }))
  };
}

// ============ User Functions (for authentication) ============

function getUserByUsername(username) {
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!row) return null;

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function getUserByEmail(email) {
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!row) return null;

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function getUserById(userId) {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!row) return null;

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function createUser({ username, email, passwordHash }) {
  const id = generateId();
  const now = getTimestamp();

  try {
    db.prepare(`
      INSERT INTO users (id, username, email, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, username, email, passwordHash, now, now);
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return { error: 'Username or email already in use' };
    }
    throw err;
  }

  return { id, username, email, createdAt: now, updatedAt: now };
}

// ============ Candidate Functions ============

function getAllCandidates(userId, ownerFilter) {
  const teamId = getUserTeamId(userId);

  let rows;
  if (teamId) {
    // ownerFilter: undefined/null => current user, 'all' => all team, otherwise user id
    if (!ownerFilter) {
      rows = db.prepare(`
        SELECT c.*, u.username as created_by_username
        FROM candidates c
        LEFT JOIN users u ON u.id = c.created_by
        WHERE c.team_id = ? AND c.created_by = ?
        ORDER BY c.name
      `).all(teamId, userId);
    } else if (ownerFilter === 'all') {
      rows = db.prepare(`
        SELECT c.*, u.username as created_by_username
        FROM candidates c
        LEFT JOIN users u ON u.id = c.created_by
        WHERE c.team_id = ?
        ORDER BY c.name
      `).all(teamId);
    } else {
      rows = db.prepare(`
        SELECT c.*, u.username as created_by_username
        FROM candidates c
        LEFT JOIN users u ON u.id = c.created_by
        WHERE c.team_id = ? AND c.created_by = ?
        ORDER BY c.name
      `).all(teamId, ownerFilter);
    }
  } else {
    rows = db.prepare(`
      SELECT c.*, u.username as created_by_username
      FROM candidates c
      LEFT JOIN users u ON u.id = c.created_by
      WHERE c.created_by = ? AND c.team_id IS NULL
      ORDER BY c.name
    `).all(userId);
  }

  return rows.map(row => formatCandidateRow(row));
}

function formatCandidateRow(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    skills: row.skills,
    category: row.category || '',
    resumeFilename: row.resume_filename,
    resumeOriginalName: row.resume_original_name,
    resumeText: row.resume_text || '',
    archivedAt: row.archived_at,
    archiveCategory: row.archive_category,
    createdBy: row.created_by,
    createdByUsername: row.created_by_username,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function getCandidateById(candidateId, userId) {
  const teamId = getUserTeamId(userId);

  let candidate;
  if (teamId) {
    candidate = db.prepare(`
      SELECT c.*, u.username as created_by_username
      FROM candidates c
      LEFT JOIN users u ON u.id = c.created_by
      WHERE c.id = ? AND c.team_id = ?
    `).get(candidateId, teamId);
  } else {
    candidate = db.prepare(`
      SELECT c.*, u.username as created_by_username
      FROM candidates c
      LEFT JOIN users u ON u.id = c.created_by
      WHERE c.id = ? AND c.created_by = ? AND c.team_id IS NULL
    `).get(candidateId, userId);
  }

  if (!candidate) return null;

  const comments = db.prepare(`
    SELECT cc.*, u.username as created_by_username
    FROM candidate_comments cc
    LEFT JOIN users u ON u.id = cc.created_by
    WHERE cc.candidate_id = ?
    ORDER BY cc.created_at DESC
  `).all(candidateId);

  const files = db.prepare(`
    SELECT * FROM candidate_files
    WHERE candidate_id = ?
    ORDER BY uploaded_at ASC
  `).all(candidateId);

  return {
    ...formatCandidateRow(candidate),
    files: files.map(f => ({
      id: f.id,
      filename: f.filename,
      originalName: f.original_name,
      fileSize: f.file_size,
      mimeType: f.mime_type,
      uploadedAt: f.uploaded_at,
      uploadedBy: f.uploaded_by
    })),
    comments: comments.map(c => ({
      id: c.id,
      content: c.content,
      createdBy: c.created_by,
      createdByUsername: c.created_by_username,
      createdAt: c.created_at,
      updatedAt: c.updated_at
    }))
  };
}

// Find an existing (non-archived) candidate with the same email, within the
// caller's scope (whole team for team users, own candidates for solo users).
// Used to avoid creating duplicate profiles for the same person. Returns the
// formatted candidate or null. Empty email => null (can't dedup without one).
// excludeId lets the edit flow ignore the candidate being edited.
// Canonical form of an email for both storage and lookup.
//
// Why this is not just trim().toLowerCase(): CV text comes out of pdf-parse,
// which routinely carries non-breaking spaces and zero-width characters through
// from the PDF. An address stored as "anna@x.se " looked identical in the
// UI but never matched the dedup lookup, so the same person was imported again
// as a new profile. Storage and lookup MUST use this same function or the
// mismatch comes straight back.
function normalizeEmail(email) {
  if (!email) return '';
  return String(email)
    .replace(/[​-‍﻿]/g, '')   // zero-width space/joiner/BOM
    .replace(/\s/g, '')                  // ALL whitespace, nbsp included: an
                                         // address cannot contain any, and PDF
                                         // extraction sprinkles it inside as
                                         // well as at the ends
    .toLowerCase();
}

// Canonical form of a name, used only for the dedup fallback when a CV has no
// email at all. Collapses whitespace and case; deliberately does NOT strip
// diacritics, so "Jonsson" and "Jönsson" stay different people.
function normalizeName(name) {
  if (!name) return '';
  return String(name)
    .replace(/[​-‍﻿]/g, '')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function findCandidateByEmail(email, userId, excludeId = null) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  const teamId = getUserTeamId(userId);
  let row;
  if (teamId) {
    row = db.prepare(`
      SELECT * FROM candidates
      WHERE team_id = ? AND archived_at IS NULL AND LOWER(TRIM(email)) = ? AND id != ?
      LIMIT 1
    `).get(teamId, normalized, excludeId || '');
  } else {
    row = db.prepare(`
      SELECT * FROM candidates
      WHERE created_by = ? AND team_id IS NULL AND archived_at IS NULL AND LOWER(TRIM(email)) = ? AND id != ?
      LIMIT 1
    `).get(userId, normalized, excludeId || '');
  }
  return row ? formatCandidateRow(row) : null;
}

// All candidates in scope whose name matches, ignoring case and whitespace.
// Returns an ARRAY on purpose: the import only treats a name match as a
// duplicate when it is unambiguous, and two people really can share a name.
function findCandidatesByName(name, userId, excludeId = null) {
  const normalized = normalizeName(name);
  if (!normalized) return [];
  const teamId = getUserTeamId(userId);
  const scope = teamId ? 'team_id = ?' : 'created_by = ? AND team_id IS NULL';

  // Compared in JS, not SQL. SQLite's TRIM only strips the ends, so it cannot
  // collapse the internal double spaces or the zero-width characters that PDF
  // extraction leaves in a name — and those are exactly what made two records
  // for the same person look different. resume_text is excluded from the SELECT
  // on purpose: this runs once per CV during an import, and pulling tens of KB
  // of cached text per candidate per file would be pure churn.
  const rows = db.prepare(`
    SELECT id, name, email, phone, role, skills, category, resume_filename, resume_original_name,
           archived_at, created_by, created_at, updated_at
    FROM candidates
    WHERE ${scope} AND archived_at IS NULL AND id != ?
    ORDER BY created_at ASC
  `).all(teamId || userId, excludeId || '');

  return rows
    .filter(r => normalizeName(r.name) === normalized)
    .map(formatCandidateRow);
}

// ============ Duplicate detection & merging ============

// Group candidates that look like the same person.
//
// Grouping is by normalized name, then each group is classified by how much the
// emails agree. That distinction is the whole point: a group where the only
// addresses present are identical (or absent) is safe to merge automatically,
// whereas two different real addresses means we are probably looking at two
// different people and a human has to decide.
function findDuplicateCandidateGroups(userId) {
  const teamId = getUserTeamId(userId);
  const scope = teamId ? 'c.team_id = ?' : 'c.created_by = ? AND c.team_id IS NULL';
  const rows = db.prepare(`
    SELECT c.*, u.username AS created_by_username,
           (SELECT COUNT(*) FROM candidate_files cf WHERE cf.candidate_id = c.id) AS file_count,
           (SELECT COUNT(*) FROM candidate_comments cc WHERE cc.candidate_id = c.id) AS comment_count
    FROM candidates c
    LEFT JOIN users u ON u.id = c.created_by
    WHERE ${scope} AND c.archived_at IS NULL
    ORDER BY c.created_at ASC
  `).all(teamId || userId);

  const byName = new Map();
  for (const r of rows) {
    const key = normalizeName(r.name);
    if (!key) continue;
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key).push(r);
  }

  const groups = [];
  for (const [key, members] of byName) {
    if (members.length < 2) continue;
    const emails = [...new Set(members.map(m => normalizeEmail(m.email)).filter(Boolean))];
    groups.push({
      key,
      name: members[0].name,
      // conflicting = more than one distinct real address in the group.
      conflictingEmails: emails.length > 1,
      emails,
      // Oldest first — the survivor default, so the original record and its
      // creation date are what remain.
      members: members.map(m => ({
        id: m.id,
        name: m.name,
        email: m.email || '',
        phone: m.phone || '',
        role: m.role || '',
        skills: m.skills || '',
        category: m.category || '',
        createdBy: m.created_by,
        createdByUsername: m.created_by_username || '',
        createdAt: m.created_at,
        hasResumeText: !!(m.resume_text && m.resume_text.length > 0),
        fileCount: m.file_count,
        commentCount: m.comment_count
      }))
    });
  }
  groups.sort((a, b) => b.members.length - a.members.length || a.name.localeCompare(b.name));
  return groups;
}

// Comments the importer writes on every auto-created profile. They carry no
// information once a profile has been merged into another one, and worse, the
// "created via CV import" line is simply FALSE about a survivor that was
// entered by hand. Dropped rather than carried over.
const BOILERPLATE_IMPORT_COMMENTS = [
  'Automatiskt skapad via CV import',
  'CV uppdaterat via import (matchade befintlig e-postadress)',
];

function isBoilerplateImportComment(content) {
  const c = String(content || '').trim();
  return BOILERPLATE_IMPORT_COMMENTS.some(b => c === b);
}

// Merge duplicates into `survivorId`, then delete them.
//
// One transaction: a half-merged candidate (files moved, row still present)
// would be worse than either outcome.
const mergeCandidatesTx = db.transaction((survivorId, duplicateIds, userId, teamId) => {
  const survivor = db.prepare('SELECT * FROM candidates WHERE id = ?').get(survivorId);
  const now = getTimestamp();
  const moved = { files: 0, comments: 0, offers: 0, todos: 0, skippedComments: 0 };

  // Fields we can fill in from a duplicate — only ever into an EMPTY field on
  // the survivor, never overwriting something a human may have curated.
  const fillable = ['email', 'phone', 'role', 'skills', 'resume_filename', 'resume_original_name'];
  const fill = {};

  for (const dupId of duplicateIds) {
    const dup = db.prepare('SELECT * FROM candidates WHERE id = ?').get(dupId);
    if (!dup) continue;

    for (const f of fillable) {
      if (!survivor[f] && !fill[f] && dup[f]) fill[f] = dup[f];
    }
    // Prefer any CV text/profile we already have over none.
    if (!survivor.resume_text && !fill.resume_text && dup.resume_text) {
      fill.resume_text = dup.resume_text;
      fill.resume_text_status = dup.resume_text_status || 'ok';
    }
    if (!survivor.profile_json && !fill.profile_json && dup.profile_json) {
      fill.profile_json = dup.profile_json;
      fill.profile_status = dup.profile_status || 'ok';
      fill.skill_tags = dup.skill_tags || '';
    }

    const f = db.prepare('UPDATE candidate_files SET candidate_id = ? WHERE candidate_id = ?').run(survivorId, dupId);
    moved.files += f.changes;

    for (const c of db.prepare('SELECT * FROM candidate_comments WHERE candidate_id = ?').all(dupId)) {
      if (isBoilerplateImportComment(c.content)) {
        db.prepare('DELETE FROM candidate_comments WHERE id = ?').run(c.id);
        moved.skippedComments++;
        continue;
      }
      db.prepare('UPDATE candidate_comments SET candidate_id = ? WHERE id = ?').run(survivorId, c.id);
      moved.comments++;
    }

    const o = db.prepare('UPDATE candidate_offers SET candidate_id = ? WHERE candidate_id = ?').run(survivorId, dupId);
    moved.offers += o.changes;

    const t = db.prepare(
      "UPDATE todos SET linked_id = ? WHERE linked_type = 'candidate' AND linked_id = ?"
    ).run(survivorId, dupId);
    moved.todos += t.changes;

    // Drop the duplicate out of every request's match list, otherwise the entry
    // dangles at an id that no longer exists.
    const reqScope = teamId ? 'team_id = ?' : 'created_by = ? AND team_id IS NULL';
    for (const req of db.prepare(`SELECT id, matched_candidates FROM consultant_requests WHERE ${reqScope}`).all(teamId || userId)) {
      let list;
      try { list = JSON.parse(req.matched_candidates || '[]'); } catch (_) { continue; }
      if (!Array.isArray(list) || !list.some(m => m.candidateId === dupId)) continue;
      const next = list.filter(m => m.candidateId !== dupId);
      db.prepare('UPDATE consultant_requests SET matched_candidates = ?, updated_at = ? WHERE id = ?')
        .run(JSON.stringify(next), now, req.id);
    }
    db.prepare('DELETE FROM request_match_cache WHERE candidate_id = ?').run(dupId);

    db.prepare('DELETE FROM candidates WHERE id = ?').run(dupId);
  }

  const keys = Object.keys(fill);
  if (keys.length > 0) {
    db.prepare(`UPDATE candidates SET ${keys.map(k => `${k} = ?`).join(', ')}, updated_at = ? WHERE id = ?`)
      .run(...keys.map(k => fill[k]), now, survivorId);
  } else {
    db.prepare('UPDATE candidates SET updated_at = ? WHERE id = ?').run(now, survivorId);
  }

  // The merged profile's cached matches describe a pool that just changed.
  db.prepare("UPDATE candidates SET request_matches = '[]' WHERE id = ?").run(survivorId);
  db.prepare('DELETE FROM request_match_cache WHERE candidate_id = ?').run(survivorId);

  return moved;
});

function mergeCandidates(survivorId, duplicateIds, userId) {
  const survivor = getCandidateById(survivorId, userId);
  if (!survivor) return { error: 'Candidate not found' };

  const teamId = getUserTeamId(userId);
  // Every id must be in scope, or a merge could be used to reach another team's
  // rows by guessing ids.
  const ids = (duplicateIds || []).filter(id => id && id !== survivorId);
  for (const id of ids) {
    if (!getCandidateById(id, userId)) return { error: 'Candidate not found' };
  }
  if (ids.length === 0) return { error: 'Nothing to merge' };

  const moved = mergeCandidatesTx(survivorId, ids, userId, teamId);

  createCandidateComment(
    survivorId,
    `Sammanslagen med ${ids.length} dubblettprofil(er). Flyttat: ${moved.files} fil(er), ` +
    `${moved.comments} kommentar(er), ${moved.offers} erbjudande(n), ${moved.todos} todo(s).`,
    userId
  );

  return { merged: ids.length, moved, candidate: getCandidateById(survivorId, userId) };
}

function createCandidate({ name, email, phone, role, skills, category, resumeFilename, resumeOriginalName }, userId) {
  const teamId = getUserTeamId(userId);
  const id = generateId();
  const now = getTimestamp();
  const username = getUsernameById(userId);

  // email is stored in its canonical form — the dedup lookup compares against it.
  db.prepare(`
    INSERT INTO candidates (id, name, email, phone, role, skills, category, resume_filename, resume_original_name, team_id, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, normalizeEmail(email), phone || '', role || '', skills || '', category || 'in_progress', resumeFilename || '', resumeOriginalName || '', teamId, userId, now, now);

  return {
    id,
    name,
    email: email || '',
    phone: phone || '',
    role: role || '',
    skills: skills || '',
    category: category || 'in_progress',
    resumeFilename: resumeFilename || '',
    resumeOriginalName: resumeOriginalName || '',
    createdBy: userId,
    createdByUsername: username,
    createdAt: now,
    updatedAt: now,
    comments: []
  };
}

function updateCandidate(candidateId, { name, email, phone, role, skills, category, resumeFilename, resumeOriginalName }, userId) {
  // Verify access
  const candidate = getCandidateById(candidateId, userId);
  if (!candidate) return null;

  const existing = db.prepare('SELECT * FROM candidates WHERE id = ?').get(candidateId);
  const now = getTimestamp();

  db.prepare(`
    UPDATE candidates
    SET name = ?, email = ?, phone = ?, role = ?, skills = ?, category = ?, resume_filename = ?, resume_original_name = ?, updated_at = ?
    WHERE id = ?
  `).run(
    name !== undefined ? name : existing.name,
    email !== undefined ? normalizeEmail(email) : existing.email,
    phone !== undefined ? phone : existing.phone,
    role !== undefined ? role : existing.role,
    skills !== undefined ? skills : existing.skills,
    category !== undefined ? category : (existing.category || ''),
    resumeFilename !== undefined ? resumeFilename : existing.resume_filename,
    resumeOriginalName !== undefined ? resumeOriginalName : existing.resume_original_name,
    now,
    candidateId
  );

  return getCandidateById(candidateId, userId);
}

function transferCandidate(candidateId, newOwnerId, userId) {
  const candidate = getCandidateById(candidateId, userId);
  if (!candidate) return { error: 'Candidate not found' };

  const teamId = getUserTeamId(userId);
  if (!teamId) return { error: 'Transfer is only available for team users' };

  // Any team member can transfer a candidate (team members share full edit access)

  // Verify target user is a member of the same team
  const targetIsMember = db.prepare(`
    SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ?
  `).get(teamId, newOwnerId);
  if (!targetIsMember) return { error: 'Target user is not a member of your team' };

  if (newOwnerId === candidate.createdBy) {
    return { error: 'Candidate is already owned by that user' };
  }

  const now = getTimestamp();
  db.prepare('UPDATE candidates SET created_by = ?, updated_at = ? WHERE id = ?')
    .run(newOwnerId, now, candidateId);

  return { success: true, candidate: getCandidateById(candidateId, userId) };
}

function deleteCandidate(candidateId, userId) {
  const candidate = getCandidateById(candidateId, userId);
  if (!candidate) return { error: 'Candidate not found' };

  const role = getUserRole(userId);
  if (role === 'member' && candidate.createdBy !== userId) {
    return { error: 'Permission denied. You can only delete candidates you created.' };
  }

  db.prepare('DELETE FROM candidate_comments WHERE candidate_id = ?').run(candidateId);
  db.prepare('DELETE FROM candidate_files WHERE candidate_id = ?').run(candidateId);
  db.prepare('DELETE FROM candidates WHERE id = ?').run(candidateId);

  return { success: true };
}

function getCandidateFiles(candidateId) {
  return db.prepare(`
    SELECT * FROM candidate_files
    WHERE candidate_id = ?
    ORDER BY uploaded_at ASC
  `).all(candidateId).map(f => ({
    id: f.id,
    filename: f.filename,
    originalName: f.original_name,
    fileSize: f.file_size,
    mimeType: f.mime_type,
    uploadedAt: f.uploaded_at,
    uploadedBy: f.uploaded_by
  }));
}

// Add candidate file — atomic check + insert to prevent exceeding limit
const addCandidateFileTx = db.transaction((candidateId, { filename, originalName, fileSize, mimeType }, userId) => {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM candidate_files WHERE candidate_id = ?').get(candidateId).cnt;
  if (count >= 5) {
    return { error: 'Maximum 5 files per candidate' };
  }

  const id = generateId();
  const now = getTimestamp();

  db.prepare(`
    INSERT INTO candidate_files (id, candidate_id, filename, original_name, file_size, mime_type, uploaded_at, uploaded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, candidateId, filename, originalName, fileSize || 0, mimeType || '', now, userId);

  db.prepare('UPDATE candidates SET updated_at = ? WHERE id = ?').run(now, candidateId);

  return { id, filename, originalName, fileSize: fileSize || 0, mimeType: mimeType || '', uploadedAt: now, uploadedBy: userId };
});

function addCandidateFile(candidateId, fileData, userId) {
  return addCandidateFileTx(candidateId, fileData, userId);
}

function deleteCandidateFile(candidateId, fileId, userId) {
  const candidate = getCandidateById(candidateId, userId);
  if (!candidate) return { error: 'Candidate not found' };

  const file = db.prepare('SELECT * FROM candidate_files WHERE id = ? AND candidate_id = ?').get(fileId, candidateId);
  if (!file) return { error: 'File not found' };

  const role = getUserRole(userId);
  if (role === 'member' && file.uploaded_by !== userId) {
    return { error: 'Permission denied. You can only delete files you uploaded.' };
  }

  db.prepare('DELETE FROM candidate_files WHERE id = ?').run(fileId);
  const now = getTimestamp();
  db.prepare('UPDATE candidates SET updated_at = ? WHERE id = ?').run(now, candidateId);

  return { success: true, filename: file.filename };
}

function getCandidateFileById(candidateId, fileId, userId) {
  const candidate = getCandidateById(candidateId, userId);
  if (!candidate) return null;

  const file = db.prepare('SELECT * FROM candidate_files WHERE id = ? AND candidate_id = ?').get(fileId, candidateId);
  if (!file) return null;

  return {
    id: file.id,
    filename: file.filename,
    originalName: file.original_name,
    fileSize: file.file_size,
    mimeType: file.mime_type,
    uploadedAt: file.uploaded_at,
    uploadedBy: file.uploaded_by
  };
}

function createCandidateComment(candidateId, content, userId) {
  // Verify access to candidate
  const candidate = getCandidateById(candidateId, userId);
  if (!candidate) return null;

  const teamId = getUserTeamId(userId);
  const id = generateId();
  const now = getTimestamp();
  const username = getUsernameById(userId);

  db.prepare(`
    INSERT INTO candidate_comments (id, candidate_id, content, team_id, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, candidateId, content, teamId, userId, now, now);

  db.prepare('UPDATE candidates SET updated_at = ? WHERE id = ?').run(now, candidateId);

  return {
    id,
    content,
    createdBy: userId,
    createdByUsername: username,
    createdAt: now,
    updatedAt: now
  };
}

function updateCandidateComment(candidateId, commentId, content, userId) {
  // Verify access to candidate
  const candidate = getCandidateById(candidateId, userId);
  if (!candidate) return null;

  const comment = db.prepare('SELECT * FROM candidate_comments WHERE id = ? AND candidate_id = ?').get(commentId, candidateId);
  if (!comment) return null;

  const now = getTimestamp();
  const username = getUsernameById(comment.created_by);

  db.prepare('UPDATE candidate_comments SET content = ?, updated_at = ? WHERE id = ?').run(content, now, commentId);
  db.prepare('UPDATE candidates SET updated_at = ? WHERE id = ?').run(now, candidateId);

  return {
    id: commentId,
    content,
    createdBy: comment.created_by,
    createdByUsername: username,
    createdAt: comment.created_at,
    updatedAt: now
  };
}

function deleteCandidateComment(candidateId, commentId, userId) {
  // Verify access to candidate
  const candidate = getCandidateById(candidateId, userId);
  if (!candidate) return { error: 'Candidate not found' };

  const comment = db.prepare('SELECT * FROM candidate_comments WHERE id = ? AND candidate_id = ?').get(commentId, candidateId);
  if (!comment) return { error: 'Comment not found' };

  const role = getUserRole(userId);
  if (role === 'member' && comment.created_by !== userId) {
    return { error: 'Permission denied. You can only delete comments you created.' };
  }

  const now = getTimestamp();

  db.prepare('DELETE FROM candidate_comments WHERE id = ?').run(commentId);
  db.prepare('UPDATE candidates SET updated_at = ? WHERE id = ?').run(now, candidateId);

  return { success: true };
}

// ----- Candidate offers (employment offer revisions) -----

function formatOfferRow(row) {
  return {
    id: row.id,
    candidateId: row.candidate_id,
    contractType: row.contract_type,
    candidateName: row.candidate_name,
    personalNumber: row.personal_number || '',
    startDate: row.start_date || '',
    workLocation: row.work_location || '',
    department: row.department || '',
    signLocation: row.sign_location || '',
    signDate: row.sign_date || '',
    signerName: row.signer_name || '',
    signerTitle: row.signer_title || '',
    fixedSalary: row.fixed_salary,
    expectedRate: row.expected_rate,
    variablePercentage: row.variable_percentage,
    salaryYear: row.salary_year,
    calculation: row.calculation_json ? JSON.parse(row.calculation_json) : null,
    contractFilename: row.contract_filename || '',
    contractOriginalName: row.contract_original_name || '',
    attachmentFilename: row.attachment_filename || '',
    attachmentOriginalName: row.attachment_original_name || '',
    emailSubject: row.email_subject || '',
    emailBody: row.email_body || '',
    createdBy: row.created_by,
    createdByUsername: row.created_by_username || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getOffersForCandidate(candidateId, userId) {
  // Caller must have already verified access via getCandidateById.
  const rows = db.prepare(`
    SELECT o.*, u.username as created_by_username
    FROM candidate_offers o
    LEFT JOIN users u ON u.id = o.created_by
    WHERE o.candidate_id = ?
    ORDER BY o.created_at DESC
  `).all(candidateId);
  return rows.map(formatOfferRow);
}

function getOfferById(candidateId, offerId, userId) {
  const candidate = getCandidateById(candidateId, userId);
  if (!candidate) return null;
  const row = db.prepare(`
    SELECT o.*, u.username as created_by_username
    FROM candidate_offers o
    LEFT JOIN users u ON u.id = o.created_by
    WHERE o.id = ? AND o.candidate_id = ?
  `).get(offerId, candidateId);
  if (!row) return null;
  return formatOfferRow(row);
}

function createOffer(candidateId, payload, userId) {
  const candidate = getCandidateById(candidateId, userId);
  if (!candidate) return { error: 'Candidate not found' };

  const teamId = getUserTeamId(userId);
  const id = generateId();
  const now = getTimestamp();

  db.prepare(`
    INSERT INTO candidate_offers (
      id, candidate_id, contract_type, candidate_name, personal_number, start_date,
      work_location, department, sign_location, sign_date, signer_name, signer_title,
      fixed_salary, expected_rate, variable_percentage, salary_year, calculation_json,
      contract_filename, contract_original_name, attachment_filename, attachment_original_name,
      email_subject, email_body, team_id, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    candidateId,
    payload.contractType,
    payload.candidateName,
    payload.personalNumber || '',
    payload.startDate || '',
    payload.workLocation || '',
    payload.department || '',
    payload.signLocation || '',
    payload.signDate || '',
    payload.signerName || '',
    payload.signerTitle || '',
    payload.fixedSalary || 0,
    payload.expectedRate || 0,
    payload.variablePercentage || 0,
    payload.salaryYear || 0,
    JSON.stringify(payload.calculation || {}),
    payload.contractFilename || '',
    payload.contractOriginalName || '',
    payload.attachmentFilename || '',
    payload.attachmentOriginalName || '',
    payload.emailSubject || '',
    payload.emailBody || '',
    teamId,
    userId,
    now,
    now
  );

  const row = db.prepare(`
    SELECT o.*, u.username as created_by_username
    FROM candidate_offers o
    LEFT JOIN users u ON u.id = o.created_by
    WHERE o.id = ?
  `).get(id);
  return formatOfferRow(row);
}

function deleteOffer(candidateId, offerId, userId) {
  const offer = getOfferById(candidateId, offerId, userId);
  if (!offer) return { error: 'Offer not found' };

  // Permission: solo + creator can always delete; team owner can delete any;
  // team members can delete their own only.
  const role = getUserRole(userId);
  if (role !== 'solo' && offer.createdBy !== userId && !isTeamOwner(userId)) {
    return { error: 'Insufficient permissions' };
  }

  db.prepare('DELETE FROM candidate_offers WHERE id = ?').run(offerId);
  return {
    deleted: true,
    contractFilename: offer.contractFilename,
    attachmentFilename: offer.attachmentFilename,
  };
}

// ============ User Emails (Authorized Sender Addresses) ============

function getUserEmails(userId) {
  const rows = db.prepare('SELECT * FROM user_emails WHERE user_id = ? ORDER BY created_at ASC').all(userId);
  return rows.map(toCamelCase);
}

function addUserEmail(userId, email, label) {
  const id = generateId();
  const now = getTimestamp();
  const normalizedEmail = email.toLowerCase().trim();
  try {
    db.prepare('INSERT INTO user_emails (id, user_id, email, label, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(id, userId, normalizedEmail, label || '', now);
    return { id, userId, email: normalizedEmail, label: label || '', createdAt: now };
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      // Check who owns it for a better error message
      const existing = db.prepare('SELECT user_id FROM user_emails WHERE email = ?').get(normalizedEmail);
      if (existing && existing.user_id === userId) return { error: 'You have already added this email' };
      return { error: 'This email is registered by another user' };
    }
    throw err;
  }
}

function removeUserEmail(emailId, userId) {
  const row = db.prepare('SELECT * FROM user_emails WHERE id = ? AND user_id = ?').get(emailId, userId);
  if (!row) return { error: 'Email not found' };
  db.prepare('DELETE FROM user_emails WHERE id = ?').run(emailId);
  return { deleted: true };
}

function findUserByAuthorizedEmail(email) {
  const row = db.prepare(`
    SELECT ue.user_id, u.username, u.team_id
    FROM user_emails ue
    JOIN users u ON u.id = ue.user_id
    WHERE ue.email = ?
  `).get(email.toLowerCase().trim());
  return row ? toCamelCase(row) : null;
}

// ============ Email Inbox ============

function getAllInboxEmails(userId) {
  const teamId = getUserTeamId(userId);
  let rows;
  if (teamId) {
    rows = db.prepare('SELECT e.*, u.username as created_by_username FROM email_inbox e LEFT JOIN users u ON u.id = e.user_id WHERE e.team_id = ? ORDER BY e.created_at DESC').all(teamId);
  } else {
    rows = db.prepare('SELECT e.*, u.username as created_by_username FROM email_inbox e LEFT JOIN users u ON u.id = e.user_id WHERE e.user_id = ? ORDER BY e.created_at DESC').all(userId);
  }
  return rows.map(r => {
    const obj = toCamelCase(r);
    obj.extractedData = JSON.parse(r.extracted_data || '{}');
    return obj;
  });
}

function getInboxEmailById(emailId, userId) {
  const teamId = getUserTeamId(userId);
  let row;
  if (teamId) {
    row = db.prepare('SELECT * FROM email_inbox WHERE id = ? AND team_id = ?').get(emailId, teamId);
  } else {
    row = db.prepare('SELECT * FROM email_inbox WHERE id = ? AND user_id = ?').get(emailId, userId);
  }
  if (!row) return null;
  const obj = toCamelCase(row);
  obj.extractedData = JSON.parse(row.extracted_data || '{}');
  return obj;
}

function createInboxEmail({ fromEmail, fromName, subject, body, userId, teamId }) {
  const id = generateId();
  const now = getTimestamp();
  db.prepare(`
    INSERT INTO email_inbox (id, from_email, from_name, subject, body, user_id, team_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, fromEmail, fromName || '', subject || '', body, userId, teamId || null, now);
  return { id, fromEmail, fromName: fromName || '', subject: subject || '', body, status: 'pending', classification: 'pending', userId, teamId, createdAt: now };
}

function updateInboxEmail(emailId, updates) {
  const sets = [];
  const values = [];
  if (updates.fromEmail !== undefined) { sets.push('from_email = ?'); values.push(updates.fromEmail); }
  if (updates.fromName !== undefined) { sets.push('from_name = ?'); values.push(updates.fromName); }
  if (updates.subject !== undefined) { sets.push('subject = ?'); values.push(updates.subject); }
  if (updates.classification !== undefined) { sets.push('classification = ?'); values.push(updates.classification); }
  if (updates.confidence !== undefined) { sets.push('confidence = ?'); values.push(updates.confidence); }
  if (updates.extractedData !== undefined) { sets.push('extracted_data = ?'); values.push(JSON.stringify(updates.extractedData)); }
  if (updates.status !== undefined) { sets.push('status = ?'); values.push(updates.status); }
  if (updates.stage !== undefined) { sets.push('stage = ?'); values.push(updates.stage); }
  if (updates.actionType !== undefined) { sets.push('action_type = ?'); values.push(updates.actionType); }
  if (updates.actionId !== undefined) { sets.push('action_id = ?'); values.push(updates.actionId); }
  if (updates.actionSummary !== undefined) { sets.push('action_summary = ?'); values.push(updates.actionSummary); }
  if (updates.errorMessage !== undefined) { sets.push('error_message = ?'); values.push(updates.errorMessage); }
  if (updates.processedAt !== undefined) { sets.push('processed_at = ?'); values.push(updates.processedAt); }
  if (sets.length === 0) return;
  values.push(emailId);
  db.prepare(`UPDATE email_inbox SET ${sets.join(', ')} WHERE id = ?`).run(...values);
}

// Atomically take ownership of an inbox email for background processing.
//
// The inbox is team-scoped, so two members (or one impatient double-click) can
// both hit Reprocess on the same row. A blind `UPDATE ... SET status =
// 'processing'` lets both runs proceed and duplicate every side effect
// (handleTodo in particular creates a fresh ToDo each time). This conditional
// UPDATE is the claim: exactly one caller sees changes === 1, the losers see 0
// and back off. better-sqlite3 runs it as a single atomic statement, so there
// is no TOCTOU window between the check and the write.
function claimInboxEmailForProcessing(emailId) {
  const result = db.prepare(`
    UPDATE email_inbox
    SET status = 'processing', stage = 'classifying', error_message = '', processed_at = NULL
    WHERE id = ? AND status IN ('pending', 'failed', 'review', 'completed')
  `).run(emailId);
  return result.changes === 1;
}

function deleteInboxEmail(emailId, userId) {
  const email = getInboxEmailById(emailId, userId);
  if (!email) return { error: 'Email not found' };
  db.prepare('DELETE FROM email_inbox WHERE id = ?').run(emailId);
  return { deleted: true };
}

// ============ Consultant Requests ============

function getOpenConsultantRequests(userId) {
  const teamId = getUserTeamId(userId);
  let rows;
  if (teamId) {
    rows = db.prepare("SELECT * FROM consultant_requests WHERE team_id = ? AND status IN ('open', 'in_progress') ORDER BY created_at DESC").all(teamId);
  } else {
    rows = db.prepare("SELECT * FROM consultant_requests WHERE created_by = ? AND status IN ('open', 'in_progress') ORDER BY created_at DESC").all(userId);
  }
  return rows.map(r => {
    const obj = toCamelCase(r);
    obj.matchedCandidates = JSON.parse(r.matched_candidates || '[]');
    return obj;
  });
}

function getAllConsultantRequests(userId) {
  const teamId = getUserTeamId(userId);
  let rows;
  if (teamId) {
    rows = db.prepare('SELECT r.*, u.username as created_by_username FROM consultant_requests r LEFT JOIN users u ON u.id = r.created_by WHERE r.team_id = ? ORDER BY r.created_at DESC').all(teamId);
  } else {
    rows = db.prepare('SELECT r.*, u.username as created_by_username FROM consultant_requests r LEFT JOIN users u ON u.id = r.created_by WHERE r.created_by = ? ORDER BY r.created_at DESC').all(userId);
  }
  return rows.map(r => {
    const obj = toCamelCase(r);
    obj.matchedCandidates = JSON.parse(r.matched_candidates || '[]');
    return obj;
  });
}

function getConsultantRequestById(requestId, userId) {
  const teamId = getUserTeamId(userId);
  let row;
  if (teamId) {
    row = db.prepare('SELECT * FROM consultant_requests WHERE id = ? AND team_id = ?').get(requestId, teamId);
  } else {
    row = db.prepare('SELECT * FROM consultant_requests WHERE id = ? AND created_by = ?').get(requestId, userId);
  }
  if (!row) return null;
  const obj = toCamelCase(row);
  obj.matchedCandidates = JSON.parse(row.matched_candidates || '[]');
  return obj;
}

// Find the request that was created from a given inbox email (if any). Used to
// make email reprocessing idempotent: reprocessing must update the existing
// request rather than create a duplicate. Returns the oldest match if somehow
// more than one exists.
function getConsultantRequestByEmailInboxId(emailInboxId, userId) {
  if (!emailInboxId) return null;
  const teamId = getUserTeamId(userId);
  let row;
  if (teamId) {
    row = db.prepare('SELECT * FROM consultant_requests WHERE email_inbox_id = ? AND team_id = ? ORDER BY created_at ASC LIMIT 1').get(emailInboxId, teamId);
  } else {
    row = db.prepare('SELECT * FROM consultant_requests WHERE email_inbox_id = ? AND created_by = ? ORDER BY created_at ASC LIMIT 1').get(emailInboxId, userId);
  }
  if (!row) return null;
  const obj = toCamelCase(row);
  obj.matchedCandidates = JSON.parse(row.matched_candidates || '[]');
  return obj;
}

function createConsultantRequest({ title, description, requiredSkills, role, clientName, clientEmail, urgency, emailInboxId }, userId) {
  const teamId = getUserTeamId(userId);
  const id = generateId();
  const now = getTimestamp();
  db.prepare(`
    INSERT INTO consultant_requests (id, title, description, required_skills, role, client_name, client_email, urgency, email_inbox_id, team_id, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, title, description || '', requiredSkills || '', role || '', clientName || '', clientEmail || '', urgency || 'normal', emailInboxId || null, teamId, userId, now, now);
  return { id, title, description: description || '', requiredSkills: requiredSkills || '', role: role || '', clientName: clientName || '', clientEmail: clientEmail || '', urgency: urgency || 'normal', status: 'open', matchedCandidates: [], emailInboxId, createdAt: now, updatedAt: now };
}

function updateConsultantRequest(requestId, updates, userId) {
  const request = getConsultantRequestById(requestId, userId);
  if (!request) return null;
  const now = getTimestamp();
  const sets = ['updated_at = ?'];
  const values = [now];
  if (updates.title !== undefined) { sets.push('title = ?'); values.push(updates.title); }
  if (updates.description !== undefined) { sets.push('description = ?'); values.push(updates.description); }
  if (updates.requiredSkills !== undefined) { sets.push('required_skills = ?'); values.push(updates.requiredSkills); }
  if (updates.role !== undefined) { sets.push('role = ?'); values.push(updates.role); }
  if (updates.clientName !== undefined) { sets.push('client_name = ?'); values.push(updates.clientName); }
  if (updates.clientEmail !== undefined) { sets.push('client_email = ?'); values.push(updates.clientEmail); }
  if (updates.urgency !== undefined) { sets.push('urgency = ?'); values.push(updates.urgency); }
  if (updates.status !== undefined) { sets.push('status = ?'); values.push(updates.status); }
  if (updates.matchedCandidates !== undefined) { sets.push('matched_candidates = ?'); values.push(JSON.stringify(updates.matchedCandidates)); }
  values.push(requestId);
  db.prepare(`UPDATE consultant_requests SET ${sets.join(', ')} WHERE id = ?`).run(...values);
  return getConsultantRequestById(requestId, userId);
}

// Upsert a single candidate into a request's matched_candidates list, keeping
// the list sorted by score (desc). Used when (re)matching a candidate against
// open requests so the candidate shows up — correctly sorted — on the request
// detail page. Synchronous read-modify-write: atomic under Node's single thread,
// so concurrent candidate matches can't clobber each other's inserts. Preserves
// any existing strengths/gaps/reasoning and the "sent" flag for this candidate.
function addCandidateToRequestMatches(requestId, candidateMatch, userId) {
  const request = getConsultantRequestById(requestId, userId);
  if (!request) return false;

  const list = Array.isArray(request.matchedCandidates) ? request.matchedCandidates.slice() : [];
  const existing = list.find(m => m.candidateId === candidateMatch.candidateId);

  const merged = {
    candidateId: candidateMatch.candidateId,
    score: candidateMatch.score,
    strengths: candidateMatch.strengths || (existing && existing.strengths) || '',
    gaps: candidateMatch.gaps || (existing && existing.gaps) || '',
    reasoning: candidateMatch.reasoning || (existing && existing.reasoning) || ''
  };
  if (existing && existing.sent) merged.sent = true;
  if (existing && existing.status) merged.status = existing.status;

  const next = list.filter(m => m.candidateId !== candidateMatch.candidateId);
  next.push(merged);
  next.sort((a, b) => (b.score || 0) - (a.score || 0));

  const now = getTimestamp();
  db.prepare('UPDATE consultant_requests SET matched_candidates = ?, updated_at = ? WHERE id = ?')
    .run(JSON.stringify(next), now, requestId);
  return true;
}

// Remove a candidate from a request's matched_candidates list (used when a
// re-match shows the candidate no longer matches a previously-matched request).
// Candidates already marked "sent" are kept so the Sent history is preserved.
function removeCandidateFromRequestMatches(requestId, candidateId, userId) {
  const request = getConsultantRequestById(requestId, userId);
  if (!request) return false;

  const list = Array.isArray(request.matchedCandidates) ? request.matchedCandidates : [];
  const target = list.find(m => m.candidateId === candidateId);
  if (!target || target.sent) return false;

  const next = list.filter(m => m.candidateId !== candidateId);
  const now = getTimestamp();
  db.prepare('UPDATE consultant_requests SET matched_candidates = ?, updated_at = ? WHERE id = ?')
    .run(JSON.stringify(next), now, requestId);
  return true;
}

// Merge a freshly computed full ranking (newMatches) into a request's
// matched_candidates WITHOUT clobbering entries for candidates that weren't part
// of this matching run. This replaces the old blind overwrite, which had a race:
// when a candidate is added at the same time a request is being matched, the
// candidate inserts itself into the request via addCandidateToRequestMatches,
// and a blind overwrite from the (older) request-side snapshot would wipe it.
//
// evaluatedCandidateIds = the candidates this run actually scored (the snapshot
// passed to the matcher). Their entries are replaced by newMatches; entries for
// any other candidate (e.g. one added concurrently) are preserved. The "sent"
// flag is carried over. Synchronous read-modify-write => atomic under Node's
// single thread, so it can't interleave with the per-candidate atomic inserts.
function reconcileRequestMatches(requestId, evaluatedCandidateIds, newMatches, userId) {
  const request = getConsultantRequestById(requestId, userId);
  if (!request) return false;

  const existing = Array.isArray(request.matchedCandidates) ? request.matchedCandidates : [];

  // Safety net: an empty result is almost always a transient AI/parse failure
  // (truncated or unparseable response), NOT a real "nobody matches". Never let
  // it wipe a populated list — preserve what's there and let the user re-run.
  // A genuine empty request (no prior matches) is a no-op either way.
  if (!newMatches || newMatches.length === 0) {
    return false;
  }

  const evaluated = new Set(evaluatedCandidateIds || []);

  // Preserve entries for candidates this run did not evaluate (e.g. added
  // concurrently and self-inserted via addCandidateToRequestMatches).
  const preserved = existing.filter(m => !evaluated.has(m.candidateId));

  // Carry over the "sent" flag and client status for evaluated candidates from
  // their old entry (a fresh match must not reset a sent/declined/etc. status).
  const prevById = new Map(existing.map(m => [m.candidateId, m]));
  const fresh = (newMatches || []).map(m => {
    const prev = prevById.get(m.candidateId);
    if (prev && prev.sent) {
      return { ...m, sent: true, ...(prev.status ? { status: prev.status } : {}) };
    }
    return m;
  });

  const merged = [...preserved, ...fresh];
  merged.sort((a, b) => (b.score || 0) - (a.score || 0));

  const now = getTimestamp();
  db.prepare('UPDATE consultant_requests SET matched_candidates = ?, updated_at = ? WHERE id = ?')
    .run(JSON.stringify(merged), now, requestId);
  return true;
}

// Set the client-response status of a candidate that has been sent for a
// request (sent / declined / interview / accepted). Only applies to candidates
// already marked sent. Atomic read-modify-write. Returns the updated request or
// null if the request or the sent candidate entry isn't found.
const REQUEST_CANDIDATE_STATUSES = ['sent', 'declined', 'interview', 'accepted'];
function setRequestCandidateStatus(requestId, candidateId, status, userId) {
  if (!REQUEST_CANDIDATE_STATUSES.includes(status)) return null;
  const request = getConsultantRequestById(requestId, userId);
  if (!request) return null;

  const list = Array.isArray(request.matchedCandidates) ? request.matchedCandidates : [];
  const target = list.find(m => m.candidateId === candidateId);
  if (!target || !target.sent) return null; // status only applies to sent candidates

  const next = list.map(m =>
    m.candidateId === candidateId ? { ...m, sent: true, status } : m
  );
  const now = getTimestamp();
  db.prepare('UPDATE consultant_requests SET matched_candidates = ?, updated_at = ? WHERE id = ?')
    .run(JSON.stringify(next), now, requestId);
  return getConsultantRequestById(requestId, userId);
}

function deleteConsultantRequest(requestId, userId) {
  const request = getConsultantRequestById(requestId, userId);
  if (!request) return { error: 'Request not found' };
  if (!canDeleteEntity(userId, { created_by: request.createdBy })) {
    return { error: 'Permission denied' };
  }
  db.prepare('DELETE FROM consultant_requests WHERE id = ?').run(requestId);
  return { deleted: true };
}

// ============ Candidate Resume Text ============

function updateCandidateResumeText(candidateId, resumeText) {
  db.prepare("UPDATE candidates SET resume_text = ?, resume_text_status = 'ok', request_matches = '[]' WHERE id = ?")
    .run(resumeText, candidateId);
}

// Mark that extraction was attempted but yielded nothing usable, so the
// backfill loops stop retrying this file on every consultant-request email.
// Cleared automatically whenever a new CV is attached (updateCandidateResumeText).
function markCandidateResumeUnextractable(candidateId) {
  db.prepare("UPDATE candidates SET resume_text_status = 'empty' WHERE id = ?").run(candidateId);
}

function countCandidatesNeedingResumeExtraction(userId) {
  const teamId = getUserTeamId(userId);
  const scope = teamId ? 'team_id = ?' : 'created_by = ?';
  const row = db.prepare(`SELECT COUNT(*) AS n FROM candidates WHERE ${scope} AND resume_text_status IS NULL`)
    .get(teamId || userId);
  return row?.n || 0;
}

// Candidates whose CV text has never been extracted (or was attached before
// this tracking existed). Scoped the same way as the rest of the data layer.
function getCandidatesNeedingResumeExtraction(userId, limit) {
  const teamId = getUserTeamId(userId);
  const scope = teamId ? 'c.team_id = ?' : 'c.created_by = ?';
  const param = teamId || userId;
  return db.prepare(`
    SELECT c.id, c.name, c.skills, c.resume_filename,
           (SELECT cf.filename FROM candidate_files cf
             WHERE cf.candidate_id = c.id ORDER BY cf.uploaded_at DESC LIMIT 1) AS file_filename
    FROM candidates c
    WHERE ${scope} AND c.resume_text_status IS NULL
    LIMIT ?
  `).all(param, limit);
}

function getCandidateRequestMatches(candidateId) {
  const row = db.prepare('SELECT request_matches FROM candidates WHERE id = ?').get(candidateId);
  if (!row || !row.request_matches) return [];
  try { return JSON.parse(row.request_matches); } catch (_) { return []; }
}

// Tracks whether a background candidate→request auto-match is in flight, so the
// UI can poll instead of showing an empty list before matching finishes.
// 'pending' = running, 'done' = finished (matches cached). null = never run.
function setCandidateMatchStatus(candidateId, status) {
  db.prepare('UPDATE candidates SET match_status = ? WHERE id = ?').run(status, candidateId);
}

function getCandidateMatchStatus(candidateId) {
  const row = db.prepare('SELECT match_status FROM candidates WHERE id = ?').get(candidateId);
  return row ? row.match_status : null;
}

function updateCandidateRequestMatches(candidateId, matches) {
  db.prepare('UPDATE candidates SET request_matches = ? WHERE id = ?').run(JSON.stringify(matches), candidateId);
}

// The candidate pool a request is matched against.
//
// ORDER BY c.id is load-bearing, not cosmetic: the matcher chunks this list and
// relies on chunk contents being byte-identical between runs for the Anthropic
// prompt cache to hit. An unordered SELECT would reshuffle chunk boundaries and
// silently turn every cached run back into a full-price one.
//
// Also returns the distilled profile and canonical skill tags, which are what
// the fast path actually sends and filters on.
function getCandidatesWithResumes(userId) {
  const teamId = getUserTeamId(userId);
  const scope = teamId ? 'c.team_id = ?' : 'c.created_by = ?';
  const rows = db.prepare(`
    SELECT c.id, c.name, c.role, c.skills, c.resume_text, c.email, c.phone,
           c.profile_json, c.profile_status, c.skill_tags, c.updated_at
    FROM candidates c
    WHERE ${scope} AND c.category IN ('in_progress', 'employed_no_assignment', 'contact_later')
      AND ((c.resume_text IS NOT NULL AND c.resume_text != '') OR c.skills != '')
    ORDER BY c.id
  `).all(teamId || userId);
  return rows.map(toCamelCase);
}

// ============ Distilled candidate profiles ============

// Store the distilled profile + canonical skill tags produced once per CV.
// Deliberately does NOT touch resume_text or request_matches — distillation is
// a derived artefact of text that has already been cached.
function updateCandidateProfile(candidateId, profileJson, skillTags) {
  db.prepare(`
    UPDATE candidates
    SET profile_json = ?, profile_status = 'ok', skill_tags = ?
    WHERE id = ?
  `).run(
    typeof profileJson === 'string' ? profileJson : JSON.stringify(profileJson || {}),
    skillTags || '',
    candidateId
  );
}

// Distillation was attempted and produced nothing usable. Same purpose as
// markCandidateResumeUnextractable: stop the backfill retrying it forever.
function markCandidateProfileEmpty(candidateId) {
  db.prepare("UPDATE candidates SET profile_status = 'empty' WHERE id = ?").run(candidateId);
}

function countCandidatesNeedingProfile(userId) {
  const teamId = getUserTeamId(userId);
  const scope = teamId ? 'team_id = ?' : 'created_by = ?';
  const row = db.prepare(`
    SELECT COUNT(*) AS n FROM candidates
    WHERE ${scope} AND profile_status IS NULL
      AND ((resume_text IS NOT NULL AND resume_text != '') OR skills != '')
  `).get(teamId || userId);
  return row?.n || 0;
}

// Candidates with cached CV text but no distilled profile yet — i.e. everything
// that predates this feature. Bounded by `limit` because distillation is an AI
// call per candidate.
function getCandidatesNeedingProfile(userId, limit) {
  const teamId = getUserTeamId(userId);
  const scope = teamId ? 'c.team_id = ?' : 'c.created_by = ?';
  const rows = db.prepare(`
    SELECT c.id, c.name, c.email, c.phone, c.role, c.skills, c.resume_text
    FROM candidates c
    WHERE ${scope} AND c.profile_status IS NULL
      AND ((c.resume_text IS NOT NULL AND c.resume_text != '') OR c.skills != '')
    ORDER BY c.id
    LIMIT ?
  `).all(teamId || userId, limit);
  return rows.map(toCamelCase);
}

// ============ Request match cache (per candidate↔request pair) ============

// Cached scores for this request, keyed by candidate id. The caller compares
// the stored fingerprints against freshly computed ones and only reuses a row
// when both sides are unchanged — so staleness is impossible by construction
// rather than by remembering to invalidate.
function getRequestMatchCache(requestId) {
  const rows = db.prepare('SELECT * FROM request_match_cache WHERE request_id = ?').all(requestId);
  const byCandidate = new Map();
  for (const r of rows) byCandidate.set(r.candidate_id, toCamelCase(r));
  return byCandidate;
}

// Upsert one scored pair. Written inside a transaction by the caller.
const putRequestMatchCacheEntry = db.transaction((requestId, entries) => {
  const stmt = db.prepare(`
    INSERT INTO request_match_cache
      (request_id, candidate_id, request_fingerprint, candidate_fingerprint,
       score, strengths, gaps, reasoning, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(request_id, candidate_id) DO UPDATE SET
      request_fingerprint = excluded.request_fingerprint,
      candidate_fingerprint = excluded.candidate_fingerprint,
      score = excluded.score,
      strengths = excluded.strengths,
      gaps = excluded.gaps,
      reasoning = excluded.reasoning,
      created_at = excluded.created_at
  `);
  const now = getTimestamp();
  for (const e of entries) {
    stmt.run(
      requestId, e.candidateId, e.requestFingerprint, e.candidateFingerprint,
      e.score == null ? null : Math.round(e.score),
      e.strengths || '', e.gaps || '', e.reasoning || '', now
    );
  }
});

function saveRequestMatchCache(requestId, entries) {
  if (!entries || entries.length === 0) return;
  putRequestMatchCacheEntry(requestId, entries);
}

function clearRequestMatchCache(requestId) {
  db.prepare('DELETE FROM request_match_cache WHERE request_id = ?').run(requestId);
}

// ============ Request-side matching job state ============

// Single-writer claim, same pattern as claimInboxEmailForProcessing: a
// conditional UPDATE that exactly one caller can win. Without it, two teammates
// (or one double-click) would run the same multi-minute AI job twice and burn
// double the tokens racing to write the same list.
function claimRequestForMatching(requestId, userId, mode) {
  const request = getConsultantRequestById(requestId, userId);
  if (!request) return { error: 'not_found' };

  const result = db.prepare(`
    UPDATE consultant_requests
    SET match_status = 'running', match_stage = ?, match_summary = ?
    WHERE id = ? AND (match_status IS NULL OR match_status IN ('done', 'failed'))
  `).run('Förbereder', JSON.stringify({ mode, startedAt: getTimestamp() }), requestId);

  if (result.changes === 0) return { error: 'already_running' };
  return { claimed: true, request };
}

function setRequestMatchStage(requestId, stage) {
  db.prepare('UPDATE consultant_requests SET match_stage = ? WHERE id = ?').run(stage, requestId);
}

function finishRequestMatching(requestId, status, summary) {
  db.prepare(`
    UPDATE consultant_requests
    SET match_status = ?, match_stage = NULL, match_summary = ?
    WHERE id = ?
  `).run(status, JSON.stringify(summary || {}), requestId);
}

function getRequestMatchState(requestId, userId) {
  const teamId = getUserTeamId(userId);
  const scope = teamId ? 'team_id = ?' : 'created_by = ?';
  const row = db.prepare(`
    SELECT match_status, match_stage, match_summary
    FROM consultant_requests WHERE id = ? AND ${scope}
  `).get(requestId, teamId || userId);
  if (!row) return null;
  let summary = {};
  try { summary = JSON.parse(row.match_summary || '{}'); } catch (_) { summary = {}; }
  return { status: row.match_status, stage: row.match_stage, summary };
}

module.exports = {
  // Utilities
  generateId,
  getTimestamp,

  // Companies
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  archiveCompany,
  restoreCompany,
  getArchivedCompanies,

  // Contacts
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  archiveContact,
  restoreContact,
  getArchivedContacts,

  // Notes
  createNote,
  updateNote,
  deleteNote,

  // Todos
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,

  // Checklists
  getAllChecklists,
  getChecklistById,
  createChecklist,
  updateChecklist,
  deleteChecklist,

  // Search
  search,

  // Users
  getUserByUsername,
  getUserByEmail,
  getUserById,
  createUser,
  getUsernameById,
  updateUserPassword,

  // Candidates
  getAllCandidates,
  getCandidateById,
  findCandidateByEmail,
  findCandidatesByName,
  findDuplicateCandidateGroups,
  mergeCandidates,
  normalizeEmail,
  normalizeName,
  createCandidate,
  updateCandidate,
  transferCandidate,
  deleteCandidate,
  createCandidateComment,
  updateCandidateComment,
  deleteCandidateComment,

  // Candidate Files
  getCandidateFiles,
  addCandidateFile,
  deleteCandidateFile,
  getCandidateFileById,

  // Candidate Offers
  getOffersForCandidate,
  getOfferById,
  createOffer,
  deleteOffer,

  // Team & Access Control
  getUserTeamId,
  getUserRole,
  isTeamOwner,
  isTeamMember,
  canDeleteEntity,
  getTeamByUserId,
  createTeam,
  getTeamMembers,
  addTeamMember,
  removeTeamMember,
  transferOwnership,
  mergeUserDataIntoTeam,
  deleteUserSoloData,
  userHasSoloData,
  updateTeamLogo,
  getTeamLogo,

  // Invitations
  createInvitation,
  getInvitationById,
  getInvitationsByEmail,
  getInvitationsByTeam,
  acceptInvitation,
  declineInvitation,
  cancelInvitation,

  // User Emails
  getUserEmails,
  addUserEmail,
  removeUserEmail,
  findUserByAuthorizedEmail,

  // Email Inbox
  getAllInboxEmails,
  getInboxEmailById,
  createInboxEmail,
  updateInboxEmail,
  claimInboxEmailForProcessing,
  deleteInboxEmail,

  // Consultant Requests
  getOpenConsultantRequests,
  getAllConsultantRequests,
  getConsultantRequestById,
  createConsultantRequest,
  updateConsultantRequest,
  deleteConsultantRequest,

  // Candidate Resume Text
  updateCandidateResumeText,
  markCandidateResumeUnextractable,
  getCandidatesNeedingResumeExtraction,
  countCandidatesNeedingResumeExtraction,
  getCandidateRequestMatches,
  updateCandidateRequestMatches,
  setCandidateMatchStatus,
  getCandidateMatchStatus,
  getConsultantRequestByEmailInboxId,
  addCandidateToRequestMatches,
  removeCandidateFromRequestMatches,
  reconcileRequestMatches,
  setRequestCandidateStatus,
  getCandidatesWithResumes,

  // Distilled candidate profiles
  updateCandidateProfile,
  markCandidateProfileEmpty,
  countCandidatesNeedingProfile,
  getCandidatesNeedingProfile,

  // Request match cache + job state
  getRequestMatchCache,
  saveRequestMatchCache,
  clearRequestMatchCache,
  claimRequestForMatching,
  setRequestMatchStage,
  finishRequestMatching,
  getRequestMatchState
};
