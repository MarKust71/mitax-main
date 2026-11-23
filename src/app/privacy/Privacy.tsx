/* eslint-disable max-len -- legal prose, long sentences are intentional */
'use client';

import React from 'react';
import { Box, Link, Typography } from '@mui/material';

import { PrivacyProps } from './Privacy.types';
import { styles } from './Privacy.styles';

const CONTACT_EMAIL = 'biuro@mitax.pl';
const LAST_UPDATED = '23 listopada 2026 r.';

type SectionProps = { title: string; children: React.ReactNode };

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <Box component="section" sx={styles.section}>
    <Typography variant="h6" component="h2" gutterBottom>
      {title}
    </Typography>
    {children}
  </Box>
);

const List: React.FC<{ items: string[] }> = ({ items }) => (
  <Box component="ul" sx={styles.list}>
    {items.map((item) => (
      <Typography key={item} component="li">
        {item}
      </Typography>
    ))}
  </Box>
);

export const Privacy: React.FC<PrivacyProps> = ({}) => {
  return (
    <Box component="main" sx={styles.wrapper}>
      <Typography variant="h4" component="h1" gutterBottom>
        Polityka prywatności
      </Typography>
      <Typography variant="body2">Ostatnia aktualizacja: {LAST_UPDATED}</Typography>

      <Section title="1. Administrator danych">
        <Typography>
          Administratorem danych osobowych jest MITAX Consulting sp. z o.o. z siedzibą przy ul.
          Warszawskiej 4/8, 59-900 Zgorzelec, Polska, NIP 6152043432 (dalej: „Administrator”).
        </Typography>
        <Typography>
          Kontakt w sprawach dotyczących danych osobowych:{' '}
          <Link href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</Link>.
        </Typography>
      </Section>

      <Section title="2. Zakres polityki">
        <Typography>
          Polityka dotyczy serwisu internetowego prowadzonego przez Administratora oraz
          funkcjonalności korzystających z interfejsów API LinkedIn. Dane osobowe przetwarzamy
          zgodnie z rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO) oraz
          przepisami prawa polskiego.
        </Typography>
      </Section>

      <Section title="3. Jakie dane przetwarzamy">
        <List
          items={[
            'dane konta użytkownika: adres e-mail (pełniący funkcję nazwy użytkownika), skrót hasła (hasło nie jest przechowywane w postaci jawnej), rola oraz daty utworzenia i weryfikacji konta;',
            'dane sesji: losowy identyfikator sesji (w bazie przechowujemy wyłącznie jego skrót) oraz data wygaśnięcia sesji;',
            'dane o próbach logowania i rejestracji (adres e-mail, rodzaj i czas próby) wykorzystywane do ograniczania liczby prób;',
            'dziennik aktywności: działania wykonane w serwisie przez zalogowanego użytkownika wraz z adresem e-mail i czasem;',
            'dane przesłane przez użytkownika w formularzach i wiadomościach kierowanych do Administratora;',
            'dane pozyskane z LinkedIn w zakresie opisanym w punkcie 6.',
          ]}
        />
      </Section>

      <Section title="4. Cele i podstawy prawne przetwarzania">
        <List
          items={[
            'założenie i obsługa konta, uwierzytelnianie oraz świadczenie funkcji serwisu - art. 6 ust. 1 lit. b RODO (wykonanie umowy);',
            'zapewnienie bezpieczeństwa serwisu, przeciwdziałanie nadużyciom, prowadzenie dziennika aktywności - art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes Administratora);',
            'odpowiedź na wiadomości i zapytania - art. 6 ust. 1 lit. f RODO;',
            'dochodzenie roszczeń i obrona przed roszczeniami, wypełnianie obowiązków prawnych (np. podatkowych i rachunkowych) - art. 6 ust. 1 lit. f oraz lit. c RODO;',
            'przetwarzanie danych z LinkedIn - art. 6 ust. 1 lit. a RODO (zgoda udzielona w procesie autoryzacji LinkedIn) lub, gdy jest to niezbędne do realizacji wybranej przez użytkownika funkcji, art. 6 ust. 1 lit. b RODO.',
          ]}
        />
      </Section>

      <Section title="5. Pliki cookie">
        <Typography>
          Serwis używa wyłącznie niezbędnego pliku cookie sesji (<code>session</code>). Jest on
          ustawiany po zalogowaniu, ma atrybuty HttpOnly oraz SameSite=Lax (a w środowisku
          produkcyjnym także Secure) i wygasa po upływie czasu ważności sesji lub po wylogowaniu.
          Plik ten jest niezbędny do działania serwisu, dlatego nie wymaga zgody. Nie stosujemy
          cookie reklamowych ani analitycznych podmiotów trzecich.
        </Typography>
        <Typography sx={{ mt: 1 }}>
          Strony serwisu pobierają czcionki i ikony z serwerów Google Fonts, co powoduje przekazanie
          adresu IP odwiedzającego temu dostawcy.
        </Typography>
      </Section>

      <Section title="6. Integracja z LinkedIn (LinkedIn API)">
        <Typography>
          Jeżeli użytkownik zdecyduje się skorzystać z funkcji powiązanych z LinkedIn, Administrator
          korzysta z interfejsów API udostępnianych przez LinkedIn Corporation / LinkedIn Ireland
          Unlimited Company na podstawie ich warunków korzystania z API.
        </Typography>
        <List
          items={[
            'dostęp do danych następuje wyłącznie po wyraźnej autoryzacji użytkownika na stronie LinkedIn (protokół OAuth 2.0); zakres danych jest ograniczony do uprawnień (scopes), na które użytkownik wyraził zgodę;',
            'możemy otrzymać podstawowe dane profilu (np. imię i nazwisko, adres e-mail, identyfikator konta LinkedIn, zdjęcie profilowe) oraz, jeśli użytkownik udzieli takiej zgody, uprawnienie do publikowania treści w jego imieniu;',
            'dane z LinkedIn wykorzystujemy wyłącznie w celu realizacji funkcji, do której użytkownik udzielił zgody, i nie używamy ich do innych celów;',
            'nie sprzedajemy, nie wynajmujemy ani nie udostępniamy danych z LinkedIn podmiotom trzecim w celach marketingowych ani reklamowych, nie budujemy na ich podstawie baz danych do dalszej odsprzedaży, nie profilujemy użytkowników i nie podejmujemy wobec nich zautomatyzowanych decyzji;',
            'tokeny dostępowe LinkedIn przechowujemy w sposób zabezpieczony i wykorzystujemy tylko do działań zleconych przez użytkownika; po cofnięciu zgody lub wygaśnięciu tokenu przestajemy z nich korzystać i usuwamy je;',
            'zgodę można w każdej chwili cofnąć w ustawieniach konta LinkedIn (Ustawienia i prywatność → Prywatność danych → Usługi, na które udzieliłeś zgody) lub przez kontakt z Administratorem; cofnięcie zgody nie wpływa na zgodność z prawem przetwarzania dokonanego przed jej cofnięciem.',
          ]}
        />
        <Typography>
          LinkedIn jest odrębnym administratorem danych przetwarzanych na własnych serwisach. Zasady
          jego działania opisuje{' '}
          <Link
            href="https://www.linkedin.com/legal/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Polityka prywatności LinkedIn
          </Link>
          .
        </Typography>
      </Section>

      <Section title="7. Odbiorcy danych">
        <Typography>Dane mogą być powierzane lub udostępniane wyłącznie:</Typography>
        <List
          items={[
            'dostawcom usług niezbędnych do działania serwisu (hosting i infrastruktura, baza danych, poczta elektroniczna wysyłająca wiadomości systemowe), którzy przetwarzają dane na podstawie umów powierzenia;',
            'LinkedIn - w zakresie niezbędnym do działania integracji, o której mowa w punkcie 6;',
            'organom publicznym, jeżeli obowiązek taki wynika z przepisów prawa.',
          ]}
        />
      </Section>

      <Section title="8. Przekazywanie danych poza EOG">
        <Typography>
          Jeżeli dostawcy usług lub LinkedIn przetwarzają dane poza Europejskim Obszarem
          Gospodarczym, odbywa się to z zastosowaniem mechanizmów przewidzianych w RODO, w
          szczególności decyzji stwierdzającej odpowiedni stopień ochrony lub standardowych klauzul
          umownych.
        </Typography>
      </Section>

      <Section title="9. Okres przechowywania danych">
        <List
          items={[
            'dane konta - do czasu jego usunięcia, a następnie przez okres niezbędny do dochodzenia roszczeń lub wynikający z przepisów prawa;',
            'sesje - do wygaśnięcia lub wylogowania;',
            'dziennik aktywności - przez okres niezbędny do zapewnienia bezpieczeństwa i rozliczalności działań w serwisie;',
            'dane z LinkedIn - do cofnięcia zgody lub usunięcia konta przez użytkownika, w zależności od tego, co nastąpi wcześniej;',
            'korespondencja - przez czas niezbędny do obsługi sprawy oraz do upływu terminów przedawnienia roszczeń.',
          ]}
        />
      </Section>

      <Section title="10. Prawa osób, których dane dotyczą">
        <Typography>Przysługuje Ci prawo do:</Typography>
        <List
          items={[
            'dostępu do swoich danych i uzyskania ich kopii;',
            'sprostowania danych;',
            'usunięcia danych („prawo do bycia zapomnianym”);',
            'ograniczenia przetwarzania;',
            'przenoszenia danych;',
            'sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie;',
            'cofnięcia zgody w dowolnym momencie;',
            'wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa).',
          ]}
        />
        <Typography>
          Aby skorzystać z tych praw, napisz na adres{' '}
          <Link href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</Link>. Prosimy o wskazanie adresu
          e-mail powiązanego z kontem, abyśmy mogli zweryfikować tożsamość wnioskodawcy.
        </Typography>
      </Section>

      <Section title="11. Dobrowolność podania danych">
        <Typography>
          Podanie danych jest dobrowolne, ale niezbędne do założenia konta i korzystania z funkcji
          serwisu. Korzystanie z funkcji powiązanych z LinkedIn jest w pełni opcjonalne.
        </Typography>
      </Section>

      <Section title="12. Bezpieczeństwo danych">
        <Typography>
          Stosujemy środki techniczne i organizacyjne adekwatne do ryzyka, m.in. haszowanie haseł i
          tokenów sesji, ograniczanie liczby prób logowania, kontrolę uprawnień oraz szyfrowane
          połączenie HTTPS.
        </Typography>
      </Section>

      <Section title="13. Zmiany polityki prywatności">
        <Typography>
          Administrator może zmieniać niniejszą politykę, np. w związku ze zmianą przepisów lub
          funkcji serwisu. Aktualna wersja jest zawsze dostępna pod adresem tej strony, a data
          ostatniej aktualizacji znajduje się na jej początku.
        </Typography>
      </Section>
    </Box>
  );
};
