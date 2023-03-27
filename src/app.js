import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import i18next from 'i18next';
import _ from 'lodash';
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
  modalTitle: document.querySelector('.modal-title'),
  modalDescr: document.querySelector('.modal-body'),
  modalReadBtn: document.querySelector('.modal-link'),
  modalCloseBtn: document.querySelector('.modal-close'),
  fullArticleButton: document.querySelector('.full-article'),
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

const axiosResponse = (url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);

const addFeeds = (id, title, description, watchedState) => {
  watchedState.feeds.unshift({ id, title, description });
};

const addPosts = (feedId, posts, watchedState) => {
  const result = posts.map((post) => ({
    feedId,
    id: _.uniqueId(),
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
    readPostIds: new Set(),
  };

  // const getCurrentPosts = (data) => data.map((post) => {
  //   const { title, link, description } = post;
  //   return { title, link, description };
  // });

  //   const getUniquePosts = (posts, currentPosts) =>
  // _.differenceWith(posts, currentPosts, _.isEqual);
  // const normalizeData = (feeds, posts, feedUrl) => {
  //   const feedId = _.get(feeds, 'id', _.uniqueId('feed'));
  //   const normalizedFeed = { ...feeds, id: feedId, url: feedUrl };
  //   const normalizedPosts = posts.map((post) => {
  //     const id = _.uniqueId('post');
  //     return { ...post, id, feedId };
  //   });
  //   return { feed: normalizedFeed, posts: normalizedPosts };
  // };

  const postsUpdate = (url, feedId, watchedState) => {
    const timeout = 5000;
    const inner = () => {
      axiosResponse(url)
        .then((response) => parseRSS(response.data.contents))
        .then((parsedRSS) => {
          const postsUrls = watchedState.posts
            .filter((post) => feedId === post.feedId)
            .map(({ link }) => link);
          const newPosts = parsedRSS.posts.filter(({ link }) => !postsUrls.includes(link));
          console.log(newPosts);
          if (newPosts.length > 0) {
            addPosts(feedId, newPosts, watchedState);
          }
        })
        .catch(console.error)
        .finally(() => {
          setTimeout(inner, timeout);
        });
    };
    setTimeout(inner, timeout);
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
        const feedId = _.uniqueId();
        const title = parsedRSS.feed.feedTitle;
        const description = parsedRSS.feed.feedDescription;

        addFeeds(feedId, title, description, watchedState);
        addPosts(feedId, parsedRSS.posts, watchedState);
        postsUpdate(state.data, feedId, watchedState);

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

  elements.posts.addEventListener('click', (e) => {
    const postId = e.target.dataset.id;
    if (postId) {
      watchedState.readPostIds.add(postId);
    }
    if (e.target.dataset.bsTarget === '#modal') {
      const post = state.posts
        .find(({ id }) => postId === id);
      const { title, description, link } = post;
      watchedState.modal = { title, description, link };
    }
  });
};
