import { useEffect, useState } from "react";
import { lumiEngine, type LumiEngineState } from "./lumiEngine";

const initialState: LumiEngineState = lumiEngine.getState();

export function useLumiEngineState(): LumiEngineState {
  const [state, setState] = useState<LumiEngineState>(initialState);

  useEffect(() => {
    return lumiEngine.subscribe(setState);
  }, []);

  return state;
}
