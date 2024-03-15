export type CalcDynamicClassesParamsItem = string | Record<string, any>;

export type CalcDynamicClassesParams = CalcDynamicClassesParamsItem | Array<CalcDynamicClassesParamsItem>;

export type FetchParameters = Parameters<typeof fetch>;

export interface InvokeFetchOptions {
  timeout?: number; // ms.
}

export interface EventsListenerItemFn<FP = any, R = any> {
  (params?: FP): R | Promise<R>;
}

export interface EventsListenerItem<FP = any, R = any, M = Record<string, any>> {
  namespace: string;
  fn: EventsListenerItemFn<FP, R>;

  metrics?: M;
}

export interface EventsListenerRegisterOptions<M = Record<string, any>> {
  metrics?: M;
}

export interface EventsListenerUnregisterOptions<Item> {
  externalJudgements?: (judgedSourceItem: Item) => boolean;
}

export interface EventsListenerTriggerOptions {
  this?: any;
  parallel?: boolean; // Default false.
  failurePrioritized?: boolean; // Default false.
}

export interface EventSubscribeInvalidatorItem<
  Subscriber extends Function = Function,
  Invalidator extends Function = Function,
  Metrics extends Record<string, any> = Record<string, any>,
> {
  subscriber: Subscriber;
  invalidator: Invalidator;

  metrics?: Metrics;
}

export interface EventSubscribeInvalidatorUnregisterOptions<Item> {
  externalJudgements?: (provideItem: Partial<Item>, judgedSourceItem: Item) => boolean;
}

export interface LoopTimeoutReTryInitParams {
  successCallback: Function;
  loopCondition?: () => boolean;
  exceedRetryTimesCallback?: Function;
}

export interface DarkModeManagerInitialOptions {
  modeChangeEvents?: EventsListenerTriggerOptions;
}

export interface DarkModeManagerModeBase {
  modeThemeClasses: {
    dark: string;
    light: string;
  };
  darkModeEnabled: boolean;
  modeThemeClass: string;
}

export interface DarkModeManagerModeChangeEventParams {
  darkModeEnabled: DarkModeManagerModeBase['darkModeEnabled'];
  modeThemeClass: DarkModeManagerModeBase['modeThemeClass'];
}
