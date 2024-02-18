import { redirect } from "next/navigation";

export default function Report({
  searchParams,
}: {
  searchParams: { url: string };
}) {
  if (searchParams.url) {
    redirect(
      `/community-notes/explore/reports/${encodeURIComponent(searchParams.url)}`
    );
  }
}
