"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useHeaderUser } from "@/components/layout/HeaderAuth";
import { SearchPalette } from "@/components/layout/SearchPalette";
import { useSearchHotkey } from "@/components/layout/useDismiss";

interface SearchApi {
  open: () => void;
}

const SearchContext = createContext<SearchApi>({ open: () => undefined });

/**
 * One search palette for the whole real site: the header icon, the big search fields on landing pages,
 * the dashboard top bar and Ctrl/Cmd+K all open this same instance. Must sit inside HeaderAuthProvider.
 */
export function SearchProvider({ children }: { children: ReactNode }) {
  const user = useHeaderUser();
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  useSearchHotkey(open);
  const api = useMemo(() => ({ open }), [open]);

  return (
    <SearchContext.Provider value={api}>
      {children}
      <SearchPalette open={isOpen} onClose={close} role={user?.role} />
    </SearchContext.Provider>
  );
}

export const useSearch = (): SearchApi => useContext(SearchContext);
