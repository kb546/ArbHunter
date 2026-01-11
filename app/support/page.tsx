import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';
import { PageHeader, PageShell } from '@/components/layout/PageShell';
import { Card } from '@/components/ui/card';
import SupportForm from './supportForm';

export default async function SupportPage() {
  const session = await getAuthedSessionFromCookies();
  if (!session?.user) redirect('/auth/login?next=/support');

  return (
    <PageShell>
      <PageHeader
        title="Support"
        description="Tell us what happened and we’ll help you fast."
        right={
          <Link className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4" href="/account/settings">
            Account settings
          </Link>
        }
      />

      <Card className="p-5 sm:p-6">
        <SupportForm email={(session.user.email as string | undefined) || null} />
      </Card>
    </PageShell>
  );
}

