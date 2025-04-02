import { immerable } from "immer";

export class GloabalStateService {
    [immerable] = true;
    
    curEditingResourceId: string | null;
    
    constructor() {
        this.curEditingResourceId = null;
    }
}
