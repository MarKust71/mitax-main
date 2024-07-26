import React from 'react';
import { render, screen } from '@testing-library/react';

import { Takamol } from './Takamol';

describe('Takamol', () => {
  test('renders', () => {
    render(<Takamol />);
    const element = screen.getByText('Takamol');
    expect(element).toBeInTheDocument();
  });
});
