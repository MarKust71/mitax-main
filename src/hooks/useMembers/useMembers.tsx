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
    onSuccess: () => {
      console.log('Member created');
    },
    onError: (error: unknown) => {
      console.error('Failed to create member:', { error });
    },
  });

  const addMember = async (data: CreateMemberDTO) => {
    await mutate({ data, db });
  };

  const fetchAll = async () => {
    const members = await fetchAllMembersQuery({ db });

    dispatch(setMembers(members));
  };

  return { addMember, error, fetchAll, members, status };
};
