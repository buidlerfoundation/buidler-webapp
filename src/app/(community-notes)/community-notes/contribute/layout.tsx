import MyContributorWrapper from "screens/Main/Layout/MyContributorWrapper";

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
