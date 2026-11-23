/* eslint-disable max-len -- legal prose, long sentences are intentional */
import type { Metadata } from 'next';

import { Privacy } from './Privacy';

export const metadata: Metadata = {
  title: 'Polityka prywatności - MITAX Consulting sp. z o.o.',
  description:
    'Polityka prywatności serwisu MITAX Consulting sp. z o.o. - zasady przetwarzania danych osobowych, w tym danych pozyskiwanych z API LinkedIn.',
};

export default function Page() {
  return <Privacy />;
}
