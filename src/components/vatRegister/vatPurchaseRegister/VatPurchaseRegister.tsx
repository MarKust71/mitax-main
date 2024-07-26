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
      purchaseDate: (row['tns:DataZakupu'] || row['DataZakupu']) as { '#text': string },
      receiptDate: (row['tns:DataWplywu'] || row['DataWplywu'] || { '#text': '' }) as {
        '#text': string;
      },
      invoiceNumber: (row['tns:DowodZakupu'] || row['DowodZakupu']) as { '#text': string },
      netAmount: (row['tns:K_42'] || row['K_42']) as { '#text': string },
      vatAmount: (row['tns:K_43'] || row['K_43']) as { '#text': string },
      rowNumber: (row['tns:LpZakupu'] || row['LpZakupu']) as { '#text': string },
      supplierName: (row['tns:NazwaDostawcy'] || row['NazwaDostawcy']) as { '#text': string },
      supplierVatId: (row['tns:NrDostawcy'] || row['NrDostawcy']) as { '#text': string },
      country: (row['tns:KodKrajuNadaniaTIN'] || row['KodKrajuNadaniaTIN'] || { '#text': '' }) as {
        '#text': string;
      },
    };

    return {
      id: `${rows.supplierVatId['#text']}-${rows.rowNumber['#text']}`,
      rowNumber: Number(rows.rowNumber['#text']),
      purchaseDate: rows.purchaseDate['#text'],
      receiptDate: rows.receiptDate['#text'],
      country: rows.country['#text'],
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
