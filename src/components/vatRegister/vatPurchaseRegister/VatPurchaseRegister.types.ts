import { XmlObject } from '../../../app/jpk/Jpk.types';

export type VatPurchaseRegisterProps = {
  registerRows: XmlObject[] | null;
};

export type VatPurchaseRegisterRow = {
  id: string;
  rowNumber: number;
  purchaseDate: string;
  receiptDate: string;
  supplierVatId: string;
  supplierName: string;
  invoiceNumber: string;
  netAmount: number;
  vatAmount: number;
  country: string;
};
