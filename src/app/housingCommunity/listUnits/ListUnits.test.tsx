import React from 'react';
import { render, screen } from '@testing-library/react';

import { ListUnits } from './ListUnits';

describe('ListUnits', () => {
  test('renders', () => {
    render(<ListUnits />);
    const element = screen.getByText('ListUnits');
    expect(element).toBeInTheDocument();
  });
});
