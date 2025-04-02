import { create } from "zustand/react";
import { GloabalStateService } from "../global-states.service";
import { produce } from "immer";

const initialGlobalUIState = new GloabalStateService();

export const useGlobalUIStateStore = create<any>((set) => ({
    globalUIState: initialGlobalUIState,
    
    updateEditingResource: (id: string | null) =>
        set(
            produce((state: any) => {
                if (state.globalUIState.curEditingResourceId !== id) {
                    state.globalUIState.curEditingResourceId = id;
                    console.log(`globalUIStateStore: Sending Resource ID #${id} to Canvas...`);
                }
                    
            })
        )
}));