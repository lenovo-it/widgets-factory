import type { SvelteDarkModeManagerMiscOptions } from './types';
import { DarkModeManager, EventSubscribeInvalidators } from '../utils';
import { derived, writable } from 'svelte/store';
import type { DarkModeManagerModeChangeEventParams, EventSubscribeInvalidatorItem } from '../types';
import { getContext, hasContext, onDestroy, setContext } from 'svelte';
import { SVELTE_DARK_MODE_MANAGER_CONTEXT_KEY } from './constants';

function _baseSetupDarkModeManagerMisc(options?: SvelteDarkModeManagerMiscOptions) {
  const darkModeManager = new DarkModeManager(options?.initialOptions);
  const currentDarkModeState = writable({
    modeThemeClass: darkModeManager.modeThemeClass,
    modeThemeClasses: darkModeManager.modeThemeClasses,
    darkModeEnabled: darkModeManager.darkModeEnabled,
  });
  const subscribeInvalidators = new EventSubscribeInvalidators();

  darkModeManager.registerModeChangeEvent(function (params) {
    currentDarkModeState.update(function (state) {
      state.darkModeEnabled = params!.darkModeEnabled;
      state.modeThemeClass = params!.modeThemeClass;

      return state;
    });
  });

  function modeStateDerived<T>(f: (params: DarkModeManagerModeChangeEventParams) => T) {
    return derived(currentDarkModeState, f);
  }
  function stateSubscribe(f: Parameters<typeof currentDarkModeState.subscribe>[0]) {
    subscribeInvalidators.register({
      subscriber: f,
      invalidator: currentDarkModeState.subscribe(f),
    });
  }

  onDestroy(function () {
    darkModeManager.unregisterModeChangeEvent();
    subscribeInvalidators.clear();
  });

  return setContext(SVELTE_DARK_MODE_MANAGER_CONTEXT_KEY, {
    currentModeState: modeStateDerived(function (state) {
      return state;
    }),
    derived: modeStateDerived,
    changeEventSubscribe: stateSubscribe,
    unsubscribe: subscribeInvalidators.unregister.bind(subscribeInvalidators),
  });
}

export function setupDarkModeManagerMisc(options?: SvelteDarkModeManagerMiscOptions) {
  if (hasContext(SVELTE_DARK_MODE_MANAGER_CONTEXT_KEY)) {
    return useDarkModeManagerMisc();
  }

  return _baseSetupDarkModeManagerMisc(options);
}

export function useDarkModeManagerMisc() {
  const darkModeManagerMisc = getContext<ReturnType<typeof _baseSetupDarkModeManagerMisc>>(
    SVELTE_DARK_MODE_MANAGER_CONTEXT_KEY,
  );

  const subscribers: Array<Pick<EventSubscribeInvalidatorItem, 'subscriber'>> = [];

  const changeEventSubscribeModified: (typeof darkModeManagerMisc)['changeEventSubscribe'] = function (f) {
    subscribers.push({
      subscriber: f,
    });

    return darkModeManagerMisc.changeEventSubscribe(f);
  };

  onDestroy(function () {
    darkModeManagerMisc.unsubscribe(subscribers);

    subscribers.length = 0;
  });

  // Hack.
  return Object.setPrototypeOf(
    { changeEventSubscribe: changeEventSubscribeModified } as typeof darkModeManagerMisc,
    darkModeManagerMisc,
  ) as typeof darkModeManagerMisc;
}
