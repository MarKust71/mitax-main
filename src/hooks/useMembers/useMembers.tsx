import { useContext } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { FirebaseContext } from '../../App';
import {
  setMembers,
  setMembersFetched,
  setMembersFetching,
} from '../../reducers/membersReducer/membersReducer';
import { useAppDispatch, useAppSelector } from '../hooks';

import { CreateMemberDTO, Member } from './useMembers.types';
import { createMemberMutation } from './mutations/createMemberMutation';
import { fetchAllMembersQuery } from './queries/fetchAllMembersQuery';

export const useMembers = () => {
  const { db } = useContext(FirebaseContext);
  const dispatch = useAppDispatch();
  const members = useAppSelector((state) => state.members.members);

  const { mutate, error, status } = useMutation(createMemberMutation, {
    onSuccess: () => {
      console.log('Member created');
    },
    onError: (error: unknown) => {
      console.error('Failed to create member:', { error });
    },
  });

  const { refetch: fetchAll } = useQuery({
    queryKey: ['members'],
    queryFn: () => fetchAllMembersQuery({ db }),
    onSuccess: (members: Member[]) => {
      dispatch(setMembers(members));
      dispatch(setMembersFetching(false));
      dispatch(setMembersFetched(true));
    },
    onError: (error: unknown) => {
      dispatch(setMembersFetching(false));
      dispatch(setMembersFetched(false));

      console.error('Failed to fetch all members:', { error });
    },
  });

  const addMember = async (data: CreateMemberDTO) => {
    await mutate({ data, db });
  };

  return { addMember, error, fetchAll, members, status };
};
