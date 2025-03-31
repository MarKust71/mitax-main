import React from 'react';
import { Fab, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

import { HousingCommunity } from '../HousingCommunity';
import { MainRoutes } from '../../../routing/MainRouter.constants';

import { ListUnitsProps } from './ListUnits.types';

export const ListUnits: React.FC<ListUnitsProps> = ({}) => {
  const navigate = useNavigate();

  const handleAddUnitButtonClick = () => {
    navigate(MainRoutes.HC_UNIT_NEW);
  };

  return (
    <HousingCommunity>
      <Typography variant="h6">Lokale</Typography>

      <Fab
        color="secondary"
        sx={{
          bottom: 16,
          position: 'absolute',
          right: 16,
        }}
        aria-label="add"
        onClick={handleAddUnitButtonClick}
      >
        <AddIcon />
      </Fab>
    </HousingCommunity>
  );
};
