const loginRouter = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

loginRouter.post('/', async (request, response) => {
  try {
    const { email, password } = request.body;
    const userExist = await User.findOne({ email });
    if (!userExist) {
      return response.status(400).json({ error: 'Email o contraseña invalidos' });
    }

    if (!userExist.verified) {
      return response.status(400).json({ error: 'Tu email no esta verificado' });
    }

    const isCorrect = await bcrypt.compare(password, userExist.passwordHash);
    if (!isCorrect) {
      return response.status(400).json({ error: 'Email o contraseña invalidos' });
    }

    const userForToken = {
      id: userExist.id,
      name: userExist.name,
      email: userExist.email,
      typeUser: userExist.typeUser,
      datos: userExist.datos,
      registrado: userExist.registrado,
    };

    const accessToken = jwt.sign(userForToken, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1d',
    });

    response.cookie('accessToken', accessToken, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    });

    return response.status(200).json(userForToken);
  } catch (error) {
    console.log(error);
  }
});

module.exports = loginRouter;
