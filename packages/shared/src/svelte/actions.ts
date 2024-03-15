import { getShadowRoot } from '../utils';
import type { Action } from 'svelte/action';
import type { SvelteRegisterStylesParams } from './types';

function _registerStyles(
  curStyles: SvelteRegisterStylesParams['styles'],
  target: Parameters<typeof getShadowRoot>[0],
  options?: { prevStyles?: SvelteRegisterStylesParams['styles'] },
) {
  const modifiedPrevStyles = options?.prevStyles ? ([] as LazyStyleTagInjectClasses[]).concat(options?.prevStyles) : [];
  const modifiedCurStyles = ([] as LazyStyleTagInjectClasses[]).concat(curStyles);

  if (!modifiedCurStyles.length) {
    return;
  }

  modifiedCurStyles.forEach(function (style) {
    if (modifiedPrevStyles.includes(style)) {
      return;
    }

    style.use({ target: getShadowRoot(target) });
  });
}

function _unregisterStyles(
  curStyles: SvelteRegisterStylesParams['styles'],
  options?: { prevStyles?: SvelteRegisterStylesParams['styles'] },
) {
  const modifiedPrevStyles = options?.prevStyles ? ([] as LazyStyleTagInjectClasses[]).concat(options?.prevStyles) : [];
  const modifiedCurStyles = ([] as LazyStyleTagInjectClasses[]).concat(curStyles);

  if (!modifiedCurStyles.length) {
    modifiedPrevStyles.forEach(function (style) {
      style.unuse();
    });

    return;
  }

  modifiedPrevStyles.forEach(function (style) {
    if (modifiedCurStyles.includes(style)) {
      return;
    }

    style.unuse();
  });
}

export const registerStyles: Action<HTMLElement, SvelteRegisterStylesParams> = function (node, params) {
  let lastParams = params;

  _registerStyles(lastParams.styles, node);

  return {
    update(newParams) {
      _unregisterStyles(newParams.styles, { prevStyles: lastParams.styles });
      _registerStyles(newParams.styles, node, { prevStyles: lastParams.styles });

      lastParams = newParams;
    },
    destroy() {
      _unregisterStyles(lastParams.styles);
    },
  };
};
