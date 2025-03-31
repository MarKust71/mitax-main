import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import axios from 'axios';
import * as cheerio from 'cheerio';

type PackageEvent = {
  date: string;
  status: string;
  location: string;
};

export const PackageTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [events, setEvents] = useState<PackageEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    codeReader
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .decodeFromVideoDevice(undefined, videoRef.current!, (result, err, controls) => {
        if (err) {
          console.error(err);
          // setError('(1) Nie udało się uzyskać dostępu do kamery.');
        }
        if (result) {
          setTrackingNumber(result.getText());
          // codeReader.reset(); // stop scanning
          controls.stop(); // stop video stream
        }
      })
      .catch((err) => {
        console.error(err);
        setError('(2) Nie udało się uzyskać dostępu do kamery.');
      });

    return () => {
      // codeReader.reset();
    };
  }, []);

  useEffect(() => {
    const fetchTrackingData = async () => {
      if (!trackingNumber) return;

      try {
        const { data } = await axios.get(
          `https://emonitoring.poczta-polska.pl/?numer=${trackingNumber}`,
        );
        const $ = cheerio.load(data);

        const readEvents: PackageEvent[] = [];

        $('table.table-bordered tr').each((i, el) => {
          const tds = $(el).find('td');

          if (tds.length === 3) {
            const date = $(tds[0]).text().trim();
            const status = $(tds[1]).text().trim();
            const location = $(tds[2]).text().trim();

            readEvents.push({ date, status, location });
          }
        });

        if (readEvents.length === 0) {
          // return res.status(404).json({ error: 'Nie znaleziono danych przesyłki.' });
        }

        // res.json({ code, events });
        setEvents(readEvents);
      } catch (err) {
        console.error(err);
        // res.status(500).json({ error: 'Błąd podczas pobierania danych z Poczty Polskiej.' });
      }
    };

    fetchTrackingData();
  }, [trackingNumber]);

  return (
    <div>
      <h1>Śledzenie przesyłki</h1>

      {!trackingNumber && <video ref={videoRef} style={{ width: '100%' }} />}

      {trackingNumber && <p>Numer przesyłki: {trackingNumber}</p>}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {events && (
        <ul>
          {events.map((event, index) => (
            <li key={index}>
              <strong>{event.date}</strong> - {event.status} ({event.location})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
