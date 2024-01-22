import { defaultMetadataCN } from "common/AppConfig";
import { Metadata } from "next";
import FCWrapper from "screens/Main/Layout/FCWrapper";
import AppToastNotification from "shared/AppToastNotification";

export const metadata: Metadata = defaultMetadataCN;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <FCWrapper communityNote>
        <>
          {children}
          <AppToastNotification />
        </>
      </FCWrapper>
    </section>
  );
}
