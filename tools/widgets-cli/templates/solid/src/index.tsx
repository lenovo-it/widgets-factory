import { customElement } from 'solid-element';
import App from './App';

customElement('$NAME$', {}, (props, { element }) => {
  return App(props);
});

if (__DEV__) {
  document.getElementById('root')!.appendChild(document.createElement('$NAME$'));
  // import('solid-js/web').then(p => p.render(() => <App />, document.getElementById('root')!));
}
