const mongoose = require('mongoose');
const pagoSchema = new mongoose.Schema({
  referencia: String,
  monto: String,
  fecha: String,
  confirmado: {
    type: Boolean,
    default: false,
  },
  metodo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Metodo',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

pagoSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  },
});

const pago = mongoose.model('Pagos', pagoSchema);

module.exports = pago;
