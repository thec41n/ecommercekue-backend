import path from "path";
import express from "express";
import multer from "multer";
import sharp from "sharp";
import { upload, uploadToGCS } from '../middlewares/uploadMiddleware.js';
import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     const extname = path.extname(file.originalname);
//     cb(null, `${file.fieldname}-${Date.now()}${extname}`);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const filetypes = /jpe?g|png|webp/;
//   const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

//   const extname = path.extname(file.originalname).toLowerCase();
//   const mimetype = file.mimetype;

//   if (filetypes.test(extname) && mimetypes.test(mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Mohon upload file gambar!"), false);
//   }
// };

// const upload = multer({ storage, fileFilter });
// const uploadSingleImage = upload.single("image");

// router.post("/", (req, res) => {
//   uploadSingleImage(req, res, async (err) => {
//     if (err) {
//       res.status(400).send({ message: err.message });
//     } else if (req.file) {
//       try {
//         const outputPath = `uploads/res-${req.file.filename}`;
//         await sharp(req.file.path)
//           .resize(1920, 1080)
//           .toFile(outputPath);

//         res.status(200).send({
//           message: "Gambar berhasil diupload!",
//           image: `/${outputPath}`,
//         });
//       } catch (error) {
//         console.error("Error resizing image");
//         res.status(500).send({
//           message: "Gagal mengubah ukuran gambar",
//           error: error.message,
//         });
//       }
//     } else {
//       res.status(400).send({ message: "Tidak ada file gambar terlampir" });
//     }
//   });
// });

router.post('/', authenticate, upload.single('image'), uploadToGCS, (req, res) => {
  if (req.file && req.file.cloudStoragePublicUrl) {
    res.status(200).json({
      message: 'Gambar Berhasil Diupload!',
      url: req.file.cloudStoragePublicUrl
    });
  } else {
    res.status(500).json({
      message: 'Something went wrong'
    });
  }
});


export default router;