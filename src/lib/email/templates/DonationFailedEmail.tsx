export function DonationFailedEmail({
  tenantName,
  amount,
  currency,
}: {
  tenantName: string;
  amount: string;
  currency: string;
}) {
  return (
    <div>
      <h2>Donation payment not completed</h2>
      <p>
        We couldn’t confirm your donation to <strong>{tenantName}</strong>.
      </p>
      <p>
        Attempted amount: <strong>{currency.toUpperCase()} {amount}</strong>
      </p>
      <p>If this was a mistake, you can try again at any time.</p>
    </div>
  );
}
