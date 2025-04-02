
/**
 * Represents a rectangular box on an image.
 * (Left Corner X, Left Corner Y, Width, Height)
 */
export type Box = [number, number, number, number];

export class ImageService {
    constructor() {}

    // /**
    //  * @param png: The Data Url of the Image
    //  * @param cropBox: a tuple of crop box, notated as (Left Corner X, Left Corner Y, Width, Height)
    //  */
    // static async cropImage(imgData: string, cropBox: Box): Promise<string> {
    //     let [left, top, width, height] = cropBox;
    //     let png = fabric.Image.fromURL(imgData);

    //     //将图片放进一个新的canvas中，经裁剪后导出一个新的图片。
    //     //如果用户选框大于原图片，则将选框缩至原图片大小
    //     if (top < png.top!) {
    //         height = height - (png.top! - top);
    //         top = png.top!;
    //     }
    //     if (left < png.left!) {
    //         width = width - (png.left! - left);
    //         left = png.left!;
    //     }
    //     if (top + height > png.top! + png.height! * png.scaleY!)
    //         height = png.top! + png.height! * png.scaleY! - top;
    //     if (left + width > png.left! + png.width! * png.scaleX!)
    //         width = png.left! + png.width! * png.scaleX! - left;

    //     var canvas_crop = new fabric.Canvas('canvas_crop');

    //     png.set('left', -left);
    //     png.set('top', -top);
    //     canvas_crop.add(png);
    //     canvas_crop.setDimensions({ width: width, height: height });
    //     canvas_crop.renderAll();
    //     return canvas_crop.toDataURL();
    // }
}
