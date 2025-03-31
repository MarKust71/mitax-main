import React from 'react';
import { useTheme } from '@mui/material';

import { TakamolProps } from './Takamol.types';
import { useStyles } from './Takamol.styles';

export const Takamol: React.FC<TakamolProps> = ({}) => {
  const theme = useTheme();
  const classes = useStyles(theme);

  return <>Takamol</>;
};
