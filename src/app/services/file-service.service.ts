import { getDocument, PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

export class FileService {
    static async openFileDialog(options: Object): Promise<string> {
        try {
            const filePath = await window.ipcRenderer.invoke(
                'open-file-dialog',
                options
            );
            return filePath || '';
        } catch (error) {
            console.error('Error selecting file:', error);
            return '';
        }
    }

    static async readFileContent(path: string): Promise<string> {
        try {
            const content = await window.ipcRenderer.invoke(
                'read-file-content',
                path
            );
            return content || '';
        } catch (error) {
            console.error('Error reading file:', error);
            return '';
        }
    }

    static validateBase64(str: string) {
        try {
            return btoa(atob(str)) === str;
        } catch (err) {
            return false;
        }
    }
    static DEAFULT_PDF_TO_IMG_OPTION = {
        disableFontFace: false,
        useSystemFonts: false,
        viewportScale: 1.0,
        verbosityLevel: 0
    };
    /**
     * Converts a PDF (as base64 string) to an array of base64 image strings
     *
     * @param {string} pdfData - Base64 encoded PDF data
     * @param {Object} options - Conversion options
     * @param {number} options.scale - Scale factor for rendering (default: 1.5)
     * @param {string} options.imageType - Output image format (default: 'image/jpeg')
     * @param {number} options.imageQuality - JPEG quality from 0 to 1 (default: 0.95)
     * @returns {Promise<string[]>} - Promise resolving to array of base64 image strings
     */
    static async convertPDFtoImages(
        pdfData: string,
        options: {
            scale?: number;
            imageType?: string;
            imageQuality?: number;
        } = {}
    ): Promise<string[]> {
        const {
            scale = 2,
            imageType = 'image/png',
            imageQuality = 1
        } = options;

        // Ensure pdfData is properly formatted
        let pdfSource = pdfData;
        if (pdfData.indexOf('data:application/pdf;base64,') === 0) {
            const blob = FileService.base64ToBlob(pdfData);
            pdfSource = URL.createObjectURL(blob);
        } else {
            const blob = FileService.base64ToBlob(pdfData, 'application/pdf');
            pdfSource = URL.createObjectURL(blob);
        }

        try {
            // Load the PDF document
            const pdf = await getDocument(pdfSource).promise;
            const numPages = pdf.numPages;
            const pages: string[] = [];

            // Process each page
            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale });

                // Create canvas for rendering
                const canvas = document.createElement('canvas');
                const canvasContext = canvas.getContext('2d');
                if (!canvasContext) {
                    throw new Error('Could not get canvas context');
                }

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Render PDF page to canvas
                await page.render({
                    canvasContext,
                    viewport
                }).promise;

                // Convert canvas to base64 image
                const imageData = canvas.toDataURL(imageType, imageQuality);
                pages.push(imageData);
            }

            return pages;
        } catch (error) {
            console.error('PDF to image conversion failed:', error);
            throw new Error(
                `Failed to convert PDF to images: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    static base64ToBlob(
        base64Data: string,
        contentType: string = 'application/pdf'
    ): Blob {
        // Remove data URL prefix if present
        const base64Content = base64Data.includes('base64,')
            ? base64Data.split('base64,')[1]
            : base64Data;

        // Convert base64 to binary
        const byteCharacters = atob(base64Content);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);

            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        return new Blob(byteArrays, { type: contentType });
    }
}
