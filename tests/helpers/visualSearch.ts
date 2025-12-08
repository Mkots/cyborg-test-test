import cv from '@techstark/opencv-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createCanvas, loadImage, Image } from '@napi-rs/canvas';
import { Jimp } from "jimp";

/**
 * Represents a bounding box with coordinates and dimensions
 */
export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Configuration for visual search
 */
export interface VisualSearchConfig {
    /** Threshold for template matching (0-1). Default: 0.8 */
    threshold: number;
}

const DEFAULT_CONFIG: VisualSearchConfig = {
    threshold: 0.8,
};

/**
 * Convert image buffer to OpenCV Mat using canvas
 * @param buffer - Image buffer
 * @returns OpenCV Mat
 */
async function bufferToMat(buffer: Buffer): Promise<any> {
    // Load image using canvas
    const img = await loadImage(buffer);

    // Create canvas with image dimensions
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');

    // Draw image to canvas
    ctx.drawImage(img, 0, 0);

    const image = await Jimp.fromBitmap(
        ctx.getImageData(0, 0, canvas.width, canvas.height)
    );

    const imageData = image.bitmap;

    // Create OpenCV Mat from image data
    const mat = cv.matFromImageData(imageData);

    return mat;
}

/**
 * Performs template matching using OpenCV
 * @param screenshotBuffer - Screenshot of the page as Buffer
 * @param templatePath - Path to template image file
 * @param config - Configuration options
 * @returns BoundingBox of the matched element
 * @throws Error if no match is found above threshold
 */
export async function findVisualMatch(
    screenshotBuffer: Buffer,
    templatePath: string,
    config: VisualSearchConfig = DEFAULT_CONFIG
): Promise<BoundingBox> {
    let srcMat: any;
    let templateMat: any;
    let resultMat: any;

    try {
        // Load template image from file
        const resolvedTemplatePath = resolve(templatePath);
        const templateBuffer = readFileSync(resolvedTemplatePath);

        // Decode screenshot image using canvas
        srcMat = await bufferToMat(screenshotBuffer);

        if (srcMat.empty()) {
            throw new Error('Failed to decode screenshot image');
        }

        // Decode template image using canvas
        templateMat = await bufferToMat(templateBuffer);

        if (templateMat.empty()) {
            throw new Error(`Failed to load template image from: ${resolvedTemplatePath}`);
        }

        // Check if template is larger than source
        if (templateMat.rows > srcMat.rows || templateMat.cols > srcMat.cols) {
            throw new Error(
                `Template size (${templateMat.cols}x${templateMat.rows}) is larger than screenshot (${srcMat.cols}x${srcMat.rows})`
            );
        }

        // Perform template matching
        resultMat = new cv.Mat();
        cv.matchTemplate(srcMat, templateMat, resultMat, cv.TM_CCOEFF_NORMED);


        // Find the best match
        const minMax = cv.minMaxLoc(resultMat, new cv.Mat());
        const maxVal = minMax.maxVal;
        const maxLoc = minMax.maxLoc;


        // Check if match meets threshold
        if (maxVal < config.threshold) {
            throw new Error(
                `No visual match found. Best match score: ${maxVal.toFixed(3)}, threshold: ${config.threshold}`
            );
        }

        // Calculate bounding box
        const boundingBox: BoundingBox = {
            x: maxLoc.x,
            y: maxLoc.y,
            width: templateMat.cols,
            height: templateMat.rows,
        };

        return boundingBox;
    } finally {
        // Clean up OpenCV matrices
        if (srcMat) srcMat.delete();
        if (templateMat) templateMat.delete();
        if (resultMat) resultMat.delete();
    }
}


export async function findAllVisualMatches(
    screenshotBuffer: Buffer,
    templatePath: string,
    config: VisualSearchConfig = DEFAULT_CONFIG
): Promise<BoundingBox[]> {
    let srcMat: any;
    let templateMat: any;
    let resultMat: any;
    let processedImage: any;
    let contours: any;
    let hierarchy: any;

    try {
        const resolvedTemplatePath = resolve(templatePath);
        const templateBuffer = readFileSync(resolvedTemplatePath);

        srcMat = await bufferToMat(screenshotBuffer);
        templateMat = await bufferToMat(templateBuffer);

        if (srcMat.empty() || templateMat.empty()) {
            throw new Error('Failed to decode images');
        }

        // Template matching
        resultMat = new cv.Mat();
        const mask = new cv.Mat();
        cv.matchTemplate(srcMat, templateMat, resultMat, cv.TM_CCOEFF_NORMED, mask);

        // Threshold
        processedImage = new cv.Mat();
        cv.threshold(resultMat, processedImage, config.threshold, 1, cv.THRESH_BINARY);
        processedImage.convertTo(processedImage, cv.CV_8UC1);

        // Find contours
        contours = new cv.MatVector();
        hierarchy = new cv.Mat();
        cv.findContours(processedImage, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
        console.log('contours.size |>', contours.size());

        const positions: BoundingBox[] = [];
        for (let i = 0; i < contours.size(); i++) {
            const contour = contours.get(i);
            const [x, y] = contour.data32S;

            positions.push({
                x,
                y,
                width: templateMat.cols,
                height: templateMat.rows,
            });
        }

        mask.delete();
        processedImage.delete();
        contours.delete();
        hierarchy.delete();

        return positions;
    } finally {
        if (srcMat) srcMat.delete();
        if (templateMat) templateMat.delete();
        if (resultMat) resultMat.delete();
    }
}


/**
 * Get center point of a bounding box
 */
export function getCenterPoint(box: BoundingBox): { x: number; y: number } {
    return {
        x: box.x + box.width / 2,
        y: box.y + box.height / 2,
    };
}