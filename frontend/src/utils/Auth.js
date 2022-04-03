export const BASE_URL = 'http://api.akaevgeniy.mesto.nomoredomains.work';

const checkResponse = (response) => {
  return response.ok ? response.json() : Promise.reject(new Error(`Ошибка ${response.status}: ${response.statusText}`));
};

export const register = ({ password, email }) => {
  return fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password, email }),
  }).then((res) => checkResponse(res));
};

export const authorize = ({ password, email }) => {
  return fetch(`${BASE_URL}/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password, email }),
  }).then((res) => checkResponse(res));
};

export const getContent = (token) => {
  return fetch(`${BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => checkResponse(res));
};
