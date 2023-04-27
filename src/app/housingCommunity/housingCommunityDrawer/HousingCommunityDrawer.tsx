import React from 'react';
import { Drawer, useTheme } from '@mui/material';

import { container, drawerWidth } from '../HousingCommunity.constants';

import { HousingCommunityDrawerProps } from './HousingCommunityDrawer.types';
import { useStyles } from './HousingCommunityDrawer.styles';
import { HousingCommunityDrawerContent } from './housingCommunityDrawerContent/HousingCommunityDrawerContent';

export const HousingCommunityDrawer: React.FC<HousingCommunityDrawerProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  const classes = useStyles(theme);

  return (
    <Drawer
      container={container}
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        display: { xs: 'block', sm: 'none' },
        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
      }}
    >
      <HousingCommunityDrawerContent onClick={onClose} />
    </Drawer>
  );
};
