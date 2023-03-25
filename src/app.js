import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import resources from './locales/index.js';
import render from './render';

const elements = {
  form: document.querySelector('form'),
  input: document.querySelector('input'),
  feedback: document.querySelector('.feedback'),
};

yup.setLocale({
  mixed: {
    notOneOf: 'inputFeedback.errors.alreadyExist',
    default: 'the entered data is not valid',
  },
  string: {
    url: 'inputFeedback.errors.notValidUrl',
  },
});

export default () => {
  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  });
  const state = {
    process: 'filling',
    data: '',
    validation: 'valid',
    err: '',
    feeds: [],
  };

  const watchedState = onChange(state, render(state, elements, i18nInstance));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    watchedState.data = formData.get('url').trim().toLowerCase();
    const schema = yup.string().url().notOneOf(state.feeds).trim();
    schema.validate(state.data)
      .then(() => {
        watchedState.validation = 'valid';
        watchedState.process = 'sending';
        watchedState.feeds.push(state.data);
        watchedState.process = 'finished';
      })
      .catch((err) => {
        watchedState.validation = 'invalid';
        watchedState.err = err.message;
        watchedState.process = 'failed';
      })
      .finally(() => {
        watchedState.process = 'filling';
      });
  });
};
