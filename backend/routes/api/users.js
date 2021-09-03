const path = require('path');
const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const { Op, sequelize } = require('sequelize');
const { User, ContactList, ContactBook, Messages } = require('../../db/models');
const { checkAuthorization } = require('../middlewares');

const { Router } = express;

const router = Router();

// Настраиваем мультер
const imageStorage = multer.diskStorage({
  destination: path.join(__dirname, '../../front/static/uploads/'),
});

const getImage = multer({ storage: imageStorage });

// Логин пользователя
router.post('/', async (req, res) => {
  console.log(req.body);
  const { credentials, password } = req.body;
  try {
    const user = await User.findOne({
      where: {
        [Op.or]: [{ login: credentials }, { email: credentials }],
      },
    });
    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (isCorrectPassword) {
      console.log(`[INFO]:[${new Date()}] - USER: ${user.login} CORRECT PASSWORD`);
      req.session.user = {
        id: user.id,
        login: user.login,
        email: user.email,
      };
      req.session.isAuthorized = true;
      res.redirect('/api/chat');
    } else {
      res
        .status(403)
        .render('error', { error: 'Не правильный пароль', message: 'Попробуй ещё раз', layout: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).render('error', {
      error,
      message: 'Проблема подключения к базе. Пожалуйста свяжитесь с администраторами',
    });
  }
});

// Создание пользователя
router.post('/new', async (req, res) => {
  const { fullName, login, email, password, phone } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [user, isNew] = await User.findOrCreate({
      where: {
        [Op.or]: [{ login }, { email }],
      },
      defaults: {
        FullName: fullName,
        login,
        email,
        password: hashedPassword,
        phone,
        avatar: '/img/avatars/avatar.jpeg',
        CypherKey: 1234,
      },
    });
    if (isNew) {
      req.session.user = {
        id: user.id,
        fullName: user.fullName,
        login: user.login,
        email: user.email,
      };
      req.session.isAuthorized = true;
      res.redirect('/api/chat');
    } else {
      res.status(403).render('error', {
        error: 'Пользователь уже существует',
        message: 'Попробуй ещё раз',
        layout: false,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).render('error', {
      error,
      message: 'Проблема подключения к базе. Пожалуйста свяжитесь с администраторами',
    });
  }
});

// Поиск пользователей
router.get('/', checkAuthorization, async (req, res) => {
  const { searchString } = req.query;
  const users = await User.findAll({
    where: {
      [Op.or]: [
        {
          login: { [Op.iRegexp]: searchString },
        },
        {
          FullName: { [Op.iRegexp]: searchString },
        },
      ],
    },
  });
  res.render('users/search', { users, session: req.session });
});

// Профиль пользователя
router.get('/:login', checkAuthorization, async (req, res) => {
  const { login } = req.params;
  try {
    const user = await User.findOne({
      where: {
        login,
      },
    });
    const isOwnerObserve = req.session.user.login === login;
    if (req.session && req.session.isAuthorized) {
      res.render('users/profile', { user, session: req.session, isOwnerObserve });
    } else {
      res.render('users/profile', { session: req.session, isOwnerObserve });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .render('users/error', { error, message: 'Не удалось обновить данные', session: req.session });
  }
});

router.post('/add/:login', checkAuthorization, async (req, res) => {
  const { login } = req.params;
  const friend = await User.findOne({
    where: {
      login,
    },
  });
  const [currentUserContactBook] = await ContactBook.findOrCreate({
    where: {
      UserId: req.session.user.id,
    },
  });
  console.log('CURBOK', currentUserContactBook);
  const contact = await ContactList.create({
    ContactBookId: currentUserContactBook.id,
    UserId: friend.id,
  });
  res.redirect('/api/chat');
});

module.exports = router;
