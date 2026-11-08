import React from 'react';
import { render, screen } from '@testing-library/react';

import { Dashboard } from './Dashboard';

describe('Dashboard', () => {
  test('renders links to the app routes', () => {
    render(<Dashboard />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Blog/ })).toHaveAttribute('href', '/blog');
  });

  test('shows the administration link to admins only', () => {
    const { rerender } = render(<Dashboard />);
    expect(screen.queryByRole('link', { name: /Administracja/ })).not.toBeInTheDocument();
    rerender(<Dashboard isAdmin />);
    expect(screen.getByRole('link', { name: /Administracja/ })).toHaveAttribute(
      'href',
      '/administracja',
    );
  });
});
