import React from 'react';
import { render, screen } from '@testing-library/react';

import { ContextDashboard } from './ContextDashboard';

describe('ContextDashboard', () => {
  test('shows the context name', () => {
    render(<ContextDashboard name="DIR" schemaName="ctx_dir" />);
    expect(screen.getByRole('heading', { name: 'DIR' })).toBeInTheDocument();
    expect(screen.getByText('ctx_dir')).toBeInTheDocument();
  });

  test('says so when the context has no modules', () => {
    render(<ContextDashboard name="DIR" schemaName="ctx_dir" contextId="c1" modules={[]} />);
    expect(screen.getByText('Ten kontekst nie ma jeszcze żadnych modułów.')).toBeInTheDocument();
  });

  test('links to the bank statements module when it is enabled', () => {
    render(
      <ContextDashboard
        name="DIR"
        schemaName="ctx_dir"
        contextId="c1"
        modules={['bank_statements']}
      />,
    );
    expect(screen.getByRole('link', { name: /Wyciągi bankowe/ })).toHaveAttribute(
      'href',
      '/dashboard/c1/wyciagi',
    );
  });
});
