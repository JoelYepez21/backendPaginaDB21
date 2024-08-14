const mongoose = require('mongoose');

const pdfFileSchema = new mongoose.Schema({
  pdfFile: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  datos: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Datos',
  },
});

pdfFileSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const PdfFile = mongoose.model('pdfFiles', pdfFileSchema);

module.exports = PdfFile;
