import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import i18next from 'i18next';
import uniqueId from 'lodash/uniqueId.js';
import resources from './locales/index.js';
import render from './render.js';
import parseRSS from './parser.js';

const elements = {
  form: document.querySelector('form'),
  input: document.querySelector('input'),
  feedback: document.querySelector('.feedback'),
  posts: document.querySelector('.posts'),
  feeds: document.querySelector('.feeds'),
  btn: document.querySelector('button[type="submit"]'),
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

const axiosResponse = (url) => {
  const allOriginsLink = 'https://allorigins.hexlet.app/get';

  const preparedURL = new URL(allOriginsLink);
  preparedURL.searchParams.set('disableCache', 'true');
  preparedURL.searchParams.set('url', url);

  return axios.get(preparedURL);
};

const addFeeds = (id, title, description, watchedState) => {
  watchedState.feeds.unshift({ id, title, description });
};

const addPosts = (feedId, posts, watchedState) => {
  const result = posts.map((post) => ({
    feedId,
    id: uniqueId(),
    title: post.title,
    description: post.description,
    link: post.link,
  }));
  watchedState.posts = result.concat(watchedState.posts);
};

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
    rssLinks: [],
    posts: [],
    feeds: [],
  };

  const watchedState = onChange(state, render(state, elements, i18nInstance));

  const validate = (url) => {
    const schema = yup.string().url().notOneOf(state.rssLinks).trim();
    schema.validate(url)
      .then(() => {
        watchedState.validation = 'valid';
        watchedState.process = 'sending';
      })
      .then(() => axiosResponse(url))
      .then((response) => parseRSS(response.data.contents))
      .then((parsedRSS) => {
        const feedId = uniqueId();
        const title = parsedRSS.feed.feedTitle;
        const description = parsedRSS.feed.feedDescription;

        addFeeds(feedId, title, description, watchedState);
        addPosts(feedId, parsedRSS.posts, watchedState);

        watchedState.rssLinks.push(state.data);
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
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    watchedState.data = formData.get('url').trim().toLowerCase();
    validate(state.data);
  });
};
