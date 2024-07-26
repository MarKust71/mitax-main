import { CreateMemberDTO } from '../../../hooks/useMembers/useMembers.types';

export type AddMemberProps = Record<string, never>;

export type AddMemberForm = CreateMemberDTO & {
  isAddress: boolean;
};
