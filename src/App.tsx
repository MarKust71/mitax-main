import React from 'react';
// Import the functions you need from the SDKs you need
import { ThemeProvider } from '@mui/material';
import { Helmet } from 'react-helmet';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

import { theme } from './theme/theme';
import { MainRouter } from './routing/MainRouter';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBSFXzC2VBaDrWuHPynIVcQ_AQsp8fUTAk',
  authDomain: 'wspolnota-fd7f0.firebaseapp.com',
  projectId: 'wspolnota-fd7f0',
  storageBucket: 'wspolnota-fd7f0.appspot.com',
  messagingSenderId: '517464925433',
  appId: '1:517464925433:web:8fa1b1ea245d52bdb1ae28',
  measurementId: 'G-X0Q54QQVYW',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

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
