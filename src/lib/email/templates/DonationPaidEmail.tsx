export function DonationPaidEmail({
  tenantName,
  amount,
  currency,
  donorName,
}: {
  tenantName: string;
  amount: string;
  currency: string;
  donorName?: string | null;
}) {
  return (
    <div>
      <h2>Thank you for your donation 🎉</h2>
      <p>
        {donorName ? <>Hi <strong>{donorName}</strong>,</> : <>Hello,</>} thank you for supporting{" "}
        <strong>{tenantName}</strong>.
      </p>
      <p>
        Amount received: <strong>{currency.toUpperCase()} {amount}</strong>
      </p>
      <p>May God bless you richly.</p>
    </div>
  );
}
