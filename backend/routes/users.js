const userRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
// импортируем контроллеры и добавляем их в качестве колбэков в методы роутов пользователя
const {
  getUsers,
  getUserId,
  updateUser,
  updateAvatar,
  getCurrentUser,
} = require('../controllers/users');

const validateURL = (value) => {
  if (!validator.isURL(value, { require_protocol: true })) {
    throw new Error('Неправильный формат ссылки');
  }
  return value;
};

userRouter.get('/users', getUsers);

userRouter.get('/users/me', getCurrentUser);

userRouter.get('/users/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().length(24).hex(),
  }),
}), getUserId);

userRouter.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updateUser);

userRouter.patch('/users/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().custom(validateURL).required(),
  }),
}), updateAvatar);

module.exports = userRouter;
