"use client";

import React, { createContext, useContext } from "react";

/**
 * Who is signed in, for the site header (Log in / Sign up vs. name, Dashboard and Log out).
 * Provided by the real-site layout; only the display name is passed to the browser.
 */
export interface HeaderUser {
  name: string;
}

const HeaderAuthContext = createContext<HeaderUser | null>(null);

export function HeaderAuthProvider({
  user,
  children,
}: {
  user: HeaderUser | null;
  children: React.ReactNode;
}) {
  return <HeaderAuthContext.Provider value={user}>{children}</HeaderAuthContext.Provider>;
}

export function useHeaderUser(): HeaderUser | null {
  return useContext(HeaderAuthContext);
}
