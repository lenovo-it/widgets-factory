import { Events } from './events';
import type {
  DarkModeManagerInitialOptions,
  DarkModeManagerModeBase,
  DarkModeManagerModeChangeEventParams,
  EventsListenerItemFn,
  EventsListenerTriggerOptions,
} from '../types';

export class DarkModeManager implements DarkModeManagerModeBase {
  private _events = new Events<DarkModeManagerModeChangeEventParams>();
  private _darkModeMatchMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  modeThemeClasses = {
    dark: 'dark-theme',
    light: 'light-theme',
  };

  get darkModeEnabled() {
    return !!this._darkModeMatchMediaQuery?.matches;
  }

  get modeThemeClass() {
    return this.darkModeEnabled ? this.modeThemeClasses.dark : this.modeThemeClasses.light;
  }

  constructor(options?: DarkModeManagerInitialOptions) {
    this._init(options);
  }

  private _init(options?: DarkModeManagerInitialOptions) {
    // eslint-disable-next-line
    const self = this;

    this._darkModeMatchMediaQuery.onchange = function () {
      self.triggerModeChangeEvent(options?.modeChangeEvents);
    };

    return this;
  }

  registerModeChangeEvent(fn: EventsListenerItemFn<DarkModeManagerModeChangeEventParams>) {
    this._events.registerListener('modeChange', fn);

    return this;
  }

  unregisterModeChangeEvent(fn?: EventsListenerItemFn<DarkModeManagerModeChangeEventParams>) {
    if (typeof fn === 'function') {
      this._events.unregisterListener('modeChange', fn);

      return this;
    }

    this._events.unregisterListener('modeChange');

    return this;
  }

  triggerModeChangeEvent(options?: EventsListenerTriggerOptions) {
    return this._events.trigger(
      'modeChange',
      { darkModeEnabled: this.darkModeEnabled, modeThemeClass: this.modeThemeClass },
      {
        this: this,
        ...options,
      },
    );
  }
}
