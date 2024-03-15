import type { LoopTimeoutReTryInitParams } from '../types';

export class LoopTimeoutRetry {
  private loopTimeSign: number = -1;
  maxLoopTimes: number = 50;
  eachLoopTimeOut: number = 100;

  constructor(options?: Partial<Pick<LoopTimeoutRetry, 'maxLoopTimes' | 'eachLoopTimeOut'>>) {
    const maxLoopTimes = options?.maxLoopTimes;
    if (typeof maxLoopTimes === 'number') {
      this.maxLoopTimes = maxLoopTimes;
    }

    const eachLoopTimeOut = options?.eachLoopTimeOut;
    if (typeof eachLoopTimeOut === 'number') {
      this.eachLoopTimeOut = eachLoopTimeOut;
    }
  }

  init({ loopCondition, successCallback, exceedRetryTimesCallback }: LoopTimeoutReTryInitParams) {
    const args = arguments;

    if (!this.maxLoopTimes) {
      // eslint-disable-next-line no-unused-expressions
      typeof exceedRetryTimesCallback === 'function' && exceedRetryTimesCallback(this);
      return this;
    }

    if (typeof loopCondition === 'function' && !loopCondition()) {
      this.maxLoopTimes--;
      clearTimeout(this.loopTimeSign);
      this.loopTimeSign = window.setTimeout(() => {
        // eslint-disable-next-line prefer-rest-params,prefer-spread
        this.init.apply(this, args as any);
      }, this.eachLoopTimeOut);

      return this;
    }

    // eslint-disable-next-line no-unused-expressions
    typeof successCallback === 'function' && successCallback(this);

    return this;
  }

  stop() {
    this.maxLoopTimes = 0;
    clearTimeout(this.loopTimeSign);
    return this;
  }
}

export function getShadowRoot(target: HTMLElement | ShadowRoot | null | undefined): ShadowRoot | undefined {
  if (!target) {
    return;
  }

  if (target instanceof ShadowRoot) {
    return target;
  }

  // @ts-ignore
  let shadowRoot = target.shadowRoot || undefined;
  // @ts-ignore
  if (!shadowRoot) {
    const root = target.getRootNode();
    if (root instanceof ShadowRoot) {
      shadowRoot = root;
    }
  }

  return shadowRoot;
}
