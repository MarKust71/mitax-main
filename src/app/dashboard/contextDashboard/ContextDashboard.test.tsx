import React from 'react';
import { render, screen } from '@testing-library/react';

import { ContextDashboard } from './ContextDashboard';

describe('ContextDashboard', () => {
  test('shows the context name', () => {
    render(<ContextDashboard name="DIR" schemaName="ctx_dir" />);
    expect(screen.getByRole('heading', { name: 'DIR' })).toBeInTheDocument();
    expect(screen.getByText('ctx_dir')).toBeInTheDocument();
  });
});
