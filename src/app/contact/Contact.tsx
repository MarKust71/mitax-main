import React from 'react';
import { useTheme } from '@mui/material';

import { ContactProps } from './Contact.types';
import { useStyles } from './Contact.styles';

export const Contact: React.FC<ContactProps> = ({}) => {
  const theme = useTheme();
  const classes = useStyles(theme);

  return <>Contact</>;
  };
