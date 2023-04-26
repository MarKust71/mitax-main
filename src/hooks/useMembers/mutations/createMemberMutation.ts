import { addDoc, collection } from 'firebase/firestore';

import { CreateMemberMutation } from '../useMembers.types';

export const createMemberMutation = async ({ db, data }: CreateMemberMutation) => {
  try {
    const docRef = await addDoc(collection(db, 'members'), data);

    console.log('Document written with ID: ', docRef.id);
  } catch (error) {
    console.error('Error adding document: ', { error });
  }
};
