import { Storage } from "@google-cloud/storage";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// Resolving __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keyFilename = "/tmp/kueyanti-project-d52f6867be18.json";
fs.writeFileSync(keyFilePath, process.env.GCP_KEYFILE_PATH);

const storage = new Storage({ keyFilename });
const bucketName = 'uploads-kueyanti';
const bucket = storage.bucket(bucketName);

const multerStorage = multer.memoryStorage();

const upload = multer({
  storage: multerStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.', 400), false);
    }
  }
});

const getFormattedDate = () => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}${month}${year}-${hours}${minutes}${seconds}`;
};

const uploadToGCS = async (req, res, next) => {
  if (!req.file) {
    console.log('No file received');
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const formattedDate = getFormattedDate();
  const extension = path.extname(req.file.originalname);
  const filename = `${formattedDate}${extension}`;
  const blob = bucket.file(filename);
  const blobStream = blob.createWriteStream();

  try {
    // Use sharp to resize the image
    const resizedImageBuffer = await sharp(req.file.buffer)
      .resize(1920, 1080)
      .toBuffer();

    blobStream.on('error', err => {
      console.error('Error during upload:', err);
      req.file.cloudStorageError = err;
      next(err);
    });

    blobStream.on('finish', () => {
      req.file.cloudStorageObject = blob.name;
      req.file.cloudStoragePublicUrl = getPublicUrl(blob.name);
      console.log('File is accessible at:', req.file.cloudStoragePublicUrl);
      next();
    });

    blobStream.end(resizedImageBuffer);
  } catch (err) {
    console.error('Error during image processing or upload:', err);
    next(err);
  }
};

const getPublicUrl = (filename) => {
  return `https://storage.googleapis.com/${bucketName}/${filename}`;
};

export { upload, uploadToGCS };