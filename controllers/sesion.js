const sesionRouter = require('express').Router();
// const User = require('../models/user');

sesionRouter.get('/', async (request, response) => {
  const user = request.user;
  return response.status(200).json(user);
});

module.exports = sesionRouter;
