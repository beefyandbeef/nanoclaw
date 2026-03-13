import { CronExpressionParser } from 'cron-parser';

import { TIMEZONE } from './config.js';

/**
 * Compute the next ISO timestamp for a cron expression.
 * Throws if the expression is invalid or produces no next date.
 */
export function nextCronRun(cronExpression: string): string {
  const interval = CronExpressionParser.parse(cronExpression, { tz: TIMEZONE });
  const iso = interval.next().toISOString();
  if (!iso) throw new Error(`Cron expression produced no next date: ${cronExpression}`);
  return iso;
}
