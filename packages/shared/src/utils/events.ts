import {
  EventsListenerItem,
  EventsListenerRegisterOptions,
  EventsListenerTriggerOptions,
  EventsListenerUnregisterOptions,
  EventSubscribeInvalidatorItem,
  EventSubscribeInvalidatorUnregisterOptions,
} from '../types';

export const eventNoopFn = function () {};

export class Events<FP = any, R = any, M = Record<string, any>> {
  protected listeners: Array<EventsListenerItem<FP, R, M>> = [];

  registerListener(
    namespace: EventsListenerItem<FP, R, M>['namespace'],
    fn: EventsListenerItem<FP, R, M>['fn'],
    options?: EventsListenerRegisterOptions<M>,
  ) {
    if (typeof fn === 'function' && typeof namespace === 'string') {
      this.listeners.push({
        namespace,
        fn,
        metrics: options?.metrics,
      });

      return this;
    }

    return this;
  }

  unregisterListener(fn: EventsListenerItem<FP, R, M>['fn']): this;
  unregisterListener(namespace: EventsListenerItem<FP, R, M>['namespace']): this;
  unregisterListener(options: EventsListenerUnregisterOptions<EventsListenerItem<FP, R, M>>): this;
  unregisterListener(
    namespace: EventsListenerItem<FP, R, M>['namespace'],
    fn: EventsListenerItem<FP, R, M>['fn'],
  ): this;
  unregisterListener(...args: any[]): this {
    switch (args.length) {
      case 1: {
        const first = args[0];
        if (typeof first === 'function') {
          this.listeners = this.listeners.filter(function (item) {
            return item.fn !== first;
          });

          return this;
        }

        if (typeof first === 'string') {
          this.listeners = this.listeners.filter(function (item) {
            return item.namespace !== first;
          });

          return this;
        }

        if (
          first &&
          typeof (first as EventsListenerUnregisterOptions<EventsListenerItem<FP, R, M>>).externalJudgements ===
            'function'
        ) {
          this.listeners = this.listeners.filter(function (item) {
            return !(first as EventsListenerUnregisterOptions<EventsListenerItem<FP, R, M>>).externalJudgements!(item);
          });

          return this;
        }

        return this;
      }
      case 2: {
        const [namespace, fn] = args as [EventsListenerItem<FP, R>['namespace'], EventsListenerItem<FP, R>['fn']];

        this.listeners = this.listeners.filter(function (item) {
          return !(item.namespace === namespace && item.fn === fn);
        });

        return this;
      }
    }

    return this;
  }

  async trigger(namespace: EventsListenerItem<FP, R, M>['namespace']): Promise<void>;
  async trigger(namespace: EventsListenerItem<FP, R, M>['namespace'], params: FP): Promise<void>;
  async trigger(
    namespace: EventsListenerItem<FP, R, M>['namespace'],
    params: FP,
    options: EventsListenerTriggerOptions,
  ): Promise<void>;
  async trigger(
    namespace: EventsListenerItem<FP, R, M>['namespace'],
    params?: FP,
    options?: EventsListenerTriggerOptions,
  ) {
    const isParallel = options?.parallel ?? false;
    const isFailurePrioritized = options?.failurePrioritized ?? false;

    const pThis = options && typeof options === 'object' && options.hasOwnProperty('this') ? options.this : null;

    if (!isParallel) {
      if (isFailurePrioritized) {
        for (const item of this.listeners) {
          await item.fn.call(pThis, params);
        }

        return;
      }

      for (const item of this.listeners) {
        try {
          await item.fn.call(pThis, params);
        } catch (e) {
          console.error('[Events]', e);
        }
      }

      return;
    }

    const fns: Array<ReturnType<EventsListenerItem<FP, R, M>['fn']>> = [];
    this.listeners.forEach(function (item) {
      if (item.namespace !== namespace) {
        return;
      }

      const res = item.fn.call(pThis, params);
      if (res instanceof Promise) {
        fns.push(res);
      }
    });

    return (isFailurePrioritized ? Promise.all(fns) : Promise.allSettled(fns)).then(eventNoopFn);
  }
}

export class EventSubscribeInvalidators<Subscribe extends Function, Invalidator extends Function> {
  private items: EventSubscribeInvalidatorItem<Subscribe, Invalidator>[] = [];

  register(item: EventSubscribeInvalidatorItem<Subscribe, Invalidator>) {
    this.items.push(item);

    return this;
  }

  unregister<
    T extends Partial<EventSubscribeInvalidatorItem<Subscribe, Invalidator>> = Partial<
      EventSubscribeInvalidatorItem<Subscribe, Invalidator>
    >,
  >(items: T | Array<T>, options?: EventSubscribeInvalidatorUnregisterOptions<T>) {
    const formattedItems = ([] as T[]).concat(items);

    this.items = this.items.filter(function (item) {
      const isPartialMatched = formattedItems.some(function (fItem) {
        if (fItem.invalidator === item.invalidator || item.subscriber === fItem.subscriber) {
          return true;
        }

        if (typeof options?.externalJudgements === 'function') {
          return options?.externalJudgements(fItem, item as T);
        }

        return false;
      });
      if (isPartialMatched) {
        // Release.
        item.invalidator();

        return false;
      }

      return true;
    });

    formattedItems.length = 0;

    return this;
  }

  clear() {
    this.items.forEach(function (item) {
      item.invalidator();
    });
    this.items.length = 0;

    return this;
  }
}
