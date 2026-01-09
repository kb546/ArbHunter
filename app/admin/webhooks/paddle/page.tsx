import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { getAuthedSessionFromCookies } from '@/lib/auth.server';

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

function isAdminEmail(email: string | null | undefined) {
  const allow = (process.env.ADMIN_EMAILS || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (allow.length === 0) return true; // dev-friendly default
  if (!email) return false;
  return allow.includes(email);
}

export default async function PaddleWebhookAdminPage() {
  const session = await getAuthedSessionFromCookies();
  if (!session?.user) redirect('/auth/login?next=/admin/webhooks/paddle');

  const email = session.user.email as string | undefined;
  if (!isAdminEmail(email)) redirect('/');

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('webhook_events')
    .select(
      'id, provider, event_type, event_id, status, http_status, signature_present, verified, verify_reason, process_error, related_user_id, related_subscription_id, related_transaction_id, created_at'
    )
    .eq('provider', 'paddle')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Paddle Webhook Events</h1>
        <p className="mt-2 text-sm text-red-600">Failed to load: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Paddle Webhook Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Last 100 webhook deliveries processed by <code>/api/webhooks/paddle</code>.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Signed in as <span className="font-medium">{email || 'unknown'}</span>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left">
              <th className="p-3">Time</th>
              <th className="p-3">Event</th>
              <th className="p-3">Status</th>
              <th className="p-3">HTTP</th>
              <th className="p-3">Verified</th>
              <th className="p-3">User</th>
              <th className="p-3">Subscription</th>
              <th className="p-3">Transaction</th>
              <th className="p-3">Error</th>
            </tr>
          </thead>
          <tbody>
            {(data || []).map((row) => (
              <tr key={row.id} className="border-t align-top">
                <td className="p-3 whitespace-nowrap">{new Date(row.created_at).toLocaleString()}</td>
                <td className="p-3">
                  <div className="font-medium">{row.event_type}</div>
                  {row.event_id ? <div className="text-xs text-muted-foreground">{row.event_id}</div> : null}
                </td>
                <td className="p-3">{row.status}</td>
                <td className="p-3">{row.http_status ?? ''}</td>
                <td className="p-3">
                  {row.verified ? 'yes' : 'no'}
                  {row.verify_reason ? <div className="text-xs text-muted-foreground">{row.verify_reason}</div> : null}
                </td>
                <td className="p-3">
                  {row.related_user_id ? <code className="text-xs">{row.related_user_id}</code> : ''}
                </td>
                <td className="p-3">
                  {row.related_subscription_id ? <code className="text-xs">{row.related_subscription_id}</code> : ''}
                </td>
                <td className="p-3">
                  {row.related_transaction_id ? <code className="text-xs">{row.related_transaction_id}</code> : ''}
                </td>
                <td className="p-3">
                  {row.process_error ? <div className="text-xs text-red-600">{row.process_error}</div> : ''}
                </td>
              </tr>
            ))}
            {(!data || data.length === 0) && (
              <tr className="border-t">
                <td className="p-6 text-muted-foreground" colSpan={9}>
                  No webhook events logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-sm text-muted-foreground">
        Tip: in Paddle Sandbox, open the failed delivery row and click <strong>Retry</strong> after redeploying.
      </div>
    </div>
  );
}

