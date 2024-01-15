import CommunityNoteByUrlWrapper from "screens/Main/Layout/CommunityNoteByUrlWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <CommunityNoteByUrlWrapper>{children}</CommunityNoteByUrlWrapper>
    </section>
  );
}
