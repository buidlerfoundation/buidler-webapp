import type { Metadata } from "next";
import Providers from "providers";
import BootstrapClient from "screens/BootstrapClient";
import "bootstrap/dist/css/bootstrap.css";
import "../index.scss";
import "../App.scss";
import "../styles/spacing.scss";
import "../styles/emoji.scss";
import "screens/Website/css/index.scss";
import "screens/Website/css/responsive.scss";
import "screens/Website/css/home.scss";
import "screens/Website/css/home-responsive.scss";
import "shared/AppToastNotification/index.scss";
import Layout from "screens/Main/Layout";
import moment from "moment";

moment.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "seconds",
    ss: "%ss",
    m: "a minute",
    mm: "%dm",
    h: "an hour",
    hh: "%dh",
    d: "a day",
    dd: "%dd",
    M: "a month",
    MM: "%dM",
    y: "a year",
    yy: "%dY",
  },
});

export const metadata: Metadata = {
  title: "Buidler - A social web annotation built on Farcaster",
  description:
    "Buidler is a social web annotation that enables you to comment and engage in discussions on any webpage. With Buidler, you can share your thoughts, explore different viewpoints, and connect with others, all within the context of the web content you're browsing.",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/logo192.png" },
  ],
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    url: "https://buidler.app",
    siteName: "Buidler",
    images: [{ url: "/img_buidler_large_promo.png" }],
    title: "Buidler - A social web annotation built on Farcaster",
    description:
      "Buidler is a social web annotation that enables you to comment and engage in discussions on any webpage. With Buidler, you can share your thoughts, explore different viewpoints, and connect with others, all within the context of the web content you're browsing.",
  },
  twitter: {
    card: "summary_large_image",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <>
            <BootstrapClient />
            <Layout>{children}</Layout>
          </>
        </Providers>
      </body>
    </html>
  );
}
