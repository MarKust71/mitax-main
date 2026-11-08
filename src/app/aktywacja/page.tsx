import Link from 'next/link';

import { activateAccount } from '@/lib/auth/activation';
import type { ActivationResult } from '@/lib/auth/activation';

const MESSAGES: Record<ActivationResult, string> = {
  activated: 'Konto zostało aktywowane. Możesz się teraz zalogować.',
  expired: 'Link aktywacyjny wygasł. Zaloguj się i poproś o wysłanie nowego linku.',
  invalid: 'Link aktywacyjny jest nieprawidłowy lub został już wykorzystany.',
};

export default async function ActivationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result: ActivationResult = token ? await activateAccount(token) : 'invalid';

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">Aktywacja konta</h1>
      <p className="mb-6">{MESSAGES[result]}</p>
      <Link href="/" className="underline">
        Strona główna
      </Link>
    </main>
  );
}
