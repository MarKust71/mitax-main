import React from 'react';
import { render, screen } from '@testing-library/react';

import { HousingCommunityDrawerContent } from './HousingCommunityDrawerContent';

describe('HousingCommunityDrawerContent', () => {
  test('renders', () => {
    render(<HousingCommunityDrawerContent onClick={() => null} />);
    const element = screen.getByText('HousingCommunityDrawerContent');
    expect(element).toBeInTheDocument();
  });
});
