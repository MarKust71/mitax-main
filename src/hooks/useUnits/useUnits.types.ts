import { Firestore } from 'firebase/firestore';

import { MemberWithPeriod } from '../useMembers/useMembers.types';

export type Unit = {
  unitId?: string;
  unitNumber: string;
  members: MemberWithPeriod[];
  isCommercial: boolean;
};

export type CreateUnitDTO = Omit<Unit, 'unitId'>;

export type CreateUnitMutation = {
  db: Firestore;
  data: CreateUnitDTO;
};
