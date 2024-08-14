const datosRouter = require('express').Router();
const User = require('../models/user');
const Datos = require('../models/datos');

datosRouter.get('/', async (request, response) => {
  const user = request.user;
  if (user.typeUser === 'superUser') {
    const users = await User.find({ typeUser: 'joven', registrado: true })
      .populate('datos', 'unidad genero')
      .populate('imagen', 'imagen');
    const datos = await Datos.find({});
    return response.status(200).json({ user: users, datos: datos });
  } else {
    const datos = await Datos.find({ user: user.id });
    return response.status(200).json(datos);
  }
});

datosRouter.post('/', async (request, response) => {
  try {
    const user = request.user;
    const REGEX_NAME = /^[A-Z][a-z]*[ ][A-Z][a-z]*[ ][A-Z][a-z]*[ ][A-Z][a-z]*$/;
    const REGEX_NUMBER = /^[0](212|412|414|424|416|426)[0-9]{7}$/;
    const {
      cedula,
      nombres,
      genero,
      fecha,
      edad,
      telefonoPersonal,
      telefonoLocal,
      unidad,
      direccion,
    } = request.body;

    if (
      !cedula ||
      !nombres ||
      !genero ||
      !fecha ||
      !telefonoPersonal ||
      !telefonoLocal ||
      !unidad ||
      !direccion
    ) {
      return response.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    if (parseInt(cedula) < 3000000) {
      return response.status(400).json({ error: 'La cedula es invalida' });
    }

    if (parseInt(cedula) > 45000000) {
      return response.status(400).json({ error: 'La cedula es invalida' });
    }

    if (!REGEX_NAME.test(nombres)) {
      return response.status(400).json({ error: 'El nombre no tiene el formato' });
    }

    if (!REGEX_NUMBER.test(telefonoPersonal)) {
      return response.status(400).json({ error: 'El telefono personal debe ser venezolano' });
    }

    if (!REGEX_NUMBER.test(telefonoLocal)) {
      return response.status(400).json({ error: 'El telefono local debe ser venezolano' });
    }

    if (genero === 'default') {
      return response.status(400).json({ error: 'Debes seleccionar un genero' });
    }

    if (genero !== 'Masculino' && genero !== 'Femenino') {
      return response.status(400).json({ error: 'Lo sentimos, hubo un error al subir tus datos' });
    }

    if (unidad === 'unidad') {
      return response.status(400).json({ error: 'Debes seleccionar una unidad' });
    }
    if (unidad !== 'Manada' && unidad !== 'Tropa' && unidad !== 'Clan') {
      return response.status(400).json({ error: 'Lo sentimos, hubo un error al subir tus datos' });
    }
    const calcularEdad = (fecha) => {
      // Si la fecha es correcta, calculamos la edad

      let values = fecha.split('-');
      let dia = values[2];
      let mes = values[1];
      let ano = values[0];

      // cogemos los valores actuales
      let fecha_hoy = new Date();
      let ahora_ano = fecha_hoy.getYear();
      let ahora_mes = fecha_hoy.getMonth() + 1;
      let ahora_dia = fecha_hoy.getDate();

      // realizamos el calculo
      let edad = ahora_ano + 1900 - ano;
      if (ahora_mes < mes) {
        edad--;
      }
      if (mes === ahora_mes && ahora_dia < dia) {
        edad--;
      }
      if (edad > 1900) {
        edad -= 1900;
      }

      // calculamos los meses
      let meses = 0;

      if (ahora_mes > mes && dia > ahora_dia) meses = ahora_mes - mes - 1;
      else if (ahora_mes > mes) meses = ahora_mes - mes;
      if (ahora_mes < mes && dia < ahora_dia) meses = 12 - (mes - ahora_mes);
      else if (ahora_mes < mes) meses = 12 - (mes - ahora_mes + 1);
      if (ahora_mes === mes && dia > ahora_dia) meses = 11;

      // calculamos los dias
      let dias = 0;
      if (ahora_dia > dia) dias = ahora_dia - dia;
      if (ahora_dia < dia) {
        const ultimoDiaMes = new Date(ahora_ano, ahora_mes - 1, 0);
        dias = ultimoDiaMes.getDate() - (dia - ahora_dia);
      }

      if (edad >= 7 && meses >= 0 && dias > 0 && edad >= 21 && meses <= 12 && dias < 30) {
        console.log('hola');
        return response.status(400).json({
          error: 'La fecha de nacimiento no cumple con el rango de edad establecidos',
        });
      }
    };
    calcularEdad(fecha);

    const datosExist = await Datos.findOne({ cedula });

    if (datosExist) {
      return response.status(400).json({ error: 'Tus datos ya existen' });
    }
    const newDatos = new Datos({
      cedula,
      nombres,
      genero,
      fechaNacimiento: fecha,
      edad,
      telefonoPersonal,
      telefonoLocal,
      unidad,
      direccion,
      user: user._id,
    });
    const savedDatos = await newDatos.save();

    user.datos = savedDatos._id;
    // user.unidad = savedDatos.unidad;
    // user.genero = savedDatos.genero;
    await user.save();
    return response.status(201).json({ message: 'Tus datos fueron guardados con exito' });
  } catch (error) {
    console.log(error);
  }
});

datosRouter.delete('/:id', async (request, response) => {
  console.log(request.params.id);
  await Datos.findByIdAndDelete(request.params.id);
  return response.status(200).json({ message: 'datos borrados' });
});

datosRouter.patch('/:id', async (request, response) => {
  try {
    const REGEX_NAME = /^[A-Z][a-z]*[ ][A-Z][a-z]*[ ][A-Z][a-z]*[ ][A-Z][a-z]*$/;
    const REGEX_NUMBER = /^[0](212|412|414|424|416|426)[0-9]{7}$/;
    const {
      cedula,
      nombres,
      genero,
      fecha,
      edad,
      telefonoPersonal,
      telefonoLocal,
      unidad,
      direccion,
    } = request.body;

    if (parseInt(cedula) < 3000000) {
      return response.status(400).json({ error: 'La cedula es invalida' });
    }

    if (parseInt(cedula) > 45000000) {
      return response.status(400).json({ error: 'La cedula es invalida' });
    }

    if (!REGEX_NAME.test(nombres)) {
      return response.status(400).json({ error: 'El nombre no tiene el formato' });
    }

    if (!REGEX_NUMBER.test(telefonoPersonal)) {
      return response.status(400).json({ error: 'El telefono personal debe ser venezolano' });
    }

    if (!REGEX_NUMBER.test(telefonoLocal)) {
      return response.status(400).json({ error: 'El telefono local debe ser venezolano' });
    }

    if (genero === 'default') {
      return response.status(400).json({ error: 'Debes seleccionar un genero' });
    }

    if (genero !== 'Masculino' && genero !== 'Femenino') {
      return response
        .status(400)
        .json({ error: 'Lo sentimos, hubo un error al actualizar  tus datos' });
    }

    if (unidad === 'unidad') {
      return response.status(400).json({ error: 'Debes seleccionar una unidad' });
    }

    if (unidad !== 'Manada' && unidad !== 'Tropa' && unidad !== 'Clan') {
      return response
        .status(400)
        .json({ error: 'Lo sentimos, hubo un error al actualizar tus datos' });
    }
    const calcularEdad = (fecha) => {
      // Si la fecha es correcta, calculamos la edad

      let values = fecha.split('-');
      let dia = values[2];
      let mes = values[1];
      let ano = values[0];

      // cogemos los valores actuales
      let fecha_hoy = new Date();
      let ahora_ano = fecha_hoy.getYear();
      let ahora_mes = fecha_hoy.getMonth() + 1;
      let ahora_dia = fecha_hoy.getDate();

      // realizamos el calculo
      let edad = ahora_ano + 1900 - ano;
      if (ahora_mes < mes) {
        edad--;
      }
      if (mes === ahora_mes && ahora_dia < dia) {
        edad--;
      }
      if (edad > 1900) {
        edad -= 1900;
      }

      // calculamos los meses
      let meses = 0;

      if (ahora_mes > mes && dia > ahora_dia) meses = ahora_mes - mes - 1;
      else if (ahora_mes > mes) meses = ahora_mes - mes;
      if (ahora_mes < mes && dia < ahora_dia) meses = 12 - (mes - ahora_mes);
      else if (ahora_mes < mes) meses = 12 - (mes - ahora_mes + 1);
      if (ahora_mes === mes && dia > ahora_dia) meses = 11;

      // calculamos los dias
      let dias = 0;
      if (ahora_dia > dia) dias = ahora_dia - dia;
      if (ahora_dia < dia) {
        const ultimoDiaMes = new Date(ahora_ano, ahora_mes - 1, 0);
        dias = ultimoDiaMes.getDate() - (dia - ahora_dia);
      }

      if (edad >= 7 && meses >= 0 && dias > 0 && edad >= 21 && meses <= 12 && dias < 30) {
        console.log('hola');
        return response.status(400).json({
          error: 'La fecha de nacimiento no cumple con el rango de edad establecidos',
        });
      }
    };
    calcularEdad(fecha);

    await Datos.findByIdAndUpdate(request.params.id, {
      cedula,
      nombres,
      genero,
      fecha,
      edad,
      telefonoPersonal,
      telefonoLocal,
      unidad,
      direccion,
    });

    return response.sendStatus(200);
  } catch (error) {
    console.log(error);
  }
});

module.exports = datosRouter;
