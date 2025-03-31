import { VatPurchaseRegisterRow } from '../components/vatRegister/vatPurchaseRegister/VatPurchaseRegister.types';
import { XmlObject } from '../app/jpk/Jpk.types';

export const xmlToRows = (xml: XmlObject[] | null): VatPurchaseRegisterRow[] | undefined =>
  xml?.map((row) => {
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
