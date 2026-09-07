import { requireAdmin } from "@/server/auth/guards";
import { ProfileForm } from "./profile-form";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const result = await requireAdmin();
  if (!result.ok) {
    redirect("/login");
  }

  return (
    <main className="content content-narrow">
      <h1>Business profile</h1>
      <p className="muted lede">
        These details belong to /{result.business.slug}. Status is controlled by
        the System Owner.
      </p>
      <p>
        <a href={`/book/${result.business.slug}`}>Public booking page</a>
      </p>
      <ProfileForm
        business={{
          name: result.business.name,
          contactEmail: result.business.contactEmail,
          contactPhone: result.business.contactPhone,
          timezone: result.business.timezone,
        }}
      />
    </main>
  );
}
