import React from 'react';
import { render, screen } from '@testing-library/react';

import { HousingCommunity } from './HousingCommunity';

describe('HousingCommunity', () => {
  test('renders', () => {
    render(<HousingCommunity />);
    const element = screen.getByText('HousingCommunity');
    expect(element).toBeInTheDocument();
  });
});
