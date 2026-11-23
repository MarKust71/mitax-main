import React from 'react';
import { render, screen } from '@testing-library/react';

import { Privacy } from './Privacy';

describe('Privacy', () => {
  test('renders the heading and the controller details', () => {
    render(<Privacy />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Polityka prywatności' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/MITAX Consulting sp\. z o\.o\./).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/6152043432/).length).toBeGreaterThan(0);
  });

  test('mentions LinkedIn', () => {
    render(<Privacy />);

    expect(screen.getByRole('heading', { name: /LinkedIn/ })).toBeInTheDocument();
  });
});
