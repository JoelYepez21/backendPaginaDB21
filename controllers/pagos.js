const pagosRouter = require('express').Router();
const Pagos = require('../models/pagos');
const nodemailer = require('nodemailer');

pagosRouter.post('/', async (request, response) => {
  try {
    const user = request.user;
    const { referencia, monto, metodo, fecha } = request.body;
    console.log(metodo);

    if (!referencia || !monto) {
      return response.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // const MetodoExist = await MetodosDePago.findOne({ cuenta });

    //   if (MetodoExist) {
    //     return response.status(400).json({ error: 'Esa cuenta ya esta asignada a un metodo de pago' });
    //   }

    const newPago = new Pagos({
      referencia,
      monto,
      fecha,
      metodo: metodo.id,
      user: user._id,
    });
    const savedPago = await newPago.save();
    console.log(savedPago);

    return response.status(201).json({ message: 'Pago enviado, esperar confirmacion' });
  } catch (error) {
    console.log(error);
  }
});

pagosRouter.get('/', async (request, response) => {
  const user = request.user;
  if (user.typeUser === 'superUser') {
    const pagos = await Pagos.find({})
      .populate('user', 'name email')
      .populate('metodo', 'typeMetodo');
    return response.status(200).json(pagos);
  } else {
    const pagos = await Pagos.find({ user: user.id }).populate('metodo', 'typeMetodo');
    return response.status(200).json(pagos);
  }
});

pagosRouter.delete('/:id/:email', async (request, response) => {
  console.log(request.params.id);
  console.log(request.params.email);
  await Pagos.findByIdAndDelete(request.params.id);
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
      to: request.params.email, // list of receivers
      subject: 'Pago Eliminado', // Subject line
      html: '<a>Tu pago fue eliminado</a>', // html body
    });
  }
  main().catch(console.error);

  return response.status(200).json({ message: 'Pago eliminado' });
});

pagosRouter.patch('/:id', async (request, response) => {
  try {
    const { confirmado, pago } = request.body;

    console.log(confirmado);
    console.log(pago.user.email);
    await Pagos.findByIdAndUpdate(request.params.id, { confirmado });

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
      if (confirmado) {
        const info = await transporter.sendMail({
          from: process.env.EMAIL_USER, // sender address
          to: pago.user.email, // list of receivers
          subject: 'Estado de pago', // Subject line
          html: '<a>Tu pago fue confirmado</a>', // html body
        });
      } else {
        const info = await transporter.sendMail({
          from: process.env.EMAIL_USER, // sender address
          to: pago.user.email, // list of receivers
          subject: 'Estado de pago', // Subject line
          html: '<a>Tu pago fue desconfirmado</a>', // html body
        });
      }
    }
    main().catch(console.error);
    return response.sendStatus(200);
  } catch (error) {
    console.log(error);
  }
});

module.exports = pagosRouter;
