'use client';

import React from 'react';
import Link from 'next/link';
import { Box, List, ListItemButton, ListItemText, Typography } from '@mui/material';

import { DashboardProps } from './Dashboard.types';
import { dashboardLinks } from './Dashboard.constants';

export const Dashboard: React.FC<DashboardProps> = ({}) => {
  return (
    <Box p={2}>
      <Typography variant="h6">Dashboard</Typography>

      <List>
        {dashboardLinks.map(({ label, route }) => (
          <ListItemButton key={route} component={Link} href={route}>
            <ListItemText primary={label} secondary={route} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};
