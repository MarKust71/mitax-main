import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';

export const PackageTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [controls, setControls] = useState<IScannerControls | null>(null);

  const startScanning = () => {
    const codeReader = new BrowserMultiFormatReader();

    if (!videoRef.current) return;

    codeReader
      .decodeFromVideoDevice(undefined, videoRef.current, (result, error, controls) => {
        if (error) return; // brak kodu – normalne
        if (result) {
          setTrackingNumber(result.getText());
          controls.stop(); // zatrzymujemy kamerę
        }
        setControls(controls);
      })
      .catch((err) => {
        console.error(err);
        setError('Nie udało się uzyskać dostępu do kamery.');
      });
  };

  useEffect(() => {
    if (!trackingNumber) {
      startScanning();
    }

    return () => {
      controls?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingNumber]);

  const handleRescan = () => {
    setTrackingNumber(null);
    setError(null);
    controls?.stop();
  };

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
          {/* Celownik */}
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
        <div>
          <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
            Numer przesyłki: <strong>{trackingNumber}</strong>
          </p>
          <button
            onClick={handleRescan}
            style={{
              marginTop: 12,
              padding: '6px 12px',
              backgroundColor: '#e0e0e0',
              border: '1px solid #ccc',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Skanuj ponownie
          </button>

          <div style={{ marginTop: 20 }}>
            <h2 style={{ fontSize: '1rem', marginBottom: 8 }}>Historia przesyłki:</h2>
            <iframe
              title="Tracking"
              src={`https://emonitoring.poczta-polska.pl/?numer=${trackingNumber}`}
              width="100%"
              height="400"
              style={{ border: '1px solid #ccc', borderRadius: 4 }}
            />
          </div>
        </div>
      )}

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
    </div>
  );
};
