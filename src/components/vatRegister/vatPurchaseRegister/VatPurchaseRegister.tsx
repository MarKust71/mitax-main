import React from 'react';
import { Box, useTheme } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import { VatPurchaseRegisterProps, VatPurchaseRegisterRow } from './VatPurchaseRegister.types';
import { useStyles } from './VatPurchaseRegister.styles';

export const VatPurchaseRegister: React.FC<VatPurchaseRegisterProps> = ({ registerRows }) => {
  const theme = useTheme();
  const classes = useStyles(theme);

  const rows: VatPurchaseRegisterRow[] | undefined = registerRows?.map((row) => {
    const rows = {
      purchaseDate: row['tns:DataZakupu'] as { '#text': string },
      invoiceNumber: row['tns:DowodZakupu'] as { '#text': string },
      netAmount: row['tns:K_42'] as { '#text': string },
      vatAmount: row['tns:K_43'] as { '#text': string },
      rowNumber: row['tns:LpZakupu'] as { '#text': string },
      supplierName: row['tns:NazwaDostawcy'] as { '#text': string },
      supplierVatId: row['tns:NrDostawcy'] as { '#text': string },
    };

    return {
      id: `${rows.supplierVatId['#text']}-${rows.rowNumber['#text']}`,
      rowNumber: Number(rows.rowNumber['#text']),
      purchaseDate: rows.purchaseDate['#text'],
      supplierVatId: rows.supplierVatId['#text'],
      supplierName: rows.supplierName['#text'],
      invoiceNumber: rows.invoiceNumber['#text'],
      netAmount: Number(rows.netAmount['#text']),
      vatAmount: Number(rows.vatAmount['#text']),
    };
  });

  const columns: GridColDef<VatPurchaseRegisterRow[][number]>[] = [
    { field: 'rowNumber', headerName: 'L.p.' },
    {
      field: 'purchaseDate',
      headerName: 'Data zakupu',
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
