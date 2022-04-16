class Api {
  constructor(options) {
    this._baseUrl = options.baseUrl;
    this.headers = options.headers;
   
  }
  //выносим в отдельный метод проверку ответа от сервера
  _parseResponse(res) {
    if (res.ok) {
      return res.json();
    }

    return Promise.reject(new Error(`Произошла ошибка со статус-кодом ${res.status}`));
  }
  //публичный метод, загружающий с сервера информацию о карточках
  getInitialCards() {
    return fetch(`${this._baseUrl}/cards`, {
      headers:  {
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
       },
    }).then((res) => this._parseResponse(res));
  }
  //метод, загружающий информацию о пользователе
  getUserProfile() {
    return fetch(`${this._baseUrl}/users/me`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
       },
    }).then((res) => this._parseResponse(res));
  }
  //метод для изменения данных пользователя на сервере
  updateUserProfile({ name, about }) {
    return fetch(`${this._baseUrl}/users/me`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        ...this.headers
       },
      body: JSON.stringify({
        name: name,
        about: about,
      }),
    }).then((res) => this._parseResponse(res));
  }
  //метод для изменения ссылки на аватар пользователя на сервере
  updateAvatar(url) {
    return fetch(`${this._baseUrl}/users/me/avatar`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        ...this.headers
       },
      body: JSON.stringify({
        avatar: url,
      }),
    }).then((res) => this._parseResponse(res));
  }
  //метод для добавления на сервер новой карточки
  addNewCard({ name, link }) {
    return fetch(`${this._baseUrl}/cards`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        ...this.headers
       },
      body: JSON.stringify({
        name,
        link,
      }),
    }).then((res) => this._parseResponse(res));
  }
  //метод для удаления карточки из БД сервера
  deleteCard(id) {
    return fetch(`${this._baseUrl}/cards/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        ...this.headers
       },
    }).then((res) => this._parseResponse(res));
  }
  //реализация PUT-запроса для постановки лайка или удаление лайка - отправляем DELETE-запрос
  changeLike(id, isLiked) {
    return fetch(`${this._baseUrl}/cards/${id}/likes`, {
      method: isLiked ? 'DELETE' : 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        ...this.headers
       },
    }).then((res) => this._parseResponse(res));
  }
}

//Создаем и экспортируем экземпляр Api со ссылкой на сервер и данных об авторизации
export default Api = new Api({
  baseUrl: 'https://api.akaevgeniy.mesto.nomoredomains.work',
  headers: {
  'Content-Type': 'application/json',
  }
});
