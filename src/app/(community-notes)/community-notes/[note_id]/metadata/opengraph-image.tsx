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
  width: 1140,
  height: 594,
};

export const contentType = "image/png";

const getRatingBadge = (status?: string) => {
  if (!status) return "";
  if (status === "helpful")
    return "https://storage.googleapis.com/buidler/24439d55-3509-4e25-9ff9-362ce2f0a8c2/1706676035316.png";
  if (status === "not_helpful")
    return "https://storage.googleapis.com/buidler/24439d55-3509-4e25-9ff9-362ce2f0a8c2/1706676053051.png";
  return "https://storage.googleapis.com/buidler/24439d55-3509-4e25-9ff9-362ce2f0a8c2/1706676067194.png";
};

export const getOGImage = async (note_id: string, fid: string = "") => {
  let url = `community-notes/dashboard/notes/${note_id}`;
  if (fid) {
    url += `?fid=${fid}`;
  }
  const dashboard = await CallerServer.get<IDashboardLink>(url);
  console.log('Response dashboard data: ', dashboard?.data);
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
    dashboard.data?.note?.final_rating_status === "currently_rated_helpful";
  // const bgBlur =
  //   "https://storage.googleapis.com/buidler/24439d55-3509-4e25-9ff9-362ce2f0a8c2/1706674980072.png";
  const ratingBadge = getRatingBadge(
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
            padding: "32px 48px",
            gap: 32,
            borderBottom: isHelpful ? "none" : "2px solid #F3F3F3",
            backgroundColor: isHelpful ? "#E9EFFD" : "white",
          }}
        >
          {isHelpful ? (
            <IconLogoCircle size={64} />
          ) : (
            <IconNMR fill="#FCB828" size={64} />
          )}
          <span
            style={{
              fontFamily: '"medium"',
              fontSize: 44,
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
              fontSize: 44,
              lineHeight: "76px",
              wordBreak: "break-word",
              whiteSpace: "pre-line",
              textOverflow: "ellipsis",
              width: 1044,
              height: 304,
              margin: "48px 48px 16px 48px",
            }}
          >
            {dashboard.data?.note?.summary}
          </p>
          <div
            style={{
              lineHeight: "76px",
              color: "#848484",
              fontFamily: '"regular"',
              fontSize: 44,
              padding: "0 48px 24px 48px",
            }}
          >
            Click to see more
          </div>
        </div>
        {ratingBadge && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              top: 0,
              backgroundColor: "rgba(255, 255, 255, .5)",
              // backgroundImage: `url(${bgBlur})`,
              // backgroundRepeat: "no-repeat",
              // backgroundSize: "cover",
            }}
          >
            <img
              src={ratingBadge}
              alt="rating-badge"
              width={472}
              height={412}
              style={{ objectFit: "contain" }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 30,
              }}
            >
              {dashboard?.data?.note?.rating?.user?.pfp?.url && (
                <img
                  alt="avatar"
                  src={dashboard?.data?.note?.rating?.user?.pfp?.url}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    objectFit: "cover",
                    border: "2px solid #F3F3F3",
                  }}
                />
              )}
              <span
                style={{
                  fontFamily: '"medium"',
                  fontSize: 44,
                  lineHeight: "60px",
                  color: "#121417",
                }}
              >
                {dashboard?.data?.note?.rating?.user?.display_name}
              </span>
            </div>
          </div>
        )}
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
export default async function OGImage({
  params,
}: {
  params: { note_id: string };
}) {
  return getOGImage(params.note_id);
}
