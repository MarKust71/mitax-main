import React from 'react';
import { render, screen } from '@testing-library/react';

import { VatPurchaseRegister } from './VatPurchaseRegister';

describe('VatPurchaseRegister', () => {
  test('renders', () => {
    render(<VatPurchaseRegister registerRows={[]} />);
    const element = screen.getByText('VatPurchaseRegister');
    expect(element).toBeInTheDocument();
  });
});
