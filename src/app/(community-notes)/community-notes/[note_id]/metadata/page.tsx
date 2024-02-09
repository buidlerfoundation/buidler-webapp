import CallerServer from "api/CallerServer";
import { IDashboardLink } from "models/CommunityNote";
import { Metadata } from "next";
import DashboardByNoteId from "screens/DashboardByNoteId";

export async function generateMetadata({
  params,
}: {
  params: { note_id: string };
}): Promise<Metadata> {
  const dashboard = await CallerServer.get<IDashboardLink>(
    `community-notes/dashboard/notes/${params.note_id}`
  );

  const title = "Community notes for the internet | Buidler";
  const description = dashboard.data?.note?.summary;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: dashboard.data?.note?.final_rating_status
    },
    twitter: {
      title,
      description,
      card: "summary_large_image",
    },
  };
}

export default DashboardByNoteId;
