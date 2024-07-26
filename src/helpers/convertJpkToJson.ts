import { XmlObject } from '../app/jpk/Jpk.types';

import { readFileAsText } from './readFileAsText';
import { xmlToJson } from './xmlToJson';

export async function convertJpkToJson(xmlFileElementId: string): Promise<XmlObject[] | null> {
  const fileInput = document.getElementById(xmlFileElementId) as HTMLInputElement;

  const EWIDENCJA = 'tns:Ewidencja';
  const ZAKUP_WIERSZ = 'tns:ZakupWiersz';

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
      const register = (json[EWIDENCJA] || json[EWIDENCJA.replaceAll('tns:', '')]) as XmlObject;
      return (register[ZAKUP_WIERSZ] ||
        register[ZAKUP_WIERSZ.replaceAll('tns:', '')]) as XmlObject[];
    }

    return null;
  } catch (error) {
    console.error('Error reading or parsing the file:', error);
    alert('Wystąpił błąd podczas przetwarzania pliku.');

    return null;
  }
}
