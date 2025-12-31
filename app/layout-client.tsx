"use client";

import { Toaster } from "react-hot-toast";
import { ReactNode } from "react";

export default function RootLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Toaster position="top-right" />
      {children}
    </>
  );
}
