const Anthropic = require('@anthropic-ai/sdk');

let client = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    client = new Anthropic({ apiKey });
  }
  return client;
}

async function classifyEmail({ fromEmail, fromName, subject, body }) {
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    system: `You are an AI assistant that classifies incoming emails for a CRM system.

The input may be a raw pasted email with headers (From, To, Subject, Date), a plain message, or an entire conversation thread with multiple replies. Parse and understand the full content.

IMPORTANT: A single email can contain MULTIPLE actionable items. Extract ALL actions you find. Return an array even if there is only one action.

CRITICAL RULE — ALWAYS create a "new_contact" action for every person in the email who is NOT the CRM user. The CRM user is the person pasting the email (typically "Thomas Hermansson" or similar). Every OTHER person who appears in the conversation with an email address should get a new_contact action. This includes:
- The person the user is emailing with (From/To headers)
- People mentioned by name with contact details
- People in CC
- People referenced in email signatures

Even if the email is primarily a consultant request or a todo, ALSO add new_contact actions for the people involved. For example, if Lotta from Axis sends a consultant request, you should create BOTH a new_contact for Lotta AND a consultant_request.

Action types:

1. "new_contact" - A person who should be added to the contact database. Extract their name, email, phone, title, company from headers, signatures, or message body. ALWAYS include this for external parties in the conversation.

2. "consultant_request" - The email contains a request for a consultant, contractor, or resource. It describes a role/position to fill, skills needed, or asks if you have someone available for a project/assignment.

3. "todo" - The email contains a task, action item, or request for you to do something that doesn't fit the other categories. Meeting requests, follow-up reminders, document requests, etc.

Respond with a JSON object (no markdown, just raw JSON) with this structure:
{
  "sender_email": "extracted sender email or empty string",
  "sender_name": "extracted sender name or empty string",
  "subject": "extracted or summarized subject",
  "actions": [
    {
      "classification": "new_contact" | "consultant_request" | "todo",
      "confidence": 0.0 to 1.0,
      "extracted": { ... }
    }
  ]
}

For "new_contact", extracted should contain:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "phone number or empty string",
  "title": "job title or empty string",
  "company": "company name or empty string",
  "department": "department or empty string",
  "notes": "any additional context from the email"
}

For "consultant_request", extracted should contain:
{
  "title": "Short title for the request",
  "description": "Full description of what's needed",
  "required_skills": "comma-separated list of required skills/technologies",
  "role": "the role/position title",
  "client_name": "who is asking (person or company)",
  "client_email": "their email if available",
  "urgency": "low" | "normal" | "high" | "urgent"
}

For "todo", extracted should contain:
{
  "title": "Short actionable title (max 100 chars)",
  "description": "Fuller description of what needs to be done",
  "due_date": "YYYY-MM-DD if a date is mentioned, otherwise empty string"
}

Always extract as much information as possible. If a field is not available, use an empty string.`,
    messages: [{
      role: 'user',
      content: body
    }]
  });

  const text = response.content[0].text.trim();
  try {
    return JSON.parse(text);
  } catch (err) {
    // Try to extract a JSON object from the response. Guard the fallback parse
    // so a malformed match still produces a clear error message instead of a
    // cryptic low-level one like "Unexpected non-whitespace character after
    // JSON at position 4".
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (err2) { /* fall through to clean error */ }
    }
    throw new Error('Failed to parse AI classification response: ' + text.substring(0, 200));
  }
}

module.exports = { classifyEmail };
