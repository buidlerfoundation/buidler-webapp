import CallerServer from "api/CallerServer";
import { IDashboardLink } from "models/CommunityNote";
import { ImageResponse } from "next/og";
import IconLogoCircle from "shared/SVG/IconLogoCircle";
import IconNMR from "shared/SVG/IconNMR";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "Summary";
export const size = {
  width: 570,
  height: 298,
};

export const contentType = "image/png";

export const getOGImage = async (note_id: string) => {
  const dashboard = await CallerServer.get<IDashboardLink>(
    `community-notes/dashboard/notes/${note_id}`
  );
  const [fontBold, fontSemibold, fontMedium, fontRegular] = await Promise.all([
    fetch(
      new URL(
        "../../../../../../public/fonts/SFUIText-Bold.woff",
        import.meta.url
      )
    ).then((res) => res.arrayBuffer()),
    fetch(
      new URL(
        "../../../../../../public/fonts/SFUIText-Semibold.woff",
        import.meta.url
      )
    ).then((res) => res.arrayBuffer()),
    fetch(
      new URL(
        "../../../../../../public/fonts/SFUIText-Medium.woff",
        import.meta.url
      )
    ).then((res) => res.arrayBuffer()),
    fetch(
      new URL(
        "../../../../../../public/fonts/SFUIText-Regular.woff",
        import.meta.url
      )
    ).then((res) => res.arrayBuffer()),
  ]);
  const isHelpful = dashboard.data?.note?.final_rating_status;
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 24px",
            gap: 16,
            borderBottom: isHelpful ? "none" : "1px solid #F3F3F3",
            backgroundColor: isHelpful ? "#E9EFFD" : "unset",
            borderTopLeftRadius: 7,
            borderTopRightRadius: 7,
          }}
        >
          {isHelpful ? (
            <IconLogoCircle size={32} />
          ) : (
            <IconNMR fill="#FCB828" size={32} />
          )}
          <span
            style={{
              fontFamily: '"medium"',
              fontSize: 22,
              color: isHelpful ? "#121417" : "#44474B",
            }}
          >
            {isHelpful ? "Helpful context" : "Needs more ratings"}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "24px 24px 12px 24px",
            backgroundColor: "white",
          }}
        >
          <p
            style={{
              display: "block",
              lineClamp: 4,
              color: "#121417",
              fontFamily: '"regular"',
              fontSize: 22,
              lineHeight: "38px",
              wordBreak: "break-word",
              whiteSpace: "pre-line",
              textOverflow: "ellipsis",
              width: 522,
              height: 152,
              margin: 0,
            }}
          >
            {dashboard.data?.note?.summary}
          </p>
          <div
            style={{
              lineHeight: "38px",
              color: "#848484",
              fontFamily: '"regular"',
              fontSize: 22,
              paddingBottom: 12,
            }}
          >
            Click to see more
          </div>
        </div>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse's width and height.
      ...size,
      fonts: [
        {
          name: "bold",
          data: fontBold,
          style: "normal",
        },
        {
          name: "semibold",
          data: fontSemibold,
          style: "normal",
        },
        {
          name: "medium",
          data: fontMedium,
          style: "normal",
        },
        {
          name: "regular",
          data: fontRegular,
          style: "normal",
        },
      ],
    }
  );
};

// Image generation
export default async function Image({
  params,
}: {
  params: { note_id: string };
}) {
  return getOGImage(params.note_id);
}
