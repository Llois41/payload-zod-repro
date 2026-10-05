import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { parsePort } from 'lib';
import { buildConfig } from 'payload';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: { user: 'users', importMap: { baseDir: dirname } },
  collections: [{ slug: 'users', auth: true, fields: [] }],
  secret: 'repro-secret',
  // `lib` imports zod; the app does not depend on zod.
  serverURL: `http://localhost:${parsePort('3000')}`,
  db: postgresAdapter({ pool: { connectionString: 'postgres://repro@127.0.0.1:5432/repro' } }),
});
