type Props = {
  name: string;
  tenantName: string;
  loginUrl: string;
};

export function WelcomeEmail({ name, tenantName, loginUrl }: Props) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", lineHeight: 1.6 }}>
      <h2>Welcome to OviBase 👋</h2>

      <p>Hi {name},</p>

      <p>
        Your church workspace <strong>{tenantName}</strong> has been created
        successfully.
      </p>

      <p>
        You can now manage members, attendance, finances, donations, and
        communication — all in one place.
      </p>

      <p>
        <a href={loginUrl}>👉 Go to your dashboard</a>
      </p>

      <p>
        If you need help onboarding your team or migrating data, we’re happy to
        support you.
      </p>

      <p>
        Blessings,<br />
        <strong>OviBase Team</strong>
      </p>
    </div>
  );
}
