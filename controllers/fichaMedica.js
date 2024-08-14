const upload = require('../utils/multer');
const PdfFile = require('../models/fichamedica');
const PdfFiletRouter = require('express').Router();
const fs = require('fs');

// [userExtractor, otro middleware] en caso de varios middleware
// En caso de array = upload.array('image')
PdfFiletRouter.post('/', upload.single('pdfFile'), async (request, response) => {
  try {
    // Si es array request.file
    const file = request.file;
    const user = request.user;

    // Como debe quedar mongo
    const newPdfFile = new PdfFile({
      pdfFile: file.filename,
      user: user._id,
      datos: user.datos._id,
    });

    const Pdf = await newPdfFile.save();

    console.log(Pdf);
    response.status(200).json({ message: 'imagen subida' });
  } catch (error) {
    console.log(error);
  }
});

PdfFiletRouter.patch('/:pdfFile/:id', upload.single('pdfFile'), async (request, response) => {
  try {
    fs.unlink('./uploads/' + request.params.pdfFile, (err) => {
      if (err) {
        throw err;
      }
    });
    const file = request.file;
    await PdfFile.findByIdAndUpdate(request.params.id, {
      pdfFile: file.filename,
    });
    response.status(200).json({ message: 'pdf actualizado' });
  } catch (error) {
    console.log('esasdadasd', error);
  }
});

PdfFiletRouter.get('/', async (request, response) => {
  const user = request.user;

  if (user.typeUser === 'superUser') {
    const Pdf = await PdfFile.find({}).populate('user', 'name').populate('datos', 'genero unidad');

    return response.status(200).json({ Pdf });
  } else {
    const Pdf = await PdfFile.find({ user: user.id }).populate('user', 'name');

    console.log(Pdf);
    return response.status(200).json({ Pdf });
  }
});

PdfFiletRouter.delete('/:pdfFile/:id', async (request, response) => {
  fs.unlink('./uploads/' + request.params.pdfFile, (err) => {
    if (err) {
      throw err;
    }
  });
  await PdfFile.findByIdAndDelete(request.params.id);
  return response.status(200).json({ message: 'Ficha medica borrada' });
});

module.exports = PdfFiletRouter;
