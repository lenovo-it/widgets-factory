import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  DarkModeManagerReactiveController,
  LazyInjectStylesElement,
  provideDarkModeManager,
} from '@lenovo-it/widgets-shared/lit';

// You can remove this one.
// If you don't want to use `tailwindcss` functionality.
import tailwindcssStyles from './tailwind.css';

// Import the `Sub` and make it registered automatically.
import './components/Sub';

@customElement('$NAME$')
export class App extends LazyInjectStylesElement {
  // This property Could be removed if unnecessary.
  /** @see https://lit.dev/docs/components/styles/ */
  static styles = css`
    /** Some DOM intrinsic styles in css format. */
    p {
      color: blue;
    }
  `;

  get lazyInjectStyles() {
    return [
      // You can remove this one.
      // If you don't want to use `tailwindcss` functionality.
      tailwindcssStyles,
    ];
  }

  // If you didn't want to use `darkModeManager` feature,
  // then you have to remove the code below, 'cause it significantly increases the bundled file size.
  // Effective only under this format.
  @provideDarkModeManager()
  private darkModeManager = new DarkModeManagerReactiveController(this, {});

  @property()
  count = 1;

  handleCountIncrease() {
    this.count++;
  }

  render() {
    return html`
      <div class="$NAME$">
        <!-- Must not to write as the shorter one: '<$NAME$-sub />' -->
        <!-- That will cause unexpected issues! -->
        ${this.count < 10 ? html`<$NAME$-sub></$NAME$-sub>` : null}
        <p>${this.count}</p>
        <button @click="${this.handleCountIncrease}">Click</button>
      </div>
    `;
  }
}
