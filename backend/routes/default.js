const path = require('path');
const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');

const { Op, sequelize } = require('sequelize');
const { User, Sound, Comment, Like, Sequelize } = require('../../db/models');

const { Router } = express;

const router = Router();

// Настраиваем мультер
const imageStorage = multer.diskStorage({
  destination: path.join(__dirname, '../../front/static/uploads/'),
  filename(req, file, cb) {
    console.log('img FILE::', file);
    cb(null, `${file.originalname}`);
  },
});

const getImage = multer({ storage: imageStorage });

// Для проверки, авторизованные ли пользователи
function checkAuthorization(req, res, next) {
  if (req.session && req.session.isAuthorized) {
    console.log('REQUEST GRANTED');
    // Пропускаем запрос в следующую Middleware
    next();
  } else {
    console.log('UNAUTHORIZED');
    res.status(403).render('login', { layout: false });
  }
}

// --------------------------

// Логин пользователя
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      where: {
        email,
      },
      raw: true,
    });
    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (isCorrectPassword) {
      console.log('PASSWORD IS CORRECT');
      req.session.user = {
        id: user.id,
        login: user.login,
        email: user.email,
      };
      req.session.isAuthorized = true;
      return res.redirect('/api/sounds/');
    }
    throw new Error('Такая связка почты и пароля не обнаружена');
  } catch (error) {
    console.log(error);
    res.render('users/error', { error, message: 'Пользователь не обнаружен' });
  }
});

// Профиль пользователя
router.get('/users/:login', checkAuthorization, async (req, res) => {
  const { login } = req.params;
  try {
    const user = await User.findOne({
      where: {
        login,
      },
    });
    const userSounds = await user.getSounds();
    const isOwnerObserve = req.session.user.login === login;
    if (req.session && req.session.isAuthorized) {
      res.render('users/profile', { sounds: userSounds, session: req.session, isOwnerObserve });
    } else {
      res.render('users/profile', { sounds: userSounds, session: req.session, isOwnerObserve });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .render('users/error', { error, message: 'Не удалось обновить данные', session: req.session });
  }
});

// Создание пользователя
router.post('/users', async (req, res) => {
  const { login, email, password } = req.body;
  console.log(req);
  try {
    console.log(login, email, password);
    const hashedPassword = await bcrypt.hash(password, 10);
    const [user, isNew] = await User.findOrCreate({
      where: {
        email,
      },
      defaults: {
        login,
        email,
        password: hashedPassword,
      },
    });
    if (isNew) {
      req.session.user = {
        id: user.id,
        login: user.login,
        email: user.email,
      };
      req.session.isAuthorized = true;
      res.redirect('/api/sounds/');
    } else {
      throw new Error('Пользователь с такими данными уже существует');
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .render('users/error', { error, message: 'Не удалось создать пользователя', layout: false });
  }
});

// Добавляем запись
router.post('/sounds', checkAuthorization, getImage.single('imgPath'), async (req, res) => {
  const { imgPath, name, soundPath } = req.body;
  try {
    const [sound, isCreated] = await Sound.findOrCreate({
      where: {
        name,
      },
      defaults: {
        imgPath: `/uploads/${req.file.filename}`,
        name,
        soundPath: 'bla bla bla',
        UserId: req.session.user.id,
      },
    });
    if (isCreated) {
      res.redirect(`/api/users/${req.session.user.login}`);
    } else {
      throw new Error('Такая песня уже существует!');
    }
  } catch (error) {
    console.log(error);
    res.status(505).render('sounds/error', {
      error,
      message: 'Не удалось добавить звук',
      session: req.session,
      layout: false,
    });
  }
});

// Изменение
router.put('/sounds/:id', checkAuthorization, async (req, res) => {
  const { id } = req.params;
  const { name, imgPath, soundPath } = req.body;
  try {
    const sound = await Sound.findOne({
      where: {
        id,
      },
    });
    if (sound.UserId === req.session.user.id) {
      sound.name = name;
      sound.imgPath = imgPath;
      sound.soundPath = soundPath;
      sound.save();
      res.render('sounds/info', { session: req.session });
    } else {
      throw new Error(
        'Азаза, не тот юзер. Но сюда никто не попадёт, потому что я в другом месте проверяю, тот ли юзер',
      );
    }
  } catch (error) {
    console.log(error);
    res.status(500).render('sounds/error', { session: req.session });
  }
});

// Удаление
router.delete('/sounds/:id', checkAuthorization, async (req, res) => {
  const { id } = req.params;
  try {
    const sound = await Sound.findOne({
      where: {
        id,
      },
    });
    if (sound.UserId === req.session.user.id) {
      sound.destroy();
      res.redirect(`/api/users/${req.session.user.login}`);
    } else {
      throw new Error('И снова не получится удалить');
    }
  } catch (error) {
    console.log(error);
    res.status(500).render('sounds/error', { session: req.session });
  }
});

// Показываем все записи
router.get('/sounds', async (req, res) => {
  const userId = req.session.user.id;
  try {
    const sounds = await Sound.findAll({
      attributes: {
        include: [[Sequelize.fn('COUNT', Sequelize.col('Likes.id')), 'likes']],
      },
      include: [{ model: Like, as: 'Likes', attributes: [] }, { model: User }],
      group: ['Sound.id', 'User.id'],
      order: [sequelize.literal('likes')],
    });
    // тут ещё через inlude привязал лайки и сделал бы по ним сортировку, но не успел
    // console.log('Sounds::::::::', sounds);
    res.render('sounds/index', { sounds, session: req.session });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
