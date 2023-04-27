import { Firestore } from 'firebase/firestore';

import { MemberWithPeriod } from '../useMembers/useMembers.types';

export type Unit = {
  unitId?: string;
  unitNumber: number;
  members: MemberWithPeriod[];
  isCommercial: boolean;
};

export type CreateUnitDTO = {
  unitNumber: number;
  members: MemberWithPeriod[];
  isCommercial: boolean;
};

export type CreateUnitMutation = {
  db: Firestore;
  data: CreateUnitDTO;
};
