import { Metadata } from "next";
import Analytic from "screens/Analytic";

export const metadata: Metadata = {
  title: "Farcaster Insights | Buidler",
  openGraph: {
    title: "Farcaster Insights | Buidler",
    url: process.env.NEXT_PUBLIC_URL + "/insights",
    description:
      "Gain valuable insights into your Farcaster profile's activities, engagement, and reach. Identify top interactors and unlock insights you never knew about.",
  },
  twitter: {
    title: "Farcaster Insights | Buidler",
    description:
      "Gain valuable insights into your Farcaster profile's activities, engagement, and reach. Identify top interactors and unlock insights you never knew about.",
  },
};

export default Analytic;
