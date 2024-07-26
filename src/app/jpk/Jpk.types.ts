export type JpkProps = Record<string, never>;

export type XmlObject = {
  [key: string]: string | XmlObject | XmlObject[] | null;
};
