"use client";

import dynamic from "next/dynamic";

const NewSwotPage = dynamic(() => import("../../views/NewSwotPage"), {
  ssr: false,
});

export default function SwotClient() {
  return <NewSwotPage />;
}

