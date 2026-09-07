import { requireAdmin } from "@/server/auth/guards";
import { getStaffForTenant } from "@/server/admin/staff";
import { StaffForm } from "../../staff-form";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function EditStaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const result = await requireAdmin();
  if (!result.ok) {
    redirect("/login");
  }

  const { id } = await params;
  const staff = await getStaffForTenant(result.businessId, id);
  if (!staff) {
    notFound();
  }

  return (
    <main className="content content-narrow">
      <Link className="back-link" href="/admin/staff">
        Back to staff
      </Link>
      <h1>Edit staff</h1>
      <StaffForm
        staff={{
          id: staff.id,
          name: staff.name,
          email: staff.email,
          status: staff.status,
        }}
      />
    </main>
  );
}
