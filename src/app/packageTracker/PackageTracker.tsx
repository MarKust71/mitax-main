/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';

export const PackageTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [controls, setControls] = useState<IScannerControls | null>(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    if (!videoRef.current) return;

    codeReader
      .decodeFromVideoDevice(undefined, videoRef.current, (result, err, controls) => {
        setControls(controls);

        if (err) {
          // Kod może nie być jeszcze widoczny – to normalne, nie pokazujemy błędu
        }
        if (result) {
          setTrackingNumber(result.getText());
          controls.stop(); // zatrzymujemy skanowanie
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Nie udało się uzyskać dostępu do kamery.');
      });

    return () => {
      controls?.stop(); // wyczyść po odmontowaniu
    };
  }, []);

  const url = useMemo(
    () => `https://emonitoring.poczta-polska.pl/?numer=${trackingNumber}`,
    [trackingNumber],
  );

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: 16 }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Śledzenie przesyłki</h1>

      {!trackingNumber && (
        <div
          style={{ position: 'relative', aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden' }}
        >
          <video
            ref={videoRef}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            muted
            autoPlay
            playsInline
          />
          {/* Zielona nakładka – celownik */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '75%',
              height: '25%',
              transform: 'translate(-50%, -50%)',
              border: '4px solid limegreen',
              borderRadius: 8,
              pointerEvents: 'none',
            }}
          />
        </div>
      )}

      {trackingNumber && (
        <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
          Numer przesyłki:{' '}
          <a href={url ?? '#'} target="_blank" rel="noopener noreferrer">
            {trackingNumber}
          </a>
        </p>
      )}

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
    </div>
  );
};
