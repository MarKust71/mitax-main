import React from 'react';
import { render, screen } from '@testing-library/react';

import { HousingCommunityDrawer } from './HousingCommunityDrawer';

describe('HousingCommunityDrawer', () => {
  test('renders', () => {
    render(<HousingCommunityDrawer onClose={() => null} open={false} />);
    const element = screen.getByText('HousingCommunityDrawer');
    expect(element).toBeInTheDocument();
  });
});
