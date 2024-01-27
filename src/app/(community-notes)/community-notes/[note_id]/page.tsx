import CallerServer from "api/CallerServer";
import { defaultMetadataCN } from "common/AppConfig";
import { IDashboardLink } from "models/CommunityNote";
import { IMetadataUrl } from "models/FC";
import { Metadata } from "next";
import DashboardByNoteId from "screens/DashboardByNoteId";

export async function generateMetadata({
  params,
}: {
  params: { note_id: string };
}): Promise<Metadata> {
  const metadata = await CallerServer.get<IMetadataUrl>(
    `external/metadata?url=${process.env.NEXT_PUBLIC_URL}/community-notes/${params.note_id}/metadata`
  );
  if (!metadata.data) return defaultMetadataCN;
  const { title, description, image = "" } = metadata.data;
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
      card: "summary_large_image",
      images: [image],
    },
    other: {
      "fc:frame": "vNext",
      "fc:frame:image": image,
    },
  };
}

export default DashboardByNoteId;
