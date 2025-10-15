import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';

import { RedirectKuMamyBiznesProps } from './RedirectKuMamyBiznes.types';

export const RedirectKuMamyBiznes: React.FC<RedirectKuMamyBiznesProps> = ({}) => {
  useEffect(() => {
    window.location.href =
      'https://drive.google.com/drive/folders/1TNcAQqnsfNfkO9BaQ5HKUKwLAfVPOUOk?usp=sharing';
  }, []);

  return (
    <>
      <Helmet>
        <title>Marek Kustosz - KuMamyBiznes</title>
      </Helmet>

      <h5>Lecimy do dysku Google...</h5>
    </>
  );
};
