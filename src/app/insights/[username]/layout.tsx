import type { Metadata } from "next";
import UserInsightWrap from "screens/Main/Layout/UserInsightWrap";

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
