import { Firestore } from 'firebase/firestore';

export type Address = {
  city: string;
  name: string;
  state: string;
  street: string;
  zip: string;
};

export type Member = {
  address: Address | null;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

export type MemberWithPeriod = {
  member: Member;
  memberFrom: string;
  memberTo: string | null;
};

export type CreateMemberDTO = Member;

export type CreateMemberMutation = {
  data: CreateMemberDTO;
  db: Firestore;
};