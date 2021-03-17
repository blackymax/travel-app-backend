const { Router } = require('express');
const express = require('express');
const mongoose = require('mongoose');
const router = Router();
const User = require('../models/userSchema');
const Country = require('../models/countrySchema');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const multer = require('multer');
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../client/public/assets/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

router.use(multer({ storage: storageConfig }).single('file'));

router.get('/countries', async (req, res) => {
  try {
    const countries = await Country.find();
    res.send(countries);
  } catch (e) {
    res.status(404).json({
      message: {
        ru: 'База данных не найдена',
        en: 'Database is not found',
        es: 'База данных не найдена',
      },
    });
  }
});

router.post('/auth', async (req, res) => {
  try {
    const { token } = req.body;
    if (token) {
      res.status(201).json({
        message: {
          en: 'Logging in...',
          ru: 'Выполняется вход...',
          es: 'Iniciando sesión...',
        },
        answer: true,
      });
    } else {
      res.status(201).json({
        message: {
          en: 'Logging in...',
          ru: 'Выполняется вход...',
          es: 'Iniciando sesión...',
        },
        answer: false,
      });
    }
  } catch (e) {
    res.status(500).json({
      error: e,
      message: {
        ru: `Что-то пошло не так, попробуйте позже ${e}`,
        en: `Something wrong, try to repeat later ${e}`,
        es: `Algo salió mal. Vuelve a intentarlo más tarde. ${e}`,
      },
    });
  }
});

router.post(
  '/register',
  [
    check('email', 'Incorrect e-mail').isEmail(),
    check('password', 'Minimal password length of symbols is 6').isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          errors: errors.array(),
          message: {
            ru: 'Введены неверные данные',
            en: 'Incorrect register inputs',
            es: 'Se ingresaron datos no válidos',
          },
        });
      }

      const { email, password, username } = req.body;
      const candidate = await User.findOne({ email });

      if (candidate)
        res.status(400).json({
          message: {
            ru: 'Пользователь уже существует',
            en: 'This user is exist',
            es: 'El usuario ya existe',
          },
        });

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = new User({
        email: email,
        password: hashedPassword,
        username: username,
        image: '',
        marks: {
          australia: '',
          cuba: '',
          egypt: '',
          england: '',
          greece: '',
          italy: '',
          mexico: '',
          portugal: '',
          spain: '',
          thailand: '',
          tunis: '',
          turkey: '',
        },
      });

      await user.save();

      res.status(201).json({
        message: {
          ru: 'Пользователь создан',
          en: 'User created',
          es: 'Creado por el usuario',
        },
        email: user.email,
        password: hashedPassword,
        username: user.username,
        image: user.image,
      });
    } catch (e) {
      res.status(500).json({
        error: e,
        message: {
          ru: 'Что-то пошло не так, попробуйте позже',
          en: 'Something wrong, try to repeat later',
          es: 'Algo salió mal. Vuelve a intentarlo más tarde.',
        },
      });
    }
  }
);

router.post(
  '/login',
  [
    check('email', 'Enter the correct e-mail').normalizeEmail().isEmail(),
    check('password', 'Password exists').exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(401).json({
          message: {
            ru: 'Неверный пароль и e-mail при входе',
            en: 'Incorrect email or password to entry',
            es: 'Contraseña y correo electrónico incorrectos al iniciar sesión',
          },
        });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ email });

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        res.status(400).json({
          message: {
            ru: 'Неверный пароль',
            en: 'Invalid password',
            es: 'Contraseña invalida',
          },
        });
      }
      const token = jwt.sign({ userId: user.id }, config.get('jwtSecret'), {
        expiresIn: '1h',
      });
      res.status(201).json({
        token: token,
        username: user.username,
        image: user.image,
        message: {
          ru: 'Вы вошли в систему',
          en: 'You enter the system',
          es: 'Estás conectado',
        },
      });
    } catch (e) {
      res.status(500).json({
        message: {
          ru: 'Что-то пошло не так, попробуйте позже',
          en: 'Something wrong, try to repeat later',
          es: 'Algo salió mal. Vuelve a intentarlo más tarde.',
        },
      });
    }
  }
);

router.post('/save-image', async (req, res, next) => {
  try {
    if (!req.body) {
      res.status(500).json({
        message: {
          ru: 'Ошибка при загрузке файла',
          en: 'Error loading file',
          es: 'Error al cargar el archivo',
        },
      });
    } else {
      const { email, image, save } = req.body;
      const user = await User.findOne({ email: email });
      const url = image;
      if (!user) {
        res.status(401).json({
          message: {
            ru: 'Пользователь не найден',
            en: 'User not found',
            es: 'No se encuentra el usuario',
          },
        });
      } else {
        if (save === true) {
          user.image = url;
          await user.save();
        }
        res.status(200).json({
          message: {
            ru: 'Успешно загружено',
            en: 'Successfully loaded',
            es: 'Cargado exitosamente',
          },
          url: user.image,
        });
      }
    }
  } catch (e) {
    res.status(400).json({
      message: {
        ru: `Ошибка при добавлении картинки в базу данных`,
        en: `Error adding picture to database`,
        es: 'Error al agregar una imagen a la base de datos',
      },
    });
  }
});

router.get('/get-marks', async (req, res) => {
  try {
    const usersData = await User.find({}, { marks: 1, username: 1 });
    res.status(200).json({
      message: {
        ru: 'Успешно загружено',
        en: 'Successfully loaded',
        es: 'Cargado exitosamente',
      },
      arr: usersData,
    });
  } catch (e) {
    res.status(404).json({
      message: {
        ru: 'База данных не найдена',
        en: 'Database is not found',
        es: 'База данных не найдена',
      },
    });
  }
});

router.post('/send-mark', async (req, res) => {
  try {
    if (!req.body) {
      res.status(500).json({
        message: {
          ru: 'Ошибка при загрузке файла',
          en: 'Error loading file',
          es: 'Error al cargar el archivo',
        },
      });
    } else {
      const { username, country, mark } = req.body;
      const user = await User.findOne({ username: username });
      if (!user) {
        res.status(401).json({
          message: {
            ru: 'Пользователь не найден',
            en: 'User not found',
            es: 'No se encuentra el usuario',
          },
        });
      } else {
        user.marks[country] = String(mark);
        await user.save();
      }
      res.status(200).json({
        message: {
          ru: 'Успешно загружено',
          en: 'Successfully loaded',
          es: 'Cargado exitosamente',
        },
        mark: user.marks[country],
        countries: user.marks,
        country: country,
      });
    }
  } catch (e) {
    res.status(400).json({
      message: {
        ru: `Ошибка при сохранении оценки в базе данных${e}`,
        en: `Error saving mark to database${e}`,
        es: 'Error al guardar la calificación en la base de datos',
      },
    });
  }
});

module.exports = router;
