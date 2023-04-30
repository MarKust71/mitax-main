import { addDoc, collection } from 'firebase/firestore';

import { CreateMemberMutation } from '../useMembers.types';

export const createMemberMutation = async ({ db, data }: CreateMemberMutation) => {
  try {
    const docRef = await addDoc(collection(db, 'members'), data);

    return docRef.id;
  } catch (error) {
    console.error('Error adding document: ', { error });

    return error;
  }
};
