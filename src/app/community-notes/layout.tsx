import { defaultMetadata } from "common/AppConfig";
import type { Metadata } from "next";
import NoteFeedWrapper from "screens/Main/Layout/NoteFeedWrapper";

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <NoteFeedWrapper>{children}</NoteFeedWrapper>
    </section>
  );
}
