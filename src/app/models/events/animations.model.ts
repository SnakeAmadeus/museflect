import { SupportedCanvasObjectAttributes } from "../renderer/render-object.model";
import { DefaultEnvelopes, Envelope, SupportedDefaultEnvelopes } from "./envelopes.model";

export class Animation {
    targetAttribute: SupportedCanvasObjectAttributes;

    startValue: number;
    endValue: number;
    envelope: Envelope;

    constructor(
        targetAttribute: SupportedCanvasObjectAttributes, 
        startValue: number,
        endValue: number,
        envelope: SupportedDefaultEnvelopes | Envelope
    ) {
        this.targetAttribute = targetAttribute;
        this.startValue = startValue;
        this.endValue = endValue;
        this.envelope = typeof envelope == "string" ? 
            DefaultEnvelopes[envelope] :
            envelope;
    }
}
