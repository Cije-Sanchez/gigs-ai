import { createContext } from "react";
import { GlobalState } from "./GlobalState";

export const GlobalStateContext = createContext<GlobalState | null>(null);
