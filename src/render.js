const errorValidation = (elements, err, i18nInstance) => {
  const { input, feedback } = elements;
  input.classList.add('is-invalid');
  feedback.classList.add('text-danger');
  feedback.classList.remove('text-success');
  feedback.textContent = i18nInstance.t(err);
};

const passedValidation = (elements, i18nInstance) => {
  const { input, feedback, form } = elements;
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.classList.add('text-success');
  feedback.textContent = i18nInstance.t('inputFeedback.success');
  input.focus();
  form.reset();
};

export default (state, elements, i18nInstance) => (path, value) => {
  switch (path) {
    case 'process':
      if (value === 'failed') {
        errorValidation(elements, state.err, i18nInstance);
      }
      if (value === 'finished') {
        passedValidation(elements, i18nInstance);
      }
      break;

    default:
      break;
  }
};
