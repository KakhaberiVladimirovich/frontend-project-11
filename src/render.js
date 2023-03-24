const errorValidation = (elements, err) => {
  const { input, feedback } = elements;
  input.classList.add('is-invalid');
  feedback.classList.add('text-danger');
  feedback.classList.remove('text-success');
  feedback.textContent = err;
};

const passedValidation = (elements) => {
  const { input, feedback, form } = elements;
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.classList.add('text-success');
  feedback.textContent = 'Круто';
  input.focus();
  form.reset();
};

export default (state, elements) => (path, value) => {
  switch (path) {
    case 'process':
      if (value === 'failed') {
        errorValidation(elements, state.err);
      }
      if (value === 'finished') {
        passedValidation(elements);
      }
      break;

    default:
      break;
  }
};
