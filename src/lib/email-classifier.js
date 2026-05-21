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
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: `You are an AI assistant that classifies incoming emails for a CRM system.
Analyze the email and classify it into one of three categories:

1. "new_contact" - The email introduces a person or contains contact information for someone who should be added to the contact database. This includes introductions, business cards, "meet our new colleague" emails, etc.

2. "consultant_request" - The email contains a request for a consultant, contractor, or resource. It describes a role/position to fill, skills needed, or asks if you have someone available for a project/assignment.

3. "todo" - The email contains a task, action item, or request for you to do something that doesn't fit the other categories. Meeting requests, follow-up reminders, document requests, etc.

Respond with a JSON object (no markdown, just raw JSON) with this structure:
{
  "classification": "new_contact" | "consultant_request" | "todo",
  "confidence": 0.0 to 1.0,
  "extracted": { ... }
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

Always extract as much information as possible from the email. If a field is not available, use an empty string.`,
    messages: [{
      role: 'user',
      content: `From: ${fromName ? fromName + ' <' + fromEmail + '>' : fromEmail}
Subject: ${subject || '(no subject)'}

${body}`
    }]
  });

  const text = response.content[0].text.trim();
  try {
    return JSON.parse(text);
  } catch (err) {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse AI classification response: ' + text.substring(0, 200));
  }
}

module.exports = { classifyEmail };
