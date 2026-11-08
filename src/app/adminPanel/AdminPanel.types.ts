import type { AdminContext, AdminUserDetails, AdminUserListItem } from '../actions/adminTypes';

export type AdminPanelProps = {
  currentUserId: string;
  initialUsers: AdminUserListItem[];
  initialContexts: AdminContext[];
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
};

export type UsersPanelProps = {
  currentUserId: string;
  initialUsers: AdminUserListItem[];
  contexts: AdminContext[];
};
