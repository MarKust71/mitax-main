import { addDoc, collection } from 'firebase/firestore';

import { CreateUnitMutation } from '../useUnits.types';

export const createUnitMutation = async ({ db, data }: CreateUnitMutation) => {
  try {
    const docRef = await addDoc(collection(db, 'units'), data);

    console.log('Document written with ID: ', docRef.id);

    return docRef.id;
  } catch (error) {
    console.error('Error adding document: ', { error });

    return error;
  }
};
