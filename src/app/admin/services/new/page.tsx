import Link from "next/link";
import { ServiceForm } from "../../service-form";

export default function NewServicePage() {
  return (
    <main className="content content-narrow">
      <p>
        <Link href="/admin/services">Back to services</Link>
      </p>
      <h1>Add service</h1>
      <ServiceForm />
    </main>
  );
}
