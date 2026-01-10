//ovibase/src/lib/email/send.ts
import { resend, FROM_EMAIL } from "./client";

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactNode;
}) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    react,
  });
}
