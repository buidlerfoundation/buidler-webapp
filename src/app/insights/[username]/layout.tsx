import type { Metadata } from "next";
import UserInsightWrap from "screens/Main/Layout/UserInsightWrap";

export const metadata: Metadata = {
  metadataBase: new URL("https://3518-171-227-252-51.ngrok-free.app"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <UserInsightWrap>{children}</UserInsightWrap>
    </section>
  );
}
