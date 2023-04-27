import React from 'react';
import { render, screen } from '@testing-library/react';

import { AddMember } from './AddMember';

describe('AddMember', () => {
  test('renders', () => {
    render(<AddMember />);
    const element = screen.getByText('AddMember');
    expect(element).toBeInTheDocument();
  });
});
