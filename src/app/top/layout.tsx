import type { Metadata } from "next";
import HomeFeedWrapper from "screens/Main/Layout/HomeFeedWrapper";

export const metadata: Metadata = {
  title: "Hacker News on Farcaster | Buidler",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <HomeFeedWrapper>{children}</HomeFeedWrapper>
    </section>
  );
}
