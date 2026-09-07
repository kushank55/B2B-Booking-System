import { PublicFrame } from "@/components/public-frame";

export default function NotFound() {
  return (
    <PublicFrame>
      <main className="content content-narrow">
        <h1>Page not found</h1>
        <p className="muted lede">
          That link is missing or you do not have access to it.
        </p>
        <div className="empty">Check the URL, or go back to the previous page.</div>
      </main>
    </PublicFrame>
  );
}
