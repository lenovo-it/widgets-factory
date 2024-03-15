import type { Vue3DarkModeManagerMiscOptions } from './types';
import {
  computed,
  type ComputedRef,
  inject,
  reactive,
  watch,
  type WatchCallback,
  type WatchOptions,
  onUnmounted,
  provide,
  readonly,
  UnwrapNestedRefs,
  onMounted,
  getCurrentInstance,
} from 'vue';
import { VUE3_DARK_MODE_MANAGER_CONTEXT_KEY } from './constants';
import { DarkModeManager, getShadowRoot } from '../utils';
import type { DarkModeManagerModeChangeEventParams } from '../types';

function _baseSetupDarkModeManagerMisc(options?: Vue3DarkModeManagerMiscOptions) {
  const darkModeManager = new DarkModeManager(options?.initialOptions);
  const currentDarkModeState = reactive({
    modeThemeClass: darkModeManager.modeThemeClass,
    modeThemeClasses: readonly(darkModeManager.modeThemeClasses),
    darkModeEnabled: darkModeManager.darkModeEnabled,
  });

  const subscribeInvalidators: Function[] = [];

  darkModeManager.registerModeChangeEvent(function (params) {
    currentDarkModeState.darkModeEnabled = params!.darkModeEnabled;
    currentDarkModeState.modeThemeClass = params!.modeThemeClass;
  });

  function modeStateComputed<T>(f: (params: DarkModeManagerModeChangeEventParams) => T): ComputedRef<T> {
    return computed(function () {
      return f(currentDarkModeState);
    });
  }

  function stateSubscribe(
    f: WatchCallback<UnwrapNestedRefs<typeof currentDarkModeState>, UnwrapNestedRefs<typeof currentDarkModeState>>,
    options?: WatchOptions,
  ) {
    // @ts-ignore
    subscribeInvalidators.push(watch(currentDarkModeState, f, Object.assign({ deep: true }, options)));
  }

  onUnmounted(function () {
    darkModeManager.unregisterModeChangeEvent();

    subscribeInvalidators.forEach(function (invalidator) {
      invalidator();
    });
  });

  const result = {
    currentModeState: computed(function () {
      return readonly(currentDarkModeState);
    }),
    modeStateComputed,
    changeEventSubscribe: stateSubscribe,
  };

  provide(VUE3_DARK_MODE_MANAGER_CONTEXT_KEY, result);

  return result;
}

export function setupDarkModeManagerMisc(options?: Vue3DarkModeManagerMiscOptions) {
  const injectedMisc = inject<ReturnType<typeof _baseSetupDarkModeManagerMisc>>(VUE3_DARK_MODE_MANAGER_CONTEXT_KEY);
  if (injectedMisc) {
    return injectedMisc;
  }

  return _baseSetupDarkModeManagerMisc(options);
}

export function useDarkModeManagerMisc() {
  return inject<ReturnType<typeof _baseSetupDarkModeManagerMisc>>(VUE3_DARK_MODE_MANAGER_CONTEXT_KEY);
}

export function useStyles(
  styles: LazyStyleTagInjectClasses,
  options?: Parameters<LazyStyleTagInjectClasses['use']>[0],
) {
  onMounted(function () {
    styles.use({ target: getShadowRoot(options?.target ?? getCurrentInstance()?.proxy?.$el) });
  });

  onUnmounted(function () {
    styles.unuse();
  });
}
