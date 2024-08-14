const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  passwordHash: String,
  verified: {
    type: Boolean,
    default: false,
  },
  registrado: {
    type: Boolean,
    default: false,
  },
  typeUser: {
    type: String,
    default: 'joven',
  },
  datos: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Datos',
  },
  imagen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'imagenPerfil',
  },
  // unidad: {
  //   type: mongoose.Schema.Types.String,
  //   ref: 'Datos',
  // },
  // genero: {
  //   type: mongoose.Schema.Types.String,
  //   ref: 'Datos',
  // },
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
