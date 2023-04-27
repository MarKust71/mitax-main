import { collection, Firestore, getDocs } from 'firebase/firestore';

type FetchAllUnitsQuery = {
  db: Firestore;
};

export const fetchAllUnitsQuery = async ({ db }: FetchAllUnitsQuery) => {
  try {
    const docRef = await getDocs(collection(db, 'units'));

    const returnValue = docRef.docs.map((doc) => ({ unitId: doc.id, ...doc.data() }));

    return returnValue;
  } catch (error) {
    console.error('Error fetching units:', { error });

    return [];
  }
};
