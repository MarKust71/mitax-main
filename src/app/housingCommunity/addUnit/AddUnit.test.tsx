import React from 'react';
import { render, screen } from '@testing-library/react';

import { AddUnit } from './AddUnit';

describe('AddUnit', () => {
  test('renders', () => {
    render(<AddUnit />);
    const element = screen.getByText('AddUnit');
    expect(element).toBeInTheDocument();
  });
});
