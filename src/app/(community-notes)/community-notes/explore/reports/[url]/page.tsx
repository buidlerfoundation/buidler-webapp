import CallerServer from "api/CallerServer";
import { defaultMetadataCN } from "common/AppConfig";
import { getMetadataFromServer } from "helpers/LinkHelper";
import { IMetadataUrl } from "models/FC";
import { Metadata } from "next";
import ReportsByUrl from "screens/ReportsByUrl";

export async function generateMetadata({
  params,
}: {
  params: { url: string };
}): Promise<Metadata> {
  const url = `${process.env.NEXT_PUBLIC_FRAME_METADATA_URL}/community-notes/explore/${params.url}`;
  const metadata = await getMetadataFromServer(url);
  if (!metadata.image) return defaultMetadataCN;
  const { title, description, image = "" } = metadata;
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
      "fc:frame:button:1": "🚫️ Misleading",
      "fc:frame:button:2": "👍️ Not Misleading",
      "fc:frame:post_url": `${process.env.NEXT_PUBLIC_API_BASE_URL}external/frame`,
    },
  };
}

export default function Report() {
  return <ReportsByUrl />;
}
