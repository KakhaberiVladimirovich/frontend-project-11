import * as yup from 'yup';
import onChange from 'on-change';
import render from './render';

const elements = {
  form: document.querySelector('form'),
  input: document.querySelector('input'),
  feedback: document.querySelector('.feedback'),
};

yup.setLocale({
  mixed: {
    notOneOf: 'RSS уже существует',
    default: 'the entered data is not valid',
  },
  string: {
    url: 'Ссылка должна быть валидным URL',
  },
});

export default () => {
  const state = {
    process: 'filling',
    data: '',
    validation: 'valid',
    err: '',
    feeds: [],
  };

  const watchedState = onChange(state, render(state, elements));

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
