import React, { useState, useEffect } from 'react';
import { Route, Switch, Redirect, withRouter, useHistory } from 'react-router-dom';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import Register from './Register';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';
import DeleteConfirmPopup from './DeleteConfirmPopup';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import ImagePopup from './ImagePopup';
import InfoTooltip from './InfoTooltip';
import CurrentUserContext from '../contexts/CurrentUserContext';
import api from '../utils/Api';
import * as auth from '../utils/Auth';

function App() {
  //объявляем стейты попапов и карточки
  const [isEditProfilePopupOpen, setEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setEditAvatarPopupOpen] = useState(false);
  const [isInfoTooltipOpen, setisInfoTooltipOpen] = useState(false);
  const [isConfirmPopupOpen, setConfirmPopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState({});
  const [deletedCard, setDeletedCard] = useState({});
  //стейт, отвечающий за статус авторизации
  const [loggedIn, setLoggedIn] = useState(false);
  //информация о пользователе для вывода в хэдере
  const [userInfo, setUserInfo] = useState({
    email: '',
  });
  //информация для попапа, выводящего статус регистрации
  const [tooltipContent, setTooltipContent] = useState({
    text: '',
    picture: false,
  });
  //хук для перехода между страницами
  const history = useHistory();
  //стейт для активации меню для мобильной версии, передаем в шапку
  const [menuActive, setMenuActive] = useState(false);

  //информация о пользователе
  const [currentUser, setCurrentUser] = useState({});
  //данные о карточках
  const [cards, setCards] = useState([]);
  //функция, выводящая в консоль ошибку при запросе к АПИ
  const parseError = (err) => {
    console.log(err);
  };
  //метод для проверки токена в браузере, если есть токен и сверен с токеном из сервера, пользователь авторизован
  const checkToken = () => {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
      return;
    }
    auth
      .getContent(jwt)
      .then((user) => {
        setUserInfo({ ...userInfo, email: user.data.email });
        setLoggedIn(true);
      })
      .catch((err) => parseError(err));
  };
  //эффект, срабатывает один раз, проверяя наличие токена после монтирования
  useEffect(() => {
    checkToken();
  }, []);
  //функция, формирующая данные для попапа с ошибкой, вызывааем при неудачной регистрации
  const createErrorTooltip = () => {
    setTooltipContent({
      text: 'Что-то пошло не так! Попробуйте ещё раз.',
      picture: false,
    });
    setisInfoTooltipOpen(true);
  };
  //эффект для перехода на защищенный роут при авторизации, срабатывает каждый раз после изменения стейта loggedIn
  useEffect(() => {
    if (loggedIn) {
      history.push('/');
    }
  }, [loggedIn]);
  //в методе делаем запрос к серверу для авторизации
  const onLogin = (data) => {
    return auth
      .authorize(data)
      .then((user) => {
        setLoggedIn(true);
        setUserInfo({ email: data.email });
        localStorage.setItem('jwt', user.token);
      })
      .catch(() => {
        createErrorTooltip();
      });
  };
  //в методе делаем запрос к серверу для регистрации и формируем попап
  const onRegister = (data) => {
    return auth
      .register(data)
      .then(() => {
        history.push('/sign-in');
        setTooltipContent({
          text: 'Вы успешно зарегистрировались!',
          picture: true,
        });
        setisInfoTooltipOpen(true);
      })
      .catch(() => {
        createErrorTooltip();
      });
  };
  //метод для выхода, удаляем jwt токен
  const onLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem('jwt');
    history.push('/sign-in');
  };

  //создаем эффект, изменяющий при монтировании стейты на данные из сервера
  useEffect(() => {
    //Загружаем информацию о пользователе и карточках с сервера, объединенно вызываем запросы с Api, обновляем стейты
    Promise.all([api.getUserProfile(), api.getInitialCards()])
      .then(([userData, placeCards]) => {
        setCurrentUser(userData);
        setCards(placeCards);
      })
      .catch((err) => parseError(err));
  }, []);
  //Функция для постановки/снятия лайка
  function handleCardLike(card) {
    // Снова проверяем, есть ли уже лайк на этой карточке
    const isLiked = card.likes.some((i) => i._id === currentUser._id);
    // Отправляем запрос в API и получаем обновлённые данные карточки
    api
      .changeLike(card._id, isLiked)
      .then((newCard) => {
        setCards((state) => state.map((c) => (c._id === card._id ? newCard : c)));
      })
      .catch((err) => parseError(err));
  }
  //Функция для удаления карточки, запрос к АПИ
  function handleCardDelete(card) {
    api
      .deleteCard(card._id)
      .then((updateCards) => {
        setCards((state) => state.filter((c) => c._id !== card._id));
        console.log(updateCards);
        closeAllPopups();
      })
      .catch((err) => parseError(err));
  }
  //функции, изменяющие значения стейтов
  const handleEditAvatarClick = () => {
    setEditAvatarPopupOpen(true);
  };
  const handleEditProfileClick = () => {
    setEditProfilePopupOpen(true);
  };
  const handleAddPlaceClick = () => {
    setAddPlacePopupOpen(true);
  };
  //функция, открывающая попап подтверждения, принимает стейт карточки для удаления
  const handleDeleteCardClick = (card) => {
    setConfirmPopupOpen(true);
    setDeletedCard(card);
  };
  //функция для закрытия всех попапов
  const closeAllPopups = () => {
    setEditAvatarPopupOpen(false);
    setEditProfilePopupOpen(false);
    setAddPlacePopupOpen(false);
    setConfirmPopupOpen(false);
    setisInfoTooltipOpen(false);
    setSelectedCard({});
  };
  //Обработчик, закрывающий попап при нажатии на Escape
  useEffect(() => {
    const closeByEscape = (e) => {
      if (e.key === 'Escape') {
        closeAllPopups();
      }
    };
    document.addEventListener('keydown', closeByEscape);

    return () => document.removeEventListener('keydown', closeByEscape);
  }, []);
  //функция, присваивающая нужную карточку стейту (для открытия попапа с рисунком)
  const handleCardClick = (card) => {
    setSelectedCard(card);
  };
  //обработчик для обновления информации о пользователе
  const handleUpdateUser = ({ name, about }) => {
    api
      .updateUserProfile({ name, about })
      .then((userInfo) => {
        setCurrentUser(userInfo);
        closeAllPopups();
      })
      .catch((err) => parseError(err));
  };
  //обработчик для обновления аватара пользователя
  const handleUpdateAvatar = (url) => {
    api
      .updateAvatar(url)
      .then((userInfo) => {
        setCurrentUser(userInfo);
        closeAllPopups();
      })
      .catch((err) => parseError(err));
  };
  //функция для добавления новой карточки на сервер, сразу отрисовывается в разметке
  const handleAddPlaceSubmit = ({ name, link }) => {
    api
      .addNewCard({ name, link })
      .then((newPlace) => {
        setCards([newPlace, ...cards]);
        closeAllPopups();
      })
      .catch((err) => parseError(err));
  };

  //отрисовка секций, оборачиваем всё в контекст (данные о пользователе будут доступны со всех компонентов)
  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page">
        <Header loggedIn={loggedIn} userInfo={userInfo} onLogout={onLogout} menuActive={menuActive} setMenuActive={setMenuActive} />
        <Switch>
          <ProtectedRoute
            exact
            path="/"
            loggedIn={loggedIn}
            onEditAvatar={handleEditAvatarClick}
            onEditProfile={handleEditProfileClick}
            onAddPlace={handleAddPlaceClick}
            onCardClick={handleCardClick}
            onCardDeleteClick={handleDeleteCardClick}
            cards={cards}
            onCardLike={handleCardLike}
            component={Main}
          />
          <Route path="/sign-in">
            <Login onLogin={onLogin} />
          </Route>
          <Route path="/sign-up">
            <Register onRegister={onRegister} />
          </Route>
          <Route>{loggedIn ? <Redirect to="/" /> : <Redirect to="/sign-in" />}</Route>
        </Switch>
        <Footer />
        {/* далее идут компоненты с попапами редактирования профиля, аватра, добавления новой карточки (места), попап подверждения при удалении, попап с изображением  */}
        <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} onUpdateUser={handleUpdateUser} />

        <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} onUpdateAvatar={handleUpdateAvatar} />

        <AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} onAddPlace={handleAddPlaceSubmit} />

        <DeleteConfirmPopup isOpen={isConfirmPopupOpen} onClose={closeAllPopups} onCardDelete={handleCardDelete} card={deletedCard} />

        <ImagePopup card={selectedCard} onClose={closeAllPopups} />

        <InfoTooltip isOpen={isInfoTooltipOpen} onClose={closeAllPopups} tooltipContent={tooltipContent} />
      </div>
    </CurrentUserContext.Provider>
  );
}

export default withRouter(App);
