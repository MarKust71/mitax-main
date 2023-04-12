import React, { useEffect } from 'react';

import { RedirectTimeSlotsProps } from './RedirectTimeSlots.types';

export const RedirectTimeSlots: React.FC<RedirectTimeSlotsProps> = () => {
  useEffect(() => {
    window.location.href = 'https://calendar.app.google/VMWMxmTkqL4GhxKdA';
  }, []);

  return <h5>Lecimy do kalendarza...</h5>;
};
