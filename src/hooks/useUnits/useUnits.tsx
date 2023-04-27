import { useContext } from 'react';
import { useMutation } from '@tanstack/react-query';

import { FirebaseContext } from '../../App';
import { useAppDispatch, useAppSelector } from '../hooks';
import { setUnits } from '../../reducers/unitsReducer/unitsReducer';

import { createUnitMutation } from './mutations/createUnitMutation';
import { CreateUnitDTO } from './useUnits.types';
import { fetchAllUnitsQuery } from './queries/fetchAllUnitsQuery';

export const useUnits = () => {
  const { db } = useContext(FirebaseContext);
  const dispatch = useAppDispatch();
  const units = useAppSelector((state) => state.units.value);

  const { mutate, error, status } = useMutation(createUnitMutation, {
    onSuccess: () => {
      console.log('Unit created');
    },
    onError: (error: unknown) => {
      console.error('Failed to create unit:', { error });
    },
  });

  const addUnit = async (data: CreateUnitDTO) => {
    await mutate({ db, data });
  };

  const fetchAll = async () => {
    const units = await fetchAllUnitsQuery({ db });

    dispatch(setUnits(units));
  };

  return { addUnit, error, fetchAll, status, units };
};
