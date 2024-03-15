import {
  createEffect,
  createMemo,
  createSignal,
  on,
  onCleanup,
  onMount,
  createContext,
  useContext,
  untrack,
  batch,
} from 'solid-js';
import { getCurrentElement } from 'solid-element';
import { DarkModeManager, getShadowRoot } from '../utils';
import type { SolidDarkModeManagerMiscOptions } from './types';
import { createStore } from 'solid-js/store';

export const DarkModeManagerContext = /*#__PURE__*/ createContext(
  {} as ReturnType<typeof _baseSetupDarkModeManagerMisc>,
);

function _baseSetupDarkModeManagerMisc(options?: SolidDarkModeManagerMiscOptions) {
  const darkModeManager = new DarkModeManager(options?.initialOptions);
  const [currentDarkModeState, setCurrentDarkModeState] = createStore({
    modeThemeClass: darkModeManager.modeThemeClass,
    modeThemeClasses: darkModeManager.modeThemeClasses,
    darkModeEnabled: darkModeManager.darkModeEnabled,
  });

  darkModeManager.registerModeChangeEvent(function (params) {
    setCurrentDarkModeState(function (state) {
      return {
        ...state,
        darkModeEnabled: params!.darkModeEnabled,
        modeThemeClass: params!.modeThemeClass,
      };
    });
  });

  function modeStateComputed<T>(f: (params: typeof currentDarkModeState) => T) {
    return batch(function () {
      return f(currentDarkModeState);
    });
  }

  function createStateMemo<T>(f: (params: typeof currentDarkModeState) => T) {
    return createMemo(function () {
      return batch(function () {
        return f(currentDarkModeState);
      });
    });
  }

  function stateSubscribe(f: (params: typeof currentDarkModeState) => any) {
    createEffect(function () {
      // Watch the changes.
      currentDarkModeState.darkModeEnabled;

      return untrack(f(currentDarkModeState));
    });
  }

  onCleanup(function () {
    darkModeManager.unregisterModeChangeEvent();
  });

  return {
    currentModeState: currentDarkModeState,
    computed: modeStateComputed,
    createModeStateMemo: createStateMemo,
    changeEventSubscribe: stateSubscribe,
  };
}

export function useStyles(
  styles: LazyStyleTagInjectClasses,
  options?: Parameters<LazyStyleTagInjectClasses['use']>[0],
) {
  onMount(function () {
    styles.use({ target: getShadowRoot(options?.target ?? getCurrentElement()) });
  });

  onCleanup(function () {
    styles.unuse();
  });
}

export function setupDarkModeManagerMisc(options?: SolidDarkModeManagerMiscOptions) {
  const context = useDarkModeManagerMisc();
  if (typeof context.createModeStateMemo === 'function') {
    return context;
  }

  return _baseSetupDarkModeManagerMisc(options);
}

export function useDarkModeManagerMisc() {
  return useContext(DarkModeManagerContext);
}
