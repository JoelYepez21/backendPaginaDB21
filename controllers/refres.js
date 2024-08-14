const refresRouter = require('express').Router();
// const User = require('../models/user');
// const jwt = require('jsonwebtoken');

refresRouter.get('/', async (request, response) => {
  return response.status(200).json({
    id: request.user.id,
    name: request.user.name,
    typeUser: request.user.typeUser,
    email: request.user.email,
    datos: request.user.datos,
    registrado: request.user.registrado,
  });
});

module.exports = refresRouter;
