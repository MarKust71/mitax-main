import { useContext } from 'react';
import { useMutation } from '@tanstack/react-query';

import { FirebaseContext } from '../../App';

import { createUnitMutation } from './mutations/createUnitMutation';
import { CreateUnitDTO } from './useUnits.types';

export const useUnits = () => {
  const { db } = useContext(FirebaseContext);

  const { mutate, error, status } = useMutation(createUnitMutation, {
    // Optional onSuccess callback
    onSuccess: () => {
      console.log('Unit created');
      // Do something with the updated data
    },
    // Optional onError callback
    onError: (error: unknown) => {
      console.error('Failed to create unit:', { error });
      // Handle the error
    },
  });

  const create = async (data: CreateUnitDTO) => {
    await mutate({ db, data });
  };

  return { create, error, status };
};
