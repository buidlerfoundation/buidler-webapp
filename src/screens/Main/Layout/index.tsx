"use client";
import { usePathname } from "next/navigation";
import React, { memo, useMemo } from "react";
import FCWrapper from "./FCWrapper";
import FCPluginWrapper from "./FCPluginWrapper";
import AppToastNotification from "shared/AppToastNotification";

interface ILayout {
  children: React.ReactNode;
}

const Layout = ({ children }: ILayout) => {
  const pathname = usePathname();
  const pathsWithoutLayout = useMemo(
    () => ["/", "/terms", "/privacy", "/login"],
    []
  );
  if (pathsWithoutLayout.includes(pathname)) return children;
  if (pathname?.includes("/plugin-fc")) {
    return <FCPluginWrapper>{children}</FCPluginWrapper>;
  }
  return (
    <FCWrapper>
      <>
        {children}
        <AppToastNotification />
      </>
    </FCWrapper>
  );
};

export default memo(Layout);
