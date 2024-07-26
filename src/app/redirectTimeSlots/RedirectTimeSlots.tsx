import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';

import { RedirectTimeSlotsProps } from './RedirectTimeSlots.types';

export const RedirectTimeSlots: React.FC<RedirectTimeSlotsProps> = () => {
  useEffect(() => {
    window.location.href = 'https://calendar.app.google/s5yvfuHrX3wmULvi9';
  }, []);

  return (
    <>
      <Helmet>
        <title>Marek Kustosz - terminy</title>
      </Helmet>

      <h5>Lecimy do kalendarza...</h5>
    </>
  );
};
