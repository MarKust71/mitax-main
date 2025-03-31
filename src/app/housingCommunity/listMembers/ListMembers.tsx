import React, { useEffect } from 'react';
import { Fab, List, ListItem, ListItemText, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

import { HousingCommunity } from '../HousingCommunity';
import { useAppSelector } from '../../../hooks/hooks';
import { useMembers } from '../../../hooks/useMembers/useMembers';
import { MainRoutes } from '../../../routing/MainRouter.constants';

import { ListMembersProps } from './ListMembers.types';

export const ListMembers: React.FC<ListMembersProps> = ({}) => {
  const { fetchAll } = useMembers();
  const navigate = useNavigate();

  const { members, isFetched, isFetching } = useAppSelector((state) => state.members);

  const handleAddMemberButtonClick = () => {
    navigate(MainRoutes.HC_MEMBER_NEW);
  };

  useEffect(() => {
    if (!isFetched && !isFetching) {
      console.log('fetching members...');
      fetchAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetched, isFetching]);

  return (
    <HousingCommunity>
      <Typography variant="h6">Właściciele</Typography>

      <List
        sx={{
          width: '100%',
          maxWidth: 360,
          bgcolor: 'background.paper',
        }}
      >
        {members.map((member) => (
          <>
            <ListItem sx={{ paddingLeft: 0 }} divider key={member.memberId}>
              <ListItemText>{`${member.lastName}, ${member.firstName}`}</ListItemText>
            </ListItem>
          </>
        ))}
      </List>

      <Fab
        color="secondary"
        sx={{
          bottom: 16,
          position: 'absolute',
          right: 16,
        }}
        aria-label="add"
        onClick={handleAddMemberButtonClick}
      >
        <AddIcon />
      </Fab>
    </HousingCommunity>
  );
};
