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

router.get('/', checkAuthorization, async (req, res) => {
  const { user } = req.session;
  const [contacts, isNew] = await ContactBook.findOrCreate({
    where: {
      UserId: user.id,
    },
    include: {
      model: ContactList,
      include: {
        model: User,
        attributes: ['login', 'FullName'],
      },
    },
    default: {
      UserId: req.session.user.id,
    },
  });
  res.render('chat', { contacts: contacts.ContactLists, session: req.session });
});

module.exports = router;
