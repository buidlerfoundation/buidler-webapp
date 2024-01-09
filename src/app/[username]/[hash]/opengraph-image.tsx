import CallerServer from "api/CallerServer";
import AppConfig from "common/AppConfig";
import { normalizeContentCast, removeProtocol } from "helpers/CastHelper";
import { ICast } from "models/FC";
import moment from "moment";
import { ImageResponse } from "next/og";
import IconActiveBadge from "shared/SVG/FC/IconActiveBadge";
import IconDefaultAvatar from "shared/SVG/IconDefaultAvatar";
import IconGlobalChannel from "shared/SVG/IconGlobalChannel";
import LogoOG from "shared/SVG/LogoOG";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "Summary";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image({
  params,
}: {
  params: { username: string; hash: string };
}) {
  const castRes = await CallerServer.get<ICast>(
    `casts/${params.hash.replace("0x", "")}?page=1&limit=1`
  );
  const [fontBold, fontSemibold, fontMedium, fontRegular] = await Promise.all([
    fetch(
      new URL("../../../../public/fonts/SFUIText-Bold.woff", import.meta.url)
    ).then((res) => res.arrayBuffer()),
    fetch(
      new URL(
        "../../../../public/fonts/SFUIText-Semibold.woff",
        import.meta.url
      )
    ).then((res) => res.arrayBuffer()),
    fetch(
      new URL("../../../../public/fonts/SFUIText-Medium.woff", import.meta.url)
    ).then((res) => res.arrayBuffer()),
    fetch(
      new URL("../../../../public/fonts/SFUIText-Regular.woff", import.meta.url)
    ).then((res) => res.arrayBuffer()),
  ]);
  const author = castRes.data?.author;
  const metadata = castRes.data?.metadata;
  const image = metadata?.logo || metadata?.image;
  const url = metadata?.url || "https://warpcast.com";
  const displayUrl = removeProtocol(url);
  const siteName = metadata?.site_name || new URL(url).host;
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          background: "#000000",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 50,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", gap: 20 }}>
            {author?.pfp?.url ? (
              <img
                src={author?.pfp?.url}
                style={{ width: 90, height: 90, borderRadius: 45 }}
                width={90}
                height={90}
                alt="avatar"
              />
            ) : (
              <IconDefaultAvatar size={90} background="#f3f3f3" color="white" />
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{ fontFamily: '"bold"', fontSize: 30, color: "white" }}
                >
                  {author?.display_name}
                </span>
                {author?.has_active_badge && <IconActiveBadge size={28} />}
                <span
                  style={{
                    color: "#ACACAC",
                    fontFamily: '"regular"',
                    fontSize: 30,
                  }}
                >
                  @{author?.username} •{" "}
                  {moment(castRes?.data?.timestamp).fromNow(true)}
                </span>
              </div>
              {castRes?.data && (
                <p
                  style={{
                    display: "block",
                    lineClamp: 2,
                    color: "white",
                    fontFamily: '"regular"',
                    fontSize: 30,
                    wordBreak: "break-word",
                    whiteSpace: "pre-line",
                    textOverflow: "ellipsis",
                    width: 990,
                    margin: 0,
                  }}
                >
                  {normalizeContentCast(castRes?.data, { withoutHtml: true })}
                </p>
              )}
            </div>
          </div>
          <div
            style={{
              borderRadius: 20,
              border: "2px solid #242424",
              padding: "15px 30px",
              display: "flex",
              flexDirection: "column",
              gap: 15,
              marginTop: 40,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {image ? (
                <img
                  alt="metadata"
                  src={image}
                  style={{ width: 60, height: 60, borderRadius: 30 }}
                  width={60}
                  height={60}
                />
              ) : (
                <IconGlobalChannel size={60} fill="#acacac" />
              )}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  lineHeight: "38px",
                  fontSize: 24,
                  fontFamily: '"medium"',
                  width: 964,
                }}
              >
                <span
                  style={{
                    color: "white",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {siteName}
                </span>
                <span
                  style={{
                    color: "#0584FE",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {displayUrl}
                </span>
              </div>
            </div>
            {metadata?.description && (
              <p
                style={{
                  display: "block",
                  lineClamp: 2,
                  width: 1040,
                  color: "white",
                  fontFamily: '"semibold"',
                  fontSize: 32,
                  lineHeight: "52px",
                  wordBreak: "break-word",
                  whiteSpace: "pre-line",
                  textOverflow: "ellipsis",
                  margin: 0,
                }}
              >
                {metadata?.description}
              </p>
            )}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: 30 }}
          ></div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              alignItems: "flex-end",
            }}
          >
            <LogoOG />
            <span
              style={{
                color: "#0584FE",
                fontSize: 32,
                lineHeight: "48px",
                fontFamily: "medium",
              }}
            >
              buidler.app/{params.username}/0x{params.hash.slice(0, AppConfig.castDetailHashLength)}
            </span>
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
}
