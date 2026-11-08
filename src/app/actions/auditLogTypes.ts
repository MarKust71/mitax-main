export type AuditLogEntry = {
  id: string;
  createdAt: string; // ISO
  userEmail: string;
  contextId: string | null;
  contextName: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  details: Record<string, unknown> | null;
};

export type AuditLogFilters = { contextId?: string; action?: string; user?: string };

// Position in the log (full-precision timestamp + id) from which the next page starts.
export type AuditLogCursor = { createdAt: string; id: string };

export type AuditLogPage = { entries: AuditLogEntry[]; nextCursor: AuditLogCursor | null };
