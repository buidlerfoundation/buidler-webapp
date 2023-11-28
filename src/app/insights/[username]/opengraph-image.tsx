import CallerServer from "api/CallerServer";
import { IFCUser } from "models/FC";
import { ImageResponse } from "next/og";
import numeral from "numeral";
import IconActiveBadge from "shared/SVG/FC/IconActiveBadge";
import IconDefaultAvatar from "shared/SVG/IconDefaultAvatar";
import IconInsights from "shared/SVG/IconInsights";
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
  params: { username: string };
}) {
  const userByUserNameRes = await CallerServer.get<IFCUser>(
    `users/user-by-username?${new URLSearchParams(params)}`
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
  const [userRes, interactionRes] = await Promise.all([
    CallerServer.get<IFCUser>(`users/${userByUserNameRes?.data?.fid}`),
    CallerServer.get<IFCUser[]>(
      `users/${userByUserNameRes?.data?.fid}/top-reaction?${new URLSearchParams(
        {
          page: "1",
          limit: "3",
        }
      )}`
    ),
  ]);
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
          <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
            {userRes?.data?.pfp?.url ? (
              <img
                src={userRes?.data?.pfp?.url}
                style={{ width: 90, height: 90, borderRadius: 45 }}
                width={90}
                height={90}
                alt="avatar"
              />
            ) : (
              <IconDefaultAvatar size={90} background="#f3f3f3" color="white" />
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                flex: 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{ fontFamily: '"bold"', fontSize: 32, color: "white" }}
                >
                  {userRes?.data?.display_name}
                </span>
                {userRes?.data?.has_active_badge && (
                  <IconActiveBadge size={28} />
                )}
              </div>
              <span
                style={{
                  color: "#ACACAC",
                  fontFamily: '"medium"',
                  fontSize: 30,
                }}
              >
                @{userRes?.data?.username}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: 70,
                padding: "0 30px",
                gap: 20,
                borderRadius: 20,
                border: "2px solid #242424",
                marginRight: 10,
              }}
            >
              <IconInsights />
              <span
                style={{
                  fontSize: 32,
                  fontFamily: '"semibold"',
                  color: "#acacac",
                  lineHeight: "48px",
                }}
              >
                Profile Insight
              </span>
            </div>
          </div>
          {userRes?.data?.profile?.bio?.text && (
            <div
              style={{
                fontSize: 32,
                lineHeight: "48px",
                fontFamily: '"medium"',
                color: "white",
                marginTop: 20,
              }}
            >
              {userRes?.data?.profile?.bio?.text}
            </div>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 75,
              marginTop: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 32,
                  lineHeight: "48px",
                  fontFamily: '"semibold"',
                  color: "white",
                }}
              >
                {numeral(userRes?.data?.total_following).format("0[.][0]a")}
              </span>
              <span
                style={{
                  fontSize: 32,
                  lineHeight: "48px",
                  fontFamily: '"regular"',
                  color: "#ACACAC",
                }}
              >
                Following
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 32,
                  lineHeight: "48px",
                  fontFamily: '"semibold"',
                  color: "white",
                }}
              >
                {numeral(userRes?.data?.total_follower).format("0[.][0]a")}
              </span>
              <span
                style={{
                  fontSize: 32,
                  lineHeight: "48px",
                  fontFamily: '"regular"',
                  color: "#ACACAC",
                }}
              >
                Follower
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 32,
                  lineHeight: "48px",
                  fontFamily: '"semibold"',
                  color: "white",
                }}
              >
                {numeral(userRes?.data?.total_cast).format("0[.][0]a")}
              </span>
              <span
                style={{
                  fontSize: 32,
                  lineHeight: "48px",
                  fontFamily: '"regular"',
                  color: "#ACACAC",
                }}
              >
                Casts
              </span>
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
            <span
              style={{
                color: "#ACACAC",
                fontSize: 28,
                lineHeight: "42px",
                fontFamily: "semibold",
              }}
            >
              Top interactions
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {interactionRes?.data?.map((el) =>
                el?.pfp?.url ? (
                  <img
                    key={el.fid}
                    alt="avatar"
                    src={el?.pfp?.url}
                    style={{ width: 60, height: 60, borderRadius: 30 }}
                    width={60}
                    height={60}
                  />
                ) : (
                  <IconDefaultAvatar
                    size={60}
                    key={el.fid}
                    background="#f3f3f3"
                    color="white"
                  />
                )
              )}
            </div>
          </div>
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
              buidler.app/insights/{params.username}
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
