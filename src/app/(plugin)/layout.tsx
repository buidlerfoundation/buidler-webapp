import FCPluginWrapper from "screens/Main/Layout/FCPluginWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <FCPluginWrapper>{children}</FCPluginWrapper>
    </section>
  );
}
