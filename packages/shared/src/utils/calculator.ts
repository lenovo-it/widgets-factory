import { type CalcDynamicClassesParams, FillUpUrlPlaceholderWithPayloadRegExp } from '../types';

export function calcDynamicClasses(params: CalcDynamicClassesParams): string {
  if (typeof params === 'string' && params) {
    return params;
  }

  if (!(typeof params === 'object' && params)) {
    return '';
  }

  if (Array.isArray(params)) {
    return Array.from(new Set(params.map(calcDynamicClasses).filter(Boolean))).join(' ');
  }

  const result = Object.entries(params).reduce(function (acc, [key, cur], idx) {
    if (!cur) {
      return acc;
    }

    key && acc.push(key);

    return acc;
  }, [] as string[]);

  return Array.from(new Set(result.filter(Boolean))).join(' ');
}

/**
 * Fill up string placeholder
 * @param propertyValue {string}
 * @param payload {*}
 * @param [payloadModifier] {(*)=>*}
 * @return {string}
 */
export function fillUpPlaceholderByPayload(
  propertyValue: string | any,
  payload: any,
  payloadModifier?: (p: any) => any,
): string | any {
  if (!propertyValue || typeof propertyValue !== 'string') return propertyValue;

  if (typeof payloadModifier !== 'function') {
    payloadModifier = (a: any) => a;
  }

  // This is a normal operation.
  // Maybe cost a little, But necessary.
  const regExpResult = FillUpUrlPlaceholderWithPayloadRegExp.test(propertyValue);
  if (!regExpResult) return propertyValue;

  // Recurse.
  return fillUpPlaceholderByPayload(
    propertyValue.replace(FillUpUrlPlaceholderWithPayloadRegExp, function (subStr, matchValue: string) {
      if (!matchValue) {
        return payloadModifier!('');
      }

      return payloadModifier!(payload?.[matchValue] || '');
    }),
    payload,
    payloadModifier,
  );
}

/**
 * Get the query value from url.
 * @param name {string}
 * @param options {{[ignoreCase]: boolean}}
 * @return {string}
 */
export function getQueryString(name: string, options?: { ignoreCase?: boolean }) {
  return getQueryStringFormTargetSearch(window.location.search, name, options);
}

/**
 * Get the query value from target search string.
 * @param targetSearchString {string}
 * @param name {string}
 * @param options {{[ignoreCase]: boolean}}
 * @return {string|null}
 */
export function getQueryStringFormTargetSearch(
  targetSearchString: string,
  name: string,
  options?: { ignoreCase?: boolean },
): string | null {
  if (!(targetSearchString && typeof targetSearchString === 'string')) {
    return null;
  }

  const reg = new RegExp('(?:[?|&]?)' + name + '=([^&]*)(?:&|$)', options?.ignoreCase ? 'i' : undefined);
  const r = targetSearchString.match(reg);
  if (r != null) return decodeURIComponent(r[1]);

  return null;
}

/**
 * Update the QueryString Param
 * @param uri {string}
 * @param key {string}
 * @param value {string}
 */
export function updateQueryStringParam(uri: string, key: string, value?: string): string {
  if (typeof value !== 'string' || !key) return uri;

  const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
  const separator = uri.indexOf('?') !== -1 ? '&' : '?';
  return re.test(uri) ? uri.replace(re, '$1' + key + '=' + value + '$2') : uri + separator + key + '=' + value;
}

/**
 * Update the Query Param.
 * @param uri {string}
 * @param queryObj {Object<any>}
 * @return {string}
 */
export function updateQueryParam(uri: string, queryObj: Record<string, any>): string {
  for (const key in queryObj) {
    if (!queryObj.hasOwnProperty(key)) continue;

    uri = updateQueryStringParam(uri, key, queryObj[key]);
  }

  return uri;
}

/**
 * Remove the QueryString Param
 * @param uri {string}
 * @param keys {string|string[]}
 */
export function removeQueryStringParam(uri: string, keys: string | string[]): string {
  ([] as string[]).concat(keys).map(function (key) {
    if (!key) return;
    const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
    if (re.test(uri)) {
      uri = uri.replace(re, function (str, $1, $2) {
        return $1 && $1.startsWith('?') ? $2.replace('&', '?') : $2;
      });
    }
  });
  return uri;
}
