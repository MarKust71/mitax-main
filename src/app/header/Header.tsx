'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

import { AuthButton } from '../auth/authButton/AuthButton';
import packageJson from '../../../package.json';

import { HeaderProps } from './Header.types';
import { styles } from './Header.styles';


export const Header: React.FC<HeaderProps> = ({}) => {
  return (
    <Box component="header" sx={styles.wrapper}>
      <Typography variant="body2">{`Wersja: ${packageJson.version}`}</Typography>
      <AuthButton />
    </Box>
  );
};
