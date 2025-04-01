import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';

export const PackageTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [controls, setControls] = useState<IScannerControls | null>(null);
  const [zoom, setZoom] = useState<number>(1);

  const startScanning = () => {
    const codeReader = new BrowserMultiFormatReader();

    if (!videoRef.current) return;

    codeReader
      .decodeFromConstraints(
        {
          video: {
            facingMode: 'environment',
            width: { ideal: 7680 },
            height: { ideal: 4320 },
          },
        },
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        videoRef.current!,
        (result, error, controls) => {
          if (result) {
            setTrackingNumber(result.getText());
            controls.stop();
          }
          setControls(controls);
        },
      )
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
    setManualInput('');
    setError(null);
    controls?.stop();
  };

  const handleManualSubmit = () => {
    const trimmed = manualInput.trim();
    if (trimmed.length >= 10) {
      setTrackingNumber(trimmed);
    } else {
      setError('Wprowadź poprawny numer przesyłki.');
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: 16 }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Śledzenie przesyłki</h1>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

      {!trackingNumber && !error && (
        <>
          <div
            style={{
              position: 'relative',
              aspectRatio: '4/3',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <video
              ref={videoRef}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
              }}
              muted
              autoPlay
              playsInline
            />
            <button
              onClick={() => setZoom((prev) => (prev === 3 ? 1 : prev + 1))}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: 4,
                padding: '4px 8px',
              }}
            >
              {`Zoom x${zoom}`}
            </button>

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
        </>
      )}

      {/* Ręczne wprowadzenie */}
      <div style={{ marginTop: 20 }}>
        <label htmlFor="manual" style={{ display: 'block', marginBottom: 4 }}>
          {`${!!error ? 'W' : 'Skanuj lub w'}prowadź numer ręcznie:`}
        </label>
        <input
          id="manual"
          type="text"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          style={{
            boxSizing: 'border-box',
            width: '100%',
            padding: 8,
            fontSize: '1rem',
            border: '1px solid #ccc',
            borderRadius: 4,
          }}
        />
        <button
          onClick={handleManualSubmit}
          style={{
            boxSizing: 'border-box',
            marginTop: 8,
            padding: '6px 12px',
            backgroundColor: '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Pokaż historię
        </button>
      </div>

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
            <div style={{ overflowX: 'auto' }}>
              <iframe
                title="Tracking"
                src={`https://emonitoring.poczta-polska.pl/?numer=${trackingNumber}`}
                width="576" // ⬅️ większa szerokość
                height="600"
                style={{
                  minWidth: '100%',
                  border: '1px solid #ccc',
                  borderRadius: 4,
                  display: 'block',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
