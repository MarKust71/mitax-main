import React from 'react';
import { render, screen } from '@testing-library/react';

import { Blog } from './Blog';

describe('Blog', () => {
  test('renders', () => {
    render(<Blog />);
    const element = screen.getByText('Blog');
    expect(element).toBeInTheDocument();
  });
});
