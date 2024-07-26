import React from 'react';
import { render, screen } from '@testing-library/react';

import { Jpk } from './Jpk';

describe('Jpk', () => {
  test('renders', () => {
    render(<Jpk />);
    const element = screen.getByText('Jpk');
    expect(element).toBeInTheDocument();
  });
});
