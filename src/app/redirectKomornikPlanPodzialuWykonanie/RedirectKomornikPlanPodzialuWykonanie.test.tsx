import React from 'react';
import { render, screen } from '@testing-library/react';

import { RedirectKomornikPlanPodzialuWykonanie } from './RedirectKomornikPlanPodzialuWykonanie';

describe('RedirectKomornikPlanPodzialuWykonanie', () => {
  test('renders', () => {
    render(<RedirectKomornikPlanPodzialuWykonanie />);
    const element = screen.getByText('RedirectKomornikPlanPodzialuWykonanie');
    expect(element).toBeInTheDocument();
  });
});
