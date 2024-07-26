import { Firestore } from 'firebase/firestore';

import { MemberWithPeriod } from '../useMembers/useMembers.types';

export type Unit = {
  isCommercial: boolean;
  isKdr: boolean;
  kdrFrom: string;
  kdrTo: string;
  members: MemberWithPeriod[];
  unitId?: string;
  unitNumber: string;
};

export type CreateUnitDTO = Omit<Unit, 'unitId'>;

export type CreateUnitMutation = {
  db: Firestore;
  data: CreateUnitDTO;
};
