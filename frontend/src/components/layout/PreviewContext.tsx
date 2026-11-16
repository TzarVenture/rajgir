"use client";

import React, { createContext, useContext } from "react";

/**
 * True while the Coming Soon gate is active (i.e. the viewer is a stakeholder
 * previewing the real site). False after launch, so preview-only UI such as
 * the "Stakeholder Preview" banner disappears for everyone.
 */
const PreviewContext = createContext(false);

export function PreviewProvider({
  isPreview,
  children,
}: {
  isPreview: boolean;
  children: React.ReactNode;
}) {
  return <PreviewContext.Provider value={isPreview}>{children}</PreviewContext.Provider>;
}

export function usePreviewMode(): boolean {
  return useContext(PreviewContext);
}
