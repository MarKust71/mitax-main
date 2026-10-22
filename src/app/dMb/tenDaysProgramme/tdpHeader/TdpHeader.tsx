import React from 'react';
import { Box } from '@mui/material';

import { TdpHeaderProps } from './TdpHeader.types';
import { styles } from './TdpHeader.styles';

export const TdpHeader: React.FC<TdpHeaderProps> = ({ children }) => {
  return <Box sx={styles.wrapper}>{children}</Box>;
};
