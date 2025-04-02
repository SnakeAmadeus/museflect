import { CanvasObject } from "./render-object.model";

export class RenderCache {
    keyframes = Array<Keyframe>;
    interpolations = Array<KeyframeInterpolation>;

    keyframesLookUpTable = new Map<number, Keyframe>;
    interpolationsLookUpTable = new Map<number, KeyframeInterpolation>;

    constructor() {
        this.keyframes = Array<Keyframe>;
        this.interpolations = Array<KeyframeInterpolation>;

        this.keyframesLookUpTable = new Map<number, Keyframe>;
        this.interpolationsLookUpTable = new Map<number, KeyframeInterpolation>;
    }

}

export class Keyframe {
    cacheId: number;
    start: number;
    sourceTaskId: Array<number>;
    canvasObjects: Array<CanvasObject>;
    activeInterpolations: Array<KeyframeInterpolation>

    constructor(
        cacheId: number, 
        start: number, 
        sourceTaskId: Array<number> | number, 
        canvasObjects: Array<number> | number, 
        activeInterpolations: Array<KeyframeInterpolation> = []
    ) {
        this.cacheId = cacheId;
        this.start = start;
        this.sourceTaskId = typeof sourceTaskId == "number" ? 
            [ sourceTaskId ] :
            sourceTaskId;
        this.canvasObjects = typeof canvasObjects == "number" ?
            [ new CanvasObject(canvasObjects) ] :
            canvasObjects.map((i) => new CanvasObject(i));
        this.activeInterpolations = activeInterpolations
    }
}

export class KeyframeInterpolation {
    cacheId: number;
    start: number;
    end: number;
    sourceTaskId: Array<number>;
    envelope: (t: number) => number;

    constructor(
        cacheId: number,
        start: number,
        end: number,
        sourceTaskId: Array<number> | number, 
        envelope: (t: number) => number
    ) {
        this.cacheId = cacheId;
        this.start = start;
        this.end = end;
        this.sourceTaskId = typeof sourceTaskId == "number" ?
            [sourceTaskId] :
            sourceTaskId;
        this.envelope = envelope;
    }
}
