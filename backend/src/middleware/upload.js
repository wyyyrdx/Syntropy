/**
 * Multer middleware for note image uploads.
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');

const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${randomUUID()}${ext}`);
  }
});

function fileFilter(req, file, cb) {
  // Some clients (notably Postman on Windows with non-ASCII filenames)
  // fail to detect the mimetype correctly and send a generic
  // 'application/octet-stream'. Fall back to checking the file
  // extension so legitimate images aren't rejected.
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetypeOk = ALLOWED_MIME_TYPES.has(file.mimetype);
  const extensionOk = ALLOWED_EXTENSIONS.has(ext);

  if (!mimetypeOk && !extensionOk) {
    return cb(new Error('Unsupported file type. Only JPEG, PNG, or WEBP images are allowed.'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES }
});

module.exports = { upload, UPLOAD_DIR };