import { FileService } from '../services/file-service.service';
import { ImageService, Box } from '../services/image.service';
import { immerable } from 'immer';

export class ScoreVideoObject {
    [immerable] = true;
    label: string;
    dataUrl: string | Array<string>;

    typeName: string;
    typeShorthand: string;
    canOnStage: boolean;
    canHaveChildren: boolean;

    constructor(label = '', data = '') {
        this.label = label;
        this.dataUrl = data;

        this.typeName = 'Others';
        this.typeShorthand = '';
        this.canOnStage = false;
        this.canHaveChildren = true;
    }
}

export class AudioTrack extends ScoreVideoObject {
    constructor(data: string, label: string = '') {
        super(label);
        this.dataUrl = data;

        this.typeName = 'Audio';
        this.typeShorthand = 'a';
        this.canOnStage = true;
        this.canHaveChildren = false;
    }
}

export class ScoreBook extends ScoreVideoObject {
    private constructor(label: string) {
        super(label);
        this.dataUrl = [];

        this.typeName = 'ScoreBook';
        this.typeShorthand = '';
        this.canOnStage = false;
        this.canHaveChildren = true;
    }

    // Use factory pattern (an async builder method) to build ScoreBook object asynchronously.
    static async create(
        data: string | string[],
        dataType: 'pdf' | 'img',
        label: string = 'New Score Book'
    ): Promise<ScoreBook> {
        const scoreBook = new ScoreBook(label);

        switch (dataType) {
            case 'pdf':
                const converted = await FileService.convertPDFtoImages(
                    data as string
                );
                converted.forEach((img) => {
                    (scoreBook.dataUrl as string[]).push(img);
                });
                console.log('PDF Converted! ', scoreBook.dataUrl);
                break;
            case 'img':
                scoreBook.dataUrl = (data as string[]).map(
                    (img) => `data:image/png;base64,${img}`
                );
                break;
        }

        return scoreBook;
    }

    toPages(
        pageRangeStart: number = -1,
        pageRangeEnd: number = -1
    ): Array<Page> | Page {
        if (pageRangeStart < 0) pageRangeStart = 0;
        if (pageRangeEnd < 0 || pageRangeEnd >= this.dataUrl.length)
            pageRangeEnd = this.dataUrl.length;

        if (pageRangeStart == pageRangeEnd) {
            return new Page(this, pageRangeStart);
        }

        const targetDataUrls = this.dataUrl.slice(pageRangeStart, pageRangeEnd);
        return (targetDataUrls as string[]).map((p, i) => {
            return new Page(p, i, `Page ${i+1}`);
        });
    }
}

export class Page extends ScoreVideoObject {
    constructor(
        data: ScoreBook | string,
        pageNumber: number = -1,
        label: string = ''
    ) {
        super(label);

        if (data instanceof ScoreBook) {
            if (pageNumber == -1) pageNumber = 0;
            this.dataUrl = JSON.parse(
                JSON.stringify((data as ScoreBook).dataUrl[pageNumber])
            );
        } else {
            this.dataUrl = data;
        }

        this.typeName = 'Page';
        this.typeShorthand = 'p';
        this.canOnStage = true;
        this.canHaveChildren = true;
    }
}

export class Excerpt extends ScoreVideoObject {
    constructor(
        data: Page | string,
        cropBox: Box | null = null,
        label: string = ''
    ) {
        super(label);

        let originalData = '';
        if (data instanceof Page) {
            originalData = data.dataUrl as string;
            if (cropBox != null) {
                ImageService.cropImage(originalData, cropBox).then(
                    (croppedImg) => (this.dataUrl = croppedImg)
                );
            } else {
                this.dataUrl = originalData;
            }
        } else {
            this.dataUrl = data;
        }

        this.typeName = 'Excerpt';
        this.typeShorthand = 's';
        this.canOnStage = true;
        this.canHaveChildren = true;
    }
}

export class Mask extends ScoreVideoObject {
    // constructor(data: string = "", )
}
