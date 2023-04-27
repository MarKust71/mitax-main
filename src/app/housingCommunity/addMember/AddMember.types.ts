import { CreateMemberDTO, MemberWithPeriod } from '../../../hooks/useMembers/useMembers.types';

export type AddMemberProps = Record<string, never>;

export type AddMemberForm = CreateMemberDTO &
  Omit<MemberWithPeriod, 'member'> & {
    isAddress: boolean;
  };
