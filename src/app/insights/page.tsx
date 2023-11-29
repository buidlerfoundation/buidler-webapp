import { Metadata } from "next";
import Analytic from "screens/Analytic";

export const metadata: Metadata = {
  title: "Farcaster Insights | Buidler",
  openGraph: {
    title: "Farcaster Insights | Buidler",
    url: process.env.NEXT_PUBLIC_URL + "/insights",
    description:
      "Track your Farcaster profile's pulse in real-time — activities, engagement, and followers. Dive deep into performance and unlock insights you never knew about.",
    images: [{ url: "/img_buidler_large_share.png" }],
  },
  twitter: {
    title: "Farcaster Insights | Buidler",
    description:
      "Track your Farcaster profile's pulse in real-time — activities, engagement, and followers. Dive deep into performance and unlock insights you never knew about.",
    images: [{ url: "/img_buidler_large_share.png" }],
  },
};

export default Analytic;
