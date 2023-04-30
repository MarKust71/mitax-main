import React from 'react';
import { render, screen } from '@testing-library/react';

import { ListMembers } from './ListMembers';

describe('ListMembers', () => {
  test('renders', () => {
    render(<ListMembers />);
    const element = screen.getByText('ListMembers');
    expect(element).toBeInTheDocument();
  });
});
