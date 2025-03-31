import React from 'react';
import { render, screen } from '@testing-library/react';

import { PackageTracker } from './PackageTracker';

describe('PackageTracker', () => {
  test('renders', () => {
    render(<PackageTracker />);
    const element = screen.getByText('PackageTracker');
    expect(element).toBeInTheDocument();
  });
});
