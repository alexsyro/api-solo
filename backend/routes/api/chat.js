const path = require('path');
const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');

const { Op, sequelize } = require('sequelize');
const { User, ContactList, ContactBook, Message } = require('../../db/models');
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

router.get('/messages/:receiver', checkAuthorization, async (req, res) => {
  const { receiver } = req.params;
  const { login } = req.session.user;
  const receiverUser = await User.findOne({ where: { login: receiver } });
  const authorUser = await User.findOne({ where: { login } });
  const messages = await Message.findAll({
    where: {
      [Op.or]: [
        {
          AuthorId: authorUser.id,
          ReceiverId: receiverUser.id,
        },
        {
          AuthorId: receiverUser.id,
          ReceiverId: authorUser.id,
        },
      ],
    },
  });
  const associations = {};
  associations[authorUser.id] = login;
  associations[receiverUser.id] = receiver;
  const messagesFromAuthor = await Message.findAll({
    where: {
      AuthorId: authorUser.id,
      ReceiverId: receiverUser.id,
    },
  });
  const messagesFromReceiver = await Message.findAll({
    where: {
      AuthorId: receiverUser.id,
      ReceiverId: authorUser.id,
    },
  });
  const comparedMessages = [...messagesFromAuthor, ...messagesFromReceiver].sort((a, b) => {
    a.createdAt - b.createdAt;
  });
  const messagesData = comparedMessages.map((entry) => ({
    date: entry.createdAt,
    message: entry.message,
    login: associations[entry.AuthorId],
  }));
  res.json({ messages: messagesData });
});

module.exports = router;
