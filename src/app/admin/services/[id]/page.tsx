import { requireAdmin } from "@/server/auth/guards";
import { getServiceForTenant } from "@/server/admin/services";
import { ServiceForm } from "../../service-form";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const result = await requireAdmin();
  if (!result.ok) {
    redirect("/login");
  }

  const { id } = await params;
  const service = await getServiceForTenant(result.businessId, id);
  if (!service) {
    notFound();
  }

  return (
    <main className="content content-narrow">
      <Link className="back-link" href="/admin/services">
        Back to services
      </Link>
      <h1>Edit service</h1>
      <ServiceForm
        service={{
          id: service.id,
          name: service.name,
          durationMinutes: service.durationMinutes,
          status: service.status,
        }}
      />
    </main>
  );
}
