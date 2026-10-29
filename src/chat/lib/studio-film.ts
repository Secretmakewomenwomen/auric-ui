import { createContext, useContext } from 'react';
export const ClipSourcesContext = createContext<Record<string, string>>({});
export function useClipSrc(id: string | null) { return useContext(ClipSourcesContext)[id ?? ''] ?? null; }
