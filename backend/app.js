require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
const auth = require('./middlewares/auth');
const userRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const errorsMiddleware = require('./middlewares/errors');
const {
  createUser,
  login,
} = require('./controllers/users');
const NotFoundError = require('./errors/not-found-err');
const { requestLogger, errorLogger } = require('./middlewares/logger');

// Слушаем 3000 порт
const { PORT = 3000 } = process.env;

const validateURL = (value) => {
  if (!validator.isURL(value, { require_protocol: true })) {
    throw new Error('Неправильный формат ссылки');
  }
  return value;
};

const app = express();
app.use(express.json());

app.use(requestLogger); // подключаем логгер запросов

app.use(cors());

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().custom(validateURL),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.use(auth);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// соединяемся с БД на локальном порту
mongoose.connect('mongodb://localhost:27017/mestodb', (err) => {
  if (err) throw err;
  console.log('connected to MongoDB');
});

app.use(userRouter);
app.use(cardsRouter);
// если ни один из маршрутов не отвечает, то передаем ошибку 404
app.use(() => {
  throw new NotFoundError('Ошибка 404 - Неправильный путь');
});

app.use(errorLogger); // подключаем логгер ошибок

app.use(errors());
app.use(errorsMiddleware);
// запуск сервера, слушаем порт
app.listen(PORT, () => {
  console.log('Run server...', PORT);
});
