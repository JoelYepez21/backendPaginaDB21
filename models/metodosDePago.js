const mongoose = require('mongoose');
const metododepagoSchema = new mongoose.Schema({
  name: String,
  cuenta: String,
  numero: String,
  cedula: String,
  typeMetodo: {
    type: String,
    default: '',
  },
});

metododepagoSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  },
});

const metododepago = mongoose.model('Metodo', metododepagoSchema);

module.exports = metododepago;
