import type { Metadata } from "next";
import HomeFeedWrapper from "pages/Main/Layout/HomeFeedWrapper";

export const metadata: Metadata = {};

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
