// Loads Jira auth from local .env only; never logs the token or Authorization header.
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import process from 'node:process';

function loadEnvFile() {
  if (!existsSync('.env')) return;
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`BLOCKER: missing ${name}. Copy .env.example to .env and fill it in.`);
    process.exit(1);
  }
  return value;
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      out[arg.slice(2)] = argv[i + 1];
      i += 1;
    }
  }
  return out;
}

loadEnvFile();
const [command] = process.argv.slice(2);
const args = parseArgs(process.argv.slice(3));

const RESPONSE_DIR = 'jira';

function redactIssueResponse(body) {
  const fields = body?.fields ?? {};
  return {
    key: body?.key,
    summary: fields.summary,
    description: fields.description,
    environment: fields.environment,
    issuetype: fields.issuetype?.name,
    status: fields.status?.name
  };
}

async function jiraFetch(path, init) {
  const baseUrl = requireEnv('JIRA_BASE_URL').replace(/\/+$/, '');
  const pat = requireEnv('JIRA_PAT');
  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${pat}`
      }
    });
  } catch (error) {
    console.error(`BLOCKER: network error calling ${path} (${error.message})`);
    process.exit(1);
  }
  if (!response.ok) {
    console.error(`BLOCKER: ${response.status} ${response.statusText} from ${path}`);
    process.exit(1);
  }
  if (response.status === 204) return null;
  return response.json();
}

if (command === 'whoami') {
  const projectKey = requireEnv('JIRA_PROJECT_KEY');
  const user = await jiraFetch('/rest/api/2/myself', { method: 'GET' });
  const project = await jiraFetch(`/rest/api/2/project/${projectKey}`, { method: 'GET' });
  console.log(`Connected as: ${user.displayName ?? user.name ?? '[unknown]'}`);
  console.log(`Project access: ${project.key} — ${project.name}`);
} else if (command === 'preview') {
  const projectKey = requireEnv('JIRA_PROJECT_KEY');
  if (!args.summary) {
    console.error('BLOCKER: --summary is required');
    process.exit(1);
  }
  const payload = {
    fields: {
      project: { key: projectKey },
      summary: args.summary,
      issuetype: { name: 'Bug' },
      description: args.description ?? '',
      environment: args.environment ?? ''
    }
  };
  mkdirSync(RESPONSE_DIR, { recursive: true });
  const outPath = args.out ?? `${RESPONSE_DIR}/issue-payload.json`;
  writeFileSync(outPath, JSON.stringify(payload, null, 2));
  console.log(`Preview written to ${outPath} (destination project: ${projectKey}, issuetype: Bug)`);
  console.log(JSON.stringify(payload, null, 2));
} else if (command === 'create') {
  const payloadPath = args.payload ?? `${RESPONSE_DIR}/issue-payload.json`;
  if (!existsSync(payloadPath)) {
    console.error(`BLOCKER: payload file not found at ${payloadPath}. Run "preview" first.`);
    process.exit(1);
  }
  const payload = JSON.parse(readFileSync(payloadPath, 'utf8'));
  const body = await jiraFetch('/rest/api/2/issue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  mkdirSync(RESPONSE_DIR, { recursive: true });
  writeFileSync(`${RESPONSE_DIR}/create-response.json`, JSON.stringify(body, null, 2));
  console.log(`Created: id=${body.id} key=${body.key} self=${body.self}`);
} else if (command === 'read') {
  const key = args.key ?? (() => {
    console.error('BLOCKER: --key is required');
    process.exit(1);
  })();
  const body = await jiraFetch(`/rest/api/2/issue/${key}`, { method: 'GET' });
  mkdirSync(RESPONSE_DIR, { recursive: true });
  writeFileSync(`${RESPONSE_DIR}/read-response.json`, JSON.stringify(body, null, 2));
  console.log(JSON.stringify(redactIssueResponse(body), null, 2));
  console.log(`(full response saved to ${RESPONSE_DIR}/read-response.json, gitignored, not printed)`);
} else if (command === 'update') {
  const key = args.key ?? (() => {
    console.error('BLOCKER: --key is required');
    process.exit(1);
  })();
  const payloadPath = args.payload ?? `${RESPONSE_DIR}/issue-update.json`;
  if (!existsSync(payloadPath)) {
    console.error(`BLOCKER: payload file not found at ${payloadPath}.`);
    process.exit(1);
  }
  const payload = JSON.parse(readFileSync(payloadPath, 'utf8'));
  await jiraFetch(`/rest/api/2/issue/${key}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  console.log(`Updated: key=${key} (PUT has no response body in Jira REST v2; run "read" to verify)`);
} else {
  console.error('Usage: node scripts/jira-request.mjs <whoami|preview|create|read|update> [--summary ..] [--description ..] [--environment ..] [--payload ..] [--key ..] [--out ..]');
  process.exit(1);
}
