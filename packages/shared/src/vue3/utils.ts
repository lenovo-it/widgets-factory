import { createApp, defineCustomElement, getCurrentInstance } from 'vue';
import type { Vue3DefineCustomElementWrappedOptions } from './types';
import { noop } from '../utils';

/**
 * Enable to use `plugin` when `defineCustomElement`.
 *
 * @see https://stackoverflow.com/a/77580452
 */
export function defineCustomElementWrapped(
  component: Parameters<typeof defineCustomElement>[0],
  options?: Vue3DefineCustomElementWrappedOptions,
) {
  return defineCustomElement({
    ...component,
    setup(...args: Parameters<Exclude<(typeof component)['setup'], undefined>>) {
      if (options?.plugins) {
        const app = createApp({});

        // install plugins
        options?.plugins.forEach(app.use);

        const inst = getCurrentInstance();
        Object.assign(inst!.appContext, app._context);
      }

      // @ts-ignore
      return component?.setup?.(args[0], args[1] || { expose: noop }); // <---- run initial setup if exists
    },
  } as typeof component);
}
