import { useContext } from 'react';
import { useMutation } from '@tanstack/react-query';

import { FirebaseContext } from '../../App';

import { CreateMemberDTO } from './useMembers.types';
import { createMemberMutation } from './mutations/createMemberMutation';

export const useMembers = () => {
  const { db } = useContext(FirebaseContext);

  const { mutate, error, status } = useMutation(createMemberMutation, {
    // Optional onSuccess callback
    onSuccess: () => {
      console.log('Member created');
      // Do something with the updated data
    },
    // Optional onError callback
    onError: (error: unknown) => {
      console.error('Failed to create member:', { error });
      // Handle the error
    },
  });

  const create = async (data: CreateMemberDTO) => {
    await mutate({ data, db });
  };

  return { create, status, error };
};
