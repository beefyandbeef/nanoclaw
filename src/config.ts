import os from 'os';
import path from 'path';

import { readEnvFile } from './env.js';

// Read config values from .env (falls back to process.env).
// Secrets (API keys, tokens) are NOT read here — they are loaded only
// by the credential proxy (credential-proxy.ts), never exposed to containers.
const envConfig = readEnvFile([
  'ASSISTANT_NAME',
  'ASSISTANT_HAS_OWN_NUMBER',
  'AGENT_MODEL',
  'AGENT_SMALL_MODEL',
]);

export const ASSISTANT_NAME =
  process.env.ASSISTANT_NAME || envConfig.ASSISTANT_NAME || 'Andy';
export const ASSISTANT_HAS_OWN_NUMBER =
  (process.env.ASSISTANT_HAS_OWN_NUMBER ||
    envConfig.ASSISTANT_HAS_OWN_NUMBER) === 'true';
export const POLL_INTERVAL = 2000;
export const SCHEDULER_POLL_INTERVAL = 60000;

// Absolute paths needed for container mounts
const PROJECT_ROOT = process.cwd();
const HOME_DIR = process.env.HOME || os.homedir();

// Mount security: allowlist stored OUTSIDE project root, never mounted into containers
export const MOUNT_ALLOWLIST_PATH = path.join(
  HOME_DIR,
  '.config',
  'nanoclaw',
  'mount-allowlist.json',
);
export const SENDER_ALLOWLIST_PATH = path.join(
  HOME_DIR,
  '.config',
  'nanoclaw',
  'sender-allowlist.json',
);
export const STORE_DIR = path.resolve(PROJECT_ROOT, 'store');
export const GROUPS_DIR = path.resolve(PROJECT_ROOT, 'groups');
export const DATA_DIR = path.resolve(PROJECT_ROOT, 'data');

export const CONTAINER_IMAGE =
  process.env.CONTAINER_IMAGE || 'nanoclaw-agent:latest';
export const CONTAINER_TIMEOUT =
  parseInt(process.env.CONTAINER_TIMEOUT || '', 10) || 1800000;
export const CONTAINER_MAX_OUTPUT_SIZE =
  parseInt(process.env.CONTAINER_MAX_OUTPUT_SIZE || '', 10) || 10485760; // 10MB default
export const CREDENTIAL_PROXY_PORT =
  parseInt(process.env.CREDENTIAL_PROXY_PORT || '', 10) || 3001;
export const IPC_POLL_INTERVAL = 1000;
export const IDLE_TIMEOUT =
  parseInt(process.env.IDLE_TIMEOUT || '', 10) || 1800000; // 30min default — how long to keep container alive after last result
export const CONTAINER_GRACE_MS =
  parseInt(process.env.CONTAINER_GRACE_MS || '', 10) || 30_000; // Grace period between idle timeout and hard kill
export const CONTAINER_MEMORY_LIMIT = process.env.CONTAINER_MEMORY_LIMIT || ''; // e.g. "2g", "512m" — empty = no limit
export const CONTAINER_CPU_LIMIT = process.env.CONTAINER_CPU_LIMIT || ''; // e.g. "1.5" (cores) — empty = no limit

// Model selection — controls which Claude model runs inside agent containers.
// AGENT_MODEL:       primary model for all agent turns (default: claude-haiku-4-5)
// AGENT_SMALL_MODEL: fast model for sub-agents and background tasks (default: same as AGENT_MODEL)
// Set either in .env to override, e.g. AGENT_MODEL=claude-sonnet-4-6 for harder tasks.
export const AGENT_MODEL =
  process.env.AGENT_MODEL ||
  envConfig.AGENT_MODEL ||
  'claude-haiku-4-5';
export const AGENT_SMALL_MODEL =
  process.env.AGENT_SMALL_MODEL ||
  envConfig.AGENT_SMALL_MODEL ||
  AGENT_MODEL; // fall back to main model if not set separately
export const MAX_CONCURRENT_CONTAINERS = Math.max(
  1,
  parseInt(process.env.MAX_CONCURRENT_CONTAINERS || '5', 10) || 5,
);

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const TRIGGER_PATTERN = new RegExp(
  `^@${escapeRegex(ASSISTANT_NAME)}\\b`,
  'i',
);

// Timezone for scheduled tasks (cron expressions, etc.)
// Uses system timezone by default
export const TIMEZONE =
  process.env.TZ || Intl.DateTimeFormat().resolvedOptions().timeZone;
