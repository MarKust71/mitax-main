import React, { useState } from 'react';
import * as XLSX from 'xlsx';

import { VatPurchaseRegister } from '../../components/vatRegister/vatPurchaseRegister/VatPurchaseRegister';
import { convertJpkToXml } from '../../helpers/convertJpkToXml';
import { xmlToRows } from '../../helpers/xmlToRows';

import { JpkProps, XmlObject } from './Jpk.types';

export const Jpk: React.FC<JpkProps> = ({}) => {
  const [registerRows, setRegisterRows] = useState<XmlObject[] | null>([]);

  const XML_FILE_ELEMENT_ID = 'xmlFile';

  const handleClickConvert = async () => {
    const rows = await convertJpkToXml(XML_FILE_ELEMENT_ID);

    setRegisterRows(rows);
  };

  const handleClickExport = () => {
    const fileBaseName = 'mic_jpk_';
    const data = xmlToRows(registerRows);
    const worksheet = XLSX.utils.json_to_sheet(data as unknown[]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'miesiac');

    XLSX.writeFile(workbook, `${fileBaseName}.xlsx`);
  };

  return (
    <>
      <h1>XML to JSON Converter</h1>

      <div>
        <input type="file" id={XML_FILE_ELEMENT_ID} accept=".xml" />
        <button onClick={handleClickConvert}>Convert</button>
        <button disabled={!registerRows} onClick={handleClickExport}>
          Export XLSX
        </button>
      </div>

      <VatPurchaseRegister registerRows={registerRows} />
    </>
  );
};
