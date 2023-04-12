import React from 'react';
import { render, screen } from '@testing-library/react';

import { RedirectTimeSlots } from './RedirectTimeSlots';

describe('RedirectTimeSlots', () => {
  test('renders', () => {
    render(<RedirectTimeSlots />);
    const element = screen.getByText('RedirectTimeSlots');
    expect(element).toBeInTheDocument();
  });
});
