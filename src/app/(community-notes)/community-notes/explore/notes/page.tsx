import CallerServer from "api/CallerServer";
import { IDashboardLink } from "models/CommunityNote";
import NotesByUrl from "screens/NotesByUrl";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { url: string };
}) {
  const dashboard = await CallerServer.get<IDashboardLink>(
    `community-notes/dashboard?url=${searchParams.url}`
  );
  const title = dashboard.data?.metadata?.data?.title;
  const description = dashboard.data?.metadata?.data?.description;
  const image = dashboard.data?.metadata?.data?.image;
  const card = dashboard.data?.metadata?.data?.card;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
    },
    twitter: {
      title,
      description,
      card,
      images: [image],
    },
  };
}

export default function Note() {
  return <NotesByUrl />;
}
