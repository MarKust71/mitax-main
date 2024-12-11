import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';

import { RedirectKomornikPlanPodzialuWykonanieProps } from './RedirectKomornikPlanPodzialuWykonanie.types';

export const RedirectKomornikPlanPodzialuWykonanie: React.FC<
  RedirectKomornikPlanPodzialuWykonanieProps
> = ({}) => {
  useEffect(() => {
    window.location.href =
      'https://docs.google.com/spreadsheets/d/1FCiWdK1DWRrvfNfNgz0zlbicjZdvKM4g-HLHWLvn6iA/edit?usp=sharing';
  }, []);

  return (
    <>
      <Helmet>
        <title>Marek Kustosz - plan podziału - wykonanie</title>
      </Helmet>

      <h5>Lecimy do formularza...</h5>
    </>
  );
};
