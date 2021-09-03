const path = require('path');
const express = require('express');
const session = require('express-session');
const { createServer } = require('http');
const { Server: SocketIOServer } = require('socket.io');
const SessionFileStore = require('session-file-store')(session);
const logger = require('morgan');
const dotenv = require('dotenv');
const axios = require('axios');
const usersRouter = require('./routes/api/users');
const chatRouter = require('./routes/api/chat');
const { checkAuthorization } = require('./routes/middlewares');
const { User, ContactList, ContactBook, Message } = require('./db/models');

// Инициализируем хранение переменных окружения в файл .env
dotenv.config();

// Достаём из файла переменные окружения
const { PORT, PHRASE } = process.env;

// Инициализируем экзмепляр экспресса
const app = express();

// Натраиваем конфиг сессий
const sessionConfig = {
  store: new SessionFileStore(),
  name: 'user_sid',
  secret: PHRASE,
  resave: true,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// Чтобы была возможность выхватывать из сокетов куки
const sessionMiddleware = session(sessionConfig);

// Настраиваем движок рендеринга шаблонов на hbs
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../front/views'));

// Morgan
app.use(logger('dev'));

// Цепляем сессии
app.use(session(sessionConfig));

// Body parsers
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Прописываем статику до нашей папки
app.use(express.static(path.join(__dirname, '../front/static')));

// Создаём сервер для перехвата сокетов
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer);

// Используем нашу middleware для выцепления сесссий
io.use((socket, next) => sessionMiddleware(socket.request, {}, next));

// Вход на сайт
app.get('/', (req, res) => {
  res.render('login');
});

// Регистрация
app.get('/registration', (req, res) => {
  res.render('registration');
});

// Логин
app.get('/login', (req, res) => {
  res.render('login');
});

// Логаут
app.get('/logout', (req, res) => {
  // io.emmit('disconnect', req.session.user.login);
  req.session.destroy();
  res.clearCookie('user_sid');
  res.redirect('/');
});

const socketUsers = [];
io.on('connection', async (socket) => {
  // Коннект пользователя
  const { login, id: userId } = socket.request.session.user;
  socket.auth = { login, userId, isConnected: true };
  console.log(`${socket.auth.login} Online`);
  const data = { message: `Пользователь ${socket.auth.login} присоединился к чату` };
  socket.broadcast.emit('user:connected', data);

  // eslint-disable-next-line no-restricted-syntax
  for (const [socketId, socket] of io.of('/').sockets) {
    // console.log(socket)
    if (socketUsers.every((user) => user.login !== login)) {
      socketUsers.push({ socketId, userId, login });
    }
  }

  // Смотрим все события
  socket.onAny(async (event, ...args) => {
    console.log('LOG::::::::::::', event, args, socket.disconnected);
  });

  // Сообщение в общем канале
  socket.on('chat:all:sendMessage', async (message) => {
    if (message === ':::weather') {
      axios.defaults.baseURL = 'https://api.weather.yandex.ru/v1/forecast?';
      axios.defaults.headers.common['X-Yandex-API-Key'] = '4276d684-fa43-4cee-90f4-c35f565faf67';
      const weaterQuery = await axios.get('lan=59.938951&lon=30.315635');
      const forecast = weaterQuery.data;
      socket.emit('user:weather', forecast);
    } else {
      const messData = { date: new Date(), message, login };
      const messageEntry = await Message.create({
        AuthorId: userId,
        ReceiverId: 2,
        message,
      });
      io.emit('chat:getMessage', messData);
    }
  });

  // Дисконнект
  socket.on('disconnected', (login) => {
    console.log(`${login} Offline`);
    // const { login } = socket.request.session.user;
    const data = { message: `Пользователь ${login} покинул чат` };
    io.emit('user:disconnected', data);
  });
});

app.use('/api/users', usersRouter);
app.use('/api/chat', chatRouter);

httpServer.listen(PORT, () => {
  const STATUS = `SERVER IS STARTING ON PORT ${PORT}`;
  console.log(STATUS);
});
