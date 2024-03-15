import App from './App.vue';
import { defineCustomElementWrapped } from '@lenovo-it/widgets-shared/vue3';

customElements.define(
  '$NAME$',
  defineCustomElementWrapped(App, {
    plugins: [],
  }),
);

// Dev.
if (__DEV__) {
  // Normal use.
  // import('vue').then(vue => vue.createApp(App).mount('#root'));

  // CustomElements use.
  document.getElementById('root')!.appendChild(document.createElement('$NAME$'));
}
