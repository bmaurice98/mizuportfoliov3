"use client";

import { DbConnection } from "../src/module_bindings";
import { SpacetimeDBProvider } from "spacetimedb/react";

const connectionBuilder = DbConnection.builder()
  .withUri(process.env.NEXT_PUBLIC_SPACETIMEDB_HOST!)
  .withDatabaseName(process.env.NEXT_PUBLIC_SPACETIMEDB_DB_NAME!)
  .withLightMode(true);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SpacetimeDBProvider connectionBuilder={connectionBuilder}>
      {children}
    </SpacetimeDBProvider>
  );
}
