import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import render from './view.js';
import resources from './locales/index.js';

const elements = {
  form: document.querySelector('form'),
  input: document.querySelector('input'),
  feedback: document.querySelector('.feedback'),
  btn: document.querySelector('button[type="submit"]'),
  posts: document.querySelector('.posts'),
  feeds: document.querySelector('.feeds'),
};

const i18nInstance = i18next.createInstance();
i18nInstance.init({
  lng: 'ru',
  debug: false,
  resources,
});

yup.setLocale({
  mixed: {
    notOneOf: i18nInstance.t('feedback.alreadyExist'),
    default: 'the entered data is not valid',
  },
  string: {
    url: i18nInstance.t('feedback.notValidUrl'),
  },
});

export default () => {
  const state = {
    processState: 'filling',
    data: '',
    validation: {
      state: 'valid',
      error: '',

    },
    feeds: [],
    post: [],
  };

  const watchedState = onChange(state, render(state, elements, i18nInstance));

  elements.form.addEventListener('input', (e) => {
    e.preventDefault();
    watchedState.data = e.target.value;
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const schema = yup.string()
      .url()
      .notOneOf(state.feeds)
      .trim();
    schema.validate(state.data)
      .then(() => {
        watchedState.validation.state = 'valid';
        watchedState.processState = 'sending';
        watchedState.feeds.push(state.data);
        watchedState.processState = 'finished';
      })
      .catch((err) => {
        watchedState.validation.state = 'invalid';
        watchedState.validation.error = err.message;
        watchedState.processState = 'failed';
      })
      .finally(() => {
        watchedState.processState = 'filling';
      });
  });
};
