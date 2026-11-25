import Link from 'next/link';

import { ResetPasswordForm } from './ResetPasswordForm';

import { checkResetToken } from '@/lib/auth/passwordReset';

const ERRORS = {
  expired: 'Link wygasł. Na ekranie logowania poproś o wysłanie nowego linku.',
  invalid: 'Link jest nieprawidłowy lub został już wykorzystany.',
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const status = token ? await checkResetToken(token) : 'invalid';

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">Ustawienie nowego hasła</h1>
      {status === 'valid' && token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <>
          <p className="mb-6">{ERRORS[status === 'expired' ? 'expired' : 'invalid']}</p>
          <Link href="/" className="underline">
            Strona główna
          </Link>
        </>
      )}
    </main>
  );
}
