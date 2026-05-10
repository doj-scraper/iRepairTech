/**
 * Structured logger — wide-event pattern (one event per request, emitted at completion).
 *
 * Import this singleton everywhere. Do NOT create additional logger instances.
 * Vercel automatically captures stdout/stderr as structured log entries.
 */

const service = process.env.npm_package_name ?? 'irepair-v2';
const version = process.env.npm_package_version ?? 'unknown';
const region = process.env.VERCEL_REGION ?? 'local';
const commit = (process.env.VERCEL_GIT_COMMIT_SHA ?? 'local').slice(0, 8);

type LogLevel = 'info' | 'error';

function emit(level: LogLevel, event: Record<string, unknown>): void {
  const line = JSON.stringify({
    level,
    service,
    version,
    region,
    commit,
    timestamp: new Date().toISOString(),
    ...event,
  });
  if (level === 'error') {
    console.error(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (event: Record<string, unknown>) => emit('info', event),
  error: (event: Record<string, unknown>) => emit('error', event),
};
