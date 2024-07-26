import React, { useState } from 'react';
import { useTheme } from '@mui/material';

import { VatPurchaseRegister } from '../../components/vatRegister/vatPurchaseRegister/VatPurchaseRegister';

import { JpkProps } from './Jpk.types';
import { useStyles } from './Jpk.styles';

export const Jpk: React.FC<JpkProps> = ({}) => {
  const theme = useTheme();
  const classes = useStyles(theme);

  const [registerRows, setRegisterRows] = useState<XmlObject[] | null>([]);

  const handleClick = async () => {
    const rows = await convertXMLtoJSON();

    setRegisterRows(rows);
  };

  return (
    <>
      <h1>XML to JSON Converter</h1>

      <div>
        <input type="file" id="xmlFile" accept=".xml" />
        <button onClick={handleClick}>Convert</button>
      </div>

      <VatPurchaseRegister registerRows={registerRows} />
    </>
  );
};

async function convertXMLtoJSON(): Promise<XmlObject[] | null> {
  const fileInput = document.getElementById('xmlFile') as HTMLInputElement;

  if (!fileInput.files || fileInput.files.length === 0) {
    alert('Proszę wybrać plik XML.');

    return null;
  }

  // eslint-disable-next-line prefer-destructuring
  const file = fileInput.files[0];

  try {
    const fileContent = await readFileAsText(file);
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(fileContent, 'application/xml');

    const json = xmlToJson(xmlDoc.documentElement);

    if (json !== null && typeof json === 'object') {
      const register = json['tns:Ewidencja'] as XmlObject;
      return register['tns:ZakupWiersz'] as XmlObject[];
    }

    return null;
  } catch (error) {
    console.error('Error reading or parsing the file:', error);
    alert('Wystąpił błąd podczas przetwarzania pliku.');

    return null;
  }
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (e: ProgressEvent<FileReader>) {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('File reading error'));
      }
    };

    reader.onerror = function () {
      reject(new Error('File reading error'));
    };

    reader.readAsText(file);
  });
}

export interface XmlObject {
  [key: string]: string | XmlObject | XmlObject[] | null;
}

function xmlToJson(xml: Node): XmlObject | string | null {
  switch (xml.nodeType) {
    case 1: {
      // element
      const obj: XmlObject = {};
      const element = xml as Element;

      if (element.attributes.length > 0) {
        for (let j = 0; j < element.attributes.length; j++) {
          const attribute = element.attributes.item(j) as Attr;

          if (!attribute.nodeName.includes('xmlns')) {
            obj[attribute.nodeName] = attribute.nodeValue || '';
          }
        }
      }

      if (element.childNodes.length > 0) {
        for (let i = 0; i < element.childNodes.length; i++) {
          const item = element.childNodes.item(i);
          const { nodeName } = item;

          if (item.nodeType === 3) {
            // text
            const textContent = item.textContent?.trim();
            if (textContent) {
              obj['#text'] = textContent;
            }
          } else {
            if (!obj[nodeName]) {
              obj[nodeName] = xmlToJson(item);
            } else {
              if (!Array.isArray(obj[nodeName])) {
                obj[nodeName] = [obj[nodeName]] as XmlObject[];
              }
              (obj[nodeName] as XmlObject[]).push(xmlToJson(item) as XmlObject);
            }
          }
        }
      }

      return obj;
    }

    case 3: {
      // text
      return xml.nodeValue;
    }

    default:
      return null;
  }
}
