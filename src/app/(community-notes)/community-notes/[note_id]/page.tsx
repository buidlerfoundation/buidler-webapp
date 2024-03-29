import CallerServer from "api/CallerServer";
import { defaultMetadataCN } from "common/AppConfig";
import { IMetadataUrl } from "models/FC";
import { Metadata } from "next";
import DashboardByNoteId from "screens/DashboardByNoteId";

export async function generateMetadata({
  params,
}: {
  params: { note_id: string };
}): Promise<Metadata> {
  const metadata = await CallerServer.get<IMetadataUrl>(
    `external/metadata?url=${process.env.NEXT_PUBLIC_FRAME_METADATA_URL}/community-notes/${params.note_id}`,
    undefined,
    undefined,
    true
  );
  if (!metadata.data) return defaultMetadataCN;
  const { title, description, image = "", site_name } = metadata.data;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`${image}&${site_name}`],
    },
    twitter: {
      title,
      description,
      card: "summary_large_image",
      images: [`${image}&${site_name}`],
    },
    other: {
      "fc:frame": "vNext",
      "fc:frame:image": `${image}&${site_name}`,
      "fc:frame:button:1": "Rate it",
      "fc:frame:post_url": `${process.env.NEXT_PUBLIC_API_BASE_URL}external/frame/${params.note_id}`,
    },
  };
}

export default DashboardByNoteId;
