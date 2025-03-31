import React from 'react';
import { Box } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import { xmlToRows } from '../../../helpers/xmlToRows';

import { VatPurchaseRegisterProps, VatPurchaseRegisterRow } from './VatPurchaseRegister.types';

export const VatPurchaseRegister: React.FC<VatPurchaseRegisterProps> = ({ registerRows }) => {
  const rows = xmlToRows(registerRows);

  const columns: GridColDef<VatPurchaseRegisterRow[][number]>[] = [
    { field: 'rowNumber', headerName: 'L.p.' },
    {
      field: 'purchaseDate',
      headerName: 'Data zakupu',
    },
    {
      field: 'receiptDate',
      headerName: 'Data wpływu',
    },
    {
      field: 'country',
      headerName: 'Kraj',
    },
    {
      field: 'supplierVatId',
      headerName: 'NIP',
      flex: 1,
    },
    {
      field: 'supplierName',
      headerName: 'Dostawca',
      flex: 1,
    },
    {
      field: 'invoiceNumber',
      headerName: 'Nr faktury',
      flex: 1,
    },
    {
      field: 'netAmount',
      headerName: 'Netto',
      type: 'number',
    },
    {
      field: 'vatAmount',
      headerName: 'VAT',
      type: 'number',
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid rows={rows} columns={columns} rowHeight={32} />
    </Box>
  );
};
