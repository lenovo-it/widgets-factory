/// <reference types="@rsbuild/core/types" />
/// <reference types="vitest" />\

// Global compile-time constants.
declare const __DEV__: boolean;
declare const __PRODUCTION__: boolean;
declare const __TEST__: boolean;

// Vue3.
declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  // biome-ignore lint/complexity/noBannedTypes: reason
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

type LazyStyleTagInjectClasses = {
  use(params?: { target?: HTMLElement | ShadowRoot | null }): void;
  unuse(): void;
} & String;

declare module '*.css' {
  const classes: LazyStyleTagInjectClasses;
  export default classes;
}

declare module '*.scss' {
  const classes: LazyStyleTagInjectClasses;
  export default classes;
}
