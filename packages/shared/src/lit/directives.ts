import type { Directive } from 'lit/directive.js';
import type { DarkModeManager } from '../utils';

export type JudgeCurrentDarkModeEnabledDirectiveRenderResult = DarkModeManager['darkModeEnabled'] | Symbol;

export declare class JudgeCurrentDarkModeEnabledDirective extends Directive {
  // Symbol is for `noChange`.
  render(...args: any[]): JudgeCurrentDarkModeEnabledDirectiveRenderResult;

  update(...args: any[]): JudgeCurrentDarkModeEnabledDirectiveRenderResult;
}
