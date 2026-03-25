"use client";

import { useEffect } from "react";

export default function ClientBodyClass() {
  useEffect(() => {
    if (
      /Safari/.test(navigator.userAgent) &&
      !/Chrome/.test(navigator.userAgent)
    ) {
      document.body.classList.add("safari-browser");
    }
  }, []);

  return null;
}

