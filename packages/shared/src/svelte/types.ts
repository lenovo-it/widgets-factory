import type { DarkModeManagerInitialOptions } from '../types';

export interface SvelteDarkModeManagerMiscOptions {
  initialOptions?: DarkModeManagerInitialOptions;
}

export interface SvelteRegisterStylesParams {
  styles: LazyStyleTagInjectClasses | LazyStyleTagInjectClasses[];
}
