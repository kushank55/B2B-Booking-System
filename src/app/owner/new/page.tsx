import Link from "next/link";
import { OnboardForm } from "./onboard-form";

export default function NewBusinessPage() {
  return (
    <main className="content content-narrow">
      <p>
        <Link href="/owner">Back to customers</Link>
      </p>
      <h1>Onboard a business</h1>
      <p className="muted">
        Creates the tenant and its first Business Admin. No invite email is sent.
      </p>
      <OnboardForm />
    </main>
  );
}
