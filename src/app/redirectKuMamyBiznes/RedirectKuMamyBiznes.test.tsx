import React from 'react';
import { render, screen } from '@testing-library/react';

import { RedirectKuMamyBiznes } from './RedirectKuMamyBiznes';

describe('RedirectKuMamyBiznes', () => {
  test('renders', () => {
    render(<RedirectKuMamyBiznes />);
    const element = screen.getByText('RedirectKuMamyBiznes');
    expect(element).toBeInTheDocument();
  });
});
