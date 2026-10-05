import { payloadLayoutRoute } from '@payloadcms/tanstack-start/client';
import { createFileRoute } from '@tanstack/react-router';
import { getLayoutDataFn, serverFunctionHandler } from '@/app/_payload/server.functions';
import styles from '@/payload.css?url';

// From Payload's blank-tanstack template, minus its Google Fonts links (self-hosted only).
export const Route = createFileRoute('/_payload')({
  head: () => ({ links: [{ rel: 'stylesheet', href: styles }] }),
  ...payloadLayoutRoute({
    load: getLayoutDataFn,
    serverFunction: serverFunctionHandler,
  }),
});
