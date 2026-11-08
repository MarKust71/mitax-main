// @vitest-environment node
import { dedupKeys, parseStatement, StatementParseError } from './index';
import { isValidAccount, normalizeAccount } from './account';
import { normalizeAmount } from './amount';

const bytes = (text: string) => new TextEncoder().encode(text);

const MT940 = `{1:F01ERSTPLPWAXXX0000000000}{2:O9401200241115ERSTPLPWAXXX00000000002411151200N}{4:
:20:STMT20241115
:25:PL61109010140000071219812874
:28C:00001/001
:60F:C241114PLN1000,00
:61:2411151115C150,00NTRFNONREF//REF001
:86:020~00PRZELEW~20Oplata za egzamin ~21Jan Kowalski
~3010901014~310000071219812999~32KOWALSKI JAN
~33 SENIOR~38PL12109010140000071219812999
:61:2411151115D20,50NTRFNONREF//REF002
:86:020~00OPLATA~20Prowizja
:61:2411151115C1234,5NTRFNONREF//REF003
:86:Wplata gotowkowa
:62F:C241115PLN2364,00
-}`;

// Structure of a real BPS export; names and account numbers are made up.
// Real Erste export layout: :86: is free text without structured sub-fields (no payer data).
// The account number is made up.
const ERSTE_UNSTRUCTURED = `{1:F0107810977    }{2:094007810977     N}{4:
:20:26110509023
:25:PL11111111111111111111111111
:28C:2026/025/1
:60F:C261105PLN523868,03
:61:261105CN1483,39NTRFNONREF
:86:Czynsz najmu lokalu i kosztyeksploatacyjne - listopad 2026
:61:261105DN0,20FCHGNONREF
:86:Opłata za smsKody,   1 szt. od 01-10-2026 do 31-10-2026
:61:261105DN2160,00FCHGNONREF
:86:Faktura:00050/10/2026 - obsługa egzaminów czeladniczych
:62F:C261105PLN523191,22
-}`;

const BPS = `<?xml version="1.0" encoding="ISO-8859-2" standalone="yes"?>
<WYCIAGI data_od="2026-11-03" data_do="2026-11-03" rachunek="11111111111111111111111111" waluta="PLN">
  <WYCIAG data="2026-11-03" rachunek="11111111111111111111111111" opis="Rachunek bieżący" waluta="PLN">
    <SALDO_OTWARCIA><KWOTA>1000.00</KWOTA><STRONA>C</STRONA></SALDO_OTWARCIA>
    <OPERACJA>
      <POZYCJA>1</POZYCJA>
      <DATA_WALUTY>2026-11-02</DATA_WALUTY>
      <DATA_TRANSAKCJI>2026-11-03</DATA_TRANSAKCJI>
      <OPIS>Przelew przychodzący zewnętrzny</OPIS>
      <BANK>10202137</BANK>
      <RACHUNEK>77102021370000920201980523</RACHUNEK>
      <KWOTA>260.13</KWOTA>
      <STRONA>C</STRONA>
      <WALUTA>PLN</WALUTA>
      <NAZWA1>JAN ŻÓŁTOWSKI UL. ŁĄKOWA 1 59-7</NAZWA1>
      <NAZWA2>30 NOWOGRODZIEC</NAZWA2>
      <NAZWA3></NAZWA3>
      <NAZWA4></NAZWA4>
      <TRESC1>Opłata za egzamin sesja listopad</TRESC1>
      <TRESC2>owa</TRESC2>
      <TRESC3></TRESC3>
      <TRESC4></TRESC4>
    </OPERACJA>
    <OPERACJA>
      <POZYCJA>2</POZYCJA>
      <DATA_WALUTY>2026-11-03</DATA_WALUTY>
      <DATA_TRANSAKCJI>2026-11-03</DATA_TRANSAKCJI>
      <OPIS>Przelew wychodzący wewnętrzny</OPIS>
      <BANK>19301376</BANK>
      <RACHUNEK>81193013763016023298000008</RACHUNEK>
      <KWOTA>600000.00</KWOTA>
      <STRONA>D</STRONA>
      <WALUTA>PLN</WALUTA>
      <NAZWA1>IZBA</NAZWA1>
      <TRESC1>Lokata</TRESC1>
    </OPERACJA>
    <SALDO_ZAMKNIECIA><KWOTA>29410.77</KWOTA><STRONA>C</STRONA></SALDO_ZAMKNIECIA>
  </WYCIAG>
</WYCIAGI>`;

