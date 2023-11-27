"use client";

import { useEffect } from "react";

function BootstrapClient() {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap");
  }, []);

  return null;
}

export default BootstrapClient;
