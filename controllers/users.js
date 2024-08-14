const usersRouter = require('express').Router();
const User = require('../models/user');
const Datos = require('../models/datos');
const Pagos = require('../models/pagos');
const PdfFile = require('../models/fichamedica');
const ImagenPerfil = require('../models/imagenPerfil');
const fs = require('fs');
const { PAGE_URL } = require('../config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

usersRouter.post('/', async (request, response) => {
  const { name, email, password, passwordConfir } = request.body;
  const EMAIL_VALIDATION = /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/;
  const PASSWORD_VALIDATION = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
  const REGEX_NAME =
    /^[A-Z\u00d1][a-zA-Z-ÿí\u00f1\u00d1]+(\s*[A-Z\u00d1][a-zA-Z-ÿí\u00f1\u00d1\s]*)$/;

  if (!name || !email || !password || !passwordConfir) {
    return response.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  if (!REGEX_NAME.test(name)) {
    return response.status(400).json({ error: 'El nombre no cumple con el formato' });
  }
  if (!EMAIL_VALIDATION.test(email)) {
    return response.status(400).json({ error: 'El email es invalido' });
  }
  if (!PASSWORD_VALIDATION.test(password)) {
    return response.status(400).json({ error: 'La contraseña no cumple con el formato' });
  }
  if (password !== passwordConfir) {
    return response.status(400).json({ error: 'La contraseña no coincide con la confirmacion' });
  }
  const userExist = await User.findOne({ email });

  if (userExist) {
    return response.status(400).json({ error: 'El email ya se encuentra en uso' });
  }

  const saltRounds = 10;

  const passwordHash = await bcrypt.hash(password, saltRounds);

  const newUser = new User({
    name,
    email,
    passwordHash,
  });
  const savedUser = await newUser.save();
  const token = jwt.sign({ id: savedUser.id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '1d',
  });
  const transporter = nodemailer.createTransport({
    pool: true,
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  async function main() {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER, // sender address
      to: savedUser.email, // list of receivers
      subject: 'Verificacion de usuario', // Subject line
      html: `<a href="${PAGE_URL}/verify/${savedUser.id}/${token}">Verificar Correo</a>`, // html body
    });
  }
  main().catch(console.error);
  return response.status(201).json({ message: 'Por favor verifica tu correo' });
});

usersRouter.patch('/:id/:token', async (request, response) => {
  try {
    const token = request.params.token;

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const id = decodedToken.id;

    await User.findByIdAndUpdate(id, { verified: true });
    return response.sendStatus(200);
  } catch (error) {
    const id = request.params.id;
    const { email } = await User.findById(id);
    //Firmar el nuevo token
    const token = jwt.sign({ id: id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1d',
    });
    //enviar el nuevo email
    const transporter = nodemailer.createTransport({
      pool: true,
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // eslint-disable-next-line no-inner-declarations
    async function main() {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER, // sender address
        to: email, // list of receivers
        subject: 'Verificacion de usuario', // Subject line
        html: `<a href="${PAGE_URL}/verify/${id}/${token}">Verificar Correo</a>`, // html body
      });
    }
    main().catch(console.error);
  }
  return response.status(400).json({
    error: 'El link ya expiro. Se ha enviado un nuevo link de verificacion a su correo',
  });
});

usersRouter.patch('/:id', async (request, response) => {
  try {
    const { registrado } = request.body;
    await User.findByIdAndUpdate(request.params.id, { registrado });
    return response.sendStatus(200);
  } catch (error) {
    console.log(error);
  }
});

usersRouter.get('/', async (request, response) => {
  const users = await User.find({ typeUser: 'joven' }).populate('datos', 'unidad genero');

  return response.status(200).json({ users });
});

usersRouter.delete('/:id', async (request, response) => {
  const datos = await Datos.find({ user: request.params.id });
  const pago = await Pagos.find({ user: request.params.id });
  const pdf = await PdfFile.find({ user: request.params.id });
  const imagen = await ImagenPerfil.find({ user: request.params.id });

  if (datos) {
    await Datos.findOneAndDelete({ user: request.params.id });
  }
  if (pago) {
    await Pagos.findOneAndDelete({ user: request.params.id });
  }
  if (pdf[0]) {
    fs.unlink('./uploads/' + pdf[0].pdfFile, (err) => {
      if (err) {
        throw err;
      }
    });
    await PdfFile.findOneAndDelete({ user: request.params.id });
  }
  if (imagen[0]) {
    fs.unlink('./imagenPerfil/' + imagen[0].imagen, (err) => {
      if (err) {
        throw err;
      }
    });
    await ImagenPerfil.findOneAndDelete({ user: request.params.id });
  }
  await User.findByIdAndDelete(request.params.id);
  return response.status(200).json({ message: 'Usuario borrado' });
});

module.exports = usersRouter;
