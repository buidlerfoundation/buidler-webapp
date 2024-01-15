import { defaultMetadata } from "common/AppConfig";
import type { Metadata } from "next";
import MyContributorWrapper from "screens/Main/Layout/MyContributorWrapper";

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <MyContributorWrapper>{children}</MyContributorWrapper>
    </section>
  );
}
