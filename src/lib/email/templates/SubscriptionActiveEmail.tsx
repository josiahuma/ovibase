//ovibase/src/lib/email/templates/SubscriptionActiveEmail.tsx
export function SubscriptionActiveEmail({ tenantName }: { tenantName: string }) {
  return (
    <div>
      <h2>Your OviBase Pro subscription is active 🎉</h2>
      <p>
        Pro features are now unlocked for <strong>{tenantName}</strong>.
      </p>
      <p>Thank you for supporting OviBase.</p>
    </div>
  );
}
