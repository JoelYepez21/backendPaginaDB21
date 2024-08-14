const uploadImagen = require('../utils/multerImagen');
const ImagenPerfil = require('../models/imagenPerfil');
const ImagenPerfilRouter = require('express').Router();
const fs = require('fs');

// [userExtractor, otro middleware] en caso de varios middleware
// En caso de array = upload.array('image')
ImagenPerfilRouter.post('/', uploadImagen.single('imagen'), async (request, response) => {
  try {
    // Si es array request.file
    const file = request.file;
    const user = request.user;

    // Como debe quedar mongo
    const newPdfFile = new ImagenPerfil({
      imagen: file.filename,
      user: user._id,
    });

    const Pdf = await newPdfFile.save();
    user.imagen = Pdf._id;
    await user.save();
    // console.log(Pdf);
    response.status(200).json({ message: 'imagen subida' });
  } catch (error) {
    console.log(error);
  }
});

ImagenPerfilRouter.patch(
  '/:imagen/:id',
  uploadImagen.single('imagen'),
  async (request, response) => {
    try {
      fs.unlink('./imagenPerfil/' + request.params.imagen, (err) => {
        if (err) {
          throw err;
        }
      });
      const file = request.file;
      await ImagenPerfil.findByIdAndUpdate(request.params.id, {
        imagen: file.filename,
      });
      response.status(200).json({ message: 'imagen actualizada' });
    } catch (error) {
      console.log(error);
    }
  },
);

ImagenPerfilRouter.get('/', async (request, response) => {
  const user = request.user;

  if (user.typeUser === 'superUser') {
    const imagen = await ImagenPerfil.find({}).populate('user', 'name');
    console.log(imagen);

    return response.status(200).json({ imagen });
  } else {
    const imagen = await ImagenPerfil.find({ user: user.id }).populate('user', 'name');

    console.log(imagen);
    return response.status(200).json({ imagen });
  }
});

ImagenPerfilRouter.delete('/:imagen/:id', async (request, response) => {
  fs.unlink('./imagenPerfil/' + request.params.imagen, (err) => {
    if (err) {
      throw err;
    }
  });
  await ImagenPerfil.findByIdAndDelete(request.params.id);
  return response.status(200).json({ message: 'imagen borrada' });
});

module.exports = ImagenPerfilRouter;
