import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

export const PackageTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    codeReader
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .decodeFromVideoDevice(undefined, videoRef.current!, (result, err, controls) => {
        if (err) {
          // console.error(err);
          // setError('Nie udało się odnaleźć kodu.');
        }
        if (result) {
          setTrackingNumber(result.getText());
          controls.stop(); // stop video stream
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Nie udało się uzyskać dostępu do kamery.');
      });
  }, []);

  const url = useMemo(
    () => `https://emonitoring.poczta-polska.pl/?numer=${trackingNumber}`,
    [trackingNumber],
  );

  return (
    <div>
      <h1>Śledzenie przesyłki</h1>

      {!trackingNumber && <video ref={videoRef} style={{ width: '100%' }} />}

      {trackingNumber && (
        <p>
          Numer przesyłki:{' '}
          <a href={url ?? '#'} target={'_blank'}>
            {trackingNumber}
          </a>
        </p>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
