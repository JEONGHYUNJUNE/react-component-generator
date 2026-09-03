import { renderHook, act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useComponentGenerator } from './useComponentGenerator';

describe('useComponentGenerator', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('새로고침 후에도 저장된 컴포넌트 목록이 복원된다', () => {
    const stored = [
      { id: '1', prompt: 'button', code: '<button/>', createdAt: '2024-01-01T00:00:00.000Z' },
    ];
    localStorage.setItem('rcg:components', JSON.stringify(stored));

    const { result } = renderHook(() => useComponentGenerator());

    expect(result.current.components).toHaveLength(1);
    expect(result.current.components[0].createdAt).toBeInstanceOf(Date);
  });

  it('컴포넌트 삭제 시 localStorage도 갱신된다', () => {
    const stored = [
      { id: '1', prompt: 'button', code: '<button/>', createdAt: '2024-01-01T00:00:00.000Z' },
    ];
    localStorage.setItem('rcg:components', JSON.stringify(stored));

    const { result } = renderHook(() => useComponentGenerator());
    act(() => result.current.removeComponent('1'));

    expect(JSON.parse(localStorage.getItem('rcg:components') ?? '[]')).toHaveLength(0);
  });

  it('전체 삭제 시 localStorage도 비워진다', () => {
    const stored = [
      { id: '1', prompt: 'button', code: '<button/>', createdAt: '2024-01-01T00:00:00.000Z' },
    ];
    localStorage.setItem('rcg:components', JSON.stringify(stored));

    const { result } = renderHook(() => useComponentGenerator());
    act(() => result.current.clearAll());

    expect(JSON.parse(localStorage.getItem('rcg:components') ?? '[]')).toHaveLength(0);
  });

  it('초기 promptHistory는 빈 배열이다', () => {
    const { result } = renderHook(() => useComponentGenerator());
    expect(result.current.promptHistory).toEqual([]);
  });

  it('새로고침 후에도 promptHistory가 복원된다', () => {
    localStorage.setItem('rcg:prompt-history', JSON.stringify(['button', 'card']));

    const { result } = renderHook(() => useComponentGenerator());

    expect(result.current.promptHistory).toEqual(['button', 'card']);
  });
});
