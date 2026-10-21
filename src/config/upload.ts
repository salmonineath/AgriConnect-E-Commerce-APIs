import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { Request, Response } from "express";
import multer from "multer";
import { badRequestError } from "@/utils/helper/error-helper";

export const UPLOAD_ROOT = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
const PRODUCT_IMAGE_DIR = path.join(UPLOAD_ROOT, "products");

export const MAX_IMAGES_PER_PRODUCT = 5;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB

// Allowed types, with the bytes every real file of that type starts with
const IMAGE_TYPES: Record<string, { ext: string; matches: (head: Buffer) => boolean }> = {
    "image/jpeg": { ext: ".jpg", matches: (h) => h[0] === 0xff && h[1] === 0xd8 && h[2] === 0xff },
    "image/png": { ext: ".png", matches: (h) => h.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
    "image/webp": { ext: ".webp", matches: (h) => h.toString("ascii", 0, 4) === "RIFF" && h.toString("ascii", 8, 12) === "WEBP" },
};

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        fs.mkdirSync(PRODUCT_IMAGE_DIR, { recursive: true });
        cb(null, PRODUCT_IMAGE_DIR);
    },
    // Random name: never trust the client's filename
    filename: (_req, file, cb) => cb(null, `${randomUUID()}${IMAGE_TYPES[file.mimetype].ext}`),
});

const upload = multer({
    storage,
    limits: { fileSize: MAX_IMAGE_BYTES, files: MAX_IMAGES_PER_PRODUCT },
    fileFilter: (_req, file, cb) => {
        if (!IMAGE_TYPES[file.mimetype]) {
            return cb(badRequestError("Only JPEG, PNG and WebP images are allowed"));
        }
        cb(null, true);
    },
}).array("images", MAX_IMAGES_PER_PRODUCT);

export const deleteImageFile = async (filename: string) => {
    // basename() stops "../" tricks from deleting files outside the folder
    await fs.promises.rm(path.join(PRODUCT_IMAGE_DIR, path.basename(filename)), { force: true });
};

const hasRealImageContent = async (file: Express.Multer.File) => {
    const handle = await fs.promises.open(file.path, "r");
    try {
        const head = Buffer.alloc(12);
        await handle.read(head, 0, 12, 0);
        return IMAGE_TYPES[file.mimetype].matches(head);
    } finally {
        await handle.close();
    }
};

const MULTER_MESSAGES: Partial<Record<multer.MulterError["code"], string>> = {
    LIMIT_FILE_SIZE: "Each image must be 2 MB or smaller",
    LIMIT_FILE_COUNT: `You can upload at most ${MAX_IMAGES_PER_PRODUCT} images at once`,
    LIMIT_UNEXPECTED_FILE: 'Send images in the "images" form field',
};

/**
 * Run the upload and return the saved files. Files whose content is not
 * really an image (e.g. a script renamed to .png) are deleted and rejected.
 */
export const receiveProductImages = async (req: Request, res: Response) => {
    await new Promise<void>((resolve, reject) => {
        upload(req, res, (err: unknown) => {
            if (err instanceof multer.MulterError) {
                return reject(badRequestError(MULTER_MESSAGES[err.code] ?? err.message));
            }
            return err ? reject(err) : resolve();
        });
    });

    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (files.length === 0) {
        throw badRequestError('No images received. Send them as multipart/form-data in the "images" field');
    }

    const checks = await Promise.all(files.map(hasRealImageContent));
    if (checks.includes(false)) {
        await Promise.all(files.map((f) => deleteImageFile(f.filename)));
        throw badRequestError("One of the files is not a valid image");
    }
    return files;
};
