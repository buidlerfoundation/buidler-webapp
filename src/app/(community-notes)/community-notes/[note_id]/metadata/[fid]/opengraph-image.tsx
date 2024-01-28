import CallerServer from "api/CallerServer";
import { IDashboardLink } from "models/CommunityNote";
import { ImageResponse } from "next/og";
import IconLogoCircle from "shared/SVG/IconLogoCircle";
import IconNMR from "shared/SVG/IconNMR";
import { getOGImage } from "../opengraph-image";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "Summary";

// Image generation
export default async function Image({
  params,
}: {
  params: { note_id: string; fid: string };
}) {
  return getOGImage(params.note_id, params.fid);
}
