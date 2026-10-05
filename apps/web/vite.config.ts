import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withPayload } from '@payloadcms/tanstack-start';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import rsc from '@vitejs/plugin-rsc';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Set WORKAROUND=1 to keep `lib` external, so Nitro resolves its zod from packages/lib.
const workaround = process.env.WORKAROUND === '1';
const external = workaround ? [/^lib(\/|$)/] : [];

export default defineConfig(
  withPayload(
    ({ pluginOptions }) => ({
      plugins: [
        rsc(pluginOptions.rsc),
        tanstackStart(pluginOptions.tanstackStart),
        viteReact(pluginOptions.react),
        nitro(pluginOptions.nitro),
      ],
      environments: {
        rsc: { build: { rollupOptions: { external } } },
        ssr: { build: { rollupOptions: { external } } },
      },
    }),
    { payloadConfigPath: path.resolve(dirname, 'src/payload.config.ts') },
  ),
);
