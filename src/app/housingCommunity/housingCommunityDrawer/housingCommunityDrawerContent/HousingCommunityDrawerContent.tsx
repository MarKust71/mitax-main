import React from 'react';
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  useTheme,
} from '@mui/material';

import { appTitle, navItems } from '../../HousingCommunity.constants';

import { HousingCommunityDrawerContentProps } from './HousingCommunityDrawerContent.types';
import { useStyles } from './HousingCommunityDrawerContent.styles';

export const HousingCommunityDrawerContent: React.FC<HousingCommunityDrawerContentProps> = ({
  onClick,
}) => {
  const theme = useTheme();
  const classes = useStyles(theme);

  return (
    <Box onClick={onClick} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        {appTitle}
      </Typography>

      <Divider />

      <List>
        {navItems.map((item) => (
          <ListItem key={item} disablePadding>
            <ListItemButton sx={{ textAlign: 'center' }}>
              <ListItemText primary={item} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
