import React from 'react';
import { render, screen } from '@testing-library/react';

import { TenDaysProgramme } from './TenDaysProgramme';

describe('TenDaysProgramme', () => {
  test('renders', () => {
    render(<TenDaysProgramme />);
    const element = screen.getByText('TenDaysProgramme');
    expect(element).toBeInTheDocument();
  });
});
