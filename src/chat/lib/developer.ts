import { createContext, useContext } from 'react';
export const WaitingContext = createContext(false);
export const ChatProjectContext = createContext<string | null>(null);
export const DeveloperContext = createContext({logs:false,changes:true});
export const useDeveloperMode=()=>useContext(DeveloperContext).logs;
export const useShowChanges=()=>useContext(DeveloperContext).changes;
