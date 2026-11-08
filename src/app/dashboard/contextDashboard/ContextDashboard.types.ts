import type { ModuleKey } from '@/lib/modules';

export type ContextDashboardProps = {
  name: string;
  schemaName: string;
  contextId?: string;
  modules?: ModuleKey[];
};
