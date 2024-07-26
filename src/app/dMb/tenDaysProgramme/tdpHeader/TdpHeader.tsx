import React from 'react';
import { Box, useTheme } from '@mui/material';

import { TdpHeaderProps } from './TdpHeader.types';
import { useStyles } from './TdpHeader.styles';

export const TdpHeader: React.FC<TdpHeaderProps> = ({ children }) => {
  const theme = useTheme();
  const classes = useStyles(theme);

  return <Box className={classes.wrapper}>{children}</Box>;
};
