import CallerServer from "api/CallerServer";
import { IDashboardLink } from "models/CommunityNote";
import { ImageResponse } from "next/og";
import IconCircleCheck from "shared/SVG/IconCircleCheck";
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

const getRatingStatus = (status?: string) => {
  if (!status) return "";
  if (status === "helpful") return "Helpful";
  if (status === "not_helpful") return "Unhelpful";
  return "Somewhat Helpful";
};

export const getOGImage = async (note_id: string, fid?: string) => {
  const dashboard = await CallerServer.get<IDashboardLink>(
    `community-notes/dashboard/notes/${note_id}?fid=${fid}`
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
  const isHelpful =
    dashboard.data?.note?.final_rating_status === "Helpful context";
  const ratingStatus = getRatingStatus(
    dashboard.data?.note?.rating?.helpfulness_level
  );
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 24px",
            gap: 16,
            borderBottom: isHelpful ? "none" : "1px solid #F3F3F3",
            backgroundColor: isHelpful ? "#E9EFFD" : "white",
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
              margin: "24px 24px 8px 24px",
            }}
          >
            {dashboard.data?.note?.summary || "efjwekfhjwekf"}
          </p>
          {ratingStatus ? (
            <div
              style={{
                display: "flex",
                height: 50,
                borderTop: "1px solid #F3F3F3",
                padding: "0 24px",
                alignItems: "center",
                gap: 12,
              }}
            >
              <IconCircleCheck size={24} fill="#F8F8F8" color="#848484" />
              <span
                style={{
                  color: "#848484",
                  fontFamily: '"regular"',
                  fontSize: 20,
                }}
              >
                You rated this note as
                <span style={{ color: "#121417", marginLeft: 5 }}>
                  {ratingStatus}
                </span>
              </span>
            </div>
          ) : (
            <div
              style={{
                lineHeight: "38px",
                color: "#848484",
                fontFamily: '"regular"',
                fontSize: 22,
                padding: "0 24px 12px 24px",
              }}
            >
              Click to see more
            </div>
          )}
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
