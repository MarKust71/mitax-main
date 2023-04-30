import { useContext } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { FirebaseContext } from '../../App';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  setUnits,
  setUnitsFetched,
  setUnitsFetching,
} from '../../reducers/unitsReducer/unitsReducer';

import { createUnitMutation } from './mutations/createUnitMutation';
import { CreateUnitDTO, Unit } from './useUnits.types';
import { fetchAllUnitsQuery } from './queries/fetchAllUnitsQuery';

export const useUnits = () => {
  const { db } = useContext(FirebaseContext);
  const dispatch = useAppDispatch();
  const units = useAppSelector((state) => state.units.units);

  const { mutate, error, status } = useMutation(createUnitMutation, {
    onSuccess: () => {
      console.log('Unit created');
    },
    onError: (error: unknown) => {
      console.error('Failed to create unit:', { error });
    },
  });

  const { refetch: fetchAll } = useQuery({
    queryKey: ['units'],
    queryFn: () => fetchAllUnitsQuery({ db }),
    onSuccess: (units: Unit[]) => {
      dispatch(setUnits(units));
      dispatch(setUnitsFetching(false));
      dispatch(setUnitsFetched(true));
    },
    onError: (error: unknown) => {
      dispatch(setUnitsFetching(false));
      dispatch(setUnitsFetched(false));

      console.error('Failed to fetch all units:', { error });
    },
  });

  const addUnit = async (data: CreateUnitDTO) => {
    const result = await mutate({ db, data });

    // TODO: remove!
    console.log('addUnit:', { result });

    return result;
  };

  return { addUnit, error, fetchAll, status, units };
};
