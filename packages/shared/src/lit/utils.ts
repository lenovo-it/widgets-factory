import { type LitElement, noChange, type Part, ReactiveController, type ReactiveControllerHost } from 'lit';
import { consume, createContext, provide } from '@lit/context';
import { Directive, directive, type DirectiveResult } from 'lit/directive.js';
import { LIT_DARK_MODE_MANAGER_CONTEXT_KEY } from './constants';
import { property } from 'lit/decorators.js';
import type { LitDarkModeManagerMiscOptions } from './types';
import { DarkModeManager, Events } from '../utils';
import type { JudgeCurrentDarkModeEnabledDirective } from './directives';

const usedGetCurrentDarkModeStateProperties: Array<keyof DarkModeManager> = /*#__PURE__*/ [
  'darkModeEnabled',
  'modeThemeClasses',
  'modeThemeClass',
];

const darkModeManagerContext = /*#__PURE__*/ createContext<DarkModeManagerReactiveController>(
  LIT_DARK_MODE_MANAGER_CONTEXT_KEY,
);

// Add `ignore` comment due to set the `hostDisconnected` and `hostConnected` lifecycle as `protected`.
// Nothing impact, only for better developing experience.
// @ts-ignore
export class DarkModeManagerReactiveController implements ReactiveController {
  private _options?: LitDarkModeManagerMiscOptions;

  private _events = new Events();

  private _darkManager!: DarkModeManager;

  private _connectedHosts = new Set<LitElement>();

  // IMPORTANT!!!
  // This is a public method!
  // Registered by `_init` function.
  judgeCurrentDarkModeEnabled!: (
    ...values: Parameters<InstanceType<typeof JudgeCurrentDarkModeEnabledDirective>['render']>
  ) => DirectiveResult<typeof JudgeCurrentDarkModeEnabledDirective>;

  constructor(rootHost: ReactiveControllerHost, options?: LitDarkModeManagerMiscOptions) {
    // Why add `ignore` comment is the same as the top comment of this class.
    // @ts-ignore
    rootHost.addController(this);

    this._init(rootHost, options);
  }

  private _init(rootHost: ReactiveControllerHost, options?: LitDarkModeManagerMiscOptions) {
    this._options = options;

    const darkModeManager = (this._darkManager = new DarkModeManager(this._options?.initialOptions));

    const connectedHosts = this._connectedHosts;

    this.judgeCurrentDarkModeEnabled = directive(
      /** @see https://lit.dev/docs/templates/custom-directives/#imperative-dom-access:-update() */
      class JudgeCurrentDarkModeEnabledDirectiveImpl extends Directive implements JudgeCurrentDarkModeEnabledDirective {
        update(part: Part, props: any[]) {
          super.update(part, props);

          // Record where used the `getCurrentDarkModeState` functionality.
          // We will try to trigger their `requestUpdate()` method to refresh their contents.
          // And we will record the `rootHost`, so I annotate the related codes below.
          const partHost = part.options?.host as LitElement;
          if (partHost) {
            if (partHost.isConnected) {
              // if (partHost !== rootHost) {
              connectedHosts.add(partHost);
              // }
            } else {
              connectedHosts.delete(partHost);
            }
          }

          return darkModeManager['darkModeEnabled'];
        }

        render(..._args: any[]) {
          // Return `nothing`.
          // Perf, for reduce unnecessary `render`.
          // Only render in `update` method.
          return noChange;
        }
      },
    );

    // Register events.
    // After contents refreshed, ok, the signal changed.
    // And then, all the watchers for the signal will be triggered.
    darkModeManager.registerModeChangeEvent(state => {
      // Trigger the host's events.
      connectedHosts.forEach(function (host) {
        // The `host` contains the `rootHost`.
        if (host && host.isConnected) {
          host.requestUpdate();
        }
      });

      this._events.trigger('stateChanged', state);
    });
  }

  get darkModeEnabled(): DarkModeManager['darkModeEnabled'] {
    return this._darkManager.darkModeEnabled;
  }

  get modeThemeClass(): DarkModeManager['modeThemeClass'] {
    return this._darkManager.modeThemeClass;
  }

  get modeThemeClasses(): DarkModeManager['modeThemeClasses'] {
    return this._darkManager.modeThemeClasses;
  }

  getCurrentDarkModeState() {
    return usedGetCurrentDarkModeStateProperties.reduce(
      (acc, cur) => {
        // @ts-ignore
        acc[cur] = this._darkManager[cur];

        return acc;
      },
      {} as Pick<DarkModeManager, 'modeThemeClass' | 'modeThemeClasses' | 'darkModeEnabled'>,
    );
  }

  changeEventSubscribe(host: LitElement, f: Parameters<DarkModeManager['registerModeChangeEvent']>[0]) {
    this._events.registerListener('stateChanged', f, { metrics: { host } });
  }

  protected hostConnected() {}

  protected hostDisconnected() {
    this._darkManager.unregisterModeChangeEvent();
    this._events.unregisterListener('stateChanged');
    this._connectedHosts.clear();
  }
}

export const provideDarkModeManager: () => PropertyDecorator = /*#__PURE__*/ function provideDarkModeManager() {
  return function (target, propertyKey) {
    // No need to set this property as a `property` (Means It shouldn't be changed).
    property({ attribute: false, reflect: false })(target, propertyKey);

    // @ts-ignore
    provide({ context: darkModeManagerContext })(target, propertyKey);

    // Cannot do this. I don't know why.
    // Maybe the `lit` framework restricts this operation.
    // @ts-ignore
    // target[propertyKey] = new DarkModeManagerReactiveController(target);
  };
};

export const injectDarkModeManager: () => PropertyDecorator = /*#__PURE__*/ function injectDarkModeManager() {
  return function (target, propertyKey) {
    // No need to set this property as a `property` (Means It shouldn't be changed).
    // property({ attribute: false, reflect: false })(target, propertyKey);

    // @ts-ignore
    consume({ context: darkModeManagerContext, subscribe: false })(target, propertyKey);

    // We will try to `delete` the records.
    // In fact, this is only a `perf` optimization.
    // We already do some judgements in `darkModeManager.registerModeChangeEvent` to determine the related host inactive or not.
    // @ts-ignore
    const disconnectedCallback = target.disconnectedCallback as any;
    // @ts-ignore
    target.disconnectedCallback = function disconnectedCallbackDarkModeManagerModified() {
      if (typeof disconnectedCallback === 'function') {
        disconnectedCallback.apply(this, arguments);
      }

      // We will try to `delete` the records.
      // @ts-ignore
      const darkModeManager = this[propertyKey] as DarkModeManagerReactiveController;
      if (darkModeManager) {
        // @ts-ignore
        darkModeManager._connectedHosts.delete(this);

        // Remove unnecessary events for current instance.
        // @ts-ignore
        darkModeManager._events.unregisterListener({
          externalJudgements: item => {
            return item.metrics?.host === this;
          },
        });
      }
    };
  };
};
