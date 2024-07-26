import React from 'react';
import { render, screen } from '@testing-library/react';

import { TdpHeader } from './TdpHeader';

describe('TdpHeader', () => {
  test('renders', () => {
    render(<TdpHeader />);
    const element = screen.getByText('TdpHeader');
    expect(element).toBeInTheDocument();
  });
});
