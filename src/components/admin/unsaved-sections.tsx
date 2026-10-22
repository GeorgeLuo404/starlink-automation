"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

/*
 * Which page sections have unsaved edits — shared by the page editor (which
 * reports them) and the sidebar (which marks them and asks before leaving).
 */

type UnsavedSections = {
  unsaved: ReadonlySet<string>;
  setUnsaved: (key: string, dirty: boolean) => void;
};

const Context = createContext<UnsavedSections>({ unsaved: new Set(), setUnsaved: () => {} });

export function UnsavedSectionsProvider({ children }: { children: React.ReactNode }) {
  const [unsaved, setSet] = useState<ReadonlySet<string>>(new Set());
  const setUnsaved = useCallback(
    (key: string, dirty: boolean) =>
      setSet((set) => {
        if (set.has(key) === dirty) return set;
        const next = new Set(set);
        if (dirty) next.add(key);
        else next.delete(key);
        return next;
      }),
    []
  );
  const value = useMemo(() => ({ unsaved, setUnsaved }), [unsaved, setUnsaved]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useUnsavedSections() {
  return useContext(Context);
}
