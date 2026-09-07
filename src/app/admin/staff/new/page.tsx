import Link from "next/link";
import { StaffForm } from "../../staff-form";

export default function NewStaffPage() {
  return (
    <main className="content content-narrow">
      <Link className="back-link" href="/admin/staff">
        Back to staff
      </Link>
      <h1>Add staff</h1>
      <StaffForm />
    </main>
  );
}
