"use client";

import dynamic from "next/dynamic";

const DiscPage = dynamic(() => import("../views/DiscPage"), { ssr: false });

export default function HomeClient() {
  return <DiscPage />;
}

