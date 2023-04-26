import { useContext } from 'react';
import { useMutation } from '@tanstack/react-query';

import { FirebaseContext } from '../../App';
import { setMembers } from '../../reducers/membersReducer/membersReducer';
import { useAppDispatch, useAppSelector } from '../hooks';

import { CreateMemberDTO } from './useMembers.types';
import { createMemberMutation } from './mutations/createMemberMutation';
import { fetchAllMembersQuery } from './queries/fetchAllMembersQuery';

export const useMembers = () => {
  const { db } = useContext(FirebaseContext);
  const dispatch = useAppDispatch();
  const members = useAppSelector((state) => state.members.value);

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

  const fetchAll = async () => {
    const members = await fetchAllMembersQuery({ db });

    dispatch(setMembers(members));
  };

  return { create, error, fetchAll, members, status };
};
