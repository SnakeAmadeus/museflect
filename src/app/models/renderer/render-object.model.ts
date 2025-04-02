export class CanvasObject {
    resourceId: number;
    attributes: CanvasObjectAttribute;

    constructor(
        resourceId: number,
        attributes: CanvasObjectAttribute = defaultCanvasObjectAttributes
    ) {
        this.resourceId = resourceId;
        this.attributes = attributes;
    }
}

export class CanvasObjectAttribute {
    posX: number;
    posY: number;
    opacity: number;
    scaleX: number;
    scaleY: number;

    constructor(
        posX: number = 0,
        posY: number = 0,
        opacity: number = 1,
        scaleX: number = 1,
        scaleY: number = 1
    ) {
        this.posX = posX;
        this.posY = posY;
        this.opacity = opacity;
        this.scaleX = scaleX;
        this.scaleY = scaleY;
    }
}
const defaultCanvasObjectAttributes = new CanvasObjectAttribute();
export type SupportedCanvasObjectAttributes = { [K in keyof CanvasObjectAttribute]: K }[keyof CanvasObjectAttribute];
