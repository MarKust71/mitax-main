import { useContext } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { useAppDispatch, useAppSelector } from '../hooks';

import { CreateMemberDTO, Member } from './useMembers.types';
import { createMemberMutation } from './mutations/createMemberMutation';
import { fetchAllMembersQuery } from './queries/fetchAllMembersQuery';

import {
  setMembers,
  setMembersFetched,
  setMembersFetching,
} from '@/reducers/membersReducer/membersReducer';
import { FirebaseContext } from '@/providers/Providers';

export const useMembers = () => {
  const { db } = useContext(FirebaseContext);
  const dispatch = useAppDispatch();
  const members = useAppSelector((state) => state.members.members);

  const { mutateAsync, error, status } = useMutation({
    mutationFn: createMemberMutation,
    onSuccess: (data) => {
      return data;
    },
    onError: (error: unknown) => {
      console.error('Failed to create member:', { error });

      return error;
    },
  });

  const { refetch: fetchAll } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      try {
        const members: Member[] = await fetchAllMembersQuery({ db });

        dispatch(setMembers(members));
        dispatch(setMembersFetching(false));
        dispatch(setMembersFetched(true));

        return members;
      } catch (error: unknown) {
        dispatch(setMembersFetching(false));
        dispatch(setMembersFetched(false));

        console.error('Failed to fetch all members:', { error });

        throw error;
      }
    },
  });

  const addMember = async (data: CreateMemberDTO) => {
    return await mutateAsync({ data, db });
  };

  return { addMember, error, fetchAll, members, status };
};
