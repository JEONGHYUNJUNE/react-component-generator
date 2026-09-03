import { renderHook, act } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('저장된 값이 없으면 initialValue를 반환한다', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('localStorage에 값이 있으면 그 값을 반환한다', () => {
    localStorage.setItem('key', JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage('key', 'default'));
    expect(result.current[0]).toBe('stored');
  });

  it('값을 변경하면 localStorage에 저장된다', () => {
    const { result } = renderHook(() => useLocalStorage('key', ''));
    act(() => result.current[1]('new-value'));
    expect(localStorage.getItem('key')).toBe(JSON.stringify('new-value'));
  });

  it('updater 함수로도 값을 변경할 수 있다', () => {
    const { result } = renderHook(() => useLocalStorage('count', 0));
    act(() => result.current[1]((prev) => prev + 1));
    expect(result.current[0]).toBe(1);
  });

  it('저장된 JSON이 파싱 불가능하면 initialValue를 반환한다', () => {
    localStorage.setItem('key', 'invalid-json{{');
    const { result } = renderHook(() => useLocalStorage('key', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('deserialize 옵션으로 커스텀 파싱이 가능하다', () => {
    localStorage.setItem('date', JSON.stringify('2024-01-01T00:00:00.000Z'));
    const { result } = renderHook(() =>
      useLocalStorage('date', null as Date | null, {
        deserialize: (raw) => new Date(JSON.parse(raw)),
      })
    );
    expect(result.current[0]).toBeInstanceOf(Date);
  });
});
