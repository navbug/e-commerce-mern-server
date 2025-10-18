const express = require("express");
const router = express.Router();
const multer = require("multer");
const {cloudinary, storage} = require("../utils/cloudinary")

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname);
//   },
// });

const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype === "image/png" || 
        file.mimetype === "image/jpg" || 
        file.mimetype === "image/jpeg" || 
        file.mimetype === "image/webp" || 
        file.mimetype === "image/svg+xml"
      ) {
        cb(null, true);
      } else {
        cb(new Error("File types allowed are .jpeg, .png, .jpg, .webp, .svg"), false);
      }
    }
  });

router.post("/uploadFile", upload.single("file"), function (req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    res.json({
      fileName: req.file.filename,
      fileUrl: req.file.path,
      publicId: req.file.filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "File upload failed" });
  }
});

const downloadFile = (req, res) => {
  const fileName = req.params.filename;
  const path = __basedir + "/uploads/";

  res.download(path + fileName, (error) => {
    if (error) {
      res.status(500).send({ meassge: "File cannot be downloaded " + error });
    }
  });
};
router.get("/files/:filename", downloadFile);

module.exports = router;
