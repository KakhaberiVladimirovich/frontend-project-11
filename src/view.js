import _ from 'lodash';

const errorHandler = (elements, err) => {
  const { input, feedback, btn } = elements;
  input.classList.add('is-invalid');
  feedback.textContent = err;
  feedback.classList.add('text-danger');
  feedback.classList.remove('text-success');
  btn.disabled = false;
};

const finishHandler = (elements, i18nInstance) => {
  const { input, feedback, form } = elements;
  input.classList.remove('is-invalid');
  input.classList.add('is-valid');
  feedback.classList.remove('text-danger');
  feedback.classList.add('text-success');
  feedback.textContent = i18nInstance.t('feedback.success');
  input.focus();
  form.reset();
};

export default (state, elements, i18nInstance) => (path, value) => {
  switch (path) {
    case 'processState':
      if (value === 'failed') {
        errorHandler(elements, state.validation.error);
      }
      if (value === 'finished') {
        finishHandler(elements, i18nInstance);
      }
      break;

    default:
      break;
  }
};
