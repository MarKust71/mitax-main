import type { AdminContext, AdminUserDetails, AdminUserListItem } from '../actions/adminTypes';
import type { AuditLogPage } from '../actions/auditLogTypes';
import type { AppSettingsValues } from '../actions/settingsTypes';

export type AdminPanelProps = {
  currentUserId: string;
  initialUsers: AdminUserListItem[];
  initialContexts: AdminContext[];
  initialAuditLog: AuditLogPage;
  initialSettings: AppSettingsValues;
};

export type UserDetailsProps = {
  user: AdminUserDetails;
  contexts: AdminContext[];
  isSelf: boolean;
  onSaved: (user: AdminUserListItem) => void;
};

export type ContextsPanelProps = {
  contexts: AdminContext[];
  onCreated: (context: AdminContext) => void;
  onModulesChanged: (contextId: string, modules: AdminContext['modules']) => void;
};

export type UsersPanelProps = {
  currentUserId: string;
  initialUsers: AdminUserListItem[];
  contexts: AdminContext[];
};

export type ActivityLogPanelProps = {
  contexts: AdminContext[];
  initialPage: AuditLogPage;
};

export type SettingsPanelProps = {
  initialSettings: AppSettingsValues;
};
