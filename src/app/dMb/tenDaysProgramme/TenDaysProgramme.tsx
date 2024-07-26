import React from 'react';
import { Box, Container, Typography, useTheme } from '@mui/material';

import { TenDaysProgrammeProps } from './TenDaysProgramme.types';
import { useStyles } from './TenDaysProgramme.styles';
import { TdpHeader } from './tdpHeader/TdpHeader';

export const TenDaysProgramme: React.FC<TenDaysProgrammeProps> = ({}) => {
  const theme = useTheme();
  const classes = useStyles(theme);

  return (
    <Container fixed className={classes.container}>
      <TdpHeader>
        <Typography
          variant={'h1'}
          fontWeight={theme.typography.fontWeightBold}
          fontSize={'12rem'}
          pr={'2rem'}
        >
          10-
        </Typography>

        <Box
          sx={{
            textAlign: 'center',
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography
              sx={{
                color: theme.palette.background.paper,
                backgroundColor: theme.palette.primary.main,
                opacity: '0.4',
                fontSize: '1.5rem',
                flexGrow: '0',
                padding: '0 1rem',
              }}
            >
              RAZEM ŁATWIEJ
            </Typography>
          </Box>

          <Box mt={2} />

          <Typography variant={'h3'} component={'h2'}>
            DNIOWY PROGRAM
          </Typography>

          <Typography variant={'h3'} component={'h2'}>
            dMb Global
          </Typography>
        </Box>
      </TdpHeader>

      <Box pt={2} mb={2} sx={{ backgroundColor: theme.palette.primary.main, opacity: '0.4' }} />
    </Container>
  );
};
