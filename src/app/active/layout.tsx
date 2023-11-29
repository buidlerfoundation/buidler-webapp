import { defaultMetadata } from "common/AppConfig";
import type { Metadata } from "next";
import HomeFeedWrapper from "screens/Main/Layout/HomeFeedWrapper";

export const metadata: Metadata = defaultMetadata;

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
