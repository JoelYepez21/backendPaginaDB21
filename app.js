require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const usersRouter = require('./controllers/users');
const mongoose = require('mongoose');
const cors = require('cors');
const loginRouter = require('./controllers/login');
const path = require('path');
const app = express();
const cookieParser = require('cookie-parser');
const sesionRouter = require('./controllers/sesion');
const { userExtractor } = require('./middlewares/auth');
const refresRouter = require('./controllers/refres');
const datosRouter = require('./controllers/datos');
const logoutRouter = require('./controllers/logout');
const metodosdepagoRouter = require('./controllers/metodosDePago');
const pagosRouter = require('./controllers/pagos');
const PdfFiletRouter = require('./controllers/fichaMedica');
const ImagenPerfilRouter = require('./controllers/imagenPerfil');
const { MONGO_URI } = require('./config');

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado :3');
  } catch (error) {
    console.log(error);
  }
})();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('tiny'));
app.use(express.urlencoded({ extended: true }));

// aca van las rutas
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use('/api/sesion', userExtractor, sesionRouter);
app.use('/api/refres', userExtractor, refresRouter);
app.use('/api/datos', userExtractor, datosRouter);
app.use('/api/logout', userExtractor, logoutRouter);
app.use('/api/metodos', userExtractor, metodosdepagoRouter);
app.use('/api/pagos', userExtractor, pagosRouter);
app.use('/api/pdffiles', userExtractor, PdfFiletRouter);
app.use('/api/uploads', userExtractor, express.static(path.resolve('uploads')));
app.use('/api/imagenPerfil', userExtractor, ImagenPerfilRouter);
app.use('/api/imagenPerfil', userExtractor, express.static(path.resolve('imagenPerfil')));
// app.use('/api/users/:id/:token', usersRouter);

app.use(express.static(path.resolve(__dirname, 'dist')));

app.get('/*', function (request, response) {
  response.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

module.exports = app;
