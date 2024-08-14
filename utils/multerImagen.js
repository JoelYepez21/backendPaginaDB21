const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './imagenPerfil');
  },
  filename: function (req, file, cb) {
    const fileName = Date.now() + '-' + file.originalname;
    cb(null, fileName);
  },
});

const uploadImagen = multer({
  storage,
  fileFilter: (request, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('The file is not a jpeg/png'), false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 20,
  },
});

module.exports = uploadImagen;
