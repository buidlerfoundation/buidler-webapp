import { useEffect, useState } from "react";

const useExtensionInstalled = () => {
  const [installed, setInstalled] = useState(true);
  // useEffect(() => {
  //   const isInstalled =
  //     document.documentElement.getAttribute("buidler-extension");
  //   setInstalled(!!isInstalled);
  // }, []);
  return installed;
};

export default useExtensionInstalled;
