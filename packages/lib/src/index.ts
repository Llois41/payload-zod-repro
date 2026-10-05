import { z } from 'zod';

export function parsePort(value: string): number {
  return z.coerce.number().int().positive().parse(value);
}
