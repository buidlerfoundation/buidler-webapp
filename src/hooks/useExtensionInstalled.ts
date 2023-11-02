import { useEffect, useState } from "react";

const useExtensionInstalled = () => {
  const [installed, setInstalled] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      const isInstalled =
        document.documentElement.getAttribute("buidler-extension");
      setInstalled(!!isInstalled);
    }, 500);
  }, []);
  return installed;
};

export default useExtensionInstalled;
