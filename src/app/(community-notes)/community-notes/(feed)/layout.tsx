import NoteFeedWrapper from "screens/Main/Layout/NoteFeedWrapper";

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
