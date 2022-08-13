import React from 'react';
import { render, screen } from '@testing-library/react';

import { Contact } from './Contact';

describe('Contact', () => {
  test('renders', () => {
    render(<Contact />);
    const element = screen.getByText('Contact');
    expect(element).toBeInTheDocument();
  });
});
