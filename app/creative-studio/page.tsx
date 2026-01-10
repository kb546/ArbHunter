import { redirect } from 'next/navigation';
import CreativeStudioClient from './CreativeStudioClient';
import { getBillingAccess } from '@/lib/billing.server';

export default async function CreativeStudioPage() {
  const access = await getBillingAccess();
  if (!access.ok) {
    redirect('/pricing');
  }

  return <CreativeStudioClient />;
}
