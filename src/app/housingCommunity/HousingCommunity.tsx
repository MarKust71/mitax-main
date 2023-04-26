import React from 'react';
import { useTheme } from '@mui/material';

import { HousingCommunityProps } from './HousingCommunity.types';
import { useStyles } from './HousingCommunity.styles';

export const HousingCommunity: React.FC<HousingCommunityProps> = ({}) => {
  const theme = useTheme();
  const classes = useStyles(theme);

  return <>HousingCommunity</>;
  };
