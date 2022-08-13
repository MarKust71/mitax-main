import React from 'react';
import { Box, Link, Typography, useTheme } from '@mui/material';

import { MainProps } from './Main.types';
import { useStyles } from './Main.styles';

export const Main: React.FC<MainProps> = ({}) => {
  const theme = useTheme();
  const classes = useStyles(theme);

  return (
    <Box className={classes.wrapper}>
      <Typography variant="h6">{'MITAX Consulting sp. z o.o.'}</Typography>
      <Box mb={2} />
      <Typography>ul. Warszawska 4/8</Typography>
      <Typography>59-900 Zgorzelec</Typography>
      <Typography>
        mail: <Link href={'mailto: biuro@mitax.pl'}>biuro@mitax.pl</Link>
      </Typography>
      <Box mb={2} />
      <Typography>NIP 6152043432, REGON 022210312, VAT-ID PL6152043432, KRS 0000473064</Typography>
      <Typography>
        Rejestr Przedsiębiorców - Sąd Rejonowy dla Wrocławia-Fabrycznej, IX Wydział Gospodarczy KRS
      </Typography>
      <Typography>Kapitał zakładowy 5.000,- PLN</Typography>
    </Box>
  );
};