// ISO-8859-2 bytes for the Polish letters (TextEncoder only produces UTF-8).
const ISO_8859_2: Record<string, number> = {
  Ą: 0xa1,
  ą: 0xb1,
  Ć: 0xc6,
  ć: 0xe6,
  Ę: 0xca,
  ę: 0xea,
  Ł: 0xa3,
  ł: 0xb3,
  Ń: 0xd1,
  ń: 0xf1,
  Ó: 0xd3,
  ó: 0xf3,
  Ś: 0xa6,
  ś: 0xb6,
  Ź: 0xac,
  ź: 0xbc,
  Ż: 0xaf,
  ż: 0xbf,
};
const iso88592 = (text: string) =>
  Uint8Array.from([...text].map((char) => ISO_8859_2[char] ?? char.charCodeAt(0)));

describe('parseStatement', () => {
  test('reads incoming payments from MT940 and attributes them to Erste', () => {
    const { bank, payments } = parseStatement(bytes(MT940));

    expect(bank).toBe('ERSTE');
    expect(payments).toHaveLength(2);
    expect(payments[0]).toEqual({
      accountNumber: 'PL61109010140000071219812874',
      bookingDate: '2024-11-15',
      amount: '150.00',
      currency: 'PLN',
      counterpartyName: 'KOWALSKI JAN SENIOR',
      counterpartyAccount: 'PL12109010140000071219812999',
      title: 'Oplata za egzamin Jan Kowalski',
      bankReference: 'REF001',
    });
    expect(payments[1].amount).toBe('1234.50');
    expect(payments[1].title).toBe('Wplata gotowkowa');
  });

  test('reads Erste MT940 with unstructured :86: (title only, no payer in the file)', () => {
    const { bank, payments } = parseStatement(bytes(ERSTE_UNSTRUCTURED));

    expect(bank).toBe('ERSTE');
    expect(payments).toEqual([
      {
        accountNumber: 'PL11111111111111111111111111',
        bookingDate: '2026-11-05',
        amount: '1483.39',
        currency: 'PLN',
        counterpartyName: null,
        counterpartyAccount: null,
        title: 'Czynsz najmu lokalu i kosztyeksploatacyjne - listopad 2026',
        bankReference: null,
      },
    ]);
  });

  test('reads incoming payments from BPS XML (ISO-8859-2) and attributes them to BPS', () => {
    const { bank, payments } = parseStatement(iso88592(BPS));

    expect(bank).toBe('BPS');
    expect(payments).toEqual([
      {
        accountNumber: '11111111111111111111111111',
        bookingDate: '2026-11-03',
        amount: '260.13',
        currency: 'PLN',
        counterpartyName: 'JAN ŻÓŁTOWSKI UL. ŁĄKOWA 1 59-730 NOWOGRODZIEC',
        counterpartyAccount: '77102021370000920201980523',
        title: 'Opłata za egzamin sesja listopadowa',
        bankReference: null,
      },
    ]);
  });

  test('decodes Windows-1250 files', () => {
    const latin = Uint8Array.from(
      Buffer.from(MT940.replace('Wplata gotowkowa', 'Własna wpłata'), 'latin1'),
    );

    expect(() => parseStatement(latin)).not.toThrow();
  });

  test('rejects unknown formats with a readable message', () => {
    expect(() => parseStatement(bytes('<root/>'))).toThrow(StatementParseError);
    expect(() => parseStatement(bytes(''))).toThrow('pusty');
  });
});

describe('dedupKeys', () => {
  test('is stable between runs and numbers identical payments within a file', () => {
    const { payments } = parseStatement(bytes(MT940));
    const twice = [payments[0], payments[0]];
    const keys = dedupKeys(twice);

    expect(keys[0]).not.toBe(keys[1]);
    expect(dedupKeys(twice)).toEqual(keys);
  });
});

describe('normalizeAmount', () => {
  test.each([
    ['150,00', '150.00'],
    ['1 234,5', '1234.50'],
    ['1.234,56', '1234.56'],
    ['99.9', '99.90'],
    ['100', '100.00'],
    ['0,5', '0.50'],
  ])('%s -> %s', (input, expected) => {
    expect(normalizeAmount(input)).toBe(expected);
  });

  test('rejects garbage', () => {
    expect(() => normalizeAmount('abc')).toThrow(StatementParseError);
  });
});

describe('normalizeAccount', () => {
  test.each([
    ['68109023980000000167810977', '68109023980000000167810977'],
    ['PL68109023980000000167810977', '68109023980000000167810977'],
    ['PL 68 1090 2398 0000 0001 6781 0977', '68109023980000000167810977'],
    ['de89 3704 0044 0532 0130 00', 'DE89370400440532013000'],
  ])('%s -> %s', (input, expected) => {
    expect(normalizeAccount(input)).toBe(expected);
  });

  test('validates the shape of the number', () => {
    expect(isValidAccount('68109023980000000167810977')).toBe(true);
    expect(isValidAccount('123')).toBe(false);
    expect(isValidAccount('68-1090')).toBe(false);
  });
});
