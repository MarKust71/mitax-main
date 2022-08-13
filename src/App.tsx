import React from 'react';
import { ThemeProvider } from '@mui/material';
import { Helmet } from 'react-helmet';

import { theme } from './theme/theme';
import { MainRouter } from './routing/MainRouter';

export const App = () => {
  return (
    <>
      <Helmet>
        <title>MITAX Consulting sp. z o.o.</title>
      </Helmet>
      <ThemeProvider theme={theme}>
        <MainRouter />
      </ThemeProvider>
    </>
  );
};
