import { CreateUnitDTO } from '../../../hooks/useUnits/useUnits.types';

export type AddUnitProps = Record<string, never>;

export type AddUnitForm = CreateUnitDTO & {
  member: string;
  memberFrom: string;
  memberTo: string;
  share: number;
};
