// @ts-check

import Example from './Example.js';
import 'bootstrap';

export default () => {
  const element = document.getElementById('point');
  const obj = new Example(element);
  obj.init();

  const triggerTabList = document.querySelectorAll('#list-tab2 a');
  triggerTabList.forEach((triggerEl) => {
    const tabTrigger = new bootstrap.Tab(triggerEl);

    triggerEl.addEventListener('click', (event) => {
      event.preventDefault();
      tabTrigger.show();
    });
  });
};
