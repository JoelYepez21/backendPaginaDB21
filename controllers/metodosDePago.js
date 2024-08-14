const metodosdepagoRouter = require('express').Router();
const MetodosDePago = require('../models/metodosDePago');

metodosdepagoRouter.post('/', async (request, response) => {
  const { name, cuenta, numero, cedula, typeMetodo } = request.body;
  const REGEX_NUMBER = /^[0](212|412|414|424|416|426)[0-9]{7}$/;

  if (typeMetodo === 'digital') {
    if (!name || !cuenta || !numero || !cedula) {
      return response.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (!REGEX_NUMBER.test(numero)) {
      return response.status(400).json({ error: 'El telefono afiliado debe ser venezolano' });
    }
  }

  if (typeMetodo === 'fisico') {
    if (!name) {
      return response.status(400).json({ error: 'El nombre del metodo de pago es requerido' });
    }
  }

  const MetodoExist = await MetodosDePago.findOne({ cuenta });

  if (MetodoExist) {
    return response.status(400).json({ error: 'Esa cuenta ya esta asignada a un metodo de pago' });
  }

  const newMetodoDePago = new MetodosDePago({
    name,
    cuenta,
    numero,
    cedula,
    typeMetodo,
  });
  const savedMetodo = await newMetodoDePago.save();
  console.log(savedMetodo);

  return response.status(201).json({ message: 'Metodo creado con exito' });
});

metodosdepagoRouter.get('/:typeMetodo', async (request, response) => {
  const user = request.user;

  if (user.typeUser === 'superUser') {
    const metodos = await MetodosDePago.find({});
    return response.status(200).json(metodos);
  } else {
    const metodos = await MetodosDePago.find({ name: request.params.typeMetodo });
    return response.status(200).json(metodos);
  }
});

metodosdepagoRouter.get('/', async (request, response) => {
  const user = request.user;

  if (user.typeUser === 'superUser') {
    const metodos = await MetodosDePago.find({});
    return response.status(200).json(metodos);
  } else {
    const metodos = await MetodosDePago.find({});
    return response.status(200).json(metodos);
  }
});

metodosdepagoRouter.delete('/:id', async (request, response) => {
  console.log(request.params.id);
  await MetodosDePago.findByIdAndDelete(request.params.id);
  return response.status(200).json({ message: 'Metodo borrado' });
});
metodosdepagoRouter.patch('/:id/:typeMetodo', async (request, response) => {
  try {
    const REGEX_NUMBER = /^[0](212|412|414|424|416|426)[0-9]{7}$/;
    const { name, cuenta, numero, cedula } = request.body;

    if (request.params.typeMetodo === 'digital') {
      if (!name || !cuenta || !numero || !cedula) {
        return response.status(400).json({ error: 'Todos los campos son requeridos' });
      }

      if (!REGEX_NUMBER.test(numero)) {
        return response.status(400).json({ error: 'El telefono afiliado debe ser venezolano' });
      }
    }

    if (request.params.typeMetodo === 'fisico') {
      if (!name) {
        return response.status(400).json({ error: 'El nombre del metodo de pago es requerido' });
      }
    }

    await MetodosDePago.findByIdAndUpdate(request.params.id, {
      name,
      cuenta,
      numero,
      cedula,
    });

    return response.sendStatus(200);
  } catch (error) {
    console.log(error);
  }
});
module.exports = metodosdepagoRouter;
