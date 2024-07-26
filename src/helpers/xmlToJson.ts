import { XmlObject } from '../app/jpk/Jpk.types';

export function xmlToJson(xml: Node): XmlObject | string | null {
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
