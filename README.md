# payload-zod-repro

`withPayload`'s build externalizes leaf deps such as `zod` as bare imports, which fails under pnpm when a workspace package imports them.

## Versions

- `payload` / `@payloadcms/*` 4.0.0-canary.37
- Vite 8.3.2 (Rolldown 1.2.12), `nitro` 3.0.260903-beta, `@vitejs/plugin-rsc` 0.5.35
- pnpm 11.28.4 with isolated `node_modules` (the default), Node 26

## Reproduce

- `packages/lib` depends on `zod` and imports it; its exports point at `.ts` source.
- `apps/web` is the TanStack Start template; `payload.config.ts` imports `lib` (`workspace:*`). The app does not depend on `zod`.

```sh
pnpm install
pnpm build                 # fails
WORKAROUND=1 pnpm build    # passes
```

`pnpm build` fails in Nitro's pass:

```
Error: [vite]: Rolldown failed to resolve import "zod" from
"<app>/node_modules/.nitro/vite/services/rsc/assets/payload.config-….js".
```

`vite dev` works.

## Cause

`zod` is in `ssrExternalPackages` and not in `buildBundledPackages`, so it ends up in `buildExternalPackages`. That list goes into `environments.rsc` and `environments.ssr` as `build.rollupOptions.external`, and it matches the import name whatever the importer. So the RSC build:

1. inlines `lib`, because it is source and not external;
2. leaves its `import 'zod'` bare;
3. writes the chunk under the app's `node_modules/.nitro/…`.

Nitro then resolves `zod` from the chunk's location. Under pnpm's isolated layout, the app's `node_modules` only links the app's direct dependencies, so the lookup fails. `external.ts` already states the precondition this breaks: "Externalizing only works for specifiers resolvable from the project root."

It's the same class of bug that [#17365](https://github.com/payloadcms/payload/pull/17365) fixed for `pluralize` and [#17672](https://github.com/payloadcms/payload/pull/17672) for the storage SDKs (`buildBundledPackages`). Both fixes list packages by name, so they don't cover a leaf dep that comes in through the app's own workspace packages.

## Workaround

`WORKAROUND=1` in `apps/web/vite.config.ts` keeps the workspace package external as well, so Nitro reaches it by its real path and resolves `zod` from `packages/lib`:

```ts
environments: {
  rsc: { build: { rollupOptions: { external: [/^lib(\/|$)/] } } },
  ssr: { build: { rollupOptions: { external: [/^lib(\/|$)/] } } },
},
```

Nitro still bundles `lib` and `zod` into `.output/server`; nothing needs installing on the server.

## Possible fixes

- In the build, externalize a leaf dep only when the import resolves to the same file from the project root as from its importer, and bundle it otherwise. A `resolveId` hook can check both through Vite's own resolver.
- Or expose an option to take entries off the build externals. `mergeConfig` can only append, so users can't currently opt out of an entry like `zod`.
