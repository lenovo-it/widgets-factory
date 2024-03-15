import { customElement } from 'lit/decorators.js';
import { html } from 'lit';
import {
  type DarkModeManagerReactiveController,
  injectDarkModeManager,
  LazyInjectStylesElement,
} from '@lenovo-it/widgets-shared/lit';

import styles from '../index.scss';

@customElement('$NAME$-sub')
export class Sub extends LazyInjectStylesElement {
  get lazyInjectStyles() {
    return [styles];
  }

  // If you didn't want to use `darkModeManger` feature,
  // then you have to remove the code below, 'cause it significantly increases the bundled file size.
  @injectDarkModeManager()
  darkModeManager!: DarkModeManagerReactiveController;

  connectedCallback() {
    super.connectedCallback();

    console.log(this.darkModeManager.getCurrentDarkModeState());
  }

  render() {
    return html`
      <div class="test-lit-sub">
        <p>${this.darkModeManager.judgeCurrentDarkModeEnabled()}</p>
      </div>
    `;
  }
}
