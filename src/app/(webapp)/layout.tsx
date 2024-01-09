import FCWrapper from "screens/Main/Layout/FCWrapper";
import AppToastNotification from "shared/AppToastNotification";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <FCWrapper>
        <>
          {children}
          <AppToastNotification />
        </>
      </FCWrapper>
    </section>
  );
}
