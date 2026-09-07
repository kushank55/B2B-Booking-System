import Link from "next/link";
import { OnboardForm } from "./onboard-form";

export default function NewBusinessPage() {
  return (
    <main className="content content-narrow">
      <Link className="back-link" href="/owner">
        Back to customers
      </Link>
      <h1>Onboard a business</h1>
      <p className="muted lede">
        Creates the tenant and its first Business Admin. No invite email is sent.
      </p>
      <OnboardForm />
    </main>
  );
}
