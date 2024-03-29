import { redirect } from "next/navigation";

export default function Note({
  searchParams,
}: {
  searchParams: { url: string };
}) {
  if (searchParams.url) {
    redirect(
      `/community-notes/explore/notes/${encodeURIComponent(searchParams.url)}`
    );
  }
}
