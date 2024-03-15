import { LitElement } from 'lit';
import { getShadowRoot } from '../utils';

export class LazyInjectStylesElement extends LitElement {
  protected get lazyInjectStyles(): LazyStyleTagInjectClasses[] {
    return [];
  }

  connectedCallback() {
    super.connectedCallback();

    // We will inject the styles under the `shadowRoot`.
    // @ts-ignore
    this.lazyInjectStyles.forEach(style => {
      style.use({ target: getShadowRoot(this) });
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // We will inject the styles under the `shadowRoot`.
    // @ts-ignore
    this.lazyInjectStyles.forEach(function (style) {
      style.unuse();
    });

    this.lazyInjectStyles.length = 0;
  }
}
