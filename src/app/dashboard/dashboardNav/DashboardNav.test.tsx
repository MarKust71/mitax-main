import React from 'react';
import { render, screen } from '@testing-library/react';

import { DashboardNav } from './DashboardNav';

vi.mock('next/navigation', () => ({ usePathname: () => '/dashboard/b' }));

describe('DashboardNav', () => {
  test('lists the items and marks the current one', () => {
    render(
      <DashboardNav
        items={[
          { href: '/dashboard/a', label: 'Alfa' },
          { href: '/dashboard/b', label: 'Beta' },
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Alfa' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Beta' })).toHaveAttribute('aria-current', 'page');
  });
});
