const container = (title, state, elements, i18nInstance) => {
  elements[title].textContent = '';

  const columns = document.createElement('div');
  columns.classList.add('card', 'border-0');
  const InnerContainer = document.createElement('div');
  InnerContainer.classList.add('card-body');
  const InnerContainerTitle = document.createElement('h2');
  InnerContainerTitle.classList.add('card-title', 'h4');
  InnerContainerTitle.textContent = i18nInstance.t(title);
  InnerContainer.append(InnerContainerTitle);
  columns.append(InnerContainer);
  elements[title].append(columns);
  if (title === 'feeds') {
    const feedsList = document.createElement('ul');
    feedsList.classList.add('list-group', 'border-0', 'rounded-0');
    state.feeds.forEach((feed) => {
      const listGroupItem = document.createElement('li');
      listGroupItem.classList.add('list-group-item', 'border-0', 'border-end-0');
      const h3 = document.createElement('h3');
      h3.classList.add('h6', 'm-0');
      h3.textContent = feed.title;
      const p = document.createElement('p');
      p.classList.add('m-0', 'small', 'text-black-50');
      p.textContent = feed.description;
      listGroupItem.append(h3);
      listGroupItem.append(p);
      feedsList.append(listGroupItem);
    });
    columns.append(feedsList);
  }
  if (title === 'posts') {
    const postsList = document.createElement('ul');
    postsList.classList.add('list-group', 'border-0', 'rounded-0');
    state.posts.forEach((post) => {
      const postsListItem = document.createElement('li');
      postsListItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
      const a = document.createElement('a');
      a.classList.add(state.readPostIds.has(post.id) ? ('fw-normal', 'link-secondary') : 'fw-bold');
      a.href = post.link;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.setAttribute('data-id', post.id);
      a.textContent = post.title;

      const button = document.createElement('button');
      button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      button.type = 'button';
      button.setAttribute('data-id', post.id);
      button.setAttribute('data-bs-toggle', 'modal');
      button.setAttribute('data-bs-target', '#modal');
      button.textContent = i18nInstance.t('preview');
      postsListItem.append(a);
      postsListItem.append(button);
      postsList.append(postsListItem);
    });
    columns.append(postsList);
  }
};

const sendingHandler = (elements) => {
  elements.btn.disabled = true;
};

const errorValidation = (elements, err, i18nInstance) => {
  const { input, feedback } = elements;
  if (err === 'Network Error') {
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.textContent = i18nInstance.t('inputFeedback.errors.networkError');
    return;
  }
  input.classList.add('is-invalid');
  feedback.classList.add('text-danger');
  feedback.classList.remove('text-success');
  feedback.textContent = i18nInstance.t(err);
};

const passedValidation = (state, elements, i18nInstance) => {
  const {
    input, feedback, form, btn,
  } = elements;
  input.classList.remove('is-invalid');
  feedback.textContent = '';

  container('posts', state, elements, i18nInstance);
  container('feeds', state, elements, i18nInstance);

  btn.disabled = false;
  feedback.classList.remove('text-danger');
  feedback.classList.add('text-success');
  feedback.textContent = i18nInstance.t('inputFeedback.success');
  input.focus();
  form.reset();
};

export default (state, elements, i18nInstance) => (path, value) => {
  switch (path) {
    case 'process':
      if (value === 'sending') {
        sendingHandler(elements);
      }
      if (value === 'failed') {
        errorValidation(elements, state.err, i18nInstance);
      }
      if (value === 'finished') {
        passedValidation(state, elements, i18nInstance);
      }
      break;

    case 'readPostIds':
      container('posts', state, elements, i18nInstance);
      break;
    case 'posts':
      container('posts', state, elements, i18nInstance);
      break;
    case 'modal':
      elements.modal.title.textContent = value.title;
      elements.modal.body.textContent = value.description;
      elements.modal.fullArticleButton.href = value.link;
      break;
    default:
      break;
  }
};
