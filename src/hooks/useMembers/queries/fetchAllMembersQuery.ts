import { collection, Firestore, getDocs } from 'firebase/firestore';

import { Member } from '../useMembers.types';

type FetchAllMembersQuery = {
  db: Firestore;
};

export const fetchAllMembersQuery = async ({ db }: FetchAllMembersQuery): Promise<Member[]> => {
  try {
    const docRef = await getDocs(collection(db, 'members'));

    const returnValue = docRef.docs.map((doc) => ({ memberId: doc.id, ...doc.data() })) as Member[];

    return returnValue;
  } catch (error) {
    console.error('Error fetching members:', { error });

    return [];
  }
};
