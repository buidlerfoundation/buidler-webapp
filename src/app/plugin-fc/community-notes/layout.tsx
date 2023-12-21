import { defaultMetadata } from "common/AppConfig";
import type { Metadata } from "next";
import CommunityNoteWrapper from "screens/Main/Layout/CommunityNoteWrapper";

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <CommunityNoteWrapper>{children}</CommunityNoteWrapper>
    </section>
  );
}
