import { describe, it, expect } from 'vitest';
import { validatePromptLength, MAX_PROMPT_LENGTH } from './validatePrompt';

describe('validatePromptLength', () => {
  it('MAX_PROMPT_LENGTH는 500이다', () => {
    expect(MAX_PROMPT_LENGTH).toBe(500);
  });

  it('빈 문자열은 유효하다', () => {
    expect(validatePromptLength('')).toBe(true);
  });

  it('499자는 유효하다', () => {
    expect(validatePromptLength('a'.repeat(499))).toBe(true);
  });

  it('정확히 500자는 유효하다', () => {
    expect(validatePromptLength('a'.repeat(500))).toBe(true);
  });

  it('501자는 유효하지 않다', () => {
    expect(validatePromptLength('a'.repeat(501))).toBe(false);
  });

  it('1000자는 유효하지 않다', () => {
    expect(validatePromptLength('a'.repeat(1000))).toBe(false);
  });
});
