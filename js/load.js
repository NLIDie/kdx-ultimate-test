// file load.js

(() => {
  'use strict';

  const URL = 'https://rawgit.com/Varinetz/e6cbadec972e76a340c41a65fcc2a6b3/raw/90191826a3bac2ff0761040ed1d95c59f14eaf26/frontend_test_table.json';

  window.load = (onSuccess, onError) => {
    const xhr = new XMLHttpRequest();

    xhr.open('GET', URL);

    xhr.addEventListener('load', (evt) => {
      if (xhr.status === 200) {
        onSuccess(JSON.parse(xhr.responseText));
      } else {
        onError(`Ошибка загрузки данных: статус ${xhr.status} ${xhr.statusText}`);
      }
    });

    xhr.addEventListener('error', (evt) => {
      onError('Произощла ошибка соединения');
    });

    xhr.addEventListener('timeout', (evt) => {
      onError(`Запрос не успел выполниться за ${xhr.timeout} мс`);
    });

    xhr.timeout = 10000;

    xhr.send();
  };
})();
