import React, { useState } from 'react';
import { useTheme } from '@mui/material';

import { VatPurchaseRegister } from '../../components/vatRegister/vatPurchaseRegister/VatPurchaseRegister';
import { convertJpkToJson } from '../../helpers/convertJpkToJson';

import { JpkProps, XmlObject } from './Jpk.types';
import { useStyles } from './Jpk.styles';

export const Jpk: React.FC<JpkProps> = ({}) => {
  const theme = useTheme();
  const classes = useStyles(theme);

  const [registerRows, setRegisterRows] = useState<XmlObject[] | null>([]);

  const XML_FILE_ELEMENT_ID = 'xmlFile';

  const handleClick = async () => {
    const rows = await convertJpkToJson(XML_FILE_ELEMENT_ID);

    setRegisterRows(rows);
  };

  return (
    <>
      <h1>XML to JSON Converter</h1>

      <div>
        <input type="file" id={XML_FILE_ELEMENT_ID} accept=".xml" />
        <button onClick={handleClick}>Convert</button>
      </div>

      <VatPurchaseRegister registerRows={registerRows} />
    </>
  );
};
